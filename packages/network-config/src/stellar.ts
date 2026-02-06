/**
 * Stellar Network Configurations
 * Sourced from ui-builder/packages/adapter-stellar/src/networks/
 */

import { StellarNetworkConfig } from "./types";

export const STELLAR_MAINNET: StellarNetworkConfig = {
  id: "stellar-mainnet",
  name: "Stellar",
  ecosystem: "stellar",
  type: "mainnet",
  isTestnet: false,
  networkPassphrase: "Public Global Stellar Network ; September 2015",
  horizonUrl: "https://horizon.stellar.org",
  sorobanRpcUrl: "https://mainnet.sorobanrpc.com",
  explorerUrl: "https://stellar.expert/explorer/public",
  startBlock: 60377000, // OZ Stellar AccessControl contracts launch on mainnet
  subqlNode: "@subql/node-stellar",
};

export const STELLAR_TESTNET: StellarNetworkConfig = {
  id: "stellar-testnet",
  name: "Stellar Testnet",
  ecosystem: "stellar",
  type: "testnet",
  isTestnet: true,
  networkPassphrase: "Test SDF Network ; September 2015",
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  explorerUrl: "https://stellar.expert/explorer/testnet",
  startBlock: 14000, // OZ Stellar AccessControl contracts deployment on testnet
  subqlNode: "@subql/node-stellar",
};

export const STELLAR_NETWORKS: StellarNetworkConfig[] = [
  STELLAR_MAINNET,
  STELLAR_TESTNET,
];
