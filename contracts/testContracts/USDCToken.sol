// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract USDCToken is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("USDCToken", "USDC") {
        _setupDecimals(6); // USDC has decimal 6
    }
}


