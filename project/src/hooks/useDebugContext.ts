import * as React from 'react';

/**
 * This is a debug hook to help identify React context issues.
 * It will log when the component mounts and unmounts, and any context value changes.
 */
export function useDebugContext<T>(context: React.Context<T | null>, contextName: string) {
  const contextValue = React.useContext(context);
  const componentId = React.useRef(Math.random().toString(36).substring(2, 9));
  
  React.useEffect(() => {
    console.log(`[${contextName}] Component mounted with context:`, {
      componentId: componentId.current,
      contextValue,
      contextType: typeof context,
      contextDisplayName: (context as any).displayName || 'No display name',
      contextConsumer: (context as any)._currentValue ? 'Has value' : 'No value',
      reactVersion: React.version,
      isReactContext: typeof context === 'object' && context !== null && 
        '_context' in context && 
        context._context !== undefined
    });

    return () => {
      console.log(`[${contextName}] Component unmounted`, { componentId: componentId.current });
    };
  }, [context, contextName, contextValue]);

  return contextValue;
}
