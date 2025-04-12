// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CookiesToken.sol";

contract ArtistStaking is Ownable {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }

    uint256 public constant PLATFORM_FEE = 10; // 10%
    uint256 public constant COOKIES_REWARD_RATE = 100; // 100 COOKIES per day per staked token
    uint256 public constant SECONDS_PER_DAY = 86400;

    address public platformWallet;
    IERC20 public stablecoin;
    CookiesToken public cookiesToken;

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public lastRewardClaim;

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event YieldClaimed(address indexed staker, uint256 amount);
    event CookiesRewarded(address indexed staker, uint256 amount);

    constructor(
        address _stablecoin,
        address _cookiesToken,
        address _platformWallet
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        cookiesToken = CookiesToken(_cookiesToken);
        platformWallet = _platformWallet;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (stakes[msg.sender].isActive) {
            // Claim any pending rewards before updating stake
            _claimRewards(msg.sender);
        }

        stakes[msg.sender] = Stake({
            amount: amount,
            timestamp: block.timestamp,
            isActive: true
        });

        lastRewardClaim[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");

        // Claim any pending rewards
        _claimRewards(msg.sender);

        uint256 amount = userStake.amount;
        userStake.isActive = false;
        userStake.amount = 0;

        require(stablecoin.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external {
        require(stakes[msg.sender].isActive, "No active stake");
        _claimRewards(msg.sender);
    }

    function _claimRewards(address staker) internal {
        uint256 timePassed = block.timestamp - lastRewardClaim[staker];
        if (timePassed == 0) return;

        Stake storage userStake = stakes[staker];
        uint256 yield = (userStake.amount * timePassed) / SECONDS_PER_DAY; // Simple 1:1 yield per day
        uint256 platformShare = (yield * PLATFORM_FEE) / 100;
        uint256 artistShare = yield - platformShare;

        // Transfer yields
        require(stablecoin.transfer(platformWallet, platformShare), "Platform transfer failed");
        require(stablecoin.transfer(staker, artistShare), "Artist transfer failed");

        // Calculate and mint COOKIES rewards
        uint256 cookiesReward = (userStake.amount * COOKIES_REWARD_RATE * timePassed) / SECONDS_PER_DAY;
        cookiesToken.mint(staker, cookiesReward);

        lastRewardClaim[staker] = block.timestamp;
        emit YieldClaimed(staker, yield);
        emit CookiesRewarded(staker, cookiesReward);
    }

    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }
}