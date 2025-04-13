// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CookiesToken.sol";

contract StableCoinStaking is Ownable {
    struct StakerInfo {
        uint256 stakedAmount;
        uint256 lastRewardTimestamp;
    }

    // Staking configuration
    uint256 public rewardRate = 10; // 10 COOKIES tokens per minute per cUSD
    uint256 public constant MINUTE = 60; // 60 seconds

    // State variables
    CookiesToken public cookiesToken;
    IERC20 public stableCoin;
    mapping(address => StakerInfo) public stakers;
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _cookiesToken, address _stableCoin) Ownable(msg.sender) {
        cookiesToken = CookiesToken(_cookiesToken);
        stableCoin = IERC20(_stableCoin);
    }

    // Get pending rewards for a user
    function pendingRewards(address _user) public view returns (uint256) {
        StakerInfo storage staker = stakers[_user];
        
        if (staker.stakedAmount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - staker.lastRewardTimestamp;
        return (staker.stakedAmount * rewardRate * timeElapsed) / MINUTE;
    }

    // Get user's staked amount
    function stakedBalanceOf(address _user) external view returns (uint256) {
        return stakers[_user].stakedAmount;
    }

    // Stake stablecoins to earn COOKIES
    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0");
        
        // Claim any pending rewards first
        _claimRewards(msg.sender);
        
        // Transfer the stablecoins from user to this contract
        require(stableCoin.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update user's staking info
        stakers[msg.sender].stakedAmount += _amount;
        stakers[msg.sender].lastRewardTimestamp = block.timestamp;
        
        // Update total staked amount
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }

    // Unstake stablecoins
    function unstake(uint256 _amount) external {
        StakerInfo storage staker = stakers[msg.sender];
        require(staker.stakedAmount >= _amount, "Not enough staked");
        
        // Claim any pending rewards first
        _claimRewards(msg.sender);
        
        // Update user's staking info
        staker.stakedAmount -= _amount;
        
        // Update total staked amount
        totalStaked -= _amount;
        
        // Transfer the stablecoins back to the user
        require(stableCoin.transfer(msg.sender, _amount), "Transfer failed");
        
        emit Unstaked(msg.sender, _amount);
    }

    // Claim pending rewards
    function claimRewards() external {
        _claimRewards(msg.sender);
    }

    // Internal function to claim rewards
    function _claimRewards(address _user) internal {
        uint256 reward = pendingRewards(_user);
        
        if (reward > 0) {
            stakers[_user].lastRewardTimestamp = block.timestamp;
            cookiesToken.mint(_user, reward);
            emit RewardPaid(_user, reward);
        }
    }

    // Update reward rate (only owner)
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }

    // Emergency withdraw stablecoins (only owner)
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= stableCoin.balanceOf(address(this)), "Insufficient balance");
        require(stableCoin.transfer(owner(), _amount), "Transfer failed");
    }
} 