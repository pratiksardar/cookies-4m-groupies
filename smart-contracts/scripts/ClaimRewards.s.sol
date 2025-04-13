// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/StableCoinStaking.sol";
import "../contracts/CookiesToken.sol";

contract ClaimRewards is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Contract addresses
        address STAKING_CONTRACT = 0xca8364f68aA2309F699f13F1a8b47F5A98fc5360;
        address COOKIES_TOKEN = 0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6;
        
        // Get the user's address
        address userAddress = vm.addr(deployerPrivateKey);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Check pending rewards
        StableCoinStaking staking = StableCoinStaking(STAKING_CONTRACT);
        uint256 pendingRewards = staking.pendingRewards(userAddress);
        console.log("Pending rewards:", pendingRewards);
        
        // Check current COOKIES balance
        CookiesToken cookies = CookiesToken(COOKIES_TOKEN);
        uint256 currentBalance = cookies.balanceOf(userAddress);
        console.log("Current COOKIES balance:", currentBalance);
        
        // Claim rewards
        staking.claimRewards();
        console.log("Claimed rewards successfully");
        
        // Check new COOKIES balance
        uint256 newBalance = cookies.balanceOf(userAddress);
        console.log("New COOKIES balance:", newBalance);
        console.log("Rewards claimed:", newBalance - currentBalance);
        
        vm.stopBroadcast();
    }
} 