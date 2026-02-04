/**
 * All network configurations
 */

import { AnyNetworkConfig } from './types';
import { EVM_NETWORKS } from './evm';
import { STELLAR_NETWORKS } from './stellar';

/**
 * All supported networks (30 total)
 */
export const ALL_NETWORKS: AnyNetworkConfig[] = [
  ...EVM_NETWORKS,
  ...STELLAR_NETWORKS,
];

/**
 * Get network config by ID
 */
export function getNetworkById(id: string): AnyNetworkConfig | undefined {
  return ALL_NETWORKS.find((n) => n.id === id);
}

/**
 * Get all mainnet networks
 */
export function getMainnets(): AnyNetworkConfig[] {
  return ALL_NETWORKS.filter((n) => !n.isTestnet);
}

/**
 * Get all testnet networks
 */
export function getTestnets(): AnyNetworkConfig[] {
  return ALL_NETWORKS.filter((n) => n.isTestnet);
}

/**
 * Get networks by ecosystem
 */
export function getNetworksByEcosystem(
  ecosystem: 'evm' | 'stellar'
): AnyNetworkConfig[] {
  return ALL_NETWORKS.filter((n) => n.ecosystem === ecosystem);
}
