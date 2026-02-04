/**
 * Sync schema across all network indexers
 * This script ensures all indexers reference the shared schema correctly
 *
 * Usage: npx tsx scripts/sync-schema.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const networksDir = path.join(__dirname, '..', 'networks');
const schemaPath = path.join(
  __dirname,
  '..',
  'packages',
  'schema',
  'schema.graphql'
);

// Check schema exists
if (!fs.existsSync(schemaPath)) {
  console.error('Error: packages/schema/schema.graphql not found');
  process.exit(1);
}

console.log('Checking schema references in all indexers...\n');

let errors = 0;
let checked = 0;

// Check EVM networks
const evmDir = path.join(networksDir, 'evm');
if (fs.existsSync(evmDir)) {
  const evmNetworks = fs
    .readdirSync(evmDir)
    .filter((f) => fs.statSync(path.join(evmDir, f)).isDirectory());

  for (const network of evmNetworks) {
    const projectPath = path.join(evmDir, network, 'project.ts');
    if (fs.existsSync(projectPath)) {
      const content = fs.readFileSync(projectPath, 'utf-8');
      if (!content.includes('../../../packages/schema/schema.graphql')) {
        console.error(`❌ ${network}: schema path not found or incorrect`);
        errors++;
      } else {
        console.log(`✓ evm/${network}`);
      }
      checked++;
    }
  }
}

// Check Stellar networks
const stellarDir = path.join(networksDir, 'stellar');
if (fs.existsSync(stellarDir)) {
  const stellarNetworks = fs
    .readdirSync(stellarDir)
    .filter((f) => fs.statSync(path.join(stellarDir, f)).isDirectory());

  for (const network of stellarNetworks) {
    const projectPath = path.join(stellarDir, network, 'project.ts');
    if (fs.existsSync(projectPath)) {
      const content = fs.readFileSync(projectPath, 'utf-8');
      if (!content.includes('../../../packages/schema/schema.graphql')) {
        console.error(
          `❌ stellar/${network}: schema path not found or incorrect`
        );
        errors++;
      } else {
        console.log(`✓ stellar/${network}`);
      }
      checked++;
    }
  }
}

console.log(`\nChecked ${checked} indexers`);

if (errors > 0) {
  console.error(`\n${errors} indexer(s) have schema reference issues`);
  process.exit(1);
} else {
  console.log('\nAll indexers reference the shared schema correctly!');
}
