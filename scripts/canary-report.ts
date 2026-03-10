#!/usr/bin/env tsx
/**
 * Canary Health Check Report
 *
 * Fetches GitHub Actions workflow run data for the canary health checks
 * and produces a visual terminal report.
 *
 * Usage:
 *   pnpm run canary:report          # default 48h
 *   pnpm run canary:report -- 24    # last 24 hours
 *   pnpm run canary:report -- 72    # last 72 hours
 */

import { execSync } from "child_process";

const REPO = "pasevin/access-control-indexers";
const WORKFLOW = "canary.yml";
const BAR_WIDTH = 20;

interface Run {
  databaseId: number;
  createdAt: string;
  conclusion: string;
}

interface Job {
  conclusion: string;
  databaseId: number;
  name: string;
}

type FailureReason =
  | "UNREACHABLE"
  | "UNHEALTHY"
  | "SMOKE QUERY FAILED"
  | "BAD RESPONSE"
  | "NULL HEIGHTS"
  | "LAG EXCEEDED"
  | "UNKNOWN";

function gh(args: string): string {
  return execSync(`gh ${args}`, { encoding: "utf-8", timeout: 30_000 }).trim();
}

function ghJson<T>(args: string): T {
  return JSON.parse(gh(args)) as T;
}

function parseRuns(hours: number): Run[] {
  const all = ghJson<Run[]>(
    `run list --repo ${REPO} --workflow=${WORKFLOW} --limit=200 --json databaseId,createdAt,conclusion`
  );
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return all.filter((r) => new Date(r.createdAt) >= cutoff);
}

function getFailedJobs(runId: number): { network: string; jobId: number }[] {
  const raw = gh(
    `run view ${runId} --repo ${REPO} --json jobs --jq '.jobs[] | select(.conclusion == "failure" and .name != "summary" and .name != "setup" and .name != "no-endpoints") | "\\(.databaseId)|\\(.name)"'`
  );
  if (!raw) return [];
  return raw.split("\n").map((line) => {
    const [jobId, name] = line.split("|", 2);
    const match = name?.match(/^health-check \(([^,]+),/);
    return { network: match?.[1] ?? "unknown", jobId: parseInt(jobId, 10) };
  });
}

function classifyFailure(jobId: number): FailureReason {
  let logs: string;
  try {
    logs = gh(`api repos/${REPO}/actions/jobs/${jobId}/logs`);
  } catch {
    return "UNKNOWN";
  }

  for (const line of logs.split("\n")) {
    if (!line.includes("##[error]") || line.includes("Process completed"))
      continue;
    const lower = line.toLowerCase();
    if (lower.includes("unreachable") || lower.includes("timed out"))
      return "UNREACHABLE";
    if (line.includes("indexerHealthy=false")) return "UNHEALTHY";
    if (lower.includes("query failed")) return "SMOKE QUERY FAILED";
    if (lower.includes("unexpected shape")) return "BAD RESPONSE";
    if (lower.includes("null heights")) return "NULL HEIGHTS";
    if (lower.includes("lag") && lower.includes("exceeds"))
      return "LAG EXCEEDED";
  }
  return "UNKNOWN";
}

function buildBar(failures: number, total: number): string {
  const failBlocks = Math.round((failures / total) * BAR_WIDTH);
  const passBlocks = BAR_WIDTH - failBlocks;
  return "█".repeat(failBlocks) + "░".repeat(passBlocks);
}

function formatReasons(reasons: Map<FailureReason, number>): string {
  return [...reasons.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([r, c]) => `${r}: ${c}`)
    .join(", ");
}

async function main() {
  const hours = parseInt(process.argv[2] || "48", 10);
  if (isNaN(hours) || hours <= 0) {
    console.error("Usage: canary-report [hours]");
    process.exit(1);
  }

  const INNER_WIDTH = 84;
  const title = `CANARY HEALTH CHECK REPORT - LAST ${hours}h`;
  const pad = Math.max(INNER_WIDTH - 2 - title.length, 1);
  console.log(`\n  ╔${"═".repeat(INNER_WIDTH)}╗`);
  console.log(`  ║  ${title}${" ".repeat(pad)}║`);
  console.log(`  ╚${"═".repeat(INNER_WIDTH)}╝\n`);

  process.stdout.write("  Fetching workflow runs...");
  const runs = parseRuns(hours);
  const totalRuns = runs.length;
  const greenRuns = runs.filter((r) => r.conclusion === "success").length;
  const failRuns = runs.filter((r) => r.conclusion === "failure").length;
  process.stdout.write(` found ${totalRuns}\n`);

  if (totalRuns === 0) {
    console.log("  No runs found in this time window.\n");
    return;
  }

  console.log(
    `  Runs: ${totalRuns}  │  All-green: ${greenRuns}  │  With failures: ${failRuns}\n`
  );

  const networkFailures = new Map<string, Map<FailureReason, number>>();
  const networkTotals = new Map<string, number>();

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    process.stdout.write(`\x1b[2K\r  Analyzing run ${i + 1}/${totalRuns}...`);

    const allJobsRaw = gh(
      `run view ${run.databaseId} --repo ${REPO} --json jobs --jq '.jobs[] | select(.name != "setup" and .name != "summary" and .name != "no-endpoints") | .name'`
    );
    if (allJobsRaw) {
      for (const jobName of allJobsRaw.split("\n")) {
        const match = jobName.match(/^health-check \(([^,]+),/);
        if (match) {
          const net = match[1];
          networkTotals.set(net, (networkTotals.get(net) ?? 0) + 1);
        }
      }
    }

    if (run.conclusion !== "failure") continue;

    const failedJobs = getFailedJobs(run.databaseId);
    for (const { network, jobId } of failedJobs) {
      const reason = classifyFailure(jobId);
      if (!networkFailures.has(network)) {
        networkFailures.set(network, new Map());
      }
      const reasons = networkFailures.get(network)!;
      reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
    }
  }

  process.stdout.write("\x1b[2K\r");

  const failingNets = [...networkFailures.entries()]
    .map(([net, reasons]) => ({
      net,
      reasons,
      totalFails: [...reasons.values()].reduce((a, b) => a + b, 0),
      totalRuns: networkTotals.get(net) ?? 0,
    }))
    .sort((a, b) => b.totalFails - a.totalFails);

  const allNets = new Set(networkTotals.keys());
  const failingNetNames = new Set(failingNets.map((f) => f.net));
  const healthyNets = [...allNets]
    .filter((n) => !failingNetNames.has(n))
    .sort();

  if (failingNets.length > 0) {
    console.log("  FAILING NETWORKS:");
    for (const { net, reasons, totalFails, totalRuns } of failingNets) {
      const pct = Math.round((totalFails / totalRuns) * 100);
      const bar = buildBar(totalFails, totalRuns);
      const reasonStr = formatReasons(reasons);
      console.log(
        `    ${net.padEnd(28)} ${String(totalFails).padStart(
          2
        )}/${totalRuns} fail (${String(pct).padStart(
          3
        )}%) ${bar}  [${reasonStr}]`
      );
    }
  }

  if (healthyNets.length > 0) {
    console.log(`\n  ALWAYS HEALTHY (${healthyNets.length} networks):`);
    for (const net of healthyNets) {
      console.log(`    ✓ ${net}`);
    }
  }

  console.log(`\n  ${"─".repeat(INNER_WIDTH + 2)}`);
  console.log(
    `  ${totalRuns} runs over ${hours}h  │  ${allNets.size} networks  │  ${greenRuns} fully green  │  ${failingNets.length} with issues`
  );
  console.log(
    `  Workflow: https://github.com/${REPO}/actions/workflows/${WORKFLOW}`
  );
  console.log();
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
