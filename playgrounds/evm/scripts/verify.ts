import { execSync } from "node:child_process";
import { getAddress } from "viem";

/**
 * Verify deployed contracts on Etherscan, Sourcify, and Blockscout.
 *
 * Reads ETHERSCAN_API_KEY from .env (loaded via dotenv in hardhat.config.ts).
 *
 * Usage:
 *   npx hardhat run scripts/verify.ts --network sepolia
 *
 * To verify a single contract, set the CONTRACT env var:
 *   CONTRACT=accessControl npx hardhat run scripts/verify.ts --network sepolia
 */

// Deployed contract addresses on Sepolia
const DEPLOYED_CONTRACTS = {
  accessControl: getAddress("0x447b67c43347ae336cabe9d1c60a56df82781e1e"),
  ownable: getAddress("0x02c0ae8e78843b8c5389b57077ebd26632206fe0"),
  ownable2Step: getAddress("0x1300522c7103eb5e041f85f8f7dc3354501b1e75"),
  combined: getAddress("0x0e46df975af95b8bf8f52abc97a49669c2d663b5"),
};

// Constructor argument used for all contracts (deployer/owner address)
const CONSTRUCTOR_ARG = getAddress(
  "0xf0a9ed2663311ce436347bb6f240181ff103ca16"
);

// Contract definitions mapping keys to contract names
const CONTRACT_DEFINITIONS: {
  key: string;
  name: string;
  address: string;
}[] = [
  {
    key: "accessControl",
    name: "AccessControlMock",
    address: DEPLOYED_CONTRACTS.accessControl,
  },
  {
    key: "ownable",
    name: "OwnableMock",
    address: DEPLOYED_CONTRACTS.ownable,
  },
  {
    key: "ownable2Step",
    name: "Ownable2StepMock",
    address: DEPLOYED_CONTRACTS.ownable2Step,
  },
  {
    key: "combined",
    name: "CombinedMock",
    address: DEPLOYED_CONTRACTS.combined,
  },
];

interface VerifyResult {
  name: string;
  address: string;
  success: boolean;
  output: string;
}

function verifyContract(
  networkName: string,
  name: string,
  address: string,
  constructorArg: string
): VerifyResult {
  console.log(`\n--- Verifying ${name} at ${address} ---`);

  const cmd = `npx hardhat verify --network ${networkName} ${address} ${constructorArg}`;

  try {
    const output = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120_000,
    });

    console.log(output);
    return { name, address, success: true, output };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    const stdout = execError.stdout ?? "";
    const stderr = execError.stderr ?? "";
    const combined = `${stdout}\n${stderr}`;

    // Hardhat verify exits non-zero if Blockscout fails even when Etherscan
    // succeeds. Treat Etherscan success as overall success.
    const etherscanVerified =
      combined.includes("Contract verified successfully on Etherscan") ||
      combined.includes("already been verified on Etherscan");

    const sourcifyVerified =
      combined.includes("Contract verified successfully on Sourcify") ||
      combined.includes("already been verified on Sourcify");

    if (etherscanVerified || sourcifyVerified) {
      console.log(stdout);
      if (etherscanVerified) console.log("  ✓ Etherscan: verified");
      if (sourcifyVerified) console.log("  ✓ Sourcify: verified");
      return { name, address, success: true, output: combined };
    }

    console.error(stdout);
    console.error(stderr);
    return { name, address, success: false, output: combined };
  }
}

function main() {
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error(
      "Error: ETHERSCAN_API_KEY not set. Add it to your .env file."
    );
    process.exitCode = 1;
    return;
  }

  // Detect network from CLI args (--network <name>)
  const networkFlagIndex = process.argv.indexOf("--network");
  const networkName =
    networkFlagIndex !== -1 ? process.argv[networkFlagIndex + 1] : "sepolia";

  console.log("=== Contract Verification ===");
  console.log("Network:", networkName);
  console.log(
    "Etherscan API key:",
    `${process.env.ETHERSCAN_API_KEY.slice(0, 4)}...`
  );
  console.log("Constructor arg (owner):", CONSTRUCTOR_ARG);

  // Determine which contracts to verify
  const targetContract = process.env.CONTRACT;

  const toVerify = targetContract
    ? CONTRACT_DEFINITIONS.filter((c) => c.key === targetContract)
    : CONTRACT_DEFINITIONS;

  if (toVerify.length === 0) {
    const validKeys = CONTRACT_DEFINITIONS.map((c) => c.key).join(", ");
    console.error(
      `Unknown contract: "${targetContract}". Valid options: ${validKeys}`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\nVerifying ${toVerify.length} contract(s)...`);

  const results: VerifyResult[] = [];

  for (const contract of toVerify) {
    const result = verifyContract(
      networkName,
      contract.name,
      contract.address,
      CONSTRUCTOR_ARG
    );
    results.push(result);
  }

  // Print summary
  console.log("\n=== Verification Summary ===");
  for (const r of results) {
    const icon = r.success ? "✓" : "✗";
    console.log(`  ${icon} ${r.name} (${r.address})`);
  }

  const failedCount = results.filter((r) => !r.success).length;
  if (failedCount > 0) {
    console.log(`\n⚠ ${failedCount} contract(s) failed verification.`);
    process.exitCode = 1;
  } else {
    console.log("\n✓ All contracts verified successfully!");
  }
}

main();
