// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CookiesToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC20("COOKIES", "COOKIE") Ownable(msg.sender) {
        minters[msg.sender] = true;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "Caller is not a minter");
        _;
    }

    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}