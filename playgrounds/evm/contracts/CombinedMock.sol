// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title CombinedMock
 * @notice Mock contract implementing both AccessControl and Ownable2Step
 */
contract CombinedMock is AccessControl, Ownable2Step {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(address admin) Ownable(admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // AccessControl functions
    function grantRolePublic(bytes32 role, address account) external {
        grantRole(role, account);
    }

    function revokeRolePublic(bytes32 role, address account) external {
        revokeRole(role, account);
    }

    // Ownable2Step functions
    function transferOwnershipPublic(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    function acceptOwnershipPublic() external {
        acceptOwnership();
    }

    function renounceOwnershipPublic() external onlyOwner {
        renounceOwnership();
    }
}
