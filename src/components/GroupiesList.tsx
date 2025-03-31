import { useDonations } from '../hooks/useDonations';
import { Box, Typography, List, ListItem, ListItemText, Skeleton } from '@mui/material';
import { ethers } from 'ethers';

interface GroupiesListProps {
  artistAddress: string;
}

export const GroupiesList = ({ artistAddress }: GroupiesListProps) => {
  const { donations, loading } = useDonations(artistAddress, 'artist');

  // Get unique donors
  const uniqueDonors = [...new Set(donations.map(d => d.donor_address))];

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Groupies
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} />
        ))}
      </Box>
    );
  }

  if (uniqueDonors.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Groupies
        </Typography>
        <Typography color="text.secondary">
          No groupies yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Groupies ({uniqueDonors.length})
      </Typography>
      <List>
        {uniqueDonors.map((donor) => {
          const donorDonations = donations.filter(d => d.donor_address === donor);
          const totalAmount = donorDonations.reduce(
            (sum, d) => sum + parseFloat(d.amount),
            0
          );

          return (
            <ListItem key={donor} divider>
              <ListItemText
                primary={`${donor.slice(0, 6)}...${donor.slice(-4)}`}
                secondary={`Total Donated: ${totalAmount} cUSD`}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}; 