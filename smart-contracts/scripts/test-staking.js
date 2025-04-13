// Test script to interact with the deployed StableCoinStaking contract
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Load contract addresses from environment variables or use defaults
  const stableCoinStakingAddress = process.env.STABLE_COIN_STAKING_ADDRESS;
  const stableCoinAddress = process.env.STABLECOIN_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const cookiesTokenAddress = process.env.COOKIES_TOKEN_ADDRESS;
  
  if (!stableCoinStakingAddress || !cookiesTokenAddress) {
    console.error("Please set STABLE_COIN_STAKING_ADDRESS and COOKIES_TOKEN_ADDRESS in your environment");
    return;
  }
  
  console.log("StableCoinStaking address:", stableCoinStakingAddress);
  console.log("StableCoin (cUSD) address:", stableCoinAddress);
  console.log("CookiesToken address:", cookiesTokenAddress);
  
  // Get contract instances
  const StableCoinStaking = await ethers.getContractFactory("StableCoinStaking");
  const staking = StableCoinStaking.attach(stableCoinStakingAddress);
  
  const CookiesToken = await ethers.getContractFactory("CookiesToken");
  const cookies = CookiesToken.attach(cookiesTokenAddress);
  
  const stableCoinAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ];
  const stableCoin = new ethers.Contract(stableCoinAddress, stableCoinAbi, deployer);
  
  // Check balances
  const stableCoinBalance = await stableCoin.balanceOf(deployer.address);
  const cookiesBalance = await cookies.balanceOf(deployer.address);
  
  console.log("Your cUSD balance:", ethers.formatEther(stableCoinBalance));
  console.log("Your COOKIES balance:", ethers.formatEther(cookiesBalance));
  
  // Check staking details
  try {
    const stakedAmount = await staking.stakedBalanceOf(deployer.address);
    const pendingRewards = await staking.pendingRewards(deployer.address);
    console.log("Your staked amount:", ethers.formatEther(stakedAmount));
    console.log("Your pending rewards:", ethers.formatEther(pendingRewards));
    
    // Get staking reward rate
    const rewardRate = await staking.rewardRate();
    console.log("Reward rate:", rewardRate, "COOKIES per minute per cUSD staked");
    
  } catch (error) {
    console.error("Error retrieving staking info:", error.message);
  }
  
  // Test staking if we have cUSD
  if (stableCoinBalance.gt(0)) {
    const stakeAmount = ethers.parseEther("1.0"); // Stake 1 cUSD
    
    // First approve the transfer
    console.log("Approving staking contract to spend cUSD...");
    try {
      const approveTx = await stableCoin.approve(stableCoinStakingAddress, stakeAmount);
      await approveTx.wait();
      console.log("Approval successful");
      
      // Then stake
      console.log("Staking 1 cUSD...");
      const stakeTx = await staking.stake(stakeAmount);
      await stakeTx.wait();
      console.log("Staking successful!");
      
      // Check updated balances
      const newStakedAmount = await staking.stakedBalanceOf(deployer.address);
      console.log("Your new staked amount:", ethers.formatEther(newStakedAmount));
      
    } catch (error) {
      console.error("Error during staking process:", error.message);
    }
  } else {
    console.log("Not enough cUSD to test staking. Get some from the Alfajores faucet: https://faucet.celo.org/alfajores");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 