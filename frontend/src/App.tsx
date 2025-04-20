import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { WalletProvider } from './hooks/useWallet';
import ArtistListing from './pages/ArtistListing';
import Gallery from './pages/Gallery';
import Groupies from './pages/Groupies';
import Landing from './pages/Landing';
import StakePage from './pages/Stake';

function App() {
  return (
    <WalletProvider>
      <ThemeProvider defaultTheme="light">
    <Router>
      <div className="min-h-screen bg-[#E5D9C9] dark:bg-neutral-900 text-[#14213D] dark:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/artist-listing" element={<ArtistListing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/groupies" element={<Groupies />} />
            <Route path="/stake" element={<StakePage />} />
            <Route path="/" element={<Landing />} />
          </Routes>
        </main>
      </div>
    </Router>
      </ThemeProvider>
    </WalletProvider>
  );
}

export default App;