import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../supabase';

function Groupies() {
  const { address } = useWallet();
  const [stakes, setStakes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchUserActivity();
    }
  }, [address]);

  async function fetchUserActivity() {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address)
        .single();

      if (profileData) {
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
            .eq('staker_id', profileData.id),
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
            .eq('buyer_id', profileData.id),
          supabase
            .from('donations')
            .select(`
              *,
              artist:artists(
                *,
                profile:profiles(*)
              )
            `)
            .eq('donor_id', profileData.id)
        ]);

        setStakes(stakesData.data || []);
        setPurchases(purchasesData.data || []);
        setDonations(donationsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet to view your activity</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-6">Your Stakes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stakes.map((stake) => (
            <div key={stake.id} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={stake.artist.profile.avatar_url || 'https://via.placeholder.com/40x40'}
                  alt={stake.artist.profile.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-bold">{stake.artist.profile.username}</h3>
                  <p className="text-gray-400">{stake.artist.category}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p>Amount Staked: {stake.amount} USDC</p>
                <p>$COOKIES Earned: {stake.cookies_earned}</p>
                <p>Status: {stake.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Your Purchases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-gray-900 p-6 rounded-lg">
              <h3 className="font-bold mb-2">{purchase.artwork.title}</h3>
              <p className="text-gray-400 mb-4">by {purchase.artwork.artist.profile.username}</p>
              <p>Price: {purchase.price} {purchase.currency}</p>
              <p>Status: {purchase.status}</p>
              <p className="text-sm text-gray-500 mt-2">
                Tx: {purchase.transaction_hash.slice(0, 6)}...{purchase.transaction_hash.slice(-4)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Your Donations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={donation.artist.profile.avatar_url || 'https://via.placeholder.com/40x40'}
                  alt={donation.artist.profile.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-bold">{donation.artist.profile.username}</h3>
                  <p className="text-gray-400">{donation.artist.category}</p>
                </div>
              </div>
              <p>Amount: {donation.amount} {donation.currency}</p>
              {donation.message && (
                <p className="mt-2 italic">"{donation.message}"</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Groupies;