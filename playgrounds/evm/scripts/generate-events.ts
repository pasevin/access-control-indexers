import { network } from "hardhat";
import { keccak256, toBytes, getAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

/**
 * Generate test events for the Access Control indexer using deployed contracts
 * Usage: PRIVATE_KEY=<key> npx hardhat run scripts/generate-events.ts --network sepolia
 */

// Deployed contract addresses on Sepolia
const DEPLOYED_CONTRACTS = {
  accessControl: getAddress("0xd2e50107e0250631f5dff19a4ea226a04a0e747e"),
  defaultAdminRules: getAddress("0xd5590c114f7331d61f5c952e68be161aa5fed14e"),
  ownable: getAddress("0xeb3fbb1d60cc21f36f3545f6b9421b62bd28cd5c"),
  ownable2Step: getAddress("0x868d17c3aaaf3c053e2fcb1bcdea88a6afc95c0d"),
  combined: getAddress("0x5adda282f133b878270282e15c1c9a8d0e228f51"),
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

  console.log("Generating test events on:", networkName);
  console.log("Deployer:", deployer.account.address);
  console.log("\n=== Using Deployed Contracts ===");
  console.log("AccessControlMock:", DEPLOYED_CONTRACTS.accessControl);
  console.log("DefaultAdminRulesMock:", DEPLOYED_CONTRACTS.defaultAdminRules);
  console.log("OwnableMock:", DEPLOYED_CONTRACTS.ownable);
  console.log("Ownable2StepMock:", DEPLOYED_CONTRACTS.ownable2Step);
  console.log("CombinedMock:", DEPLOYED_CONTRACTS.combined);

  // Generate random addresses for test accounts
  const [alice, bob, charlie, dave, eve] = generateRandomAddresses(5);
  console.log("\nTest accounts (random addresses):");
  console.log("  alice:", alice);
  console.log("  bob:", bob);
  console.log("  charlie:", charlie);
  console.log("  dave:", dave);
  console.log("  eve:", eve);

  // Get contract instances
  const accessControl = await viem.getContractAt(
    "AccessControlMock",
    DEPLOYED_CONTRACTS.accessControl
  );

  const defaultAdminRules = await viem.getContractAt(
    "DefaultAdminRulesMock",
    DEPLOYED_CONTRACTS.defaultAdminRules
  );

  const ownable2Step = await viem.getContractAt(
    "Ownable2StepMock",
    DEPLOYED_CONTRACTS.ownable2Step
  );

  const combined = await viem.getContractAt(
    "CombinedMock",
    DEPLOYED_CONTRACTS.combined
  );

  // Define roles
  const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
  const MINTER_ROLE = keccak256(toBytes("MINTER_ROLE"));
  const BURNER_ROLE = keccak256(toBytes("BURNER_ROLE"));
  const OPERATOR_ROLE = keccak256(toBytes("OPERATOR_ROLE"));
  const PAUSER_ROLE = keccak256(toBytes("PAUSER_ROLE"));
  const UPGRADER_ROLE = keccak256(toBytes("UPGRADER_ROLE"));

  console.log("\n=== Role Hashes ===");
  console.log("MINTER_ROLE:", MINTER_ROLE);
  console.log("BURNER_ROLE:", BURNER_ROLE);
  console.log("OPERATOR_ROLE:", OPERATOR_ROLE);
  console.log("PAUSER_ROLE:", PAUSER_ROLE);
  console.log("UPGRADER_ROLE:", UPGRADER_ROLE);

  const eventCount = {
    roleGranted: 0,
    roleRevoked: 0,
    roleAdminChanged: 0,
    defaultAdminTransferScheduled: 0,
    defaultAdminTransferCanceled: 0,
    ownershipTransferStarted: 0,
    ownershipTransferred: 0,
  };

  // =========================================================================
  // Phase 1: Grant Roles on AccessControlMock
  // =========================================================================
  console.log("\n=== Phase 1: Grant Roles on AccessControlMock ===");

  let tx = await accessControl.write.grantRolePublic([MINTER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to alice");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to bob");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to charlie");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([BURNER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted BURNER_ROLE to alice");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([BURNER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted BURNER_ROLE to dave");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([OPERATOR_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted OPERATOR_ROLE to bob");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([OPERATOR_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted OPERATOR_ROLE to eve");
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([PAUSER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted PAUSER_ROLE to charlie");
  eventCount.roleGranted++;

  // =========================================================================
  // Phase 2: Revoke Some Roles
  // =========================================================================
  console.log("\n=== Phase 2: Revoke Some Roles ===");

  tx = await accessControl.write.revokeRolePublic([MINTER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Revoked MINTER_ROLE from bob");
  eventCount.roleRevoked++;

  tx = await accessControl.write.revokeRolePublic([BURNER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Revoked BURNER_ROLE from dave");
  eventCount.roleRevoked++;

  tx = await accessControl.write.revokeRolePublic([OPERATOR_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Revoked OPERATOR_ROLE from eve");
  eventCount.roleRevoked++;

  // =========================================================================
  // Phase 3: Role Admin Changes
  // =========================================================================
  console.log("\n=== Phase 3: Role Admin Changes ===");

  tx = await accessControl.write.setRoleAdminPublic([
    PAUSER_ROLE,
    OPERATOR_ROLE,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Set OPERATOR_ROLE as admin of PAUSER_ROLE");
  eventCount.roleAdminChanged++;

  tx = await accessControl.write.setRoleAdminPublic([
    UPGRADER_ROLE,
    MINTER_ROLE,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Set MINTER_ROLE as admin of UPGRADER_ROLE");
  eventCount.roleAdminChanged++;

  // =========================================================================
  // Phase 4: DefaultAdminRulesMock Operations
  // =========================================================================
  console.log("\n=== Phase 4: DefaultAdminRulesMock Operations ===");

  // Grant roles on DefaultAdminRulesMock
  tx = await defaultAdminRules.write.grantRolePublic([MINTER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to alice on DefaultAdminRulesMock");
  eventCount.roleGranted++;

  tx = await defaultAdminRules.write.grantRolePublic([BURNER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted BURNER_ROLE to bob on DefaultAdminRulesMock");
  eventCount.roleGranted++;

  tx = await defaultAdminRules.write.grantRolePublic([OPERATOR_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted OPERATOR_ROLE to charlie on DefaultAdminRulesMock");
  eventCount.roleGranted++;

  tx = await defaultAdminRules.write.grantRolePublic([PAUSER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted PAUSER_ROLE to dave on DefaultAdminRulesMock");
  eventCount.roleGranted++;

  // Revoke a role
  tx = await defaultAdminRules.write.revokeRolePublic([BURNER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Revoked BURNER_ROLE from bob on DefaultAdminRulesMock");
  eventCount.roleRevoked++;

  // Begin default admin transfer (emits DefaultAdminTransferScheduled)
  tx = await defaultAdminRules.write.beginDefaultAdminTransfer([alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Began default admin transfer to alice");
  eventCount.defaultAdminTransferScheduled++;

  // Cancel the transfer (emits DefaultAdminTransferCanceled)
  tx = await defaultAdminRules.write.cancelDefaultAdminTransfer();
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Canceled default admin transfer");
  eventCount.defaultAdminTransferCanceled++;

  // Begin another transfer to bob
  tx = await defaultAdminRules.write.beginDefaultAdminTransfer([bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Began default admin transfer to bob");
  eventCount.defaultAdminTransferScheduled++;

  // Cancel that too
  tx = await defaultAdminRules.write.cancelDefaultAdminTransfer();
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Canceled default admin transfer");
  eventCount.defaultAdminTransferCanceled++;

  // Set role admin on DefaultAdminRulesMock (not for DEFAULT_ADMIN_ROLE)
  tx = await defaultAdminRules.write.setRoleAdminPublic([
    PAUSER_ROLE,
    MINTER_ROLE,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(
    "✓ Set MINTER_ROLE as admin of PAUSER_ROLE on DefaultAdminRulesMock"
  );
  eventCount.roleAdminChanged++;

  // =========================================================================
  // Phase 5: Combined Contract Operations
  // =========================================================================
  console.log("\n=== Phase 5: Combined Contract Operations ===");

  tx = await combined.write.grantRolePublic([MINTER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to alice on CombinedMock");
  eventCount.roleGranted++;

  tx = await combined.write.grantRolePublic([BURNER_ROLE, bob]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted BURNER_ROLE to bob on CombinedMock");
  eventCount.roleGranted++;

  // Begin default admin transfer on CombinedMock
  tx = await combined.write.beginDefaultAdminTransfer([charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Began default admin transfer to charlie on CombinedMock");
  eventCount.defaultAdminTransferScheduled++;

  // Cancel it
  tx = await combined.write.cancelDefaultAdminTransfer();
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Canceled default admin transfer on CombinedMock");
  eventCount.defaultAdminTransferCanceled++;

  // =========================================================================
  // Phase 6: Additional Role Operations on AccessControlMock
  // =========================================================================
  console.log("\n=== Phase 6: Additional Role Operations ===");

  tx = await accessControl.write.grantRolePublic([MINTER_ROLE, dave]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted MINTER_ROLE to dave");
  eventCount.roleGranted++;

  // Grant deployer MINTER_ROLE so they can manage UPGRADER_ROLE
  tx = await accessControl.write.grantRolePublic([
    MINTER_ROLE,
    deployer.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(
    "✓ Granted MINTER_ROLE to deployer (needed to manage UPGRADER_ROLE)"
  );
  eventCount.roleGranted++;

  tx = await accessControl.write.grantRolePublic([UPGRADER_ROLE, alice]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted UPGRADER_ROLE to alice");
  eventCount.roleGranted++;

  // Grant deployer OPERATOR_ROLE so they can manage PAUSER_ROLE
  tx = await accessControl.write.grantRolePublic([
    OPERATOR_ROLE,
    deployer.account.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(
    "✓ Granted OPERATOR_ROLE to deployer (needed to manage PAUSER_ROLE)"
  );
  eventCount.roleGranted++;

  tx = await accessControl.write.revokeRolePublic([PAUSER_ROLE, charlie]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Revoked PAUSER_ROLE from charlie");
  eventCount.roleRevoked++;

  tx = await accessControl.write.grantRolePublic([PAUSER_ROLE, eve]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("✓ Granted PAUSER_ROLE to eve");
  eventCount.roleGranted++;

  // =========================================================================
  // Summary
  // =========================================================================
  console.log("\n=== Event Generation Complete ===");
  console.log("Total events generated:");
  console.log(`- RoleGranted: ${eventCount.roleGranted}`);
  console.log(`- RoleRevoked: ${eventCount.roleRevoked}`);
  console.log(`- RoleAdminChanged: ${eventCount.roleAdminChanged}`);
  console.log(
    `- DefaultAdminTransferScheduled: ${eventCount.defaultAdminTransferScheduled}`
  );
  console.log(
    `- DefaultAdminTransferCanceled: ${eventCount.defaultAdminTransferCanceled}`
  );
  console.log(
    `- OwnershipTransferStarted: ${eventCount.ownershipTransferStarted}`
  );
  console.log(`- OwnershipTransferred: ${eventCount.ownershipTransferred}`);
  console.log(
    `\nTotal: ${Object.values(eventCount).reduce((a, b) => a + b, 0)} events`
  );

  console.log("\n=== Contract Summary ===");
  console.log("AccessControlMock:", DEPLOYED_CONTRACTS.accessControl);
  console.log("  - Has roles: MINTER, BURNER, OPERATOR, PAUSER, UPGRADER");
  console.log(
    "  - Has admin hierarchy: OPERATOR_ROLE -> PAUSER_ROLE, MINTER_ROLE -> UPGRADER_ROLE"
  );
  console.log("DefaultAdminRulesMock:", DEPLOYED_CONTRACTS.defaultAdminRules);
  console.log("  - Has roles: MINTER, BURNER, OPERATOR, PAUSER");
  console.log("  - Has admin hierarchy: MINTER_ROLE -> PAUSER_ROLE");
  console.log("  - DefaultAdmin transfer scheduled + canceled");
  console.log("CombinedMock:", DEPLOYED_CONTRACTS.combined);
  console.log("  - Has roles: MINTER, BURNER");
  console.log("  - DefaultAdmin transfer scheduled + canceled");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
