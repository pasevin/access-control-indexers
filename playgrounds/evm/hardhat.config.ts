import { defineConfig } from 'hardhat/config';
import hardhatViem from '@nomicfoundation/hardhat-viem';

export default defineConfig({
  plugins: [hardhatViem],
  solidity: {
    version: '0.8.28',
  },
  networks: {
    // Add network configs as needed
    // Example:
    // sepolia: {
    //   type: "http",
    //   url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
});
