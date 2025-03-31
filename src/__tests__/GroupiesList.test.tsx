import { render, screen } from '@testing-library/react';
import { GroupiesList } from '../components/GroupiesList';
import { useDonations } from '../hooks/useDonations';

// Mock the useDonations hook
jest.mock('../hooks/useDonations');

describe('GroupiesList', () => {
  const mockArtistAddress = '0x1234567890123456789012345678901234567890';
  const mockDonations = [
    {
      id: '1',
      donor_address: '0x1111',
      artist_address: mockArtistAddress,
      amount: '10',
      token_address: '0x3333',
      transaction_hash: '0xabc1',
      block_number: 123,
      timestamp: '2024-03-28T12:00:00Z',
    },
    {
      id: '2',
      donor_address: '0x1111',
      artist_address: mockArtistAddress,
      amount: '20',
      token_address: '0x3333',
      transaction_hash: '0xabc2',
      block_number: 124,
      timestamp: '2024-03-28T12:01:00Z',
    },
    {
      id: '3',
      donor_address: '0x2222',
      artist_address: mockArtistAddress,
      amount: '15',
      token_address: '0x3333',
      transaction_hash: '0xabc3',
      block_number: 125,
      timestamp: '2024-03-28T12:02:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    (useDonations as jest.Mock).mockReturnValue({
      donations: [],
      loading: true,
    });

    render(<GroupiesList artistAddress={mockArtistAddress} />);
    expect(screen.getByText('Groupies')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('shows empty state when no donations', () => {
    (useDonations as jest.Mock).mockReturnValue({
      donations: [],
      loading: false,
    });

    render(<GroupiesList artistAddress={mockArtistAddress} />);
    expect(screen.getByText('No groupies yet')).toBeInTheDocument();
  });

  it('shows list of unique donors with total amounts', () => {
    (useDonations as jest.Mock).mockReturnValue({
      donations: mockDonations,
      loading: false,
    });

    render(<GroupiesList artistAddress={mockArtistAddress} />);
    
    // Check title shows correct count
    expect(screen.getByText('Groupies (2)')).toBeInTheDocument();
    
    // Check donor addresses are displayed
    expect(screen.getByText('0x1111...1111')).toBeInTheDocument();
    expect(screen.getByText('0x2222...2222')).toBeInTheDocument();
    
    // Check total amounts
    expect(screen.getByText('Total Donated: 30 cUSD')).toBeInTheDocument();
    expect(screen.getByText('Total Donated: 15 cUSD')).toBeInTheDocument();
  });

  it('calls useDonations with correct parameters', () => {
    (useDonations as jest.Mock).mockReturnValue({
      donations: [],
      loading: false,
    });

    render(<GroupiesList artistAddress={mockArtistAddress} />);
    
    expect(useDonations).toHaveBeenCalledWith(mockArtistAddress, 'artist');
  });
}); 