"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LoadingScreen from "@/components/loading-screen"
import ProfileHeader from "@/components/Profile/components/profile-header"
import GuideProfileContent from "@/components/Profile/components/guide-profile-content"
import TouristProfileContent from "@/components/Profile/components/tourist-profile-content"
import type { Tour } from '@/services/profileService';
import { getUserProfile, checkBackendHealth, getGuideTourStats, getGuideTours } from "@/services/profileService"
import { GuideProvider } from '@/contexts/GuideContext';

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { user } = useAuth()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [backendError, setBackendError] = useState(false)
  const [activeTours, setActiveTours] = useState<Tour[]>([])
  const [completedTours, setCompletedTours] = useState<Tour[]>([])

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const isBackendUp = await checkBackendHealth();
        if (!isBackendUp) {
          setBackendError(true)
          return;
        }

        const profileData = await getUserProfile(userId);
        console.log('Fetched profile data:', {
          id: profileData.id, 
          hasId: !!profileData.id
        });
        
        if (!profileData.id) {
          console.error('Profile data missing id field');
          profileData.id = userId; // Fallback to userId
        }
        
        if (profileData.userType === 'guide') {
          const stats = await getGuideTourStats(userId);
          
          // Only fetch completed tours for réalisés
          const completedToursData = await getGuideTours(userId, 'completed');
          
          // Only fetch active tours for proposés
          const activeToursData = await getGuideTours(userId, 'active');
          
          setProfile({ ...profileData, stats });
          setActiveTours(activeToursData);
          setCompletedTours(completedToursData);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setBackendError(true)
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileData()
  }, [userId])

  useEffect(() => {
    console.log('Full profile data:', profile);
  }, [profile]);

  if (loading) {
    return <LoadingScreen />
  }

  if (backendError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Backend Server Unavailable
            </h2>
            <p className="text-gray-600">
              We couldn't connect to the server. Please try again later.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-sm text-red-500 mt-4">
                Development Note: Make sure your backend server is running on port 5001
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
            <p className="text-gray-600">Ce profil n'existe pas ou a été supprimé.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 mt-20">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={() => setIsFollowing(!isFollowing)}
        />

        {profile.userType === "guide" ? (
          <GuideProvider guide={{
            id: profile.id,
            name: profile.name || '',
            activeTours: activeTours,
            completedTours: completedTours
          }}>
            <GuideProfileContent currentUserId={user?.id} />
          </GuideProvider>
        ) : (
          <TouristProfileContent profile={profile} />
        )}
      </main>

      <Footer />
    </div>
  )
}