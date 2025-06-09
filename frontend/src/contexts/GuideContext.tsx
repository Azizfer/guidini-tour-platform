import { createContext, useContext, ReactNode } from 'react';
import { Guide, Tour } from '@/types';

interface GuideContextType {
  guide: {
    id: string;
    name: string;
    activeTours: Tour[];
    completedTours: Tour[];
    // other guide properties
  };
}

const GuideContext = createContext<GuideContextType | null>(null);

export const GuideProvider = ({ 
  children, 
  guide 
}: { 
  children: ReactNode; 
  guide: GuideContextType['guide'] 
}) => (
  <GuideContext.Provider value={{ guide }}>
    {children}
  </GuideContext.Provider>
);

export const useGuide = (): GuideContextType['guide'] => {
  const context = useContext(GuideContext);
  
  if (!context) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('GuideContext used outside provider');
    }
    
    return {
      id: '',
      name: '',
      activeTours: [],
      completedTours: [],
      // other default guide properties
    };
  }
  
  return context.guide;
};
