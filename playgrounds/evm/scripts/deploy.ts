import { network } from 'hardhat';

async function main() {
  const { viem, networkName } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log('Deploying contracts to:', networkName);
  console.log('Deployer address:', deployer.account.address);

  // Deploy AccessControlMock
  const accessControl = await viem.deployContract('AccessControlMock', [
    deployer.account.address,
  ]);
  console.log('AccessControlMock deployed to:', accessControl.address);

  // Deploy OwnableMock
  const ownable = await viem.deployContract('OwnableMock', [
    deployer.account.address,
  ]);
  console.log('OwnableMock deployed to:', ownable.address);

  // Deploy Ownable2StepMock
  const ownable2Step = await viem.deployContract('Ownable2StepMock', [
    deployer.account.address,
  ]);
  console.log('Ownable2StepMock deployed to:', ownable2Step.address);

  // Deploy CombinedMock
  const combined = await viem.deployContract('CombinedMock', [
    deployer.account.address,
  ]);
  console.log('CombinedMock deployed to:', combined.address);

  console.log('\nDeployment complete!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
