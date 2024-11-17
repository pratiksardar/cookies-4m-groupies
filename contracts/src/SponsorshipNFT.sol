// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@pythnetwork/pyth-evm/contracts/PythEntropy.sol";

contract SponsorshipNFT {
    // Sponsorship tiers
    uint256[] public tierThresholds = [1 ether, 5 ether, 10 ether, 20 ether, 50 ether];
    string[] public tierNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

    // Pyth entropy contract
    PythEntropy public pythEntropy;

    // Events
    event SponsorshipNFTMinted(
        uint256 indexed tokenId,
        address indexed artist,
        address indexed sponsor,
        uint256 amount,
        uint256 tier
    );

    // Custom errors
    error OnlyCrowdfundingContract();
    error InvalidTierSetup();
    error NoSponsorshipFound();

    constructor(
        address initialOwner,
        address _crowdfundingContract,
        address _pythEntropyAddress
    ) {
        // Initialize the Pyth entropy contract
        pythEntropy = PythEntropy(_pythEntropyAddress);
    }

    function mintSponsorshipNFT(
        address artist,
        address sponsor,
        uint256 amount
    ) external {
        // Generate a random token ID using Pyth entropy
        uint256 tokenId = pythEntropy.getRandomNumber();

        // Determine the sponsorship tier based on the amount
        uint256 tier = getTier(amount);

        // Mint the NFT (implementation depends on your NFT minting logic)
        // _mint(sponsor, tokenId);

        emit SponsorshipNFTMinted(tokenId, artist, sponsor, amount, tier);
    }

    function getTier(uint256 amount) internal view returns (uint256) {
        for (uint256 i = tierThresholds.length; i > 0; i--) {
            if (amount >= tierThresholds[i - 1]) {
                return i - 1;
            }
        }
        revert InvalidTierSetup();
    }
}