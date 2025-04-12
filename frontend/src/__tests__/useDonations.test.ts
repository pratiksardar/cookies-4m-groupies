import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useDonations } from '../hooks/useDonations';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-react');

describe('useDonations', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockDonations = [
    {
      id: '1',
      donor_address: '0x1111',
      artist_address: '0x2222',
      amount: '10',
      token_address: '0x3333',
      transaction_hash: '0xabc1',
      block_number: 123,
      timestamp: '2024-03-28T12:00:00Z',
    },
    {
      id: '2',
      donor_address: '0x1111',
      artist_address: '0x2222',
      amount: '20',
      token_address: '0x3333',
      transaction_hash: '0xabc2',
      block_number: 124,
      timestamp: '2024-03-28T12:01:00Z',
    },
  ];

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('returns empty array and loading false when no address provided', async () => {
    const { result } = renderHook(() => useDonations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.donations).toEqual([]);
    });
  });

  it('fetches donations for donor address', async () => {
    mockSupabase.order.mockResolvedValue({ data: mockDonations, error: null });

    const { result } = renderHook(() => useDonations(mockAddress, 'donor'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.donations).toEqual(mockDonations);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('donations');
    expect(mockSupabase.eq).toHaveBeenCalledWith('donor_address', mockAddress.toLowerCase());
  });

  it('fetches donations for artist address', async () => {
    mockSupabase.order.mockResolvedValue({ data: mockDonations, error: null });

    const { result } = renderHook(() => useDonations(mockAddress, 'artist'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.donations).toEqual(mockDonations);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('donations');
    expect(mockSupabase.eq).toHaveBeenCalledWith('artist_address', mockAddress.toLowerCase());
  });

  it('handles error when fetching donations', async () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockSupabase.order.mockResolvedValue({ 
      data: null, 
      error: new Error('Failed to fetch') 
    });

    const { result } = renderHook(() => useDonations(mockAddress));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.donations).toEqual([]);
    });

    consoleSpy.mockRestore();
  });

  it('updates donations when address changes', async () => {
    const newAddress = '0x9876543210987654321098765432109876543210';
    
    mockSupabase.order.mockResolvedValueOnce({ 
      data: mockDonations, 
      error: null 
    }).mockResolvedValueOnce({ 
      data: [mockDonations[0]], 
      error: null 
    });

    const { result, rerender } = renderHook(
      ({ address }) => useDonations(address), 
      { initialProps: { address: mockAddress } }
    );

    await waitFor(() => {
      expect(result.current.donations).toEqual(mockDonations);
    });

    rerender({ address: newAddress });

    await waitFor(() => {
      expect(result.current.donations).toEqual([mockDonations[0]]);
    });
  });
}); 