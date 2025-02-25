import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Artist, Artwork } from '../types/supabase';
import { motion } from 'framer-motion';
import { ArtistModal } from '../components/ArtistModal';

interface ArtistWithProfile extends Artist {
  profile?: {
    username: string;
    bio?: string;
    avatar_url?: string;
  };
  artworks?: Artwork[];
}

function Gallery() {
  const [artists, setArtists] = useState<ArtistWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<ArtistWithProfile | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  async function fetchArtists() {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          profile:profiles(*),
          artworks(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-londrina font-bold mb-8 text-[#14213D] dark:text-white"
      >
        Discover Artists
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#14213D] dark:bg-neutral-800 rounded-lg overflow-hidden shadow-custom hover:transform hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
            onClick={() => setSelectedArtist(artist)}
          >
            <div className="aspect-w-16 aspect-h-9 relative h-48">
              <img
                src={artist.profile?.avatar_url || 'https://via.placeholder.com/400x400'}
                alt={artist.profile?.username}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-londrina text-white mb-2">{artist.profile?.username}</h2>
              <p className="text-gray-300 mb-4">{artist.profile?.bio}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow font-londrina">{artist.category}</span>
                <div className="space-x-2">
                  <button 
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle stake action
                    }}
                  >
                    Stake
                  </button>
                  <button 
                    className="bg-accent-500 hover:bg-accent-600 text-[#14213D] px-4 py-2 rounded-lg font-londrina transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle donate action
                    }}
                  >
                    Donate
                  </button>
                </div>
              </div>
              {artist.artworks && artist.artworks.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-londrina text-white mb-3">Latest Artworks</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {artist.artworks.slice(0, 3).map((artwork) => (
                      <motion.div
                        key={artwork.id}
                        whileHover={{ scale: 1.05 }}
                        className="relative aspect-square"
                      >
                        <img
                          src={artwork.media_url}
                          alt={artwork.title}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedArtist && (
        <ArtistModal
          isOpen={!!selectedArtist}
          onClose={() => setSelectedArtist(null)}
          artist={selectedArtist}
        />
      )}
    </div>
  );
}

export default Gallery;