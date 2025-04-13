// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/CookiesToken.sol";
import "../contracts/NFTFactory.sol";
import "../contracts/ArtistDonation.sol";
import "../contracts/ArtistStaking.sol";
import "../contracts/StableCoinStaking.sol";

contract DeployAll is Script {
    function run() public {
        // Get the private key and platform wallet from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address platformWallet = vm.envAddress("PLATFORM_WALLET_ADDRESS");
        address stableCoinAddress = vm.envAddress("STABLECOIN_ADDRESS");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy CookiesToken first
        CookiesToken cookiesToken = new CookiesToken();
        console.log("CookiesToken deployed to:", address(cookiesToken));

        // Deploy NFTFactory
        NFTFactory nftFactory = new NFTFactory();
        console.log("NFTFactory deployed to:", address(nftFactory));

        // Deploy ArtistDonation
        ArtistDonation artistDonation = new ArtistDonation(platformWallet);
        console.log("ArtistDonation deployed to:", address(artistDonation));

        // Deploy ArtistStaking
        ArtistStaking artistStaking = new ArtistStaking(
            stableCoinAddress,
            address(cookiesToken),
            platformWallet
        );
        console.log("ArtistStaking deployed to:", address(artistStaking));

        // Deploy StableCoinStaking
        StableCoinStaking stableCoinStaking = new StableCoinStaking(
            address(cookiesToken),
            stableCoinAddress
        );
        console.log("StableCoinStaking deployed to:", address(stableCoinStaking));

        // Grant minter roles
        cookiesToken.addMinter(address(artistStaking));
        cookiesToken.addMinter(address(stableCoinStaking));
        console.log("Granted minter roles to staking contracts");

        vm.stopBroadcast();

        // Log verification commands
        console.log("\nTo verify the contracts, run:");
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(cookiesToken),
            " contracts/CookiesToken.sol:CookiesToken --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY"
        )));
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(nftFactory),
            " contracts/NFTFactory.sol:NFTFactory --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY"
        )));
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(artistDonation),
            " contracts/ArtistDonation.sol:ArtistDonation --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY --constructor-args $(cast abi-encode \"constructor(address)\" ",
            platformWallet,
            ")"
        )));
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(artistStaking),
            " contracts/ArtistStaking.sol:ArtistStaking --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY --constructor-args $(cast abi-encode \"constructor(address,address,address)\" ",
            stableCoinAddress,
            " ",
            address(cookiesToken),
            " ",
            platformWallet,
            ")"
        )));
        console.log(string(abi.encodePacked(
            "forge verify-contract ",
            address(stableCoinStaking),
            " contracts/StableCoinStaking.sol:StableCoinStaking --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY --constructor-args $(cast abi-encode \"constructor(address,address)\" ",
            address(cookiesToken),
            " ",
            stableCoinAddress,
            ")"
        )));
    }
} 