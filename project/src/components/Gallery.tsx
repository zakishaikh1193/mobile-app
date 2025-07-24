import React from 'react';
import { LineArt } from '../types/lineArt';

interface GalleryProps {
  artworks?: LineArt[];
  onSelectArtwork: (artwork: LineArt) => void;
}

const Gallery: React.FC<GalleryProps> = ({ artworks = [], onSelectArtwork }) => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-purple-700">Happy Color!</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.isArray(artworks) && artworks.map((art) => (
          <button
            key={art.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col items-center cursor-pointer focus:ring-4 focus:ring-pink-300 outline-none"
            onClick={() => onSelectArtwork(art)}
            aria-label={`Select ${art.title}`}
          >
            <img src={art.referenceImage} alt={art.title} className="w-40 h-40 object-cover rounded-2xl mb-4" />
            <div className="font-bold text-lg text-purple-700 mb-1">{art.title}</div>
            <div className="text-sm text-gray-500 mb-2">{art.category} • <span className="capitalize">{art.difficulty}</span></div>
            <div className="flex gap-1 mb-2">
              {art.tags.map(tag => (
                <span key={tag} className="bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 text-xs font-semibold">#{tag}</span>
              ))}
            </div>
            {/* Optionally, show difficulty as stars or icons here if you want */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 