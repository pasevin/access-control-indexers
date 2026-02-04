import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy AccessControlMock
  const AccessControlMock = await ethers.getContractFactory(
    'AccessControlMock'
  );
  const accessControl = await AccessControlMock.deploy(deployer.address);
  await accessControl.waitForDeployment();
  console.log(
    'AccessControlMock deployed to:',
    await accessControl.getAddress()
  );

  // Deploy OwnableMock
  const OwnableMock = await ethers.getContractFactory('OwnableMock');
  const ownable = await OwnableMock.deploy(deployer.address);
  await ownable.waitForDeployment();
  console.log('OwnableMock deployed to:', await ownable.getAddress());

  // Deploy Ownable2StepMock
  const Ownable2StepMock = await ethers.getContractFactory('Ownable2StepMock');
  const ownable2Step = await Ownable2StepMock.deploy(deployer.address);
  await ownable2Step.waitForDeployment();
  console.log('Ownable2StepMock deployed to:', await ownable2Step.getAddress());

  // Deploy CombinedMock
  const CombinedMock = await ethers.getContractFactory('CombinedMock');
  const combined = await CombinedMock.deploy(deployer.address);
  await combined.waitForDeployment();
  console.log('CombinedMock deployed to:', await combined.getAddress());

  console.log('\nDeployment complete!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
