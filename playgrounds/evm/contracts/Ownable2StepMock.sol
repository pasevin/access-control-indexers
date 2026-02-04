// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title Ownable2StepMock
 * @notice Mock contract for testing Ownable2Step indexer
 */
contract Ownable2StepMock is Ownable2Step {
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Start ownership transfer (for testing)
     */
    function transferOwnershipPublic(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    /**
     * @notice Accept ownership (for testing)
     */
    function acceptOwnershipPublic() external {
        acceptOwnership();
    }

    /**
     * @notice Renounce ownership (for testing)
     */
    function renounceOwnershipPublic() external onlyOwner {
        renounceOwnership();
    }
}
