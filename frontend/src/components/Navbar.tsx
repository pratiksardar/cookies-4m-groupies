import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTheme } from './ThemeProvider';
import { WalletModal } from './WalletModal';
import { NetworkIndicator } from './NetworkIndicator';
import { StakingModal } from './StakingModal';
import { RewardsModal } from './RewardsModal';
import { useCookiesToken } from '../hooks/useCookiesToken';

function Navbar() {
  const location = useLocation();
  const { connect, disconnect, address, isModalOpen, openModal, closeModal } = useWallet();
  const { cookiesBalance } = useCookiesToken();
  const { allowToggle } = useTheme();
  const [stakingModalOpen, setStakingModalOpen] = useState(false);
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
                <Link
                  to="/stake"
                  className={`px-3 py-2 rounded-md text-sm font-londrina font-medium ${
                    isActive('/stake')
                      ? 'bg-[rgb(var(--text-primary))] text-[rgb(var(--background))]'
                      : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--text-primary))]/5'
                  }`}
                >
                  Staking
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {address && <NetworkIndicator />}
              {address ? (
                <div className="flex items-center space-x-4">
                  {/* COOKIES Balance Display - Now clickable */}
                  <button
                    onClick={() => setRewardsModalOpen(true)}
                    className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-londrina font-medium flex items-center hover:bg-amber-200 transition-colors"
                  >
                    <span className="mr-1">🍪</span>
                    <span>{cookiesBalance}</span>
                  </button>
                  <button
                    onClick={() => setStakingModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-londrina font-medium"
                  >
                    Stake cUSD
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

      {/* Staking Modal for cUSD/COOKIES */}
      <StakingModal 
        isOpen={stakingModalOpen}
        onClose={() => setStakingModalOpen(false)}
      />

      {/* Rewards Modal */}
      <RewardsModal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
      />
    </>
  );
}

export default Navbar;