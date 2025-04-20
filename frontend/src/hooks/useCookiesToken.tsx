import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { COOKIES_TOKEN_ADDRESS, STABLE_COIN_STAKING_ADDRESS, CUSD_TOKEN_ADDRESS, ARTIST_STAKING_ADDRESS } from '../config/contracts';
import CookiesTokenABI from '../abi/CookiesToken.json';
import StableCoinStakingABI from '../abi/StableCoinStaking.json';
import ArtistStakingABI from '../abi/ArtistStaking.json';

// ERC20 ABI for balance and approval functions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// Specific contract address for pending rewards
const PENDING_REWARDS_CONTRACT = '0xca8364f68aA2309F699f13F1a8b47F5A98fc5360';

export const useCookiesToken = () => {
  const { provider, address, signer } = useWallet();
  const [cookiesBalance, setCookiesBalance] = useState<string>('0');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [pendingCookiesRewards, setPendingCookiesRewards] = useState<string>('0');
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

  // Fetch pending rewards directly from the specific contract
  const fetchPendingRewards = useCallback(async () => {
    if (!provider || !address) return;

    try {
      // Use the specific contract for pending rewards
      const pendingRewardsContract = new ethers.Contract(
        PENDING_REWARDS_CONTRACT,
        ['function pendingRewards(address) view returns (uint256)'],
        provider
      );
      
      const directPendingRewards = await pendingRewardsContract.pendingRewards(address);
      const formattedDirectPendingRewards = formatBalance(directPendingRewards);
      
      console.log('Fetched pending rewards:', formattedDirectPendingRewards);
      setPendingCookiesRewards(formattedDirectPendingRewards);
    } catch (err) {
      console.error('Error fetching pending rewards:', err);
    }
  }, [provider, address]);

  // Fetch staked amount and pending rewards
  const fetchStakingInfo = useCallback(async () => {
    if (!provider || !address) return;

    try {
      // Get stablecoin staking contract
      const stableCoinStakingContract = new ethers.Contract(
        STABLE_COIN_STAKING_ADDRESS,
        StableCoinStakingABI,
        provider
      );

      // Get artist staking contract
      const artistStakingContract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        provider
      );

      // Fetch stablecoin staking info
      const userStakedAmount = await stableCoinStakingContract.stakedBalanceOf(address);
      
      // Fetch pending rewards directly
      await fetchPendingRewards();

      // Fetch artist staking delegations and rewards
      const filter = artistStakingContract.filters.Delegated(address);
      const events = await artistStakingContract.queryFilter(filter);
      
      let artistPendingRewards = ethers.parseEther('0');
      for (const event of events) {
        const eventLog = event as ethers.EventLog;
        const artistAddress = eventLog.args?.[1]; // The artist address is the second argument
        if (artistAddress) {
          const rewards = await artistStakingContract.getPendingRewards(address, artistAddress);
          artistPendingRewards = artistPendingRewards + rewards;
        }
      }

      // Set staked amount
      setStakedAmount(formatBalance(userStakedAmount));
      
      // Set total pending rewards (artist + cookies)
      const totalPendingRewards = ethers.parseEther(pendingCookiesRewards || '0') + artistPendingRewards;
      setPendingRewards(formatBalance(totalPendingRewards));
    } catch (err) {
      console.error('Error fetching staking info:', err);
    }
  }, [provider, address, fetchPendingRewards, pendingCookiesRewards]);

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

  // Claim rewards from both contracts
  const claimRewards = async () => {
    if (!signer || !address) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get contract instances
      const stableCoinStakingContract = new ethers.Contract(
        PENDING_REWARDS_CONTRACT, // Use the specific contract address for pending rewards
        StableCoinStakingABI,
        signer
      );

      // Get the pending rewards amount first
      const pendingRewardsAmount = await stableCoinStakingContract.pendingRewards(address);
      
      if (pendingRewardsAmount <= 0) {
        setError('No rewards to claim');
        return false;
      }

      // Claim from stablecoin staking using the correct function
      const stableCoinClaimTx = await stableCoinStakingContract.claimRewards();
      await stableCoinClaimTx.wait();

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

  // Debug function to check pending rewards directly from contract
  const debugCheckPendingRewards = useCallback(async () => {
    if (!provider || !address) return null;

    try {
      // Use the specific contract for pending rewards
      const pendingRewardsContract = new ethers.Contract(
        PENDING_REWARDS_CONTRACT,
        ['function pendingRewards(address) view returns (uint256)'],
        provider
      );

      // Get direct pending rewards value
      const directPendingRewards = await pendingRewardsContract.pendingRewards(address);
      const formattedDirectPendingRewards = formatBalance(directPendingRewards);
      
      console.log('Direct contract pendingRewards:', formattedDirectPendingRewards);
      console.log('Current frontend pendingCookiesRewards:', pendingCookiesRewards);
      
      if (formattedDirectPendingRewards !== pendingCookiesRewards) {
        console.warn('MISMATCH: Contract value does not match frontend display');
        console.warn('Contract value:', formattedDirectPendingRewards);
        console.warn('Frontend value:', pendingCookiesRewards);
        
        // Update the frontend value to match the contract
        setPendingCookiesRewards(formattedDirectPendingRewards);
      } else {
        console.log('Values match correctly');
      }
      
      return {
        contractValue: formattedDirectPendingRewards,
        frontendValue: pendingCookiesRewards,
        match: formattedDirectPendingRewards === pendingCookiesRewards
      };
    } catch (err) {
      console.error('Error checking pending rewards:', err);
      return null;
    }
  }, [provider, address, pendingCookiesRewards]);

  // Fetch data when wallet or provider changes
  useEffect(() => {
    if (provider && address) {
      fetchCookiesBalance();
      fetchPendingRewards(); // Fetch pending rewards directly
      fetchStakingInfo();
      
      // Set up interval to refresh data every 60 seconds
      const intervalId = setInterval(() => {
        fetchCookiesBalance();
        fetchPendingRewards(); // Refresh pending rewards directly
        fetchStakingInfo();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [provider, address, fetchCookiesBalance, fetchPendingRewards, fetchStakingInfo]);

  return {
    cookiesBalance,
    stakedAmount,
    pendingRewards,
    pendingCookiesRewards,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    loading,
    error,
    debugCheckPendingRewards,
    refreshData: useCallback(async () => {
      await fetchCookiesBalance();
      await fetchPendingRewards(); // Refresh pending rewards directly
      await fetchStakingInfo();
    }, [fetchCookiesBalance, fetchPendingRewards, fetchStakingInfo])
  };
}; 