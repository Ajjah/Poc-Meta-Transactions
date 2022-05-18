//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

contract Counter {
    uint256 public counter = 0;

    constructor() {}

    function IncrementCounter() public {
        ++counter;
    }

    function DecrementCounter() public {
        require(counter > 0, "counter cannot be negative");
        --counter;
    }
}
