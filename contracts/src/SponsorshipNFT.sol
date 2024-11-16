// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SponsorshipNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;

    address public crowdfundingContract;

    struct SponsorshipDetails {
        address artist;
        address sponsor;
        uint256 amount;
        uint256 timestamp;
        string artistProfileURI;
        uint256 sponsorshipTier;
    }

    mapping(uint256 => SponsorshipDetails) public sponsorshipDetails;
    mapping(address => mapping(address => uint256[])) public artistSponsorNFTs; // artist => sponsor => tokenIds

    // Sponsorship tiers
    uint256[] public tierThresholds = [1 ether, 5 ether, 10 ether, 20 ether, 50 ether];
    string[] public tierNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

    // Events
    event SponsorshipNFTMinted(
        uint256 indexed tokenId,
        address indexed artist,
        address indexed sponsor,
        uint256 amount,
        uint256 tier
    );

    // Custom errors
    error OnlyCrowdfundingContract();
    error InvalidTierSetup();
    error NoSponsorshipFound();

    constructor(
        address initialOwner,
        address _crowdfundingContract
    ) ERC721("Sponsorship NFT", "SPNFT") Ownable(initialOwner) {
        crowdfundingContract = _crowdfundingContract;
    }

    modifier onlyCrowdfunding() {
        if (msg.sender != crowdfundingContract) revert OnlyCrowdfundingContract();
        _;
    }

    function _getNextTokenId() private returns (uint256) {
        _tokenIds += 1;
        return _tokenIds;
    }

    function mintSponsorshipNFT(
        address artist,
        address sponsor,
        uint256 amount,
        string calldata artistProfileURI
    ) external onlyCrowdfunding returns (uint256) {
        uint256 newTokenId = _getNextTokenId(); 

        // Determine sponsorship tier
        uint256 tier = _determineTier(amount);

        // Store sponsorship details
        sponsorshipDetails[newTokenId] = SponsorshipDetails({
            artist: artist,
            sponsor: sponsor,
            amount: amount,
            timestamp: block.timestamp,
            artistProfileURI: artistProfileURI,
            sponsorshipTier: tier
        });

        // Track NFTs for artist-sponsor relationship
        artistSponsorNFTs[artist][sponsor].push(newTokenId);

        // Generate and set token URI
        string memory _uri = _generateTokenURI(newTokenId);
        _safeMint(sponsor, newTokenId);
        _setTokenURI(newTokenId, _uri);

        emit SponsorshipNFTMinted(newTokenId, artist, sponsor, amount, tier);

        return newTokenId;
    }

    function _determineTier(uint256 amount) internal view returns (uint256) {
        for (uint256 i = tierThresholds.length; i > 0; i--) {
            if (amount >= tierThresholds[i - 1]) {
                return i;
            }
        }
        return 0;
    }

    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        SponsorshipDetails memory details = sponsorshipDetails[tokenId];
        
        bytes memory image = _generateSVGImage(details);
        
        bytes memory dataURI = abi.encodePacked(
            '{',
            '"name": "Sponsorship NFT #', tokenId.toString(), '",',
            '"description": "This NFT represents a sponsorship between an artist and their supporter.",',
            '"image": "data:image/svg+xml;base64,', Base64.encode(image), '",',
            '"attributes": [',
                '{"trait_type": "Artist", "value": "', _toHexString(details.artist), '"},',
                '{"trait_type": "Sponsor", "value": "', _toHexString(details.sponsor), '"},',
                '{"trait_type": "Amount", "value": "', details.amount.toString(), '"},',
                '{"trait_type": "Tier", "value": "', tierNames[details.sponsorshipTier - 1], '"},',
                '{"trait_type": "Timestamp", "value": "', details.timestamp.toString(), '"}',
            ']',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function _generateSVGImage(SponsorshipDetails memory details) internal view returns (bytes memory) {
        string memory tierColor = _getTierColor(details.sponsorshipTier);
        
        return abi.encodePacked(
            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
            '<style>',
            '.title { font: bold 24px sans-serif; fill: white; }',
            '.info { font: 16px sans-serif; fill: white; }',
            '</style>',
            '<rect width="100%" height="100%" fill="', tierColor, '"/>',
            '<text x="50%" y="30%" class="title" text-anchor="middle">',
            tierNames[details.sponsorshipTier - 1], ' Sponsor',
            '</text>',
            '<text x="50%" y="50%" class="info" text-anchor="middle">',
            'Amount: ', details.amount.toString(), ' ETH',
            '</text>',
            '<text x="50%" y="70%" class="info" text-anchor="middle">',
            'Date: ', _formatTimestamp(details.timestamp),
            '</text>',
            '</svg>'
        );
    }

    function _getTierColor(uint256 tier) internal pure returns (string memory) {
        if (tier == 5) return "#4A90E2"; // Diamond
        if (tier == 4) return "#9013FE"; // Platinum
        if (tier == 3) return "#F5A623"; // Gold
        if (tier == 2) return "#B8E986"; // Silver
        return "#50E3C2"; // Bronze
    }

    function _formatTimestamp(uint256 timestamp) internal pure returns (string memory) {
        return timestamp.toString();
    }

    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint160(addr) / (2**(8*(19 - i)))));
            buffer[i*2] = _toHexChar(uint8(b) / 16);
            buffer[i*2+1] = _toHexChar(uint8(b) % 16);
        }
        return string(buffer);
    }

    function _toHexChar(uint8 value) internal pure returns (bytes1) {
        if (value < 10) {
            return bytes1(uint8(48 + value));
        } else {
            return bytes1(uint8(87 + value));
        }
    }

    // Admin functions
    function updateCrowdfundingContract(address _newAddress) external onlyOwner {
        crowdfundingContract = _newAddress;
    }

    function updateTierThresholds(uint256[] calldata _newThresholds, string[] calldata _newNames) external onlyOwner {
        if (_newThresholds.length != _newNames.length) revert InvalidTierSetup();
        tierThresholds = _newThresholds;
        tierNames = _newNames;
    }

    // View functions
    function getSponsorshipDetails(uint256 tokenId) external view returns (SponsorshipDetails memory) {
        if (_ownerOf(tokenId) != address(0)) { 
        return sponsorshipDetails[tokenId];
        }

        revert NoSponsorshipFound();
    }

    function getArtistSponsorNFTs(address artist, address sponsor) external view returns (uint256[] memory) {
        return artistSponsorNFTs[artist][sponsor];
    }

    // function _burn(uint256 tokenId) internal override(ERC721) {
    //     super._burn(tokenId);
    // }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

     // Add these override functions to handle inheritance conflicts
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721)
    {
        super._increaseBalance(account, value);
    }

}