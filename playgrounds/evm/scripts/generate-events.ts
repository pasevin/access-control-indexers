import { ethers } from 'hardhat';

/**
 * Generate test events for the Access Control indexer
 * Usage: npx hardhat run scripts/generate-events.ts --network <network>
 */
async function main() {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  console.log('Generating test events with deployer:', deployer.address);
  console.log('Test accounts:', {
    alice: alice.address,
    bob: bob.address,
    charlie: charlie.address,
  });

  // Deploy fresh contracts
  console.log('\n=== Deploying Contracts ===');

  const AccessControlMock = await ethers.getContractFactory(
    'AccessControlMock'
  );
  const accessControl = await AccessControlMock.deploy(deployer.address);
  await accessControl.waitForDeployment();
  console.log('AccessControlMock:', await accessControl.getAddress());

  const Ownable2StepMock = await ethers.getContractFactory('Ownable2StepMock');
  const ownable2Step = await Ownable2StepMock.deploy(deployer.address);
  await ownable2Step.waitForDeployment();
  console.log('Ownable2StepMock:', await ownable2Step.getAddress());

  const CombinedMock = await ethers.getContractFactory('CombinedMock');
  const combined = await CombinedMock.deploy(deployer.address);
  await combined.waitForDeployment();
  console.log('CombinedMock:', await combined.getAddress());

  // Define roles
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MINTER_ROLE'));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('BURNER_ROLE'));
  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes('OPERATOR_ROLE'));
  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PAUSER_ROLE'));

  console.log('\n=== Phase 1: Grant Roles ===');

  // Grant roles to different accounts
  await accessControl.grantRolePublic(MINTER_ROLE, alice.address);
  console.log('Granted MINTER_ROLE to alice');

  await accessControl.grantRolePublic(MINTER_ROLE, bob.address);
  console.log('Granted MINTER_ROLE to bob');

  await accessControl.grantRolePublic(BURNER_ROLE, charlie.address);
  console.log('Granted BURNER_ROLE to charlie');

  await accessControl.grantRolePublic(OPERATOR_ROLE, alice.address);
  console.log('Granted OPERATOR_ROLE to alice');

  console.log('\n=== Phase 2: Revoke Roles ===');

  await accessControl.revokeRolePublic(MINTER_ROLE, bob.address);
  console.log('Revoked MINTER_ROLE from bob');

  console.log('\n=== Phase 3: Role Admin Changes ===');

  // Set OPERATOR_ROLE as admin of PAUSER_ROLE
  await accessControl.setRoleAdminPublic(PAUSER_ROLE, OPERATOR_ROLE);
  console.log('Set OPERATOR_ROLE as admin of PAUSER_ROLE');

  console.log('\n=== Phase 4: Ownership Transfer (2-Step) ===');

  // Start ownership transfer
  await ownable2Step.transferOwnershipPublic(alice.address);
  console.log('Started ownership transfer to alice');

  // Accept ownership (as alice)
  await ownable2Step.connect(alice).acceptOwnershipPublic();
  console.log('Alice accepted ownership');

  console.log('\n=== Phase 5: Combined Contract ===');

  // Grant roles on combined contract
  await combined.grantRolePublic(MINTER_ROLE, bob.address);
  console.log('Granted MINTER_ROLE to bob on combined contract');

  // Transfer ownership on combined contract
  await combined.transferOwnershipPublic(charlie.address);
  console.log('Started ownership transfer to charlie on combined contract');

  await combined.connect(charlie).acceptOwnershipPublic();
  console.log('Charlie accepted ownership on combined contract');

  console.log('\n=== Event Generation Complete ===');
  console.log('Total events generated:');
  console.log('- RoleGranted: 5');
  console.log('- RoleRevoked: 1');
  console.log('- RoleAdminChanged: 1');
  console.log('- OwnershipTransferStarted: 2');
  console.log('- OwnershipTransferred: 2');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
