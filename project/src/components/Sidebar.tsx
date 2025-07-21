import React, { useState } from 'react';
import { Home, Bookmark, Image, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { SavedArtwork, LineArt } from '../types/lineArt';

interface SidebarProps {
  isGalleryOpen: boolean;
  onToggleGallery: () => void;
  savedArtworks: SavedArtwork[];
  onSelectSaved: (artwork: LineArt) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isGalleryOpen,
  onToggleGallery,
  savedArtworks,
  onSelectSaved
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSavedSelect = (saved: SavedArtwork) => {
    const lineArt: LineArt = {
      id: saved.originalId,
      title: saved.title,
      category: saved.category,
      svgContent: '', // Would need to store this
      difficulty: 'easy',
      tags: [],
      referenceImage: '',
    };
    onSelectSaved(lineArt);
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white border-r-4 border-purple-200 shadow-2xl transition-all duration-300 flex flex-col h-full`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b-2 border-purple-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-purple-600">Menu</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-purple-100 hover:bg-purple-200 p-2 rounded-full transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-purple-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-3">
        {/* Gallery Toggle */}
        <button
          onClick={onToggleGallery}
          className={`w-full flex items-center space-x-3 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 ${
            isGalleryOpen 
              ? 'bg-purple-500 text-white' 
              : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
          }`}
          aria-label="Toggle gallery view"
        >
          <Home className="h-6 w-6" />
          {!isCollapsed && <span className="font-medium">Art Gallery</span>}
        </button>

        {/* Saved Artworks */}
        <div className={`${isCollapsed ? '' : 'space-y-2'}`}>
          <div className={`flex items-center space-x-3 p-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Bookmark className="h-5 w-5 text-purple-600" />
            {!isCollapsed && (
              <span className="font-medium text-purple-600">My Art ({savedArtworks.length})</span>
            )}
          </div>

          {!isCollapsed && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {savedArtworks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved artwork yet!</p>
                  <p className="text-xs">Complete drawings to see them here</p>
                </div>
              ) : (
                savedArtworks.slice(-5).reverse().map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => handleSavedSelect(artwork)}
                    className="w-full bg-gray-50 hover:bg-purple-50 p-3 rounded-xl text-left transition-colors duration-200"
                  >
                    <div className="font-medium text-sm text-gray-800 truncate">
                      {artwork.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(artwork.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Achievement Section */}
        <div className={`bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl ${isCollapsed ? 'p-2' : ''}`}>
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <Trophy className="h-6 w-6 text-yellow-600" />
            {!isCollapsed && (
              <div>
                <div className="font-bold text-yellow-700">Achievements</div>
                <div className="text-sm text-yellow-600">
                  {savedArtworks.length} artworks completed!
                </div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{savedArtworks.length >= 1 ? '🎨' : '🔒'}</span>
                <span className={`text-xs ${savedArtworks.length >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                  First Masterpiece
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{savedArtworks.length >= 5 ? '🌟' : '🔒'}</span>
                <span className={`text-xs ${savedArtworks.length >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                  Color Hero (5 artworks)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{savedArtworks.length >= 10 ? '🏆' : '🔒'}</span>
                <span className={`text-xs ${savedArtworks.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  Master Artist (10 artworks)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-purple-100">
          <div className="text-center text-xs text-gray-500">
            <p>🎨 Keep creating amazing art!</p>
            <p className="mt-1">Made with ❤️ for young artists</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 