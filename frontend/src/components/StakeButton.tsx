import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { Dialog, DialogContent, DialogTitle, TextField, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ARTIST_STAKING_ADDRESS } from '../config/contracts';
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

const StyledSlider = styled(Slider)({
  color: '#FCA311',
  '& .MuiSlider-thumb': {
    backgroundColor: '#FCA311',
  },
  '& .MuiSlider-track': {
    backgroundColor: '#FCA311',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(252, 163, 17, 0.3)',
  },
});

interface StakeButtonProps {
  artistAddress: string;
  onSuccess?: () => void;
}

export const StakeButton = ({ artistAddress, onSuccess }: StakeButtonProps) => {
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDelegation, setCurrentDelegation] = useState<number>(0);
  const { provider, address, signer } = useWallet();

  useEffect(() => {
    if (open && address && artistAddress) {
      fetchCurrentDelegation();
    }
  }, [open, address, artistAddress]);

  const fetchCurrentDelegation = async () => {
    if (!provider || !address) return;

    try {
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        provider
      );

      const delegation = await contract.delegations(address, artistAddress);
      setCurrentDelegation(delegation.toNumber());
      setPercentage(delegation.toNumber());
    } catch (error) {
      console.error('Error fetching delegation:', error);
    }
  };

  const handleDelegate = async () => {
    if (!provider || !address || !artistAddress) {
      setError("Wallet not connected or invalid artist address");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const contractSigner = signer || await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        ARTIST_STAKING_ADDRESS,
        ArtistStakingABI,
        contractSigner
      );

      // Send delegate transaction
      console.log("Delegating rewards...");
      const tx = await contract.delegate(artistAddress, percentage);
      const receipt = await tx.wait();

      // Save delegation to database
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
        const { error: dbError } = await supabase.from('delegations').insert({
          delegator_id: profileData.id,
          artist_id: artistData.id,
          percentage: percentage,
          transaction_hash: receipt.hash,
        });

        if (dbError) throw dbError;
      }

      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('Delegation failed:', err);
      let errorMessage = 'Failed to delegate rewards. ';
      
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
          Delegate 
          <span className="text-xs ml-1 align-top">(unavailable)</span>
        </div>
      ) : (
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setOpen(true)}
          disabled={!address}
        >
          Delegate
        </button>
      )}

      <StyledDialog 
        open={open} 
        onClose={() => !loading && setOpen(false)}
      >
        <DialogTitle className="font-londrina text-2xl">Delegate COOKIES Rewards</DialogTitle>
        <DialogContent>
          <div className="mb-6 text-sm text-gray-300">
            Choose what percentage of your COOKIES rewards to delegate to this artist.
            {currentDelegation > 0 && (
              <p className="mt-2">Current delegation: {currentDelegation}%</p>
            )}
          </div>
          
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-300">Percentage to Delegate</p>
            <StyledSlider
              value={percentage}
              onChange={(_, value) => setPercentage(value as number)}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
            />
            <div className="flex justify-between text-sm text-gray-300">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 mt-2 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleDelegate}
            disabled={loading || percentage === currentDelegation}
            className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Delegation'}
          </button>
        </DialogContent>
      </StyledDialog>
    </>
  );
}; 