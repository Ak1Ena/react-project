import { useContext } from 'react';
import { UIContext } from './UIContextDef';
import type { UIContextType } from './UIContextDef';

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
