import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { ARTIST_STAKING_ADDRESS, CUSD_TOKEN_ADDRESS } from '../config/contracts';
import ArtistStakingABI from '../abi/ArtistStaking.json';
import { Stake } from '../types/supabase';

function StakePage() {
  const { provider, address, signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStakes, setUserStakes] = useState<Stake[]>([]);
  const [cookiesEarned, setCookiesEarned] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');

  useEffect(() => {
    if (address) {
      fetchUserStakes();
      fetchStakingInfo();
    }
  }, [address]);

  const fetchUserStakes = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address?.toLowerCase())
        .single();

      if (profileData) {
        const { data: stakes } = await supabase
          .from('stakes')
          .select(`
            *,
            artist:artists(
              *,
              profile:profiles(*)
            )
          `)
          .eq('staker_id', profileData.id)
          .eq('status', 'active');

        setUserStakes(stakes || []);
      }
    } catch (error) {
      console.error('Error fetching stakes:', error);
    }
  };

  const fetchStakingInfo = async () => {
    if (!provider || !address) return;

    try {
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        provider
      );

      const stake = await contract.stakes(address);
      setTotalStaked(ethers.formatEther(stake.amount));

      // Calculate earned COOKIES based on stake time and reward rate
      const lastClaim = await contract.lastRewardClaim(address);
      const rewardRate = await contract.COOKIES_REWARD_RATE();
      const timePassed = Math.floor(Date.now() / 1000) - lastClaim.toNumber();
      const earned = stake.amount.mul(rewardRate).mul(timePassed).div(86400);
      setCookiesEarned(ethers.formatEther(earned));
    } catch (error) {
      console.error('Error fetching staking info:', error);
    }
  };

  const handleClaimRewards = async () => {
    if (!provider || !address) return;

    setLoading(true);
    try {
      const contractSigner = signer || await provider.getSigner();
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        contractSigner
      );

      const tx = await contract.claimRewards();
      await tx.wait();

      fetchStakingInfo();
    } catch (err: any) {
      console.error('Failed to claim rewards:', err);
      setError(err.message || 'Failed to claim rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (stakeId: string) => {
    if (!provider || !address) return;

    setLoading(true);
    try {
      const contractSigner = signer || await provider.getSigner();
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        contractSigner
      );

      const tx = await contract.unstake();
      const receipt = await tx.wait();

      // Update database
      const { error: dbError } = await supabase
        .from('stakes')
        .update({
          status: 'ended',
          end_date: new Date().toISOString(),
          transaction_hash: receipt.hash
        })
        .eq('id', stakeId);

      if (dbError) throw dbError;

      fetchUserStakes();
      fetchStakingInfo();
    } catch (err: any) {
      console.error('Failed to unstake:', err);
      setError(err.message || 'Failed to unstake');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-londrina font-bold mb-4">Please connect your wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-londrina font-bold mb-8">Your Staking Overview</h1>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 shadow-custom">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Staked</p>
              <p className="text-2xl font-londrina">{totalStaked} cUSD</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">COOKIES Earned</p>
              <p className="text-2xl font-londrina">{cookiesEarned} COOKIES</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClaimRewards}
              disabled={loading || Number(cookiesEarned) === 0}
              className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg font-londrina disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Claim COOKIES'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-custom">
          <h2 className="text-2xl font-londrina font-bold mb-4">Your Active Stakes</h2>
          
          {userStakes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              You have no active stakes. Click the "Stake" button in the navbar to start staking.
            </p>
          ) : (
            <div className="space-y-4">
              {userStakes.map((stake) => (
                <div
                  key={stake.id}
                  className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-londrina text-lg">
                        {stake.amount} cUSD
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Staked on {new Date(stake.start_date).toLocaleDateString()}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        <a 
                          href={`https://explorer.celo.org/alfajores/tx/${stake.transaction_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View Transaction
                        </a>
                        {stake.approve_transaction_hash && (
                          <span> | <a 
                            href={`https://explorer.celo.org/alfajores/tx/${stake.approve_transaction_hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View Approval
                          </a></span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col space-y-2">
                      <p className="font-londrina text-lg">
                        {stake.cookies_earned} COOKIES
                      </p>
                      <button
                        onClick={() => handleUnstake(stake.id)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm font-londrina disabled:opacity-50"
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StakePage; 