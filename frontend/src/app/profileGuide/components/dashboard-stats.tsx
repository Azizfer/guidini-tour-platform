"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { useState, useEffect } from "react"

import {
  CalendarIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

// Ajouter la fonctionnalité de dialogue pour "Voir toutes les activités"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import notificationService, { Notification } from "@/services/notificationService"

interface Guide {
  toursCount?: number
  reservationsCount?: number
  rating?: number
  reviewCount?: number
  totalRevenue?: number
  touristsCount?: number
  paymentsReceived?: number
}

interface ProfileStatsProps {
  guide: Guide
}

export function DashboardStats({ guide }: ProfileStatsProps) {
  // State pour les statistiques locales
  const [stats, setStats] = useState({
    toursCount: guide.toursCount || 0,
    reservationsCount: guide.reservationsCount || 0,
    rating: guide.rating || 0,
    reviewCount: guide.reviewCount || 0,
    totalRevenue: guide.totalRevenue || 0,
    touristsCount: guide.touristsCount || 0
  });
  
  // State for recent activity data
  const [recentActivity, setRecentActivity] = useState<Array<{
    title: string;
    description: string;
    amount: string;
    date: string;
    icon: React.ReactNode;
    isIncome: boolean;
  }>>([]);
  
  // Écouteurs d'événements pour les mises à jour des compteurs
  useEffect(() => {
    // Fonction pour mettre à jour le compteur de tours actifs
    const handleTourAdded = (event: Event) => {
      console.log('Événement tourAdded reçu dans le dashboard');
      
      // Forcer la mise à jour du compteur
      setStats(prevStats => {
        const newCount = prevStats.toursCount + 1;
        console.log(`Mise à jour du compteur de tours: ${prevStats.toursCount} -> ${newCount}`);
        return {
          ...prevStats,
          toursCount: newCount
        };
      });
      
      // Ajouter également une nouvelle activité
      setRecentActivity(prev => [
        {
          title: "Nouveau tour créé",
          description: "Vous avez ajouté un nouveau tour",
          amount: "",
          date: "Aujourd'hui",
          icon: <CalendarIcon className="h-5 w-5 text-blue-500" />,
          isIncome: false,
        },
        ...prev.slice(0, 4) // Garder seulement les 5 activités les plus récentes
      ]);
    };
    
    // Fonction pour mettre à jour le compteur de réservations
    const handleReservationAdded = (event: Event) => {
      console.log('Événement reservationAdded reçu dans le dashboard');
      
      setStats(prevStats => {
        const newCount = prevStats.reservationsCount + 1;
        console.log(`Mise à jour du compteur de réservations: ${prevStats.reservationsCount} -> ${newCount}`);
        return {
          ...prevStats,
          reservationsCount: newCount
        };
      });
      
      // Ajouter également une nouvelle activité
      setRecentActivity(prev => [
        {
          title: "Nouvelle réservation",
          description: "Un touriste a réservé l'un de vos tours",
          amount: "+",
          date: "Aujourd'hui",
          icon: <UsersIcon className="h-5 w-5 text-green-500" />,
          isIncome: true,
        },
        ...prev.slice(0, 4) // Garder seulement les 5 activités les plus récentes
      ]);
    };
    
    // Fonction pour gérer la suppression d'un tour
    const handleTourDeleted = (event: Event) => {
      console.log('Événement tourDeleted reçu dans le dashboard');
      
      // Décrémenter le compteur de tours actifs
      setStats(prevStats => {
        const newCount = Math.max(0, prevStats.toursCount - 1); // Empêcher les valeurs négatives
        console.log(`Mise à jour du compteur de tours après suppression: ${prevStats.toursCount} -> ${newCount}`);
        return {
          ...prevStats,
          toursCount: newCount
        };
      });
      
      // Ajouter une activité pour la suppression
      setRecentActivity(prev => [
        {
          title: "Tour supprimé",
          description: "Vous avez supprimé un tour",
          amount: "",
          date: "Aujourd'hui",
          icon: <TrashIcon className="h-5 w-5 text-red-500" />,
          isIncome: false,
        },
        ...prev.slice(0, 4) // Garder seulement les 5 activités les plus récentes
      ]);
    };
    
    // Fonction pour rafraîchir le dashboard
    const handleRefreshDashboard = () => {
      console.log('Événement refreshDashboard reçu');
      // Mettre à jour manuellement les compteurs - vérifier le type d'événement
      const eventType = localStorage.getItem('lastDashboardEvent');
      
      if (eventType === 'tourAdded') {
        setStats(prevStats => ({
          ...prevStats,
          toursCount: prevStats.toursCount + 1
        }));
      } else if (eventType === 'tourDeleted') {
        setStats(prevStats => ({
          ...prevStats,
          toursCount: Math.max(0, prevStats.toursCount - 1)
        }));
      }
      
      // Effacer l'information après utilisation
      localStorage.removeItem('lastDashboardEvent');
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('tourAdded', handleTourAdded);
    window.addEventListener('tourDeleted', handleTourDeleted);
    window.addEventListener('reservationAdded', handleReservationAdded);
    window.addEventListener('refreshDashboard', handleRefreshDashboard);
    
    // Mise à jour initiale - incrémenter le compteur si des tours existent déjà
    if (guide.toursCount && guide.toursCount > 0) {
      console.log('Initialisation du compteur de tours avec:', guide.toursCount);
      setStats(prevStats => ({
        ...prevStats,
        toursCount: guide.toursCount || 0 // Utiliser 0 comme valeur par défaut si undefined
      }));
    }
    
    // Nettoyer les écouteurs d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('tourAdded', handleTourAdded);
      window.removeEventListener('tourDeleted', handleTourDeleted);
      window.removeEventListener('reservationAdded', handleReservationAdded);
      window.removeEventListener('refreshDashboard', handleRefreshDashboard);
    };
  }, [guide.toursCount]);
  
  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await notificationService.getUserNotifications();
        
        // Filter and transform notifications into activity items
        const activityItems = notifications
          .filter(notification => 
            notification.type === 'payment' || 
            notification.type === 'booking' || 
            notification.type === 'review'
          )
          .map(notification => {
            let icon;
            let isIncome = false;
            let amount = '';
            
            switch (notification.type) {
              case 'payment':
                icon = <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
                isIncome = true;
                amount = notification.amount ? `+${notification.amount.toFixed(2)}` : '';
                break;
              case 'booking':
                icon = <ClockIcon className="h-5 w-5 text-blue-500" />;
                isIncome = false;
                break;
              case 'review':
                icon = <StarIcon className="h-5 w-5 text-yellow-500" />;
                isIncome = false;
                break;
              default:
                icon = <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            }
            
            return {
              title: notification.title,
              description: notification.description,
              amount,
              date: notification.time,
              icon,
              isIncome
            };
          });
        
        // If no notifications, add a default message
        if (activityItems.length === 0) {
          activityItems.push({
            title: "Aucune activité récente",
            description: "Vous n'avez pas encore d'activité récente",
            amount: "",
            date: "Aujourd'hui",
            icon: <UsersIcon className="h-5 w-5 text-gray-500" />,
            isIncome: false,
          });
        }
        
        setRecentActivity(activityItems);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Set default activity if there's an error
        setRecentActivity([
          {
            title: "Erreur de chargement",
            description: "Impossible de charger les activités récentes",
            amount: "",
            date: "Aujourd'hui",
            icon: <UsersIcon className="h-5 w-5 text-gray-500" />,
            isIncome: false,
          }
        ]);
      }
    };
    
    fetchNotifications();
  }, []);

  // Ajouter un état pour contrôler l'ouverture du dialogue
  const [showAllActivities, setShowAllActivities] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tours Actifs"
          value={stats.toursCount.toString()}
          icon={<CalendarIcon className="h-5 w-5" />}
          change="+2 ce mois"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Réservations"
          value={stats.reservationsCount.toString()}
          icon={<UsersIcon className="h-5 w-5" />}
          change="+3 cette semaine"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Évaluation"
          value={stats.rating.toString()}
          icon={<StarIcon className="h-5 w-5" />}
          change={`${stats.reviewCount} avis`}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Touristes Guidés"
          value={(guide.touristsCount || 0).toString()}
          icon={<UsersIcon className="h-5 w-5" />}
          change="+12 ce mois"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Section */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">Revenus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total des revenus</p>
                <p className="text-3xl font-bold text-slate-900">{guide.totalRevenue || 0} TND</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Paiements reçus</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-semibold text-slate-900">{guide.paymentsReceived || 0}</p>
                  <span className="text-xs flex items-center text-green-600">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +15%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Revenu moyen / tour</p>
                <p className="text-xl font-semibold text-slate-900">
                  {Math.round((guide.totalRevenue || 0) / (guide.toursCount || 1))} TND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100">{activity.icon}</div>
                    <div>
                      <div className="font-medium text-slate-900">{activity.title}</div>
                      <div className="text-xs text-slate-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-slate-600">{activity.description}</div>
                    {activity.amount && (
                      <div className={`text-sm font-semibold ${activity.isIncome ? "text-green-600" : "text-red-600"}`}>
                        {activity.amount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Modifier le bouton "Voir toutes les activités" pour ouvrir le dialogue */}
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <Button
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => setShowAllActivities(true)}
              >
                Voir toutes les activités
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Ajouter le dialogue après la section des cartes */}
      <Dialog open={showAllActivities} onOpenChange={setShowAllActivities}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Toutes les activités récentes</DialogTitle>
            <DialogDescription className="text-slate-500">
              Historique complet de vos activités récentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-100">{activity.icon}</div>
                  <div>
                    <div className="font-medium text-slate-900">{activity.title}</div>
                    <div className="text-xs text-slate-500">{activity.date}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-slate-600">{activity.description}</div>
                  {activity.amount && (
                    <div className={`text-sm font-semibold ${activity.isIncome ? "text-green-600" : "text-red-600"}`}>
                      {activity.amount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change: string
  color: string
  bgColor: string
}

function StatCard({ title, value, icon, change, color, bgColor }: StatCardProps) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{change}</p>
      </CardContent>
    </Card>
  )
}

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
