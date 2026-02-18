// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title CombinedMock
 * @notice Mock contract implementing both AccessControlDefaultAdminRules and
 *         Ownable2Step. Exercises the full spectrum of access-control patterns
 *         in a single contract.
 *
 *         `owner()` is resolved in favour of Ownable so that Ownable2Step
 *         transfer semantics remain intact while DefaultAdminRules governs the
 *         DEFAULT_ADMIN_ROLE independently.
 */
contract CombinedMock is AccessControlDefaultAdminRules, Ownable2Step {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(
        uint48 initialDelay,
        address admin
    )
        AccessControlDefaultAdminRules(initialDelay, admin)
        Ownable(admin)
    {}

    // --- Conflict resolution ---------------------------------------------------

    /**
     * @dev Both AccessControlDefaultAdminRules (IERC5313) and Ownable define
     *      owner(). Delegate to Ownable so that Ownable2Step transfer logic
     *      keeps working as expected.
     */
    function owner()
        public
        view
        override(Ownable, AccessControlDefaultAdminRules)
        returns (address)
    {
        return Ownable.owner();
    }

    // --- AccessControl helpers -------------------------------------------------

    function grantRolePublic(bytes32 role, address account) external {
        grantRole(role, account);
    }

    function revokeRolePublic(bytes32 role, address account) external {
        revokeRole(role, account);
    }

    // --- Ownable2Step helpers --------------------------------------------------

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
