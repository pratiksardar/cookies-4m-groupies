import { ethers } from "hardhat";
import { features } from "../src/config/features";
import fs from 'fs/promises';
import path from 'path';

async function updateContractAddresses(addresses: {
  cookiesToken: string;
  nftFactory: string;
  artistDonation: string;
  artistStaking: string;
}) {
  const configPath = path.join(__dirname, '../src/config/features.ts');
  let content = await fs.readFile(configPath, 'utf8');

  // Update each address in the config
  Object.entries(addresses).forEach(([key, value]) => {
    const regex = new RegExp(`(${key}:\\s*)'[^']*'`, 'g');
    content = content.replace(regex, `$1'${value}'`);
  });

  await fs.writeFile(configPath, content, 'utf8');
}

async function main() {
  // Check if contract deployment is enabled
  if (!features.contracts.deployment.enabled) {
    console.log("Contract deployment is disabled in features configuration.");
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy CookiesToken first
  const CookiesToken = await ethers.getContractFactory("CookiesToken");
  const cookiesToken = await CookiesToken.deploy();
  await cookiesToken.waitForDeployment();
  console.log("CookiesToken deployed to:", await cookiesToken.getAddress());

  // Deploy NFTFactory
  const NFTFactory = await ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy();
  await nftFactory.waitForDeployment();
  console.log("NFTFactory deployed to:", await nftFactory.getAddress());

  // Deploy ArtistDonation
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
  if (!platformWallet) {
    throw new Error("Platform wallet address not set in environment variables");
  }

  const ArtistDonation = await ethers.getContractFactory("ArtistDonation");
  const artistDonation = await ArtistDonation.deploy(platformWallet);
  await artistDonation.waitForDeployment();
  console.log("ArtistDonation deployed to:", await artistDonation.getAddress());

  // Deploy ArtistStaking with USDC address (use Base Sepolia USDC address)
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const ArtistStaking = await ethers.getContractFactory("ArtistStaking");
  const artistStaking = await ArtistStaking.deploy(
    usdcAddress,
    await cookiesToken.getAddress(),
    platformWallet
  );
  await artistStaking.waitForDeployment();
  console.log("ArtistStaking deployed to:", await artistStaking.getAddress());

  // Grant minter role to ArtistStaking contract
  const minterRole = await cookiesToken.addMinter(await artistStaking.getAddress());
  console.log("Granted minter role to ArtistStaking contract");

  // Update contract addresses in features.ts
  await updateContractAddresses({
    cookiesToken: await cookiesToken.getAddress(),
    nftFactory: await nftFactory.getAddress(),
    artistDonation: await artistDonation.getAddress(),
    artistStaking: await artistStaking.getAddress()
  });
  console.log("Updated contract addresses in features configuration");

  // Verify contracts
  console.log("\nVerifying contracts...");
  console.log("Run the following commands to verify your contracts:");
  console.log(`npx hardhat verify --network base-sepolia ${await cookiesToken.getAddress()}`);
  console.log(`npx hardhat verify --network base-sepolia ${await nftFactory.getAddress()}`);
  console.log(`npx hardhat verify --network base-sepolia ${await artistDonation.getAddress()} ${platformWallet}`);
  console.log(`npx hardhat verify --network base-sepolia ${await artistStaking.getAddress()} ${usdcAddress} ${await cookiesToken.getAddress()} ${platformWallet}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });