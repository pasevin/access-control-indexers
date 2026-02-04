#!/usr/bin/env tsx
/**
 * Build a specific network with codegen
 *
 * Usage:
 *   pnpm run build:network <network-name>
 *
 * Examples:
 *   pnpm run build:network ethereum-mainnet
 *   pnpm run build:network stellar-testnet
 *   pnpm run build:network polygon-amoy
 *
 * This script will:
 *   1. Detect the ecosystem (EVM or Stellar) based on the network name
 *   2. Run codegen to regenerate types from the schema
 *   3. Build the network package
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const NETWORKS_DIR = resolve(__dirname, '../networks');

function findNetworkPath(networkName: string): string | null {
  // Handle stellar- prefix (e.g., stellar-testnet -> stellar/testnet)
  if (networkName.startsWith('stellar-')) {
    const stellarNetworkName = networkName.replace('stellar-', '');
    const stellarPath = resolve(NETWORKS_DIR, 'stellar', stellarNetworkName);
    if (existsSync(stellarPath)) {
      return stellarPath;
    }
  }

  // Check EVM networks
  const evmPath = resolve(NETWORKS_DIR, 'evm', networkName);
  if (existsSync(evmPath)) {
    return evmPath;
  }

  // Check Stellar networks (without prefix for backwards compatibility)
  const stellarPath = resolve(NETWORKS_DIR, 'stellar', networkName);
  if (existsSync(stellarPath)) {
    return stellarPath;
  }

  return null;
}

function getEcosystem(networkPath: string): 'evm' | 'stellar' {
  return networkPath.includes('/stellar/') ? 'stellar' : 'evm';
}

interface NetworkInfo {
  name: string;
  ecosystem: 'evm' | 'stellar';
  displayName: string;
}

function listAvailableNetworks(): NetworkInfo[] {
  const networks: NetworkInfo[] = [];

  // List EVM networks
  const evmDir = resolve(NETWORKS_DIR, 'evm');
  if (existsSync(evmDir)) {
    const { readdirSync } = require('fs');
    const evmNetworks = readdirSync(evmDir, { withFileTypes: true })
      .filter((d: any) => d.isDirectory())
      .map((d: any) => ({
        name: d.name,
        ecosystem: 'evm' as const,
        displayName: d.name,
      }));
    networks.push(...evmNetworks);
  }

  // List Stellar networks
  const stellarDir = resolve(NETWORKS_DIR, 'stellar');
  if (existsSync(stellarDir)) {
    const { readdirSync } = require('fs');
    const stellarNetworks = readdirSync(stellarDir, { withFileTypes: true })
      .filter((d: any) => d.isDirectory())
      .map((d: any) => ({
        name: d.name,
        ecosystem: 'stellar' as const,
        displayName: `stellar-${d.name}`,
      }));
    networks.push(...stellarNetworks);
  }

  return networks.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function run(command: string, cwd: string): void {
  console.log(`\n📂 ${cwd}`);
  console.log(`🔧 Running: ${command}\n`);
  execSync(command, { cwd, stdio: 'inherit' });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle --list flag
  if (args.includes('--list') || args.includes('-l')) {
    console.log('\n📋 Available networks:\n');
    const networks = listAvailableNetworks();

    console.log('  EVM Networks:');
    networks
      .filter((n) => n.ecosystem === 'evm')
      .forEach((n) => console.log(`    • ${n.displayName}`));

    console.log('\n  Stellar Networks:');
    networks
      .filter((n) => n.ecosystem === 'stellar')
      .forEach((n) => console.log(`    • ${n.displayName}`));

    console.log(`\nTotal: ${networks.length} networks\n`);
    process.exit(0);
  }

  // Handle --all flag
  if (args.includes('--all') || args.includes('-a')) {
    console.log('\n🚀 Building all networks with codegen...\n');
    run('pnpm run codegen', resolve(__dirname, '..'));
    run('pnpm run build', resolve(__dirname, '..'));
    console.log('\n✅ All networks built successfully!\n');
    process.exit(0);
  }

  const networkName = args[0];

  if (!networkName) {
    console.error(`
❌ Error: Network name is required

Usage:
  pnpm run build:network <network-name>
  pnpm run build:network --list        # List all available networks
  pnpm run build:network --all         # Build all networks

Examples:
  pnpm run build:network ethereum-mainnet
  pnpm run build:network stellar-testnet
`);
    process.exit(1);
  }

  const networkPath = findNetworkPath(networkName);

  if (!networkPath) {
    console.error(`
❌ Error: Network "${networkName}" not found

Available networks:`);
    const networks = listAvailableNetworks();
    networks.forEach((n) => console.error(`  • ${n.displayName}`));
    process.exit(1);
  }

  const ecosystem = getEcosystem(networkPath);

  console.log(`
🔨 Building ${networkName} (${ecosystem})
${'─'.repeat(40)}
`);

  try {
    // Step 1: Run codegen
    console.log('📝 Step 1/2: Generating types from schema...');
    run('pnpm run codegen', networkPath);

    // Step 2: Build
    console.log('\n🏗️  Step 2/2: Building project...');
    run('pnpm run build', networkPath);

    console.log(`
${'─'.repeat(40)}
✅ ${networkName} built successfully!
`);
  } catch (error) {
    console.error(`\n❌ Build failed for ${networkName}`);
    process.exit(1);
  }
}

main();
