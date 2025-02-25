import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ArtistListing from './pages/ArtistListing';
import Gallery from './pages/Gallery';
import Groupies from './pages/Groupies';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#E5D9C9] dark:bg-neutral-900 text-[#14213D] dark:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/artist-listing" element={<ArtistListing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/groupies" element={<Groupies />} />
            <Route path="/" element={<Landing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;