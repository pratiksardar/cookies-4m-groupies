// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IArtistCrowdFunding {
    function is_artist_registered(address artist) external view returns (bool);
    function get_sponsors_by_artist(address artist) external view returns (address[] memory);
    function sponsor_share(address artist, address sponsor) external view returns (uint256);
}

// Add this interface at the top of your ArtistCrowdfunding contract
interface ISponsorshipNFT {
    function mintSponsorshipNFT(
        address artist,
        address sponsor,
        uint256 amount,
        string calldata artistProfileURI
    ) external returns (uint256);
}



contract ArtistCrowdfunding is IArtistCrowdFunding, Ownable, Pausable {
    IERC20 public immutable token;
    ISponsorshipNFT public sponsorshipNFT;

    struct Artist {
        bool isRegistered;
        uint256 totalSponsorship;
        uint256 minimumSponsorship;
        uint256 registrationTime;
        string profileURI;        // IPFS URI containing artist details
        address[] sponsors;
        mapping(address => uint256) sponsorShares;
    }

    struct SponsorInfo {
        uint256 totalSponsored;
        uint256[] sponsorshipTimestamps;
        uint256[] sponsorshipAmounts;
    }

    // Artist data
    mapping(address => Artist) public artists;
    mapping(address => mapping(address => SponsorInfo)) public artistSponsors;
    
    // Array to keep track of all registered artists
    address[] public registeredArtists;

    // Events
    event ArtistRegistered(address indexed artist, uint256 minimumSponsorship, string profileURI);
    event ArtistUpdated(address indexed artist, uint256 minimumSponsorship, string profileURI);
    event SponsorshipReceived(address indexed artist, address indexed sponsor, uint256 amount);
    event SponsorshipWithdrawn(address indexed artist, address indexed sponsor, uint256 amount);

    // Custom errors
    error ArtistAlreadyRegistered();
    error ArtistNotRegistered();
    error InvalidAmount();
    error TransferFailed();
    error InvalidAddress();
    error NoSponsorship();
    error InsufficientBalance();

    constructor(address initialOwner, address _token) Ownable(initialOwner) {
        if (_token == address(0)) revert InvalidAddress();
        token = IERC20(_token);
    }

    // Artist Registration Functions
    function registerArtist(
        uint256 minimumSponsorship,
        string calldata profileURI
    ) external whenNotPaused {
        if (artists[msg.sender].isRegistered) revert ArtistAlreadyRegistered();
        if (minimumSponsorship == 0) revert InvalidAmount();

        Artist storage newArtist = artists[msg.sender];
        newArtist.isRegistered = true;
        newArtist.minimumSponsorship = minimumSponsorship;
        newArtist.registrationTime = block.timestamp;
        newArtist.profileURI = profileURI;
        
        registeredArtists.push(msg.sender);

        emit ArtistRegistered(msg.sender, minimumSponsorship, profileURI);
    }

    function updateArtistProfile(
        uint256 newMinimumSponsorship,
        string calldata newProfileURI
    ) external whenNotPaused {
        if (!artists[msg.sender].isRegistered) revert ArtistNotRegistered();
        if (newMinimumSponsorship == 0) revert InvalidAmount();

        Artist storage artist = artists[msg.sender];
        artist.minimumSponsorship = newMinimumSponsorship;
        artist.profileURI = newProfileURI;

        emit ArtistUpdated(msg.sender, newMinimumSponsorship, newProfileURI);
    }

    // Sponsorship Functions
    function sponsorArtist(address artist, uint256 amount) external whenNotPaused {
        if (!artists[artist].isRegistered) revert ArtistNotRegistered();
        if (amount < artists[artist].minimumSponsorship) revert InvalidAmount();

        Artist storage artistData = artists[artist];
        SponsorInfo storage sponsorData = artistSponsors[artist][msg.sender];

        // Transfer tokens from sponsor to contract
        if (!token.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        // Update artist data
        if (sponsorData.totalSponsored == 0) {
            artistData.sponsors.push(msg.sender);
        }
        
        artistData.totalSponsorship += amount;
        artistData.sponsorShares[msg.sender] += amount;

        // Update sponsor data
        sponsorData.totalSponsored += amount;
        sponsorData.sponsorshipTimestamps.push(block.timestamp);
        sponsorData.sponsorshipAmounts.push(amount);

        // Mint NFT for the sponsor
        if (address(sponsorshipNFT) != address(0)) {
            sponsorshipNFT.mintSponsorshipNFT(
                artist,
                msg.sender,
                amount,
                artistData.profileURI
            );
        }
        emit SponsorshipReceived(artist, msg.sender, amount);
    }

    function withdrawSponsorship(address artist, uint256 amount) external whenNotPaused {
        if (!artists[artist].isRegistered) revert ArtistNotRegistered();
        
        Artist storage artistData = artists[artist];
        uint256 sponsorShare = artistData.sponsorShares[msg.sender];
        
        if (sponsorShare < amount) revert InsufficientBalance();

        // Update balances
        artistData.totalSponsorship -= amount;
        artistData.sponsorShares[msg.sender] -= amount;

        // Transfer tokens to sponsor
        if (!token.transfer(msg.sender, amount)) revert TransferFailed();

        emit SponsorshipWithdrawn(artist, msg.sender, amount);
    }

    // View Functions
    function is_artist_registered(address artist) external view override returns (bool) {
        return artists[artist].isRegistered;
    }

    function get_sponsors_by_artist(address artist) external view override returns (address[] memory) {
        return artists[artist].sponsors;
    }

    function sponsor_share(address artist, address sponsor) external view override returns (uint256) {
        return artists[artist].sponsorShares[sponsor];
    }

    // Additional View Functions
    function getArtistDetails(address artist) external view returns (
        bool isRegistered,
        uint256 totalSponsorship,
        uint256 minimumSponsorship,
        uint256 registrationTime,
        string memory profileURI,
        uint256 sponsorCount
    ) {
        Artist storage artistData = artists[artist];
        return (
            artistData.isRegistered,
            artistData.totalSponsorship,
            artistData.minimumSponsorship,
            artistData.registrationTime,
            artistData.profileURI,
            artistData.sponsors.length
        );
    }

    function getSponsorInfo(address artist, address sponsor) external view returns (
        uint256 totalSponsored,
        uint256[] memory timestamps,
        uint256[] memory amounts
    ) {
        SponsorInfo storage info = artistSponsors[artist][sponsor];
        return (
            info.totalSponsored,
            info.sponsorshipTimestamps,
            info.sponsorshipAmounts
        );
    }

    function getAllRegisteredArtists() external view returns (address[] memory) {
        return registeredArtists;
    }

    // Emergency Functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token_) external onlyOwner {
        uint256 balance = IERC20(token_).balanceOf(address(this));
        if (balance == 0) revert InsufficientBalance();
        if (!IERC20(token_).transfer(owner(), balance)) revert TransferFailed();
    }

    function setSponsorshipNFT(address _nftContract) external onlyOwner {
        sponsorshipNFT = ISponsorshipNFT(_nftContract);
    }

}