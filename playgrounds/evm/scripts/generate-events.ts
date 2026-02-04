import { network } from 'hardhat';
import { keccak256, toBytes } from 'viem';

/**
 * Generate test events for the Access Control indexer
 * Usage: npx hardhat run scripts/generate-events.ts --network <network>
 */
async function main() {
  const { viem, networkName } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, alice, bob, charlie] = await viem.getWalletClients();

  console.log('Generating test events on:', networkName);
  console.log('Deployer:', deployer.account.address);
  console.log('Test accounts:', {
    alice: alice.account.address,
    bob: bob.account.address,
    charlie: charlie.account.address,
  });

  // Deploy fresh contracts
  console.log('\n=== Deploying Contracts ===');

  const accessControl = await viem.deployContract('AccessControlMock', [
    deployer.account.address,
  ]);
  console.log('AccessControlMock:', accessControl.address);

  const ownable2Step = await viem.deployContract('Ownable2StepMock', [
    deployer.account.address,
  ]);
  console.log('Ownable2StepMock:', ownable2Step.address);

  const combined = await viem.deployContract('CombinedMock', [
    deployer.account.address,
  ]);
  console.log('CombinedMock:', combined.address);

  // Define roles
  const MINTER_ROLE = keccak256(toBytes('MINTER_ROLE'));
  const BURNER_ROLE = keccak256(toBytes('BURNER_ROLE'));
  const OPERATOR_ROLE = keccak256(toBytes('OPERATOR_ROLE'));
  const PAUSER_ROLE = keccak256(toBytes('PAUSER_ROLE'));

  console.log('\n=== Phase 1: Grant Roles ===');

  // Grant roles to different accounts
  let tx = await accessControl.write.grantRolePublic([
    MINTER_ROLE,
    alice.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Granted MINTER_ROLE to alice');

  tx = await accessControl.write.grantRolePublic([
    MINTER_ROLE,
    bob.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Granted MINTER_ROLE to bob');

  tx = await accessControl.write.grantRolePublic([
    BURNER_ROLE,
    charlie.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Granted BURNER_ROLE to charlie');

  tx = await accessControl.write.grantRolePublic([
    OPERATOR_ROLE,
    alice.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Granted OPERATOR_ROLE to alice');

  console.log('\n=== Phase 2: Revoke Roles ===');

  tx = await accessControl.write.revokeRolePublic([
    MINTER_ROLE,
    bob.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Revoked MINTER_ROLE from bob');

  console.log('\n=== Phase 3: Role Admin Changes ===');

  tx = await accessControl.write.setRoleAdminPublic([
    PAUSER_ROLE,
    OPERATOR_ROLE,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Set OPERATOR_ROLE as admin of PAUSER_ROLE');

  console.log('\n=== Phase 4: Ownership Transfer (2-Step) ===');

  // Start ownership transfer
  tx = await ownable2Step.write.transferOwnershipPublic([
    alice.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Started ownership transfer to alice');

  // Accept ownership (as alice)
  const ownable2StepAsAlice = await viem.getContractAt(
    'Ownable2StepMock',
    ownable2Step.address,
    { client: { wallet: alice } }
  );
  tx = await ownable2StepAsAlice.write.acceptOwnershipPublic();
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Alice accepted ownership');

  console.log('\n=== Phase 5: Combined Contract ===');

  // Grant roles on combined contract
  tx = await combined.write.grantRolePublic([MINTER_ROLE, bob.account.address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Granted MINTER_ROLE to bob on combined contract');

  // Transfer ownership on combined contract
  tx = await combined.write.transferOwnershipPublic([charlie.account.address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('Started ownership transfer to charlie on combined contract');

  const combinedAsCharlie = await viem.getContractAt(
    'CombinedMock',
    combined.address,
    { client: { wallet: charlie } }
  );
  tx = await combinedAsCharlie.write.acceptOwnershipPublic();
  await publicClient.waitForTransactionReceipt({ hash: tx });
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
