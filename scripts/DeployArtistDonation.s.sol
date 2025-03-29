// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/ArtistDonation.sol";

contract DeployArtistDonation is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get the platform wallet address from the environment
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        ArtistDonation artistDonation = new ArtistDonation(platformWallet);
        
        vm.stopBroadcast();

        // Log the deployed address
        console.log("ArtistDonation deployed to:", address(artistDonation));
        
        // Verify the contract
        string memory verifyCommand = string(
            abi.encodePacked(
                "forge verify-contract ",
                address(artistDonation),
                " ArtistDonation --chain celo-alfajores --constructor-args $(cast abi-encode \"constructor(address)\" ",
                platformWallet,
                ") --etherscan-api-key $CELOSCAN_API_KEY"
            )
        );
        
        console.log("\nTo verify the contract, run:");
        console.log(verifyCommand);
    }
} 