// src/components/ColoringGame.tsx

import React, { useState, useEffect } from 'react';
import Gallery from '../Gallery'; // Assuming this component exists
import DigitalPainting from '../DigitalPainting'; // Assuming this component exists
import { activityService, Activity } from '../../services/activityService';
// import { lineArtData } from '../../data/lineArt'; // REMOVED: We will fetch from the API now
import { LineArt } from '../../types/lineArt'; // We still need the type definition

// This adapter function is crucial. It converts the data structure from your API
// to the format that your Gallery and DigitalPainting components expect.
const adaptActivityToLineArt = (activity: Activity): LineArt => {
  return {
    id: activity.id.toString(), // The component probably expects a string ID
    title: activity.title,
    // The image_url from the API is the full, direct URL to the image file.
    // We'll use this URL for both the gallery preview and the painting canvas background.
    referenceImage: activity.image_url || '',
    svgContent: activity.image_url || '', // DigitalPainting will use this as the image source
    difficulty: activity.difficulty,
    category: activity.type.replace('_', ' '), // e.g., 'digital painting' -> 'digital painting'
    tags: [activity.type, activity.difficulty], // Use dynamic tags from the activity
  };
};

const ColoringGame: React.FC = () => {
  // 1. Initialize state with an empty array, not hardcoded data.
  const [artworks, setArtworks] = useState<LineArt[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<LineArt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColoringActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch activities from the backend. Your service correctly handles this.
        const coloringActivities = await activityService.getActivitiesByType('coloring');
        const paintingActivities = await activityService.getActivitiesByType('digital_painting');
        
        const allApiActivities = [...coloringActivities, ...paintingActivities];

        if (allApiActivities.length === 0) {
            console.warn("No 'coloring' or 'digital_painting' activities found in the database.");
        }

        // 2. Adapt the fetched activities to the LineArt format required by your components.
        const adaptedArtworks = allApiActivities.map(adaptActivityToLineArt);

        // 3. Set the component's state to be ONLY the data from the API.
        setArtworks(adaptedArtworks);

      } catch (err) {
        console.error("Failed to fetch coloring activities:", err);
        setError("Could not load the coloring book. Please try again later.");
        // Fallback to an empty array on error.
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColoringActivities();
  }, []); // The empty array ensures this effect runs only once when the component mounts.

  const handleSelectArtwork = (artwork: LineArt) => {
    setSelectedArtwork(artwork);
  };

  const handleCompleteOrBack = () => {
    setSelectedArtwork(null); // This sends the user back to the gallery
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold text-purple-700 animate-pulse">Loading Coloring Book...</div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex justify-center items-center h-screen text-center">
        <div className="text-xl font-semibold text-red-600 bg-red-100 p-6 rounded-lg shadow-md">
            <p>Oops! Something went wrong.</p>
            <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // If an artwork is selected, show the painting canvas for it.
  if (selectedArtwork) {
    return (
      <DigitalPainting 
        lineArt={selectedArtwork}
        onComplete={handleCompleteOrBack} 
      />
    );
  }

  // If no artwork is selected, show the gallery.
  // We also handle the case where the gallery is empty.
  return (
    <>
      {artworks.length > 0 ? (
        <Gallery 
          artworks={artworks} 
          onSelectArtwork={handleSelectArtwork} 
        />
      ) : (
        <div className="flex justify-center items-center h-screen text-center">
            <div className="text-xl font-semibold text-gray-500">
                <p>No coloring pages available right now.</p>
                <p>Please check back later!</p>
            </div>
        </div>
      )}
    </>
  );
};

export default ColoringGame;