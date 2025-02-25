import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTheme } from './ThemeProvider';
import { WalletModal } from './WalletModal';

function Navbar() {
  const location = useLocation();
  const { connect, disconnect, address, isModalOpen, openModal, closeModal } = useWallet();
  const { allowToggle } = useTheme();

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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {address ? (
                <div className="flex items-center space-x-4">
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
    </>
  );
}

export default Navbar;