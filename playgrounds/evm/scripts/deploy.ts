import { network } from "hardhat";

// Initial delay for DefaultAdminRules contracts (seconds).
// 0 = no delay; transfers still require waiting at least one block.
const DEFAULT_ADMIN_DELAY = 0;

async function main() {
  const { viem, networkName } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contracts to:", networkName);
  console.log("Deployer address:", deployer.account.address);

  // Deploy AccessControlMock
  const accessControl = await viem.deployContract("AccessControlMock", [
    deployer.account.address,
  ]);
  console.log("AccessControlMock deployed to:", accessControl.address);

  // Deploy DefaultAdminRulesMock
  const defaultAdminRules = await viem.deployContract("DefaultAdminRulesMock", [
    DEFAULT_ADMIN_DELAY,
    deployer.account.address,
  ]);
  console.log("DefaultAdminRulesMock deployed to:", defaultAdminRules.address);

  // Deploy OwnableMock
  const ownable = await viem.deployContract("OwnableMock", [
    deployer.account.address,
  ]);
  console.log("OwnableMock deployed to:", ownable.address);

  // Deploy Ownable2StepMock
  const ownable2Step = await viem.deployContract("Ownable2StepMock", [
    deployer.account.address,
  ]);
  console.log("Ownable2StepMock deployed to:", ownable2Step.address);

  // Deploy CombinedMock (AccessControlDefaultAdminRules + Ownable2Step)
  const combined = await viem.deployContract("CombinedMock", [
    DEFAULT_ADMIN_DELAY,
    deployer.account.address,
  ]);
  console.log("CombinedMock deployed to:", combined.address);

  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
