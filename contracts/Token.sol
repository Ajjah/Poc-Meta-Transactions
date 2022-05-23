//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(address to) ERC20("MyToken", "bcp") {
        _mint(to, 500000000 * 10**18);
    }
}
