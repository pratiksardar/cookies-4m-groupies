import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

function Navbar() {
  const location = useLocation();
  const { connect, disconnect, address } = useWallet();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">ArtistPlatform</Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/gallery"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/gallery') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Gallery
              </Link>
              <Link
                to="/artist-listing"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/artist-listing') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                List as Artist
              </Link>
              <Link
                to="/groupies"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/groupies') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Groupies
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {address ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;