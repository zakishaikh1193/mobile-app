import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

console.log('React version in ContentLibraryContext:', React.version);

// Create a simple in-memory content store
const initialContent = [
  { id: 1, title: 'Letter A Activities', type: 'Literacy', status: 'Published', downloads: 1234 },
  { id: 2, title: 'Family Tree Builder', type: 'Family', status: 'Published', downloads: 987 },
];

// Create context with a more reliable approach
const ContentLibraryContext = createContext({
  contentLibrary: initialContent,
  setContentLibrary: () => console.warn('setContentLibrary not initialized')
});

if (process.env.NODE_ENV !== 'production') {
  ContentLibraryContext.displayName = 'ContentLibraryContext';
}

// Create a simple provider component
const ContentLibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('ContentLibraryProvider rendering...');
  
  const [contentLibrary, setContentLibrary] = useState(initialContent);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    contentLibrary,
    setContentLibrary: (action: any) => {
      console.log('Updating content library with action:', action);
      setContentLibrary(prev => {
        const nextValue = typeof action === 'function' ? action(prev) : action;
        console.log('Content library updated:', { previous: prev, next: nextValue });
        return nextValue;
      });
    }
  }), [contentLibrary]);

  return (
    <ContentLibraryContext.Provider value={contextValue}>
      {children}
    </ContentLibraryContext.Provider>
  );
}

// Custom hook with additional debugging
const useContentLibrary = () => {
  console.log('useContentLibrary called');
  
  // Try to get the context value
  const context = useContext(ContentLibraryContext);
  
  // Log detailed debug information
  console.log('Context value in useContentLibrary:', {
    context,
    hasValue: !!context,
    isContext: ContentLibraryContext.$$typeof === Symbol.for('react.context'),
    reactVersion: React.version
  });

  // Throw error if context is not available
  if (!context) {
    const error = new Error('useContentLibrary must be used within a ContentLibraryProvider');
    console.error('Context error:', error);
    console.error('Available context:', ContentLibraryContext);
    throw error;
  }

  return context;
};

// Add a debug component to help track context usage
const ContentLibraryDebug: React.FC = () => {
  const context = useContentLibrary();
  
  return (
    <div style={{ display: 'none' }}>
      <pre>ContentLibrary Context: {JSON.stringify(context, null, 2)}</pre>
    </div>
  );
};

// Export all necessary components
export { 
  ContentLibraryContext, 
  ContentLibraryProvider, 
  useContentLibrary, 
  ContentLibraryDebug 
};