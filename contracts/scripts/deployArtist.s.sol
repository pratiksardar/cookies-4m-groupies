// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ArtistCrowdfunding.sol";
import "../src/SponsorshipNFT.sol";

contract DeployContracts is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER_ADDRESS");
        address tokenAddress = vm.envAddress("TOKEN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ArtistCrowdfunding first with a zero address for NFT
        ArtistCrowdfunding crowdfunding = new ArtistCrowdfunding(
            owner,
            tokenAddress,
            address(0) // Initially set NFT contract to zero address
        );

        // 2. Deploy SponsorshipNFT with the crowdfunding address
        SponsorshipNFT nft = new SponsorshipNFT(
            owner,
            address(crowdfunding)
        );

        // 3. Update the NFT address in crowdfunding contract
        crowdfunding.setSponsorshipNFT(address(nft));

        vm.stopBroadcast();

        console.log("ArtistCrowdfunding deployed at:", address(crowdfunding));
        console.log("SponsorshipNFT deployed at:", address(nft));
    }
}