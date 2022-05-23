//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.9;

import "./Token.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Receiver is ERC2771Context {
    MyToken token;

    constructor(address token_address, address forwarder)
        ERC2771Context(forwarder)
    {
        token = MyToken(token_address);
    }

    function TransferFrom(
        address _sender,
        address _reciever,
        uint256 _amount
    ) external {
        token.transferFrom(_sender, _reciever, _amount);
    }
}
