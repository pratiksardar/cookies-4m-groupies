import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTheme } from './ThemeProvider';
import { WalletModal } from './WalletModal';
import { NetworkIndicator } from './NetworkIndicator';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import { ARTIST_STAKING_ADDRESS, CUSD_TOKEN_ADDRESS } from '../config/contracts';
import ArtistStakingABI from '../abi/ArtistStaking.json';
import { supabase } from '../lib/supabase';

// Styled components
const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    backgroundColor: '#14213D',
    color: 'white',
    borderRadius: '0.5rem',
  },
});

function Navbar() {
  const location = useLocation();
  const { connect, disconnect, address, isModalOpen, openModal, closeModal, provider, signer } = useWallet();
  const { allowToggle } = useTheme();
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleStake = async () => {
    if (!provider || !address || !stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const contractSigner = signer || await provider.getSigner();
      
      // Create contract instances
      const stakingContract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        contractSigner
      );

      const tokenContract = new ethers.Contract(
        CUSD_TOKEN_ADDRESS,
        [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ],
        contractSigner
      );

      // Convert amount to wei
      const amountWei = ethers.parseEther(stakeAmount);

      // Approve token transfer
      console.log("Approving token transfer...");
      const approveTx = await tokenContract.approve(ARTIST_STAKING_ADDRESS, amountWei);
      const approveReceipt = await approveTx.wait();
      console.log("Token transfer approved. Transaction hash:", approveReceipt.hash);

      // Execute stake
      console.log("Staking tokens...");
      const stakeTx = await stakingContract.stake(amountWei);
      const stakeReceipt = await stakeTx.wait();
      console.log("Staking complete. Transaction hash:", stakeReceipt.hash);

      // Save stake to database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (profileData) {
        const { error: dbError } = await supabase.from('stakes').insert({
          staker_id: profileData.id,
          amount: stakeAmount,
          stablecoin_address: CUSD_TOKEN_ADDRESS,
          status: 'active',
          transaction_hash: stakeReceipt.hash,
          approve_transaction_hash: approveReceipt.hash,
        });

        if (dbError) throw dbError;
      }

      setStakeAmount('');
      setStakeModalOpen(false);
    } catch (err: any) {
      console.error('Staking failed:', err);
      setError(err.message || 'Failed to stake tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-[rgb(var(--background))] border-b border-[rgb(var(--text-primary))]/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-londrina font-black text-[rgb(var(--text-primary))]">
                Cookies4mgroupies
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/gallery"
                  className={`px-3 py-2 rounded-md text-sm font-londrina font-medium ${
                    isActive('/gallery')
                      ? 'bg-[rgb(var(--text-primary))] text-[rgb(var(--background))]'
                      : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--text-primary))]/5'
                  }`}
                >
                  Gallery
                </Link>
                <Link
                  to="/artist-listing"
                  className={`px-3 py-2 rounded-md text-sm font-londrina font-medium ${
                    isActive('/artist-listing')
                      ? 'bg-[rgb(var(--text-primary))] text-[rgb(var(--background))]'
                      : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--text-primary))]/5'
                  }`}
                >
                  Artist
                </Link>
                <Link
                  to="/groupies"
                  className={`px-3 py-2 rounded-md text-sm font-londrina font-medium ${
                    isActive('/groupies')
                      ? 'bg-[rgb(var(--text-primary))] text-[rgb(var(--background))]'
                      : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--text-primary))]/5'
                  }`}
                >
                  Groupies
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {address && <NetworkIndicator />}
              {address ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setStakeModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-londrina font-medium"
                  >
                    Stake
                  </button>
                  <span className="text-sm font-londrina text-[rgb(var(--text-primary))]">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button
                    onClick={disconnect}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-londrina font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={openModal}
                  className="bg-[rgb(var(--text-primary))] text-[rgb(var(--background))] px-6 py-2 rounded-lg text-sm font-londrina font-medium hover:bg-[rgb(var(--text-primary))]/90"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <WalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConnect={connect}
      />

      <StyledDialog
        open={stakeModalOpen}
        onClose={() => !loading && setStakeModalOpen(false)}
      >
        <DialogTitle className="font-londrina text-2xl">Stake cUSD</DialogTitle>
        <DialogContent>
          <div className="mb-4 text-sm text-gray-300">
            Enter the amount of cUSD you want to stake to earn COOKIES tokens.
          </div>
          <div className="mb-6">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter amount to stake"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          {error && (
            <div className="text-red-500 mt-2 text-sm mb-4">
              {error}
            </div>
          )}
          <button
            onClick={handleStake}
            disabled={loading || !stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0}
            className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Stake'}
          </button>
        </DialogContent>
      </StyledDialog>
    </>
  );
}

export default Navbar;