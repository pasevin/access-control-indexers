// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessControlMock
 * @notice Mock contract for testing Access Control indexer
 */
contract AccessControlMock is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /**
     * @notice Grant a role to an account (for testing)
     */
    function grantRolePublic(bytes32 role, address account) external {
        grantRole(role, account);
    }

    /**
     * @notice Revoke a role from an account (for testing)
     */
    function revokeRolePublic(bytes32 role, address account) external {
        revokeRole(role, account);
    }

    /**
     * @notice Set the admin role for a role (for testing)
     */
    function setRoleAdminPublic(bytes32 role, bytes32 adminRole) external {
        _setRoleAdmin(role, adminRole);
    }
}
