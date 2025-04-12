import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DonateButton } from '../components/DonateButton';
import { useWallet } from '../hooks/useWallet';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { ethers } from 'ethers';

// Mock the hooks and ethers
jest.mock('../hooks/useWallet');
jest.mock('@supabase/auth-helpers-react');
jest.mock('ethers');

describe('DonateButton', () => {
  const mockArtistAddress = '0x1234567890123456789012345678901234567890';
  const mockDonorAddress = '0x9876543210987654321098765432109876543210';
  const mockProvider = {
    getSigner: jest.fn(),
  };
  const mockSigner = {
    getAddress: jest.fn(),
  };
  const mockContract = {
    donate: jest.fn(),
  };
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn(),
  };
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (useWallet as jest.Mock).mockReturnValue({
      provider: mockProvider,
      address: mockDonorAddress,
    });
    (useSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    mockProvider.getSigner.mockReturnValue(mockSigner);
    (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);
    mockContract.donate.mockResolvedValue({
      wait: () => Promise.resolve({
        transactionHash: '0xabc',
        blockNumber: 123,
      }),
    });
    mockSupabase.insert.mockResolvedValue({ error: null });
  });

  it('renders donate button when wallet is connected', () => {
    render(<DonateButton artistAddress={mockArtistAddress} />);
    expect(screen.getByText('Donate')).toBeInTheDocument();
    expect(screen.getByText('Donate')).not.toBeDisabled();
  });

  it('disables donate button when wallet is not connected', () => {
    (useWallet as jest.Mock).mockReturnValue({
      provider: null,
      address: null,
    });
    render(<DonateButton artistAddress={mockArtistAddress} />);
    expect(screen.getByText('Donate')).toBeDisabled();
  });

  it('opens dialog when donate button is clicked', () => {
    render(<DonateButton artistAddress={mockArtistAddress} />);
    fireEvent.click(screen.getByText('Donate'));
    expect(screen.getByText('Donate to Artist')).toBeInTheDocument();
  });

  it('handles donation flow successfully', async () => {
    render(<DonateButton artistAddress={mockArtistAddress} onSuccess={mockOnSuccess} />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Donate'));
    
    // Enter amount
    fireEvent.change(screen.getByLabelText('Amount (cUSD)'), {
      target: { value: '10' },
    });
    
    // Click confirm
    fireEvent.click(screen.getByText('Confirm Donation'));
    
    await waitFor(() => {
      expect(mockContract.donate).toHaveBeenCalled();
      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles donation failure gracefully', async () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock contract failure
    mockContract.donate.mockRejectedValue(new Error('Transaction failed'));
    
    render(<DonateButton artistAddress={mockArtistAddress} onSuccess={mockOnSuccess} />);
    
    // Open dialog and submit
    fireEvent.click(screen.getByText('Donate'));
    fireEvent.change(screen.getByLabelText('Amount (cUSD)'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByText('Confirm Donation'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Donation')).not.toBeDisabled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
}); 