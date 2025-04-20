import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCookiesToken } from '../hooks/useCookiesToken';
import { DebugRewards } from './DebugRewards';

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

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const { cookiesBalance, stakedAmount, pendingCookiesRewards, claimRewards, loading, error, refreshData } = useCookiesToken();
  const [showDebug, setShowDebug] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  const handleClaimSubmit = async () => {
    const success = await claimRewards();
    if (success) {
      onClose();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing rewards data...');
      await refreshData();
      console.log('Rewards data refreshed');
    } catch (err) {
      console.error('Error refreshing rewards:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <StyledDialog
      open={isOpen}
      onClose={() => !loading && onClose()}
      aria-labelledby="rewards-modal-title"
    >
      <DialogTitle id="rewards-modal-title" className="text-2xl font-londrina">
        Your Rewards
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
            <span className="text-gray-300">Pending COOKIES Rewards</span>
            <div className="flex items-center">
              <span className="text-xl font-londrina mr-2">🍪 {pendingCookiesRewards}</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-400 hover:text-white p-1"
                title="Refresh rewards"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          {Number(pendingCookiesRewards) > 0 && (
            <button
              onClick={handleClaimSubmit}
              disabled={loading || Number(pendingCookiesRewards) <= 0}
              className="w-full mt-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-londrina transition-colors"
            >
              {loading ? 'Processing...' : 'Claim Rewards'}
            </button>
          )}
        </div>

        <div className="text-xs text-gray-400 mb-4">
          <p>You're earning 10 COOKIES every minute for each cUSD staked.</p>
          <p>With {stakedAmount} cUSD staked, you're earning {Number(stakedAmount) * 10} COOKIES per minute.</p>
        </div>

        <div className="flex justify-center mb-4">
          <a 
            href="/stake" 
            className="text-primary-500 hover:text-primary-400 text-sm font-londrina"
          >
            Go to Staking Dashboard
          </a>
        </div>

        {/* Debug section */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebug && <DebugRewards />}
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm p-2 rounded">
            {error}
          </div>
        )}
      </DialogContent>
    </StyledDialog>
  );
}; 