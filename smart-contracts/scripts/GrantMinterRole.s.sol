// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/CookiesToken.sol";

contract GrantMinterRole is Script {
    function run() public {
        // Get the private key and contract addresses from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cookiesTokenAddress = vm.envAddress("COOKIES_TOKEN_ADDRESS");
        address stableCoinStakingAddress = vm.envAddress("STABLE_COIN_STAKING_ADDRESS");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Grant minter role to the new StableCoinStaking contract
        CookiesToken cookiesToken = CookiesToken(cookiesTokenAddress);
        cookiesToken.addMinter(stableCoinStakingAddress);
        
        console.log("Granted minter role to StableCoinStaking contract at:", stableCoinStakingAddress);
        
        vm.stopBroadcast();
    }
} 