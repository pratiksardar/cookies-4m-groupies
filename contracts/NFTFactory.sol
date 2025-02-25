// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTFactory is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to artwork metadata URI
    mapping(uint256 => string) private _tokenURIs;
    
    // Mapping from token ID to artist address
    mapping(uint256 => address) public artistOf;

    constructor() ERC721("ArtistPlatformNFT", "ARTNFT") Ownable(msg.sender) {}

    function createNFT(address artist, string memory tokenURI) public returns (uint256) {
        require(artist != address(0), "Invalid artist address");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(artist, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        artistOf[newTokenId] = artist;

        return newTokenId;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}