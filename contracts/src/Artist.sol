// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IArtistCrowdFunding {
    function is_artist_registered(address artist) external view returns (bool);
    function get_sponsors_by_artist(address artist) external view returns (address[] memory);
    function sponsor_share(address artist, address sponsor) external view returns (uint256);
}

contract Artist is Ownable {
    IERC20 public token;
    IArtistCrowdFunding public crowdfundingContract;

    // Custom errors
    error ItemDoesNotExist();
    error AuctionHasEnded();
    error AuctionStillActive();
    error BidTooLow();
    error NotRegisteredArtist();
    error TransferFailed();
    error InvalidEndTime();
    error NotHighestBidder();
    error AlreadyClaimed();
    error InvalidRoyaltyPercentage();
    error ZeroAddress();
    error NotItemOwner();
    error NoRefundAvailable();

    // Events
    event ItemCreated(
        uint128 indexed itemId,
        address indexed artist,
        uint256 startingPrice,
        uint256 endTime
    );

    event BidPlaced(
        uint128 indexed itemId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );

    event AuctionEnded(
        uint128 indexed itemId,
        address indexed winner,
        uint256 winningBid
    );

    event ItemClaimed(
        uint128 indexed itemId,
        address indexed winner,
        uint256 finalAmount
    );

    event RoyaltyPaid(
        uint128 indexed itemId,
        address indexed artist,
        uint256 amount
    );

    event BidRefunded(
        uint128 indexed itemId,
        address indexed bidder,
        uint256 amount
    );

    // Split the Item struct into smaller components
    struct ItemCore {
        uint128 itemId;
        address artist;
        uint256 startingPrice;
        uint256 minBidIncrement;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
    }

    struct ItemMetadata {
        string name;
        string description;
        string metadataURI;
    }

    struct ItemState {
        bool isActive;
        bool isClaimed;
        ItemType itemType;
        uint256 royaltyPercentage;
    }

    enum ItemType {
        PHYSICAL,
        DIGITAL,
        HYBRID
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        bool isRefunded;
    }

    uint128 public itemCount;
    mapping(uint128 => ItemCore) public itemCores;
    mapping(uint128 => ItemMetadata) public itemMetadata;
    mapping(uint128 => ItemState) public itemStates;
    mapping(uint128 => Bid[]) public itemBids;
    mapping(uint128 => mapping(address => uint256)) public bidderTotalAmount;
    mapping(address => uint128[]) public artistItems;
    mapping(address => uint128[]) public userBids;

    constructor(
        address initialOwner,
        address _crowdfunding,
        address _token
    ) Ownable(initialOwner) {
        crowdfundingContract = IArtistCrowdFunding(_crowdfunding);
        token = IERC20(_token);
    }

    function createItem(
        string calldata name,
        string calldata description,
        string calldata metadataURI,
        uint256 startingPrice,
        uint256 minBidIncrement,
        uint256 duration,
        ItemType itemType,
        uint256 royaltyPercentage
    ) external {
        if (!crowdfundingContract.is_artist_registered(msg.sender)) {
            revert NotRegisteredArtist();
        }
        if (royaltyPercentage > 25) {
            revert InvalidRoyaltyPercentage();
        }

        uint256 endTime = block.timestamp + duration;
        if (endTime <= block.timestamp) {
            revert InvalidEndTime();
        }

        unchecked {
            itemCount++;
        }

        ItemCore memory core = ItemCore({
            itemId: itemCount,
            artist: msg.sender,
            startingPrice: startingPrice,
            minBidIncrement: minBidIncrement,
            highestBid: 0,
            highestBidder: address(0),
            endTime: endTime
        });

        ItemMetadata memory metadata = ItemMetadata({
            name: name,
            description: description,
            metadataURI: metadataURI
        });

        ItemState memory state = ItemState({
            isActive: true,
            isClaimed: false,
            itemType: itemType,
            royaltyPercentage: royaltyPercentage
        });

        itemCores[itemCount] = core;
        itemMetadata[itemCount] = metadata;
        itemStates[itemCount] = state;
        artistItems[msg.sender].push(itemCount);

        emit ItemCreated(itemCount, msg.sender, startingPrice, endTime);
    }

    function placeBid(uint128 itemId, uint256 bidAmount) external {
        ItemCore storage core = itemCores[itemId];
        ItemState storage state = itemStates[itemId];

        if (!state.isActive) {
            revert ItemDoesNotExist();
        }
        if (block.timestamp >= core.endTime) {
            revert AuctionHasEnded();
        }

        uint256 minBid = core.highestBid == 0 ? 
            core.startingPrice : 
            core.highestBid + core.minBidIncrement;
            
        if (bidAmount < minBid) {
            revert BidTooLow();
        }

        _handleBidTransfer(itemId, core, bidAmount);
        _updateBidInfo(itemId, core, bidAmount);

        emit BidPlaced(itemId, msg.sender, bidAmount, block.timestamp);
    }

    function _handleBidTransfer(
        uint128 itemId,
        ItemCore storage core,
        uint256 bidAmount
    ) private {
        if (!token.transferFrom(msg.sender, address(this), bidAmount)) {
            revert TransferFailed();
        }

        if (core.highestBidder != address(0)) {
            if (!token.transfer(core.highestBidder, core.highestBid)) {
                revert TransferFailed();
            }
            emit BidRefunded(itemId, core.highestBidder, core.highestBid);
        }
    }

    function _updateBidInfo(
        uint128 itemId,
        ItemCore storage core,
        uint256 bidAmount
    ) private {
        core.highestBid = bidAmount;
        core.highestBidder = msg.sender;

        itemBids[itemId].push(Bid({
            bidder: msg.sender,
            amount: bidAmount,
            timestamp: block.timestamp,
            isRefunded: false
        }));

        bidderTotalAmount[itemId][msg.sender] += bidAmount;
        userBids[msg.sender].push(itemId);
    }

    function endAuction(uint128 itemId) external {
        ItemCore storage core = itemCores[itemId];
        ItemState storage state = itemStates[itemId];

        if (!state.isActive) {
            revert ItemDoesNotExist();
        }
        if (block.timestamp < core.endTime) {
            revert AuctionStillActive();
        }

        state.isActive = false;

        if (core.highestBidder != address(0)) {
            _handleAuctionEnd(itemId, core, state);
        }

        emit AuctionEnded(itemId, core.highestBidder, core.highestBid);
    }

    function _handleAuctionEnd(
        uint128 itemId,
        ItemCore storage core,
        ItemState storage state
    ) private {
        uint256 royaltyAmount = (core.highestBid * state.royaltyPercentage) / 100;
        uint256 platformFee = (core.highestBid * 1) / 100;
        uint256 remainingAmount = core.highestBid - royaltyAmount - platformFee;

        if (!token.transfer(core.artist, royaltyAmount)) {
            revert TransferFailed();
        }
        emit RoyaltyPaid(itemId, core.artist, royaltyAmount);

        if (!token.transfer(owner(), platformFee)) {
            revert TransferFailed();
        }

        _distributeSponsorShares(itemId, core.artist, remainingAmount);
    }

    function _distributeSponsorShares(
        uint128 itemId,
        address artist,
        uint256 amount
    ) private {
        address[] memory sponsors = crowdfundingContract.get_sponsors_by_artist(artist);
        
        if (sponsors.length == 0) return;

        uint256 totalShares;
        uint256[] memory shares = new uint256[](sponsors.length);
        
        unchecked {
            for (uint32 i = 0; i < sponsors.length; i++) {
                shares[i] = crowdfundingContract.sponsor_share(artist, sponsors[i]);
                totalShares += shares[i];
            }

            for (uint32 i = 0; i < sponsors.length; i++) {
                uint256 sponsorAmount = (amount * shares[i]) / totalShares;
                if (sponsorAmount > 0) {
                    if (!token.transfer(sponsors[i], sponsorAmount)) {
                        revert TransferFailed();
                    }
                }
            }
        }
    }

    // View functions
    function getCompleteItem(uint128 itemId) external view returns (
        ItemCore memory core,
        ItemMetadata memory metadata,
        ItemState memory state
    ) {
        if (itemId > itemCount) revert ItemDoesNotExist();
        return (
            itemCores[itemId],
            itemMetadata[itemId],
            itemStates[itemId]
        );
    }

    function getItemBids(uint128 itemId) external view returns (Bid[] memory) {
        return itemBids[itemId];
    }

    function getArtistItems(address artist) external view returns (uint128[] memory) {
        return artistItems[artist];
    }

    function getUserBids(address user) external view returns (uint128[] memory) {
        return userBids[user];
    }

    function getBidderTotalAmount(uint128 itemId, address bidder) external view returns (uint256) {
        return bidderTotalAmount[itemId][bidder];
    }

    function emergencyWithdraw(address token_) external onlyOwner {
        uint256 balance = IERC20(token_).balanceOf(address(this));
        bool success = IERC20(token_).transfer(owner(), balance);
        if (!success) revert TransferFailed();
    }
}