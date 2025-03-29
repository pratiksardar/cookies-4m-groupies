// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/CookiesToken.sol";

contract DeployCookiesToken is Script {
    function run() public {
        // Get the private key from the environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        CookiesToken cookiesToken = new CookiesToken();
        
        vm.stopBroadcast();

        // Log the deployed address
        console.log("CookiesToken deployed to:", address(cookiesToken));
        
        // Verify the contract
        string memory verifyCommand = string(
            abi.encodePacked(
                "forge verify-contract ",
                address(cookiesToken),
                " contracts/CookiesToken.sol:CookiesToken --chain celo-alfajores --etherscan-api-key $CELOSCAN_API_KEY"
            )
        );
        
        console.log("\nTo verify the contract, run:");
        console.log(verifyCommand);
    }
} 