import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../supabase';

function ArtistListing() {
  const { address } = useWallet();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    category: '',
    instagram_url: '',
    twitter_url: '',
    website_url: '',
    avatar_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First create profile
      const { data: profile, error: profileError } = await supabase
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

      // Then create artist profile
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

      alert('Successfully registered as an artist!');
    } catch (error) {
      console.error('Error creating artist profile:', error);
      alert('Error creating artist profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet to continue</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">List as an Artist</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
            required
          >
            <option value="">Select a category</option>
            <option value="Digital Art">Digital Art</option>
            <option value="Photography">Photography</option>
            <option value="Illustration">Illustration</option>
            <option value="3D Art">3D Art</option>
            <option value="Animation">Animation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instagram URL</label>
          <input
            type="url"
            name="instagram_url"
            value={formData.instagram_url}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Twitter URL</label>
          <input
            type="url"
            name="twitter_url"
            value={formData.twitter_url}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website URL</label>
          <input
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-medium"
        >
          Register as Artist
        </button>
      </form>
    </div>
  );
}

export default ArtistListing;