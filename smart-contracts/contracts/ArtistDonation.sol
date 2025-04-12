// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArtistDonation is Ownable {
    uint256 public constant PLATFORM_FEE = 10; // 10%
    address public platformWallet;

    event DonationReceived(address indexed donor, address indexed artist, uint256 amount);

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    function donate(address artist, address token, uint256 amount) external {
        require(artist != address(0), "Invalid artist address");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 erc20Token = IERC20(token);
        require(erc20Token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Calculate platform fee and artist amount
        uint256 platformAmount = (amount * PLATFORM_FEE) / 100;
        uint256 artistAmount = amount - platformAmount;

        // Transfer to platform and artist
        require(erc20Token.transfer(platformWallet, platformAmount), "Platform transfer failed");
        require(erc20Token.transfer(artist, artistAmount), "Artist transfer failed");

        emit DonationReceived(msg.sender, artist, amount);
    }

    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }}