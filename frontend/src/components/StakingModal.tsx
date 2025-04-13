import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCookiesToken } from '../hooks/useCookiesToken';

// Styled components
const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    backgroundColor: '#14213D',
    color: 'white',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '480px',
  },
});

const StyledTabs = styled(Tabs)({
  marginBottom: '1.5rem',
  '& .MuiTabs-indicator': {
    backgroundColor: '#FCA311',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
      color: '#FCA311',
    },
  },
});

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StakingModal: React.FC<StakingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const { cookiesBalance, stakedAmount, pendingRewards, stakeTokens, unstakeTokens, claimRewards, loading, error } = useCookiesToken();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStakeSubmit = async () => {
    if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) return;
    const success = await stakeTokens(stakeAmount);
    if (success) {
      setStakeAmount('');
      onClose();
    }
  };

  const handleUnstakeSubmit = async () => {
    if (!unstakeAmount || isNaN(Number(unstakeAmount)) || Number(unstakeAmount) <= 0) return;
    const success = await unstakeTokens(unstakeAmount);
    if (success) {
      setUnstakeAmount('');
      onClose();
    }
  };

  const handleClaimSubmit = async () => {
    const success = await claimRewards();
    if (success) {
      onClose();
    }
  };

  return (
    <StyledDialog
      open={isOpen}
      onClose={() => !loading && onClose()}
      aria-labelledby="staking-modal-title"
    >
      <DialogTitle id="staking-modal-title" className="text-2xl font-londrina">
        Staking Dashboard
      </DialogTitle>
      <DialogContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Your COOKIES Balance</span>
            <span className="text-xl font-londrina">🍪 {cookiesBalance}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Currently Staked</span>
            <span className="text-xl font-londrina">{stakedAmount} cUSD</span>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Pending Rewards</span>
            <span className="text-xl font-londrina">🍪 {pendingRewards}</span>
          </div>
          {Number(pendingRewards) > 0 && (
            <button
              onClick={handleClaimSubmit}
              disabled={loading || Number(pendingRewards) <= 0}
              className="w-full mt-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-londrina transition-colors"
            >
              {loading ? 'Processing...' : 'Claim Rewards'}
            </button>
          )}
        </div>

        <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="staking options">
          <Tab label="Stake" className="font-londrina" />
          <Tab label="Unstake" className="font-londrina" />
        </StyledTabs>

        {activeTab === 0 ? (
          <div>
            <div className="mb-4">
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
            <button
              onClick={handleStakeSubmit}
              disabled={loading || !stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-londrina transition-colors"
            >
              {loading ? 'Processing...' : 'Stake cUSD'}
            </button>
            <div className="mt-4 text-xs text-gray-400">
              Stake cUSD to start earning COOKIES tokens. You'll earn 10 COOKIES every minute for each cUSD staked.
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Enter amount to unstake"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max={parseFloat(stakedAmount)}
                step="0.01"
              />
            </div>
            <button
              onClick={handleUnstakeSubmit}
              disabled={
                loading || 
                !unstakeAmount || 
                isNaN(Number(unstakeAmount)) || 
                Number(unstakeAmount) <= 0 || 
                Number(unstakeAmount) > parseFloat(stakedAmount)
              }
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-londrina transition-colors"
            >
              {loading ? 'Processing...' : 'Unstake cUSD'}
            </button>
            <div className="mt-4 text-xs text-gray-400">
              Unstake your cUSD anytime. Any pending rewards will be automatically claimed.
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-sm p-2 rounded">
            {error}
          </div>
        )}
      </DialogContent>
    </StyledDialog>
  );
}; 