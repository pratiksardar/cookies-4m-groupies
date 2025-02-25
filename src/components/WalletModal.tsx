import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  nounId: number;
}

const wallets: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect to your MetaMask Wallet',
    nounId: 42
  },
  {
    id: 'rabby',
    name: 'Rabby',
    description: 'Connect using Rabby Wallet',
    nounId: 69
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect to your Coinbase Wallet',
    nounId: 88
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Connect using Phantom Wallet',
    nounId: 420
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Connect with Rainbow Wallet',
    nounId: 777
  }
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => Promise<void>;
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[rgb(var(--background))] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-londrina font-bold text-[rgb(var(--text-primary))] flex justify-between items-center"
                >
                  <span className="flex items-center">
                    <WalletIcon className="w-6 h-6 mr-2" />
                    Connect Wallet
                  </span>
                  <button
                    onClick={onClose}
                    className="text-[rgb(var(--text-primary))] hover:opacity-70 transition-opacity"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 space-y-3">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      className="w-full p-4 bg-white dark:bg-neutral-800 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200 flex items-center shadow-custom-sm"
                      onClick={() => onConnect(wallet.id)}
                    >
                      <img
                        src={`https://noun.pics/${wallet.nounId}`}
                        alt={wallet.name}
                        className="w-12 h-12 mr-3 rounded-lg"
                      />
                      <div className="text-left">
                        <h4 className="font-londrina text-lg text-[rgb(var(--text-primary))]">
                          {wallet.name}
                        </h4>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                          {wallet.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}