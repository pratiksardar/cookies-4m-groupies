import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Artist, Artwork, Profile } from '../types/supabase';
import { PlusIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline';

interface ArtworkFormData {
  title: string;
  description: string;
  price: string;
  media_url: string;
  currency: string;
}

function ArtistListing() {
  const { address, openModal } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [artistData, setArtistData] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showArtworkForm, setShowArtworkForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    category: '',
    instagram_url: '',
    twitter_url: '',
    website_url: '',
    avatar_url: ''
  });

  const [artworkFormData, setArtworkFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    price: '',
    media_url: '',
    currency: 'ETH'
  });

  useEffect(() => {
    if (!address) {
      openModal();
    } else {
      checkProfileAndArtistStatus();
    }
  }, [address, openModal]);

  const checkProfileAndArtistStatus = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // First get the profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
          category: '',
          instagram_url: '',
          twitter_url: '',
          website_url: ''
        });

        // Then check if they're an artist
        const { data: artistData } = await supabase
          .from('artists')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();

        if (artistData) {
          setIsArtist(true);
          setArtistData(artistData);
          setFormData(prev => ({
            ...prev,
            category: artistData.category || '',
            instagram_url: artistData.instagram_url || '',
            twitter_url: artistData.twitter_url || '',
            website_url: artistData.website_url || ''
          }));

          // Fetch artworks
          fetchArtworks(artistData.id);
        }
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtworks = async (artistId: string) => {
    try {
      const { data: artworksData } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (artworksData) {
        setArtworks(artworksData);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'artwork') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucketName = type === 'profile' ? 'avatars' : 'artworks';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (type === 'profile') {
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      } else {
        setArtworkFormData(prev => ({ ...prev, media_url: publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!isEditMode && isArtist) {
        setIsEditMode(true);
        return;
      }

      if (profile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            bio: formData.bio,
            avatar_url: formData.avatar_url
          })
          .eq('id', profile.id);

        if (profileError) throw profileError;

        if (isArtist && artistData) {
          // Update artist profile
          const { error: artistError } = await supabase
            .from('artists')
            .update({
              category: formData.category,
              instagram_url: formData.instagram_url,
              twitter_url: formData.twitter_url,
              website_url: formData.website_url
            })
            .eq('id', artistData.id);

          if (artistError) throw artistError;
        } else {
          // Create new artist profile
          const { error: artistError } = await supabase
            .from('artists')
            .insert({
              profile_id: profile.id,
              category: formData.category,
              instagram_url: formData.instagram_url,
              twitter_url: formData.twitter_url,
              website_url: formData.website_url
            });

          if (artistError) throw artistError;
        }
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            wallet_address: address,
            username: formData.username,
            bio: formData.bio,
            avatar_url: formData.avatar_url
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Create artist profile
        const { error: artistError } = await supabase
          .from('artists')
          .insert({
            profile_id: newProfile.id,
            category: formData.category,
            instagram_url: formData.instagram_url,
            twitter_url: formData.twitter_url,
            website_url: formData.website_url
          });

        if (artistError) throw artistError;
      }

      setIsEditMode(false);
      alert(isArtist ? 'Profile updated successfully!' : 'Successfully registered as an artist!');
      checkProfileAndArtistStatus(); // Refresh the data
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistData) return;

    try {
      const { error } = await supabase
        .from('artworks')
        .insert({
          artist_id: artistData.id,
          title: artworkFormData.title,
          description: artworkFormData.description,
          media_url: artworkFormData.media_url,
          media_type: 'image',
          price: parseFloat(artworkFormData.price),
          currency: artworkFormData.currency
        });

      if (error) throw error;

      // Reset form and fetch updated artworks
      setArtworkFormData({
        title: '',
        description: '',
        price: '',
        media_url: '',
        currency: 'ETH'
      });
      setShowArtworkForm(false);
      fetchArtworks(artistData.id);
    } catch (error) {
      console.error('Error creating artwork:', error);
      alert('Error creating artwork. Please try again.');
    }
  };

  if (!address) {
    return null;
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
      <div className="max-w-4xl mx-auto">
        {/* Show Artworks Section First for Artists */}
        {isArtist && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-londrina font-bold text-[#14213D] dark:text-white">
                Your Artworks
              </h2>
              <button
                onClick={() => setShowArtworkForm(true)}
                className="flex items-center px-6 py-3 bg-[#14213D] dark:bg-primary-500 text-white rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Artwork
              </button>
            </div>

            {showArtworkForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-custom mb-8"
              >
                <h3 className="text-xl font-londrina font-bold mb-6 text-[#14213D] dark:text-white">
                  Add New Artwork
                </h3>
                <form onSubmit={handleArtworkSubmit} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-full h-64 mb-4 bg-gray-100 dark:bg-neutral-700 rounded-lg overflow-hidden">
                      {artworkFormData.media_url ? (
                        <img
                          src={artworkFormData.media_url}
                          alt="Artwork preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <PhotoIcon className="w-16 h-16 mb-2" />
                          <p>Click to upload artwork</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => artworkFileInputRef.current?.click()}
                        className="absolute bottom-4 right-4 bg-[#14213D] dark:bg-primary-500 text-white p-2 rounded-full hover:bg-opacity-90"
                      >
                        {isUploading ? '...' : '📷'}
                      </button>
                    </div>
                    <input
                      ref={artworkFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'artwork')}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#14213D] dark:text-white">
                      Title
                    </label>
                    <input
                      type="text"
                      value={artworkFormData.title}
                      onChange={(e) => setArtworkFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#14213D] dark:text-white">
                      Description
                    </label>
                    <textarea
                      value={artworkFormData.description}
                      onChange={(e) => setArtworkFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#14213D] dark:text-white">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={artworkFormData.price}
                        onChange={(e) => setArtworkFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#14213D] dark:text-white">
                        Currency
                      </label>
                      <select
                        value={artworkFormData.currency}
                        onChange={(e) => setArtworkFormData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="ETH">ETH</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowArtworkForm(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-neutral-700 text-[#14213D] dark:text-white rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#14213D] dark:bg-primary-500 text-white rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
                    >
                      Add Artwork
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-custom"
                >
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img
                      src={artwork.media_url}
                      alt={artwork.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-londrina font-bold text-[#14213D] dark:text-white mb-2">
                      {artwork.title}
                    </h3>
                    <p className="text-[#14213D]/60 dark:text-gray-400 mb-4">
                      {artwork.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#14213D] dark:text-white font-londrina">
                        {artwork.price} {artwork.currency}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="relative">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-londrina font-bold text-[#14213D] dark:text-white">
              {isArtist ? 'Artist Profile' : (profile ? 'Become an Artist' : 'Create Profile')}
            </h1>
            {isArtist && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center px-4 py-2 bg-[#14213D] dark:bg-primary-500 text-white rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200"
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                <img
                  src={formData.avatar_url || 'https://via.placeholder.com/128'}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover border-4 border-[#14213D] dark:border-primary-500"
                />
                {(!isArtist || isEditMode) && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#14213D] dark:bg-primary-500 text-white p-2 rounded-full hover:bg-opacity-90"
                  >
                    {isUploading ? '...' : '📷'}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profile')}
                className="hidden"
                disabled={isArtist && !isEditMode}
              />
            </div>

            {/* Form Fields */}
            {Object.entries({
              username: 'Username',
              bio: 'Bio',
              category: 'Category',
              instagram_url: 'Instagram URL',
              twitter_url: 'Twitter URL',
              website_url: 'Website URL'
            }).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2 text-[#14213D] dark:text-white">
                  {label}
                </label>
                {field === 'bio' ? (
                  <textarea
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    disabled={isArtist && !isEditMode}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                ) : field === 'category' ? (
                  <select
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isArtist && !isEditMode}
                    required={field === 'username' || field === 'category'}
                  >
                    <option value="">Select a category</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="Photography">Photography</option>
                    <option value="Illustration">Illustration</option>
                    <option value="3D Art">3D Art</option>
                    <option value="Animation">Animation</option>
                  </select>
                ) : (
                  <input
                    type={field.includes('url') ? 'url' : 'text'}
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-[#14213D]/20 dark:border-neutral-600 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isArtist && !isEditMode}
                    required={field === 'username'}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            {(!isArtist || isEditMode) && (
              <button
                type="submit"
                className="w-full bg-[#14213D] dark:bg-primary-500 hover:bg-opacity-90 text-white py-3 rounded-lg font-londrina transition-colors duration-200"
              >
                {isArtist ? 'Update Profile' : (profile ? 'Become an Artist' : 'Create Profile')}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArtistListing;