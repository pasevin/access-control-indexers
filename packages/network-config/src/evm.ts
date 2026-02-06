/**
 * EVM Network Configurations
 * Sourced from ui-builder/packages/adapter-evm/src/networks/
 * and ui-builder/packages/adapter-polkadot/src/networks/
 */

import { EvmNetworkConfig } from "./types";

// =============================================================================
// EVM MAINNETS
// =============================================================================

export const ETHEREUM_MAINNET: EvmNetworkConfig = {
  id: "ethereum-mainnet",
  name: "Ethereum",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 1,
  rpcUrl: "https://ethereum-rpc.publicnode.com",
  explorerUrl: "https://etherscan.io",
  startBlock: 4719568, // OZ Contracts v2 (Ownable) release (Dec 2017)
  subqlNode: "@subql/node-ethereum",
};

export const ARBITRUM_MAINNET: EvmNetworkConfig = {
  id: "arbitrum-mainnet",
  name: "Arbitrum One",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 42161,
  rpcUrl: "https://arb1.arbitrum.io/rpc",
  explorerUrl: "https://arbiscan.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const POLYGON_MAINNET: EvmNetworkConfig = {
  id: "polygon-mainnet",
  name: "Polygon",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 137,
  rpcUrl: "https://polygon-rpc.com",
  explorerUrl: "https://polygonscan.com",
  startBlock: 17000000, // earliest OZ AccessControl deployments (~Aug 2021)
  subqlNode: "@subql/node-ethereum",
};

export const POLYGON_ZKEVM_MAINNET: EvmNetworkConfig = {
  id: "polygon-zkevm-mainnet",
  name: "Polygon zkEVM",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 1101,
  rpcUrl: "https://zkevm-rpc.com",
  explorerUrl: "https://zkevm.polygonscan.com",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const BASE_MAINNET: EvmNetworkConfig = {
  id: "base-mainnet",
  name: "Base",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  explorerUrl: "https://basescan.org",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const BSC_MAINNET: EvmNetworkConfig = {
  id: "bsc-mainnet",
  name: "BNB Smart Chain",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 56,
  rpcUrl: "https://bsc-dataseed.binance.org",
  explorerUrl: "https://bscscan.com",
  startBlock: 3500000, // earliest OZ AccessControl deployments (~Jan 2021)
  subqlNode: "@subql/node-ethereum",
};

export const OPTIMISM_MAINNET: EvmNetworkConfig = {
  id: "optimism-mainnet",
  name: "OP Mainnet",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 10,
  rpcUrl: "https://mainnet.optimism.io",
  explorerUrl: "https://optimistic.etherscan.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const AVALANCHE_MAINNET: EvmNetworkConfig = {
  id: "avalanche-mainnet",
  name: "Avalanche C-Chain",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 43114,
  rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  explorerUrl: "https://snowscan.xyz",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const ZKSYNC_ERA_MAINNET: EvmNetworkConfig = {
  id: "zksync-era-mainnet",
  name: "ZkSync Era",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 324,
  rpcUrl: "https://mainnet.era.zksync.io",
  explorerUrl: "https://explorer.zksync.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const SCROLL_MAINNET: EvmNetworkConfig = {
  id: "scroll-mainnet",
  name: "Scroll",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 534352,
  rpcUrl: "https://rpc.scroll.io",
  explorerUrl: "https://scrollscan.com",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const LINEA_MAINNET: EvmNetworkConfig = {
  id: "linea-mainnet",
  name: "Linea",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 59144,
  rpcUrl: "https://rpc.linea.build",
  explorerUrl: "https://lineascan.build",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

// =============================================================================
// POLKADOT EVM NETWORKS (EVM-compatible parachains)
// =============================================================================

export const POLKADOT_HUB: EvmNetworkConfig = {
  id: "polkadot-hub",
  name: "Polkadot Hub",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 420420419,
  rpcUrl: "https://services.polkadothub-rpc.com/mainnet",
  explorerUrl: "https://blockscout.polkadot.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const MOONBEAM_MAINNET: EvmNetworkConfig = {
  id: "moonbeam-mainnet",
  name: "Moonbeam",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 1284,
  rpcUrl: "https://rpc.api.moonbeam.network",
  explorerUrl: "https://moonbeam.moonscan.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

export const MOONRIVER_MAINNET: EvmNetworkConfig = {
  id: "moonriver-mainnet",
  name: "Moonriver",
  ecosystem: "evm",
  type: "mainnet",
  isTestnet: false,
  chainId: 1285,
  rpcUrl: "https://rpc.api.moonriver.moonbeam.network",
  explorerUrl: "https://moonriver.moonscan.io",
  startBlock: 1,
  subqlNode: "@subql/node-ethereum",
};

// =============================================================================
// EVM TESTNETS
// =============================================================================

export const ETHEREUM_SEPOLIA: EvmNetworkConfig = {
  id: "ethereum-sepolia",
  name: "Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 11155111,
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.etherscan.io",
  startBlock: 10200000, // earliest OZ contract activity on Sepolia
  subqlNode: "@subql/node-ethereum",
};

export const ARBITRUM_SEPOLIA: EvmNetworkConfig = {
  id: "arbitrum-sepolia",
  name: "Arbitrum Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 421614,
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  explorerUrl: "https://sepolia.arbiscan.io",
  startBlock: 240150000,
  subqlNode: "@subql/node-ethereum",
};

export const POLYGON_AMOY: EvmNetworkConfig = {
  id: "polygon-amoy",
  name: "Polygon Amoy",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 80002,
  rpcUrl: "https://rpc-amoy.polygon.technology",
  explorerUrl: "https://amoy.polygonscan.com",
  startBlock: 33360000,
  subqlNode: "@subql/node-ethereum",
};

export const POLYGON_ZKEVM_CARDONA: EvmNetworkConfig = {
  id: "polygon-zkevm-cardona",
  name: "Polygon zkEVM Cardona",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 2442,
  rpcUrl: "https://rpc.cardona.zkevm-rpc.com",
  explorerUrl: "https://cardona-zkevm.polygonscan.com",
  startBlock: 20200000,
  subqlNode: "@subql/node-ethereum",
};

export const BASE_SEPOLIA: EvmNetworkConfig = {
  id: "base-sepolia",
  name: "Base Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorerUrl: "https://sepolia.basescan.org",
  startBlock: 37290000,
  subqlNode: "@subql/node-ethereum",
};

export const BSC_TESTNET: EvmNetworkConfig = {
  id: "bsc-testnet",
  name: "BSC Testnet",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 97,
  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
  explorerUrl: "https://testnet.bscscan.com",
  startBlock: 88720000,
  subqlNode: "@subql/node-ethereum",
};

export const OPTIMISM_SEPOLIA: EvmNetworkConfig = {
  id: "optimism-sepolia",
  name: "OP Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 11155420,
  rpcUrl: "https://sepolia.optimism.io",
  explorerUrl: "https://sepolia-optimism.etherscan.io",
  startBlock: 39300000,
  subqlNode: "@subql/node-ethereum",
};

export const AVALANCHE_FUJI: EvmNetworkConfig = {
  id: "avalanche-fuji",
  name: "Avalanche Fuji C-Chain",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 43113,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  explorerUrl: "https://testnet.snowscan.xyz",
  startBlock: 51540000,
  subqlNode: "@subql/node-ethereum",
};

export const ZKSYNC_ERA_SEPOLIA: EvmNetworkConfig = {
  id: "zksync-era-sepolia",
  name: "ZkSync Era Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 300,
  rpcUrl: "https://sepolia.era.zksync.dev",
  explorerUrl: "https://sepolia.explorer.zksync.io",
  startBlock: 6700000,
  subqlNode: "@subql/node-ethereum",
};

export const SCROLL_SEPOLIA: EvmNetworkConfig = {
  id: "scroll-sepolia",
  name: "Scroll Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 534351,
  rpcUrl: "https://sepolia-rpc.scroll.io",
  explorerUrl: "https://sepolia.scrollscan.dev",
  startBlock: 16580000,
  subqlNode: "@subql/node-ethereum",
};

export const LINEA_SEPOLIA: EvmNetworkConfig = {
  id: "linea-sepolia",
  name: "Linea Sepolia",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 59141,
  rpcUrl: "https://rpc.sepolia.linea.build",
  explorerUrl: "https://sepolia.lineascan.build",
  startBlock: 24320000,
  subqlNode: "@subql/node-ethereum",
};

export const MONAD_TESTNET: EvmNetworkConfig = {
  id: "monad-testnet",
  name: "Monad Testnet",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 10143,
  rpcUrl: "https://testnet-rpc.monad.xyz",
  explorerUrl: "https://testnet.monadexplorer.com",
  startBlock: 10540000, // earliest OZ contract deployments on Monad testnet
  subqlNode: "@subql/node-ethereum",
};

export const POLKADOT_HUB_TESTNET: EvmNetworkConfig = {
  id: "polkadot-hub-testnet",
  name: "Polkadot Hub TestNet",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 420420417,
  rpcUrl: "https://services.polkadothub-rpc.com/testnet",
  explorerUrl: "https://polkadot.testnet.routescan.io",
  startBlock: 5000000,
  subqlNode: "@subql/node-ethereum",
};

export const MOONBASE_ALPHA_TESTNET: EvmNetworkConfig = {
  id: "moonbase-alpha-testnet",
  name: "Moonbase Alpha",
  ecosystem: "evm",
  type: "testnet",
  isTestnet: true,
  chainId: 1287,
  rpcUrl: "https://rpc.api.moonbase.moonbeam.network",
  explorerUrl: "https://moonbase.moonscan.io",
  startBlock: 15120000,
  subqlNode: "@subql/node-ethereum",
};

// =============================================================================
// AGGREGATED EXPORTS
// =============================================================================

export const EVM_MAINNETS: EvmNetworkConfig[] = [
  ETHEREUM_MAINNET,
  ARBITRUM_MAINNET,
  POLYGON_MAINNET,
  POLYGON_ZKEVM_MAINNET,
  BASE_MAINNET,
  BSC_MAINNET,
  OPTIMISM_MAINNET,
  AVALANCHE_MAINNET,
  ZKSYNC_ERA_MAINNET,
  SCROLL_MAINNET,
  LINEA_MAINNET,
  POLKADOT_HUB,
  MOONBEAM_MAINNET,
  MOONRIVER_MAINNET,
];

export const EVM_TESTNETS: EvmNetworkConfig[] = [
  ETHEREUM_SEPOLIA,
  ARBITRUM_SEPOLIA,
  POLYGON_AMOY,
  POLYGON_ZKEVM_CARDONA,
  BASE_SEPOLIA,
  BSC_TESTNET,
  OPTIMISM_SEPOLIA,
  AVALANCHE_FUJI,
  ZKSYNC_ERA_SEPOLIA,
  SCROLL_SEPOLIA,
  LINEA_SEPOLIA,
  MONAD_TESTNET,
  POLKADOT_HUB_TESTNET,
  MOONBASE_ALPHA_TESTNET,
];

export const EVM_NETWORKS: EvmNetworkConfig[] = [
  ...EVM_MAINNETS,
  ...EVM_TESTNETS,
];
