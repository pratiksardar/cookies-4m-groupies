import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
}

interface Activity {
  stakes: any[];
  purchases: any[];
  donations: any[];
}

function Groupies() {
  const { address, openModal } = useWallet();
  const [activity, setActivity] = useState<Activity>({
    stakes: [],
    purchases: [],
    donations: []
  });
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!address) {
      openModal();
    } else {
      fetchUserActivity();
    }
  }, [address, openModal]);

  async function fetchUserActivity() {
    if (!address) return;

    try {
      setLoading(true);
      
      // First check if profile exists
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address);

      if (profileError) throw profileError;

      // If no profile exists yet
      if (!profiles || profiles.length === 0) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

      setHasProfile(true);
      const profileId = profiles[0].id;

      // Fetch all activity data
      const [stakesData, purchasesData, donationsData] = await Promise.all([
        supabase
          .from('stakes')
          .select(`
            *,
            artist:artists(
              *,
              profile:profiles(*)
            )
          `)
          .eq('staker_id', profileId),
        supabase
          .from('purchases')
          .select(`
            *,
            artwork:artworks(
              *,
              artist:artists(
                profile:profiles(*)
              )
            )
          `)
          .eq('buyer_id', profileId),
        supabase
          .from('donations')
          .select(`
            *,
            artist:artists(
              *,
              profile:profiles(*)
            )
          `)
          .eq('donor_id', profileId)
      ]);

      setActivity({
        stakes: stakesData.data || [],
        purchases: purchasesData.data || [],
        donations: donationsData.data || []
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return null; // Don't show anything while the modal is opening
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-londrina font-bold mb-4 text-[#14213D] dark:text-white">
            Welcome to Cookies4mgroupies!
          </h2>
          <p className="text-[#14213D]/80 dark:text-white/80 mb-8">
            To start supporting artists and tracking your activity, you'll need to create a profile first. Head over to the Artist Listing page to set up your profile!
          </p>
          <a
            href="/artist-listing"
            className="inline-block bg-[#14213D] dark:bg-primary-500 text-white px-8 py-3 rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
          >
            Create Profile
          </a>
        </motion.div>
      </div>
    );
  }

  const hasAnyActivity = activity.stakes.length > 0 || activity.purchases.length > 0 || activity.donations.length > 0;

  if (!hasAnyActivity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-londrina font-bold mb-4 text-[#14213D] dark:text-white">
            No Activity Yet
          </h2>
          <p className="text-[#14213D]/80 dark:text-white/80 mb-8">
            Start supporting your favorite artists by staking, purchasing artwork, or making donations!
          </p>
          <a
            href="/gallery"
            className="inline-block bg-[#14213D] dark:bg-primary-500 text-white px-8 py-3 rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
          >
            Explore Gallery
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {activity.stakes.length > 0 && (
        <section>
          <h2 className="text-3xl font-londrina font-bold mb-6 text-[#14213D] dark:text-white">Your Stakes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.stakes.map((stake) => (
              <motion.div
                key={stake.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-custom"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={stake.artist.profile.avatar_url || 'https://via.placeholder.com/40x40'}
                    alt={stake.artist.profile.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-londrina font-bold text-[#14213D] dark:text-white">
                      {stake.artist.profile.username}
                    </h3>
                    <p className="text-[#14213D]/60 dark:text-gray-400">{stake.artist.category}</p>
                  </div>
                </div>
                <div className="space-y-2 text-[#14213D] dark:text-white">
                  <p>Amount Staked: {stake.amount} USDC</p>
                  <p>$COOKIES Earned: {stake.cookies_earned}</p>
                  <p>Status: {stake.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activity.purchases.length > 0 && (
        <section>
          <h2 className="text-3xl font-londrina font-bold mb-6 text-[#14213D] dark:text-white">Your Purchases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.purchases.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-custom"
              >
                <h3 className="font-londrina font-bold text-[#14213D] dark:text-white mb-2">
                  {purchase.artwork.title}
                </h3>
                <p className="text-[#14213D]/60 dark:text-gray-400 mb-4">
                  by {purchase.artwork.artist.profile.username}
                </p>
                <p className="text-[#14213D] dark:text-white">
                  Price: {purchase.price} {purchase.currency}
                </p>
                <p className="text-[#14213D] dark:text-white">Status: {purchase.status}</p>
                <p className="text-sm text-[#14213D]/60 dark:text-gray-400 mt-2">
                  Tx: {purchase.transaction_hash.slice(0, 6)}...{purchase.transaction_hash.slice(-4)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activity.donations.length > 0 && (
        <section>
          <h2 className="text-3xl font-londrina font-bold mb-6 text-[#14213D] dark:text-white">Your Donations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.donations.map((donation) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-custom"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={donation.artist.profile.avatar_url || 'https://via.placeholder.com/40x40'}
                    alt={donation.artist.profile.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-londrina font-bold text-[#14213D] dark:text-white">
                      {donation.artist.profile.username}
                    </h3>
                    <p className="text-[#14213D]/60 dark:text-gray-400">{donation.artist.category}</p>
                  </div>
                </div>
                <p className="text-[#14213D] dark:text-white">
                  Amount: {donation.amount} {donation.currency}
                </p>
                {donation.message && (
                  <p className="mt-2 italic text-[#14213D]/80 dark:text-white/80">
                    "{donation.message}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Groupies;