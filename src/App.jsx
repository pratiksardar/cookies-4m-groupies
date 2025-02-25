import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ArtistListing from './pages/ArtistListing';
import Gallery from './pages/Gallery';
import Groupies from './pages/Groupies';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/artist-listing" element={<ArtistListing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/groupies" element={<Groupies />} />
            <Route path="/" element={<Gallery />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;