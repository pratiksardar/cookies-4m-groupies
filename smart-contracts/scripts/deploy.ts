import { ethers } from "hardhat";
import fs from 'fs/promises';
import path from 'path';

async function updateContractAddresses(addresses: {
  cookiesToken: string;
  nftFactory: string;
  artistDonation: string;
  artistStaking: string;
  stableCoinStaking: string;
}) {
  // Path to frontend features.ts file
  const configPath = path.join(__dirname, '../../frontend/src/config/features.ts');
  
  try {
  let content = await fs.readFile(configPath, 'utf8');

  // Update each address in the config
  Object.entries(addresses).forEach(([key, value]) => {
    const regex = new RegExp(`(${key}:\\s*)'[^']*'`, 'g');
    content = content.replace(regex, `$1'${value}'`);
  });

  await fs.writeFile(configPath, content, 'utf8');
    console.log("Updated contract addresses in features configuration");
  } catch (error) {
    console.warn("Could not update features.ts. You'll need to update contract addresses manually.");
    console.error(error);
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", network.name);

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

  // Get the appropriate stablecoin address based on the network
  let stablecoinAddress;
  if (network.name === "celo") {
    // Celo Dollar (cUSD) on Celo mainnet
    stablecoinAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  } else if (network.name === "alfajores") {
    // Celo Dollar (cUSD) on Alfajores testnet
    stablecoinAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  } else {
    // Default to a placeholder for local testing
    stablecoinAddress = "0x0000000000000000000000000000000000000000";
    console.warn("Using placeholder stablecoin address for network:", network.name);
  }

  // Deploy ArtistStaking with appropriate stablecoin address
  const ArtistStaking = await ethers.getContractFactory("ArtistStaking");
  const artistStaking = await ArtistStaking.deploy(
    stablecoinAddress,
    await cookiesToken.getAddress(),
    platformWallet
  );
  await artistStaking.waitForDeployment();
  console.log("ArtistStaking deployed to:", await artistStaking.getAddress());
  
  // Deploy StableCoinStaking contract
  const StableCoinStaking = await ethers.getContractFactory("StableCoinStaking");
  const stableCoinStaking = await StableCoinStaking.deploy(
    await cookiesToken.getAddress(),
    stablecoinAddress
  );
  await stableCoinStaking.waitForDeployment();
  console.log("StableCoinStaking deployed to:", await stableCoinStaking.getAddress());
  console.log("Using stablecoin address:", stablecoinAddress);

  // Grant minter role to ArtistStaking contract
  await cookiesToken.addMinter(await artistStaking.getAddress());
  console.log("Granted minter role to ArtistStaking contract");

  // Grant minter role to StableCoinStaking contract
  await cookiesToken.addMinter(await stableCoinStaking.getAddress());
  console.log("Granted minter role to StableCoinStaking contract");

  // Save contract addresses to a local file for reference
  const addresses = {
    cookiesToken: await cookiesToken.getAddress(),
    nftFactory: await nftFactory.getAddress(),
    artistDonation: await artistDonation.getAddress(),
    artistStaking: await artistStaking.getAddress(),
    stableCoinStaking: await stableCoinStaking.getAddress()
  };
  
  // Write addresses to a JSON file
  await fs.writeFile(
    path.join(__dirname, '../deployed-addresses.json'), 
    JSON.stringify(addresses, null, 2)
  );
  console.log("Saved contract addresses to deployed-addresses.json");
  
  // Try to update frontend config
  await updateContractAddresses(addresses);

  // Verify contracts
  console.log("\nVerifying contracts...");
  console.log("Run the following commands to verify your contracts:");
  console.log(`npx hardhat verify --network ${network.name} ${await cookiesToken.getAddress()}`);
  console.log(`npx hardhat verify --network ${network.name} ${await nftFactory.getAddress()}`);
  console.log(`npx hardhat verify --network ${network.name} ${await artistDonation.getAddress()} ${platformWallet}`);
  console.log(`npx hardhat verify --network ${network.name} ${await artistStaking.getAddress()} ${stablecoinAddress} ${await cookiesToken.getAddress()} ${platformWallet}`);
  console.log(`npx hardhat verify --network ${network.name} ${await stableCoinStaking.getAddress()} ${await cookiesToken.getAddress()} ${stablecoinAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });