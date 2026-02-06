import { defineConfig } from 'hardhat/config';
import hardhatViem from '@nomicfoundation/hardhat-viem';

export default defineConfig({
  plugins: [hardhatViem],
  solidity: {
    version: '0.8.28',
  },
  networks: {
    sepolia: {
      type: 'http',
      url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
