import React, { createContext, useContext, useState, useEffect } from 'react';

export type ContentItem = {
  id: number;
  title: string;
  type: string;
  description?: string;
  status: string;
  downloads: number;
  file?: string | null;
  thumbnail?: string | null;
};

const initialContent: ContentItem[] = [
  { id: 1, title: 'Letter A Activities', type: 'Literacy', description: '', status: 'Published', downloads: 1234, thumbnail: null },
  { id: 2, title: 'Family Tree Builder', type: 'Family', description: '', status: 'Published', downloads: 987, thumbnail: null },
  { id: 3, title: 'Emotion Matching Game', type: 'Emotions', description: '', status: 'Draft', downloads: 0, thumbnail: null },
  { id: 4, title: 'Body Parts Song', type: 'Body', description: '', status: 'Published', downloads: 756, thumbnail: null }
];

const LOCAL_STORAGE_KEY = 'contentLibrary';

const ContentLibraryContext = createContext<{
  contentLibrary: ContentItem[];
  setContentLibrary: React.Dispatch<React.SetStateAction<ContentItem[]>>;
}>({
  contentLibrary: initialContent,
  setContentLibrary: () => {},
});

export const ContentLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentLibrary, setContentLibrary] = useState<ContentItem[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialContent;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contentLibrary));
  }, [contentLibrary]);

  return (
    <ContentLibraryContext.Provider value={{ contentLibrary, setContentLibrary }}>
      {children}
    </ContentLibraryContext.Provider>
  );
};

export const useContentLibrary = () => useContext(ContentLibraryContext); 