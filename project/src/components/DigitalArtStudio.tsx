import React, { useState } from 'react';
import Gallery from './Gallery';
import DigitalPainting from './DigitalPainting';
import { LineArt } from '../types/lineArt';
import { lineArtData } from '../data/lineArt';

const DigitalArtStudio: React.FC = () => {
  const [selectedArt, setSelectedArt] = useState<LineArt | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (art: LineArt) => {
    setSelectedArt(art);
    setCompleted(false);
  };

  const handleComplete = (score: number) => {
    setCompleted(true);
    // You can add logic to save the artwork, show a score, etc.
  };

  const handleBack = () => {
    setSelectedArt(null);
    setCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {!selectedArt ? (
        <Gallery artworks={lineArtData} onSelectArtwork={handleSelect} />
      ) : (
        <div className="p-6">
          <button
            className="mb-4 px-4 py-2 rounded-full bg-purple-200 text-purple-800 font-bold shadow hover:bg-purple-300"
            onClick={handleBack}
          >
             Back to Gallery
          </button>
          <DigitalPainting
            key={selectedArt.id}
            onComplete={handleComplete}
            lineArt={selectedArt}
          />
          {completed && (
            <div className="mt-8 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Great job!</div>
              <div className="text-lg text-gray-700">You finished your painting. Compare with the reference and try another!</div>
              <button
                className="mt-4 px-6 py-2 rounded-full bg-pink-400 text-white font-bold shadow hover:bg-pink-500"
                onClick={handleBack}
              >
                Back to Gallery
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DigitalArtStudio; 