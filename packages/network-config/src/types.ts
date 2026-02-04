/**
 * Network configuration types
 */

export type Ecosystem = 'evm' | 'stellar';
export type NetworkType = 'mainnet' | 'testnet';

/**
 * Base network configuration
 */
export interface NetworkConfig {
  /** Unique network identifier (e.g., "ethereum-mainnet") */
  id: string;
  /** Display name */
  name: string;
  /** Ecosystem type */
  ecosystem: Ecosystem;
  /** Network type */
  type: NetworkType;
  /** Whether this is a testnet */
  isTestnet: boolean;
  /** Block explorer URL */
  explorerUrl: string;
  /** SubQuery node package to use */
  subqlNode: string;
}

/**
 * EVM network configuration
 */
export interface EvmNetworkConfig extends NetworkConfig {
  ecosystem: 'evm';
  /** EVM chain ID */
  chainId: number;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** Recommended start block (first OZ contract activity) */
  startBlock: number;
}

/**
 * Stellar network configuration
 */
export interface StellarNetworkConfig extends NetworkConfig {
  ecosystem: 'stellar';
  /** Stellar network passphrase */
  networkPassphrase: string;
  /** Horizon API URL */
  horizonUrl: string;
  /** Soroban RPC URL */
  sorobanRpcUrl: string;
  /** Recommended start block/ledger */
  startBlock: number;
}

/**
 * Union type for all network configs
 */
export type AnyNetworkConfig = EvmNetworkConfig | StellarNetworkConfig;
