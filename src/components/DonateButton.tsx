import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ARTIST_DONATION_ADDRESS, CUSD_TOKEN_ADDRESS } from '../config/contracts';
import ArtistDonationABI from '../abi/ArtistDonation.json';
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

interface DonateButtonProps {
  artistAddress: string;
  onSuccess?: () => void;
}

export const DonateButton = ({ artistAddress, onSuccess }: DonateButtonProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider, address, signer } = useWallet();

  const handleDonate = async () => {
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

    console.log("Starting donation with params:", {
      donorAddress: address,
      artistAddress,
      amount,
      tokenAddress: CUSD_TOKEN_ADDRESS,
      contractAddress: ARTIST_DONATION_ADDRESS
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
        ARTIST_DONATION_ADDRESS, 
        ArtistDonationABI, 
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
      const approveTx = await tokenContract.approve(ARTIST_DONATION_ADDRESS, amountWei);
      await approveTx.wait();
      console.log("Token transfer approved");
      
      // Send donation transaction
      console.log("Sending donation transaction...");
      const tx = await contract.donate(artistAddress, CUSD_TOKEN_ADDRESS, amountWei);
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Save donation to database
      const { error: dbError } = await supabase.from('donations').insert({
        donor_address: address.toLowerCase(),
        artist_address: artistAddress.toLowerCase(),
        amount: amount,
        token_address: CUSD_TOKEN_ADDRESS,
        transaction_hash: receipt.hash, // Use receipt.hash instead of transactionHash
        block_number: receipt.blockNumber,
        timestamp: new Date().toISOString()
      });

      if (dbError) throw dbError;

      setOpen(false);
      setAmount('');
      onSuccess?.();
    } catch (err: any) {
      console.error('Donation failed:', err);
      let errorMessage = 'Failed to process donation. ';
      
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
          Donate 
          <span className="text-xs ml-1 align-top">(unavailable)</span>
        </div>
      ) : (
        <button
          className="bg-accent-500 hover:bg-accent-600 text-[#14213D] px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setOpen(true)}
          disabled={!address}
        >
          Donate
        </button>
      )}

      <StyledDialog 
        open={open} 
        onClose={() => !loading && setOpen(false)}
      >
        <DialogTitle className="font-londrina text-2xl">Donate to Artist</DialogTitle>
        <DialogContent>
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
            onClick={handleDonate}
            disabled={loading || !amount}
            className="w-full mt-4 bg-accent-500 hover:bg-accent-600 text-[#14213D] px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Donation'}
          </button>
        </DialogContent>
      </StyledDialog>
    </>
  );
}; 