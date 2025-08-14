import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Create a simple in-memory content store
const initialContent = [
  { id: 1, title: 'Letter A Activities', type: 'Literacy', status: 'Published', downloads: 1234 },
  { id: 2, title: 'Family Tree Builder', type: 'Family', status: 'Published', downloads: 987 },
];

interface ContentLibraryContextType {
  contentLibrary: typeof initialContent;
  setContentLibrary: (action: typeof initialContent | ((prev: typeof initialContent) => typeof initialContent)) => void;
}

const ContentLibraryContext = createContext<ContentLibraryContextType | undefined>(undefined);

export const useContentLibrary = () => {
  const context = useContext(ContentLibraryContext);
  if (context === undefined) {
    throw new Error('useContentLibrary must be used within a ContentLibraryProvider');
  }
  return context;
};

export const ContentLibraryProvider = ({ children }: { children: ReactNode }) => {
  console.log('ContentLibraryProvider rendering...');
  
  // Use direct initialization instead of lazy initialization
  const [contentLibrary, setContentLibrary] = useState(initialContent);

  // Add a useEffect to ensure React is fully initialized
  useEffect(() => {
    console.log('ContentLibraryProvider mounted successfully');
  }, []);

  const contextValue = {
    contentLibrary,
    setContentLibrary: (action: typeof initialContent | ((prev: typeof initialContent) => typeof initialContent)) => {
      setContentLibrary(prev => {
        const nextValue = typeof action === 'function' ? action(prev) : action;
        return nextValue;
      });
    }
  };

  return (
    <ContentLibraryContext.Provider value={contextValue}>
      {children}
    </ContentLibraryContext.Provider>
  );
};

// Debug component
export const ContentLibraryDebug = () => {
  const context = useContentLibrary();
  
  return (
    <div style={{ display: 'none' }}>
      <pre>ContentLibrary Context: {JSON.stringify(context, null, 2)}</pre>
    </div>
  );
};