// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../DAAO-contracts/contracts/AIRecorder.sol";

contract Checker is AIRecorder {
    function setResponse(
        uint256 proposalId,
        bytes calldata prompt,
        bool result
    ) external {
        AIDatas[proposalId] = AIData({
            positivePassed: result,
            uri: Strings.toString(proposalId),
            prompt: prompt
        });
    }
}
