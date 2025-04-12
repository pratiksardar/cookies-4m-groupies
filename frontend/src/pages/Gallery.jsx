import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Gallery() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Artists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-[#14213D] dark:bg-neutral-800 rounded-lg overflow-hidden shadow-custom">
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
                  <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-londrina transition-colors duration-200">
                    Stake
                  </button>
                  <button className="bg-accent-500 hover:bg-accent-600 text-[#14213D] px-4 py-2 rounded-lg font-londrina transition-colors duration-200">
                    Donate
                  </button>
                </div>
              </div>
              {artist.artworks && artist.artworks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-londrina text-white mb-3">Latest Artworks</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {artist.artworks.slice(0, 3).map((artwork) => (
                      <div key={artwork.id} className="relative aspect-square">
                        <img
                          src={artwork.media_url}
                          alt={artwork.title}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;