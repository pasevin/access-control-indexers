// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OwnableMock
 * @notice Mock contract for testing Ownable indexer
 */
contract OwnableMock is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Transfer ownership (for testing)
     */
    function transferOwnershipPublic(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    /**
     * @notice Renounce ownership (for testing)
     */
    function renounceOwnershipPublic() external onlyOwner {
        renounceOwnership();
    }
}
