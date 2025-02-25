import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Scene } from '../components/three/Scene';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../lib/supabase';

function Landing() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [isArtist, setIsArtist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      checkArtistStatus();
    } else {
      setLoading(false);
    }
  }, [address]);

  const checkArtistStatus = async () => {
    try {
      // First get the profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (profile) {
        // Then check if they're an artist
        const { data: artist } = await supabase
          .from('artists')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        setIsArtist(!!artist);
      } else {
        setIsArtist(false);
      }
    } catch (error) {
      console.error('Error checking artist status:', error);
      setIsArtist(false);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = () => {
    navigate('/artist-listing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-7xl font-londrina font-black leading-tight text-[#14213D] dark:text-white"
          >
            Empower Local Artists through Web3
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl font-londrina text-[#14213D]/80 dark:text-white/80 max-w-2xl"
          >
            Join our community of artists and collectors. Create, discover, and support local talent in a decentralized marketplace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={handleArtistClick}
              className="inline-flex items-center px-8 py-4 bg-[#14213D] dark:bg-primary-500 text-white rounded-lg font-londrina text-lg hover:bg-[#14213D]/90 dark:hover:bg-primary-600 transition-colors duration-200"
            >
              <PaintBrushIcon className="w-6 h-6 mr-2" />
              Artist
            </button>
            <Link
              to="/gallery"
              className="inline-flex items-center px-8 py-4 bg-[#FCA311] text-[#14213D] rounded-lg font-londrina text-lg hover:bg-[#FCA311]/90 transition-colors duration-200"
            >
              Explore Gallery
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="lg:w-1/2 h-[600px] mt-12 lg:mt-0"
        >
          <Scene />
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;