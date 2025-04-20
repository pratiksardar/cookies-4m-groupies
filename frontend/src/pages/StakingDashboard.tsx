import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useCookiesToken } from '../hooks/useCookiesToken';
import { ethers } from 'ethers';
import { CONTRACTS } from '../config/contracts';
import { ArtistStaking__factory } from '../types/contracts';

interface Delegation {
  artistAddress: string;
  amount: string;
  pendingRewards: string;
}

const StakingDashboard: React.FC = () => {
  const { address, provider } = useWallet();
  const { cookiesBalance } = useCookiesToken();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDelegations = async () => {
      if (!address || !provider) return;

      try {
        setLoading(true);
        setError(null);

        const artistStaking = ArtistStaking__factory.connect(
          CONTRACTS.artistStaking,
          provider
        );

        // Get all delegation events for the user
        const filter = artistStaking.filters.Delegated(address);
        const events = await artistStaking.queryFilter(filter);

        const delegationPromises = events.map(async (event) => {
          const artistAddress = event.args?.artist;
          const amount = await artistStaking.getDelegation(address, artistAddress);
          const pendingRewards = await artistStaking.getPendingRewards(address, artistAddress);

          return {
            artistAddress,
            amount: ethers.utils.formatEther(amount),
            pendingRewards: ethers.utils.formatEther(pendingRewards),
          };
        });

        const delegationsData = await Promise.all(delegationPromises);
        setDelegations(delegationsData);
      } catch (err) {
        console.error('Error fetching delegations:', err);
        setError('Failed to fetch delegations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDelegations();
  }, [address, provider]);

  const handleClaimRewards = async (artistAddress: string) => {
    if (!address || !provider) return;

    try {
      setError(null);
      const artistStaking = ArtistStaking__factory.connect(
        CONTRACTS.artistStaking,
        provider.getSigner()
      );

      const tx = await artistStaking.claimRewards(artistAddress);
      await tx.wait();

      // Refresh delegations after claiming
      const updatedDelegations = delegations.map((delegation) => {
        if (delegation.artistAddress === artistAddress) {
          return { ...delegation, pendingRewards: '0' };
        }
        return delegation;
      });
      setDelegations(updatedDelegations);
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setError('Failed to claim rewards. Please try again later.');
    }
  };

  const handleUndelegate = async (artistAddress: string) => {
    if (!address || !provider) return;

    try {
      setError(null);
      const artistStaking = ArtistStaking__factory.connect(
        CONTRACTS.artistStaking,
        provider.getSigner()
      );

      const tx = await artistStaking.undelegate(artistAddress);
      await tx.wait();

      // Remove the undelegated artist from the list
      setDelegations(delegations.filter((d) => d.artistAddress !== artistAddress));
    } catch (err) {
      console.error('Error undelegating:', err);
      setError('Failed to undelegate. Please try again later.');
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-londrina font-bold text-[rgb(var(--text-primary))] mb-4">
            Please connect your wallet to view your staking dashboard
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-londrina font-bold text-[rgb(var(--text-primary))] mb-8">
        Staking Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[rgb(var(--background))] border border-[rgb(var(--text-primary))]/10 rounded-lg p-6">
          <h2 className="text-xl font-londrina font-bold text-[rgb(var(--text-primary))] mb-2">
            Your COOKIES Balance
          </h2>
          <p className="text-2xl font-londrina text-amber-600">
            {cookiesBalance} 🍪
          </p>
        </div>
        <div className="bg-[rgb(var(--background))] border border-[rgb(var(--text-primary))]/10 rounded-lg p-6">
          <h2 className="text-xl font-londrina font-bold text-[rgb(var(--text-primary))] mb-2">
            Total Delegated
          </h2>
          <p className="text-2xl font-londrina text-[rgb(var(--text-primary))]">
            {delegations.reduce((sum, d) => sum + parseFloat(d.amount), 0).toFixed(2)} 🍪
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-londrina font-bold text-[rgb(var(--text-primary))] mb-4">
        Your Delegations
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--text-primary))] mx-auto"></div>
        </div>
      ) : delegations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[rgb(var(--text-primary))]">You haven't delegated any COOKIES tokens yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {delegations.map((delegation) => (
            <div
              key={delegation.artistAddress}
              className="bg-[rgb(var(--background))] border border-[rgb(var(--text-primary))]/10 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-londrina font-bold text-[rgb(var(--text-primary))]">
                    Artist: {delegation.artistAddress.slice(0, 6)}...{delegation.artistAddress.slice(-4)}
                  </h3>
                  <p className="text-[rgb(var(--text-primary))]">
                    Delegated: {delegation.amount} 🍪
                  </p>
                  <p className="text-amber-600">
                    Pending Rewards: {delegation.pendingRewards} 🍪
                  </p>
                </div>
                <div className="flex space-x-2">
                  {parseFloat(delegation.pendingRewards) > 0 && (
                    <button
                      onClick={() => handleClaimRewards(delegation.artistAddress)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-londrina"
                    >
                      Claim Rewards
                    </button>
                  )}
                  <button
                    onClick={() => handleUndelegate(delegation.artistAddress)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-londrina"
                  >
                    Undelegate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StakingDashboard; 