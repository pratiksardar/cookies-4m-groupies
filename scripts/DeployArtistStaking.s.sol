// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/ArtistStaking.sol";

contract DeployArtistStaking is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get the required addresses from the environment
        address stablecoin = vm.envAddress("STABLECOIN_ADDRESS");
        address cookiesToken = vm.envAddress("COOKIES_TOKEN_ADDRESS");
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        ArtistStaking artistStaking = new ArtistStaking(
            stablecoin,
            cookiesToken,
            platformWallet
        );
        
        vm.stopBroadcast();

        // Log the deployed address
        console.log("ArtistStaking deployed to:", address(artistStaking));
        
        // Verify the contract
        string memory verifyCommand = string(
            abi.encodePacked(
                "forge verify-contract ",
                address(artistStaking),
                " contracts/ArtistStaking.sol:ArtistStaking --chain celo-alfajores --constructor-args $(cast abi-encode \"constructor(address,address,address)\" ",
                stablecoin,
                " ",
                cookiesToken,
                " ",
                platformWallet,
                ") --etherscan-api-key $CELOSCAN_API_KEY"
            )
        );
        
        console.log("\nTo verify the contract, run:");
        console.log(verifyCommand);
    }
} 