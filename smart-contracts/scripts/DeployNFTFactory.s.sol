// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/NFTFactory.sol";

contract DeployNFTFactory is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        NFTFactory nftFactory = new NFTFactory();
        
        vm.stopBroadcast();

        // Log the deployed address
        console.log("NFTFactory deployed to:", address(nftFactory));
        
        // Verify the contract
        string memory verifyCommand = string(
            abi.encodePacked(
                "forge verify-contract ",
                address(nftFactory),
                " contracts/NFTFactory.sol:NFTFactory --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY"
            )
        );
        
        console.log("\nTo verify the contract, run:");
        console.log(verifyCommand);
    }
} 