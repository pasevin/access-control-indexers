/**
 * EVM-specific utility functions
 */

import { normalizeEvmAddress, isZeroAddress } from '@oz-indexers/common';

/**
 * Formats a bytes32 role to a hex string
 */
export function formatRole(role: string): string {
  // Ensure proper 0x prefix and lowercase
  const normalized = role.startsWith('0x') ? role : `0x${role}`;
  return normalized.toLowerCase();
}

/**
 * Gets the network identifier for a chain
 * This should match the network config
 */
export function getNetworkId(chainId: number, isTestnet: boolean): string {
  const networks: Record<number, string> = {
    // Mainnets
    1: 'ethereum-mainnet',
    42161: 'arbitrum-mainnet',
    137: 'polygon-mainnet',
    1101: 'polygon-zkevm-mainnet',
    8453: 'base-mainnet',
    56: 'bsc-mainnet',
    10: 'optimism-mainnet',
    43114: 'avalanche-mainnet',
    324: 'zksync-era-mainnet',
    534352: 'scroll-mainnet',
    59144: 'linea-mainnet',
    420420419: 'polkadot-hub',
    1284: 'moonbeam-mainnet',
    1285: 'moonriver-mainnet',

    // Testnets
    11155111: 'ethereum-sepolia',
    421614: 'arbitrum-sepolia',
    80002: 'polygon-amoy',
    2442: 'polygon-zkevm-cardona',
    84532: 'base-sepolia',
    97: 'bsc-testnet',
    11155420: 'optimism-sepolia',
    43113: 'avalanche-fuji',
    300: 'zksync-era-sepolia',
    534351: 'scroll-sepolia',
    59141: 'linea-sepolia',
    10143: 'monad-testnet',
    420420417: 'polkadot-hub-testnet',
    1287: 'moonbase-alpha-testnet',
  };

  return networks[chainId] || `unknown-${chainId}`;
}

/**
 * Checks if an ownership transfer is a renounce (transfer to zero address)
 */
export function isOwnershipRenounce(newOwner: string): boolean {
  return isZeroAddress(newOwner);
}

/**
 * Normalizes an EVM address for storage
 */
export function normalizeAddress(address: string): string {
  return normalizeEvmAddress(address);
}
