import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
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

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

interface StakeButtonProps {
  artistAddress: string;
  onSuccess?: () => void;
}

export const StakeButton = ({ artistAddress, onSuccess }: StakeButtonProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider, address, signer } = useWallet();

  const handleStake = async () => {
    if (!provider || !address || !amount) {
      setError("Wallet not connected or amount not specified");
      return;
    }

    // Reset error state
    setError(null);

    // Validate artist address
    if (!artistAddress || artistAddress === "null" || artistAddress === "undefined" || !ethers.isAddress(artistAddress)) {
      setError("Invalid artist address. Please contact support.");
      console.error("Invalid artist address:", artistAddress);
      return;
    }

    console.log("Starting staking with params:", {
      stakerAddress: address,
      artistAddress,
      amount,
      tokenAddress: CUSD_TOKEN_ADDRESS,
      contractAddress: ARTIST_STAKING_ADDRESS
    });

    try {
      setLoading(true);
      
      // Get signer directly from wallet hook or from provider
      const contractSigner = signer || await provider.getSigner();
      if (!contractSigner) {
        throw new Error("Failed to get signer");
      }
      
      // Create contract instance
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS, 
        ArtistStakingABI, 
        contractSigner
      );

      if (!contract) {
        throw new Error("Failed to create contract instance");
      }
      
      // First, we need to approve the token transfer
      const tokenContract = new ethers.Contract(
        CUSD_TOKEN_ADDRESS,
        [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ],
        contractSigner
      );
      
      // Convert amount to wei (assuming 18 decimals)
      const amountWei = ethers.parseEther(amount);
      
      // Approve the contract to spend tokens
      console.log("Approving token transfer...");
      const approveTx = await tokenContract.approve(ARTIST_STAKING_ADDRESS, amountWei);
      await approveTx.wait();
      console.log("Token transfer approved");
      
      // Send stake transaction
      console.log("Sending stake transaction...");
      const tx = await contract.stake(amountWei);
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Save stake to database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      const { data: artistData } = await supabase
        .from('artists')
        .select('id')
        .eq('wallet_address', artistAddress.toLowerCase())
        .single();

      if (profileData && artistData) {
        const { error: dbError } = await supabase.from('stakes').insert({
          staker_id: profileData.id,
          artist_id: artistData.id,
          amount: amount,
          stablecoin_address: CUSD_TOKEN_ADDRESS,
          status: 'active',
          transaction_hash: receipt.hash,
        });

        if (dbError) throw dbError;
      }

      setOpen(false);
      setAmount('');
      onSuccess?.();
    } catch (err: any) {
      console.error('Staking failed:', err);
      let errorMessage = 'Failed to process staking. ';
      
      if (err.reason) {
        errorMessage += err.reason;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!artistAddress || !ethers.isAddress(artistAddress) ? (
        <div className="inline-block bg-gray-400 opacity-50 px-4 py-2 rounded-lg font-londrina text-[#14213D] cursor-not-allowed">
          Stake 
          <span className="text-xs ml-1 align-top">(unavailable)</span>
        </div>
      ) : (
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setOpen(true)}
          disabled={!address}
        >
          Stake
        </button>
      )}

      <StyledDialog 
        open={open} 
        onClose={() => !loading && setOpen(false)}
      >
        <DialogTitle className="font-londrina text-2xl">Stake cUSD</DialogTitle>
        <DialogContent>
          <div className="mb-4 text-sm text-gray-300">
            Stake cUSD to earn COOKIES tokens. Your COOKIES earnings will be streamed to the artist.
          </div>
          <StyledTextField
            autoFocus
            margin="dense"
            label="Amount (cUSD)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          {error && (
            <div className="text-red-500 mt-2 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleStake}
            disabled={loading || !amount}
            className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Stake'}
          </button>
        </DialogContent>
      </StyledDialog>
    </>
  );
}; 