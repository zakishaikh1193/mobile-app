import React from 'react';

// Check for React version conflicts
export const checkReactVersions = () => {
  const reactVersion = React.version;
  const reactDomVersion = (React as any)?.version;
  
  console.log('React version:', reactVersion);
  console.log('ReactDOM version:', reactDomVersion);
  
  if (reactVersion !== reactDomVersion) {
    console.warn('React and ReactDOM versions do not match!', {
      react: reactVersion,
      reactDom: reactDomVersion
    });
  }
  
  return { reactVersion, reactDomVersion };
};

// Check if React is properly initialized
export const isReactReady = () => {
  try {
    return typeof React !== 'undefined' && 
           typeof React.useState === 'function' &&
           typeof React.useEffect === 'function';
  } catch (error) {
    console.error('React not ready:', error);
    return false;
  }
};
