import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Artist, Artwork, Comment } from '../types/supabase';
import { supabase } from '../lib/supabase';
import { useWallet } from '../hooks/useWallet';

interface ArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist & {
    profile: {
      username: string;
      bio?: string;
      avatar_url?: string;
    };
    artworks: Artwork[];
  };
}

export function ArtistModal({ isOpen, onClose, artist }: ArtistModalProps) {
  const { address } = useWallet();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, artist.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !comment.trim()) return;

    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', address)
        .single();

      if (!profileData) throw new Error('Profile not found');

      const { error } = await supabase
        .from('comments')
        .insert({
          profile_id: profileData.id,
          artist_id: artist.id,
          content: comment.trim()
        });

      if (error) throw error;

      fetchComments();
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#E5D9C9] dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={artist.profile.avatar_url || 'https://via.placeholder.com/128'}
                      alt={artist.profile.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-[#14213D] dark:border-primary-500"
                    />
                    <div>
                      <Dialog.Title className="text-2xl font-londrina font-bold text-[#14213D] dark:text-white">
                        {artist.profile.username}
                      </Dialog.Title>
                      <p className="text-[#14213D]/60 dark:text-gray-400">{artist.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-[#14213D] dark:text-white hover:opacity-70 transition-opacity"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {artist.profile.bio && (
                  <p className="text-[#14213D] dark:text-white mb-6">{artist.profile.bio}</p>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-londrina font-bold text-[#14213D] dark:text-white mb-4">
                    Artworks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {artist.artworks.map((artwork) => (
                        <motion.div
                          key={artwork.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-custom"
                        >
                          <img
                            src={artwork.media_url}
                            alt={artwork.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="font-londrina font-bold text-[#14213D] dark:text-white">
                              {artwork.title}
                            </h4>
                            {artwork.description && (
                              <p className="text-sm text-[#14213D]/60 dark:text-gray-400 mt-1">
                                {artwork.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[#14213D] dark:text-white font-londrina">
                                {artwork.price} {artwork.currency}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-londrina font-bold text-[#14213D] dark:text-white mb-4 flex items-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                    Comments
                  </h3>
                  
                  {address ? (
                    <form onSubmit={handleSubmitComment} className="mb-6">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-[#14213D]/20 dark:border-neutral-700 text-[#14213D] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="submit"
                          disabled={isLoading || !comment.trim()}
                          className="px-6 py-2 bg-[#14213D] dark:bg-primary-500 text-white rounded-lg font-londrina hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50"
                        >
                          {isLoading ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-[#14213D]/60 dark:text-gray-400 mb-6">
                      Please connect your wallet to comment
                    </p>
                  )}

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white dark:bg-neutral-800 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <img
                            src={comment.profile?.avatar_url || 'https://via.placeholder.com/32'}
                            alt={comment.profile?.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="font-londrina text-[#14213D] dark:text-white">
                            {comment.profile?.username}
                          </span>
                        </div>
                        <p className="text-[#14213D]/80 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}