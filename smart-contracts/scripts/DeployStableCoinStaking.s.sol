// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/StableCoinStaking.sol";
import "../contracts/CookiesToken.sol";

contract DeployStableCoinStaking is Script {
    function run() public {
        // Get the private key and contract addresses from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cookiesTokenAddress = vm.envAddress("COOKIES_TOKEN_ADDRESS");
        address stableCoinAddress = vm.envAddress("STABLECOIN_ADDRESS");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy StableCoinStaking
        StableCoinStaking stableCoinStaking = new StableCoinStaking(
            cookiesTokenAddress,
            stableCoinAddress
        );
        console.log("StableCoinStaking deployed to:", address(stableCoinStaking));

        // Grant minter role to the staking contract
        CookiesToken cookiesToken = CookiesToken(cookiesTokenAddress);
        cookiesToken.addMinter(address(stableCoinStaking));
        console.log("Granted minter role to StableCoinStaking contract");

        vm.stopBroadcast();

        // Log verification command
        console.log("\nTo verify the contract, run:");
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(stableCoinStaking),
            " contracts/StableCoinStaking.sol:StableCoinStaking --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY --constructor-args $(cast abi-encode \"constructor(address,address)\" ",
            cookiesTokenAddress,
            " ",
            stableCoinAddress,
            ")"
        )));
    }
} 