// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../contracts/StableCoinStaking.sol";

contract StakeCUSD is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Contract addresses
        address CUSD_TOKEN = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
        address STAKING_CONTRACT = 0xca8364f68aA2309F699f13F1a8b47F5A98fc5360;
        
        // Amount to stake: 0.1 cUSD (with 18 decimals)
        uint256 amountToStake = 100000000000000000; // 0.1 * 10^18
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // First approve the staking contract to spend cUSD
        IERC20 cUSD = IERC20(CUSD_TOKEN);
        cUSD.approve(STAKING_CONTRACT, amountToStake);
        console.log("Approved staking contract to spend cUSD");
        
        // Then stake the cUSD
        StableCoinStaking staking = StableCoinStaking(STAKING_CONTRACT);
        staking.stake(amountToStake);
        console.log("Staked 0.1 cUSD successfully");
        
        vm.stopBroadcast();
    }
} 