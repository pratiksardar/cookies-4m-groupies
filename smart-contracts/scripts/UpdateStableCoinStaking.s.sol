// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/StableCoinStaking.sol";

contract UpdateStableCoinStaking is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy a new StableCoinStaking contract with the correct cUSD token address
        StableCoinStaking stableCoinStaking = new StableCoinStaking(
            0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6, // CookiesToken address
            0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1  // Correct cUSD token address with checksum
        );
        
        console.log("New StableCoinStaking deployed to:", address(stableCoinStaking));
        
        // Grant minter role to the new StableCoinStaking contract
        // This will be done in a separate transaction
        
        vm.stopBroadcast();
        
        // Log verification command
        console.log("\nTo verify the contract, run:");
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(stableCoinStaking),
            " contracts/StableCoinStaking.sol:StableCoinStaking --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY --constructor-args $(cast abi-encode \"constructor(address,address)\" ",
            "0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6",
            " ",
            "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
            ")"
        )));
    }
} 