//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Token is ERC20, ERC2771Context {
    constructor(
        string memory name,
        string memory symbol,
        address forwarder,
        address owner
    ) ERC20(name, symbol) ERC2771Context(forwarder) {
        _mint(owner, 500000000 * 10**18);
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function TransferFrom(
        address _sender,
        address _reciever,
        uint256 _amount
    ) external {
        transferFrom(_sender, _reciever, _amount);
    }
}
