import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { COOKIES_TOKEN_ADDRESS, STABLE_COIN_STAKING_ADDRESS, CUSD_TOKEN_ADDRESS } from '../config/contracts';
import CookiesTokenABI from '../abi/CookiesToken.json';
import StableCoinStakingABI from '../abi/StableCoinStaking.json';

// ERC20 ABI for balance and approval functions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export const useCookiesToken = () => {
  const { provider, address, signer } = useWallet();
  const [cookiesBalance, setCookiesBalance] = useState<string>('0');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Format ether balance with 2 decimal places
  const formatBalance = (balance: ethers.BigNumberish, decimals = 18): string => {
    return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2);
  };

  // Fetch COOKIES token balance
  const fetchCookiesBalance = useCallback(async () => {
    if (!provider || !address) return;

    try {
      const tokenContract = new ethers.Contract(
        COOKIES_TOKEN_ADDRESS,
        ERC20_ABI,
        provider
      );

      const balance = await tokenContract.balanceOf(address);
      setCookiesBalance(formatBalance(balance));
    } catch (err) {
      console.error('Error fetching COOKIES balance:', err);
    }
  }, [provider, address]);

  // Fetch staked amount and pending rewards
  const fetchStakingInfo = useCallback(async () => {
    if (!provider || !address) return;

    try {
      const stakingContract = new ethers.Contract(
        STABLE_COIN_STAKING_ADDRESS,
        StableCoinStakingABI,
        provider
      );

      const userStakedAmount = await stakingContract.stakedBalanceOf(address);
      const userPendingRewards = await stakingContract.pendingRewards(address);

      setStakedAmount(formatBalance(userStakedAmount));
      setPendingRewards(formatBalance(userPendingRewards));
    } catch (err) {
      console.error('Error fetching staking info:', err);
    }
  }, [provider, address]);

  // Stake tokens
  const stakeTokens = async (amount: string) => {
    if (!signer || !address || !amount) {
      setError('Please connect your wallet and enter an amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountWei = ethers.parseEther(amount);
      
      // Get contract instances
      const stakingContract = new ethers.Contract(
        STABLE_COIN_STAKING_ADDRESS,
        StableCoinStakingABI,
        signer
      );
      
      const tokenContract = new ethers.Contract(
        CUSD_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      // Check allowance
      const allowance = await tokenContract.allowance(address, STABLE_COIN_STAKING_ADDRESS);
      
      // If allowance is not enough, request approval
      if (allowance < amountWei) {
        const approveTx = await tokenContract.approve(STABLE_COIN_STAKING_ADDRESS, amountWei);
        await approveTx.wait();
      }

      // Execute stake transaction
      const stakeTx = await stakingContract.stake(amountWei);
      await stakeTx.wait();

      // Refresh data
      await fetchStakingInfo();
      await fetchCookiesBalance();
      
      return true;
    } catch (err: any) {
      console.error('Error staking tokens:', err);
      setError(err.message || 'Failed to stake tokens');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unstake tokens
  const unstakeTokens = async (amount: string) => {
    if (!signer || !address || !amount) {
      setError('Please connect your wallet and enter an amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountWei = ethers.parseEther(amount);
      
      // Get staking contract instance
      const stakingContract = new ethers.Contract(
        STABLE_COIN_STAKING_ADDRESS,
        StableCoinStakingABI,
        signer
      );

      // Execute unstake transaction
      const unstakeTx = await stakingContract.unstake(amountWei);
      await unstakeTx.wait();

      // Refresh data
      await fetchStakingInfo();
      await fetchCookiesBalance();
      
      return true;
    } catch (err: any) {
      console.error('Error unstaking tokens:', err);
      setError(err.message || 'Failed to unstake tokens');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!signer || !address) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get staking contract instance
      const stakingContract = new ethers.Contract(
        STABLE_COIN_STAKING_ADDRESS,
        StableCoinStakingABI,
        signer
      );

      // Execute claim transaction
      const claimTx = await stakingContract.claimRewards();
      await claimTx.wait();

      // Refresh data
      await fetchStakingInfo();
      await fetchCookiesBalance();
      
      return true;
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      setError(err.message || 'Failed to claim rewards');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when wallet or provider changes
  useEffect(() => {
    if (provider && address) {
      fetchCookiesBalance();
      fetchStakingInfo();
      
      // Set up interval to refresh data every 60 seconds
      const intervalId = setInterval(() => {
        fetchCookiesBalance();
        fetchStakingInfo();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [provider, address, fetchCookiesBalance, fetchStakingInfo]);

  return {
    cookiesBalance,
    stakedAmount,
    pendingRewards,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    loading,
    error,
    refreshData: useCallback(() => {
      fetchCookiesBalance();
      fetchStakingInfo();
    }, [fetchCookiesBalance, fetchStakingInfo])
  };
}; 