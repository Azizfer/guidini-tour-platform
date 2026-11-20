import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Make sure the URL is valid before using it
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid API URL:', url);
    return false;
  }
};

// Validate and construct the API URL
const API_URL = isValidUrl(API_BASE_URL) 
  ? `${API_BASE_URL}/api`
  : 'http://localhost:5001/api';

export interface GuideStats {
  guideId: string;
  activeTours: number;
  privateTours: number;
  completedTours: number;
  totalRevenue: number;
  touristsCount: number;
  paymentsReceived: number;
  rating: number;
  reviewCount: number;
  lastUpdated?: Date;
}

const defaultStats: GuideStats = {
  guideId: '',
  activeTours: 0,
  privateTours: 0,
  completedTours: 0,
  totalRevenue: 0,
  touristsCount: 0,
  paymentsReceived: 0,
  rating: 0,
  reviewCount: 0
};

/**
 * Fetch statistics for a specific guide
 */
export const getGuideStats = async (guideId: string): Promise<GuideStats> => {
  try {
    console.log('DEBUG: Fetching guide stats for guide:', guideId);
    console.log('DEBUG: API URL:', `${API_URL}/guides/${guideId}/stats`);
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Aucun token trouvé');
      return { ...defaultStats, guideId };
    }
    
    const response = await axios.get<GuideStats>(`${API_URL}/guides/${guideId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du guide:', error);
    
    // If the API fails, try to calculate stats from local data
    return calculateStatsLocally(guideId);
  }
};

/**
 * Update specific statistics for a guide
 */
export const updateGuideStats = async (
  guideId: string, 
  updates: Partial<GuideStats>
): Promise<GuideStats | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Authentification requise');
      return null;
    }
    
    const response = await axios.patch<GuideStats>(
      `${API_URL}/guides/${guideId}/stats`, 
      updates,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    
    // If the API fails, update stats locally
    const currentStats = await getGuideStats(guideId);
    const updatedStats = { ...currentStats, ...updates };
    localStorage.setItem(`guideStats_${guideId}`, JSON.stringify(updatedStats));
    
    return updatedStats;
  }
};

/**
 * Increment a specific statistic for a guide
 */
export const incrementStat = async (
  guideId: string,
  statName: keyof GuideStats,
  amount: number = 1
): Promise<GuideStats | null> => {
  try {
    const currentStats = await getGuideStats(guideId);
    
    // Only proceed if the stat is a number
    if (typeof currentStats[statName] === 'number') {
      const updates = {
        [statName]: (currentStats[statName] as number) + amount
      };
      
      return updateGuideStats(guideId, updates);
    }
    
    return currentStats;
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation de ${statName}:`, error);
    return null;
  }
};

/**
 * Decrement a specific statistic for a guide
 */
export const decrementStat = async (
  guideId: string,
  statName: keyof GuideStats,
  amount: number = 1
): Promise<GuideStats | null> => {
  return incrementStat(guideId, statName, -amount);
};

/**
 * Update tour count statistics when a tour status changes
 */
export const updateTourStatusStats = async (
  guideId: string,
  oldStatus: 'active' | 'private' | 'completed' | null,
  newStatus: 'active' | 'private' | 'completed' | 'deleted'
): Promise<GuideStats | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Authentification requise');
      return null;
    }
    
    // Use the dedicated endpoint for updating tour status stats
    const response = await axios.put<GuideStats>(
      `${API_URL}/guides/${guideId}/stats/tour-status`,
      { oldStatus, newStatus },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Tour status stats updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques de statut de tour:', error);
    
    // Fallback to local calculation if API fails
    try {
      // Get current stats
      const currentStats = await getGuideStats(guideId);
      const updates: Partial<GuideStats> = {};
      
      // Decrement old status count if it exists
      if (oldStatus) {
        // Use type-safe approach to update the correct field
        if (oldStatus === 'active') {
          updates.activeTours = Math.max(0, currentStats.activeTours - 1);
        } else if (oldStatus === 'private') {
          updates.privateTours = Math.max(0, currentStats.privateTours - 1);
        } else if (oldStatus === 'completed') {
          updates.completedTours = Math.max(0, currentStats.completedTours - 1);
        }
      }
      
      // Increment new status count if it's not deleted
      if (newStatus !== 'deleted') {
        // Use type-safe approach to update the correct field
        if (newStatus === 'active') {
          updates.activeTours = currentStats.activeTours + 1;
        } else if (newStatus === 'private') {
          updates.privateTours = currentStats.privateTours + 1;
        } else if (newStatus === 'completed') {
          updates.completedTours = currentStats.completedTours + 1;
        }
      }
      
      console.log('Updating guide stats locally:', updates);
      return updateGuideStats(guideId, updates);
    } catch (fallbackError) {
      console.error('Fallback update also failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Calculate guide statistics from local tour data
 * This is a fallback when the API is not available
 */
const calculateStatsLocally = async (guideId: string): Promise<GuideStats> => {
  try {
    // Try to get stats from localStorage first
    const savedStats = localStorage.getItem(`guideStats_${guideId}`);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
    
    // If no saved stats, create default stats
    const stats: GuideStats = {
      ...defaultStats,
      guideId
    };
    
    // Try to import the tours service to calculate stats
    try {
      const { getToursByGuide } = await import('./toursService');
      const tours = await getToursByGuide(guideId);
      
      // Count tours by status
      stats.activeTours = tours.filter(t => t.tourStatus === 'active').length || 0;
      stats.privateTours = tours.filter(t => t.tourStatus === 'private').length || 0;
      stats.completedTours = tours.filter(t => t.tourStatus === 'completed' || t.isCompleted).length || 0;
      
      // Calculate average rating
      const toursWithRatings = tours.filter(t => t.rating && t.rating > 0);
      if (toursWithRatings.length > 0) {
        stats.rating = toursWithRatings.reduce((sum, t) => sum + (t.rating || 0), 0) / toursWithRatings.length;
        stats.reviewCount = toursWithRatings.length;
      }
      
      // Save to localStorage for future use
      localStorage.setItem(`guideStats_${guideId}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques locales:', error);
    }
    
    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return { ...defaultStats, guideId };
  }
};

/**
 * Hook for using guide statistics in React components
 */
export const useGuideStats = (guideId: string) => {
  const [stats, setStats] = useState<GuideStats>({ ...defaultStats, guideId });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch the latest stats from the API
  const refreshStats = async () => {
    if (!guideId) {
      console.warn('Cannot refresh stats: No guide ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching fresh stats for guide ${guideId}...`);
      const fetchedStats = await getGuideStats(guideId);
      console.log('Stats fetched successfully:', fetchedStats);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Error refreshing guide stats:', err);
      setError(`Erreur lors de la récupération des statistiques: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch on component mount and set up event listeners
  useEffect(() => {
    if (guideId) {
      // Initial fetch
      refreshStats();
      
      // Set up a refresh interval
      const intervalId = setInterval(() => {
        refreshStats();
      }, 60000); // Refresh every minute
      
      // Listen for notification events that might indicate new reservations
      const handleNotification = (event: Event) => {
        console.log('Notification event received, refreshing guide stats');
        refreshStats();
      };
      
      // Listen for reservation update events
      const handleReservationUpdate = (event: Event) => {
        console.log('Reservation update event received, refreshing guide stats');
        refreshStats();
      };
      
      // Add event listeners
      window.addEventListener('notificationUpdate', handleNotification);
      window.addEventListener('reservationUpdate', handleReservationUpdate);
      
      // Clean up interval and event listeners on unmount
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('notificationUpdate', handleNotification);
        window.removeEventListener('reservationUpdate', handleReservationUpdate);
      };
    }
  }, [guideId]);
  
  return { stats, loading, error, refreshStats };
};

// Add missing import
import { useState, useEffect } from 'react';
