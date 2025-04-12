import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Donation {
  id: string;
  donor_address: string;
  artist_address: string;
  amount: string;
  token_address: string;
  transaction_hash: string;
  block_number: number;
  timestamp: string;
}

export const useDonations = (address?: string, type: 'donor' | 'artist' = 'donor') => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchDonations = async () => {
      if (!address) {
        setDonations([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq(type === 'donor' ? 'donor_address' : 'artist_address', address.toLowerCase())
          .order('timestamp', { ascending: false });

        if (error) throw error;
        setDonations(data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [address, type, supabase]);

  return { donations, loading };
}; 