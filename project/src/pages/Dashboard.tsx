import React, { useState } from 'react';
import Gallery from '../components/Gallery';
import DigitalPainting from '../components/DigitalPainting';
import { lineArtData } from '../data/lineArt';
import { LineArt, SavedArtwork } from '../types/lineArt';

const sampleSavedArtworks: SavedArtwork[] = [];

const Dashboard: React.FC = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>(sampleSavedArtworks);
  const [selectedArtwork, setSelectedArtwork] = useState<LineArt | null>(null);

  const handleToggleGallery = () => setIsGalleryOpen((open) => !open);
  const handleSelectArtwork = (art: LineArt) => {
    setSelectedArtwork(art);
    setIsGalleryOpen(false);
  };
  const handleSelectSaved = (art: LineArt) => {
    setSelectedArtwork(art);
    setIsGalleryOpen(false);
  };
  const handlePaintingComplete = (score: number) => {
    if (selectedArtwork) {
      setSavedArtworks(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          originalId: selectedArtwork.id,
          title: selectedArtwork.title,
          category: selectedArtwork.category,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setSelectedArtwork(null);
    setIsGalleryOpen(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Sidebar
        isGalleryOpen={isGalleryOpen}
        onToggleGallery={handleToggleGallery}
        savedArtworks={savedArtworks}
        onSelectSaved={handleSelectSaved}
      />
      <main className="flex-1 overflow-y-auto">
        {isGalleryOpen ? (
          <Gallery artworks={lineArtData} onSelectArtwork={handleSelectArtwork} />
        ) : selectedArtwork ? (
          <div className="p-8">
            <DigitalPainting
              lineArt={selectedArtwork}
              onComplete={handlePaintingComplete}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">Select an artwork to begin painting!</div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 