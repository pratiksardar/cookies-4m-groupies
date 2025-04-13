#!/usr/bin/env node

/**
 * Script to update frontend contract addresses based on features.ts
 * Run this after deploying contracts to update the frontend configuration
 */

const fs = require('fs');
const path = require('path');

// Paths
const featuresPath = path.resolve(__dirname, '../frontend/src/config/features.ts');
const contractsPath = path.resolve(__dirname, '../frontend/src/config/contracts.ts');

async function main() {
  console.log('Updating frontend contract addresses...');

  try {
    // Read features.ts to get deployed contract addresses
    const featuresContent = fs.readFileSync(featuresPath, 'utf8');
    
    // Extract contract addresses using regex
    const contracts = {
      COOKIES_TOKEN: extractAddress(featuresContent, 'cookiesToken'),
      NFT_FACTORY: extractAddress(featuresContent, 'nftFactory'),
      ARTIST_DONATION: extractAddress(featuresContent, 'artistDonation'),
      ARTIST_STAKING: extractAddress(featuresContent, 'artistStaking'),
      STABLE_COIN_STAKING: extractAddress(featuresContent, 'stableCoinStaking')
    };

    console.log('Found contract addresses:');
    Object.entries(contracts).forEach(([key, value]) => {
      console.log(`${key}: ${value || 'Not found'}`);
    });

    // Read contracts.ts file
    let contractsContent = fs.readFileSync(contractsPath, 'utf8');

    // Update each contract address in the file
    Object.entries(contracts).forEach(([key, value]) => {
      if (value) {
        // Replace the fallback addresses in getEnvVar calls
        const regex = new RegExp(`(${key}_ADDRESS', ')([^']*)(')`, 'g');
        contractsContent = contractsContent.replace(regex, `$1${value}$3`);
      }
    });

    // Write updated content back
    fs.writeFileSync(contractsPath, contractsContent, 'utf8');
    console.log('Frontend contract addresses updated successfully!');

  } catch (error) {
    console.error('Error updating frontend contracts:', error);
    process.exit(1);
  }
}

function extractAddress(content, contractName) {
  const regex = new RegExp(`${contractName}:\\s*['"]([^'"]*)['"`, 'g');
  const match = regex.exec(content);
  return match ? match[1] : null;
}

main(); 