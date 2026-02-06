import { network } from 'hardhat';
import { keccak256, toBytes, getAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

/**
 * Generate test events for the Access Control indexer using deployed contracts
 * Usage: PRIVATE_KEY=<key> npx hardhat run scripts/generate-events.ts --network sepolia
 */

// Deployed contract addresses on Sepolia
const DEPLOYED_CONTRACTS = {
  accessControl: getAddress('0x1a8f6185df1d2861d3012328eb923e35ca98efed'),
  ownable: getAddress('0xc851cc8bf0ed0e5b3a7247b750451e9b75dd5f3a'),
  ownable2Step: getAddress('0xd53ee5def566594dae4b7282c0be1d257c9b46cc'),
  combined: getAddress('0xce51bb95708e0057760f812244c159d2450946e8'),
};

// Generate random addresses for test accounts
function generateRandomAddresses(count: number) {
  const addresses: `0x${string}`[] = [];
  for (let i = 0; i < count; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    addresses.push(account.address);
  }
  return addresses;
}

async function main() {
  const { viem, networkName } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log('Generating test events on:', networkName);
  console.log('Deployer:', deployer.account.address);
  console.log('\n=== Using Deployed Contracts ===');
  console.log('AccessControlMock:', DEPLOYED_CONTRACTS.accessControl);
  console.log('OwnableMock:', DEPLOYED_CONTRACTS.ownable);
  console.log('Ownable2StepMock:', DEPLOYED_CONTRACTS.ownable2Step);
  console.log('CombinedMock:', DEPLOYED_CONTRACTS.combined);

  // Generate random addresses for test accounts
  const [alice, bob, charlie, dave, eve] = generateRandomAddresses(5);
  console.log('\nTest accounts (random addresses):');
  console.log('  alice:', alice);
  console.log('  bob:', bob);
  console.log('  charlie:', charlie);
  console.log('  dave:', dave);
  console.log('  eve:', eve);

  // Get contract instances
  const accessControl = await viem.getContractAt(
    'AccessControlMock',
    DEPLOYED_CONTRACTS.accessControl
  );

  const ownable2Step = await viem.getContractAt(
    'Ownable2StepMock',
    DEPLOYED_CONTRACTS.ownable2Step
  );

  const combined = await viem.getContractAt(
    'CombinedMock',
    DEPLOYED_CONTRACTS.combined
  );

  // Define roles
  const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
  const MINTER_ROLE = keccak256(toBytes('MINTER_ROLE'));
  const BURNER_ROLE = keccak256(toBytes('BURNER_ROLE'));
  const OPERATOR_ROLE = keccak256(toBytes('OPERATOR_ROLE'));
  const PAUSER_ROLE = keccak256(toBytes('PAUSER_ROLE'));
  const UPGRADER_ROLE = keccak256(toBytes('UPGRADER_ROLE'));

  console.log('\n=== Role Hashes ===');
  console.log('MINTER_ROLE:', MINTER_ROLE);
  console.log('BURNER_ROLE:', BURNER_ROLE);
  console.log('OPERATOR_ROLE:', OPERATOR_ROLE);
  console.log('PAUSER_ROLE:', PAUSER_ROLE);
  console.log('UPGRADER_ROLE:', UPGRADER_ROLE);

  let eventCount = {
    roleGranted: 0,
    roleRevoked: 0,
    roleAdminChanged: 0,
    ownershipTransferStarted: 0,
    ownershipTransferred: 0,
  };

  console.log('\n=== Phase 1: Grant Roles on AccessControlMock ===');

  // Grant MINTER_ROLE to multiple accounts
  let tx = await accessControl.write.grantRolePublic([MINTER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted MINTER_ROLE to alice');
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted MINTER_ROLE to bob');
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted MINTER_ROLE to charlie');
  eventCount.roleGranted++;

  // Grant BURNER_ROLE
  tx = await accessControl.write.grantRolePublic([BURNER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted BURNER_ROLE to alice');
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([BURNER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted BURNER_ROLE to dave');
  eventCount.roleGranted++;

  // Grant OPERATOR_ROLE
  tx = await accessControl.write.grantRolePublic([OPERATOR_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted OPERATOR_ROLE to bob');
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([OPERATOR_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted OPERATOR_ROLE to eve');
  eventCount.roleGranted++;

  // Grant PAUSER_ROLE
  tx = await accessControl.write.grantRolePublic([PAUSER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted PAUSER_ROLE to charlie');
  eventCount.roleGranted++;

  console.log('\n=== Phase 2: Revoke Some Roles ===');

  tx = await accessControl.write.revokeRolePublic([MINTER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Revoked MINTER_ROLE from bob');
  eventCount.roleRevoked++;

  tx = await accessControl.write.revokeRolePublic([BURNER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Revoked BURNER_ROLE from dave');
  eventCount.roleRevoked++;

  tx = await accessControl.write.revokeRolePublic([OPERATOR_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Revoked OPERATOR_ROLE from eve');
  eventCount.roleRevoked++;

  console.log('\n=== Phase 3: Role Admin Changes ===');

  // Set OPERATOR_ROLE as admin of PAUSER_ROLE
  tx = await accessControl.write.setRoleAdminPublic([PAUSER_ROLE, OPERATOR_ROLE]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Set OPERATOR_ROLE as admin of PAUSER_ROLE');
  eventCount.roleAdminChanged++;

  // Set MINTER_ROLE as admin of UPGRADER_ROLE
  tx = await accessControl.write.setRoleAdminPublic([UPGRADER_ROLE, MINTER_ROLE]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Set MINTER_ROLE as admin of UPGRADER_ROLE');
  eventCount.roleAdminChanged++;

  console.log('\n=== Phase 4: Combined Contract Operations ===');

  // Grant roles on combined contract
  tx = await combined.write.grantRolePublic([MINTER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted MINTER_ROLE to alice on CombinedMock');
  eventCount.roleGranted++;

  tx = await combined.write.grantRolePublic([BURNER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted BURNER_ROLE to bob on CombinedMock');
  eventCount.roleGranted++;

  tx = await combined.write.grantRolePublic([OPERATOR_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted OPERATOR_ROLE to charlie on CombinedMock');
  eventCount.roleGranted++;

  console.log('\n=== Phase 5: Additional Role Operations ===');

  // Grant more roles to show history
  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted MINTER_ROLE to dave');
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([UPGRADER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted UPGRADER_ROLE to alice');
  eventCount.roleGranted++;

  // Revoke and re-grant to show history
  tx = await accessControl.write.revokeRolePublic([PAUSER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Revoked PAUSER_ROLE from charlie');
  eventCount.roleRevoked++;

  tx = await accessControl.write.grantRolePublic([PAUSER_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log('✓ Granted PAUSER_ROLE to eve');
  eventCount.roleGranted++;

  console.log('\n=== Event Generation Complete ===');
  console.log('Total events generated:');
  console.log(`- RoleGranted: ${eventCount.roleGranted}`);
  console.log(`- RoleRevoked: ${eventCount.roleRevoked}`);
  console.log(`- RoleAdminChanged: ${eventCount.roleAdminChanged}`);
  console.log(`- OwnershipTransferStarted: ${eventCount.ownershipTransferStarted}`);
  console.log(`- OwnershipTransferred: ${eventCount.ownershipTransferred}`);
  console.log(`\nTotal: ${Object.values(eventCount).reduce((a, b) => a + b, 0)} events`);

  console.log('\n=== Contract Summary ===');
  console.log('AccessControlMock:', DEPLOYED_CONTRACTS.accessControl);
  console.log('  - Has roles: MINTER, BURNER, OPERATOR, PAUSER, UPGRADER');
  console.log('  - Has admin hierarchy: OPERATOR_ROLE -> PAUSER_ROLE, MINTER_ROLE -> UPGRADER_ROLE');
  console.log('CombinedMock:', DEPLOYED_CONTRACTS.combined);
  console.log('  - Has roles: MINTER, BURNER, OPERATOR');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
