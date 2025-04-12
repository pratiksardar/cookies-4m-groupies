// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

contract NFTFactory {
    event CollectionCreated(
        address indexed collectionAddress,
        address indexed owner,
        string name,
        string symbol
    );

    address[] public allCollections;
    mapping(address => address[]) public ownerCollections;

    function createNFTCollection(string memory name, string memory symbol) external {
        NFTCollection newCollection = new NFTCollection(name, symbol, msg.sender);
        address collectionAddress = address(newCollection);
        
        allCollections.push(collectionAddress);
        ownerCollections[msg.sender].push(collectionAddress);
        
        emit CollectionCreated(collectionAddress, msg.sender, name, symbol);
    }

    function getCollectionsByOwner(address owner) external view returns (address[] memory) {
        return ownerCollections[owner];
    }

    function getAllCollections() external view returns (address[] memory) {
        return allCollections;
    }
}