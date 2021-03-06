// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract AggregatorV3 is AggregatorV3Interface {
    constructor() {
    }

    function decimals() external override view returns (uint8) {
        return 18;
    }
    
    function description() external override view returns (string memory) {
        return "";
    }

    function version() external override view returns (uint256) {
        return 1;
    }

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.
    function getRoundData(uint80 _roundId)
    external
    override
    view
    returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (
        73786976294838207546,
        250000000000000,
        1621031671,
        1621031671,
        73786976294838207546
    );
    }

    function latestRoundData()
    external
    override
    view
    returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (
        73786976294838207546,
        250000000000000,
        1621031671,
        1621031671,
        73786976294838207546
    );
    }
}
