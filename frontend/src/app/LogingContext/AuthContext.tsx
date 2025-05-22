"use client"
import { createContext, useContext, useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

import axios from "axios"

// Définir les types pour le contexte d'authentification
interface User {
  id?: string
  _id?: string // MongoDB ID format
  username?: string
  name?: string // Added to match backend response
  firstName?: string
  lastName?: string
  email?: string
  token?: string
  profileImage?: string
  userType?: string
  phoneNumber?: string
  preferences?: any
}

// Définir le type pour la réponse API
interface ApiResponse {
  token: string
  user: User
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User | null>
  register: (userData: any) => Promise<User | null>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Helper function to consistently handle user authentication
  const handleUserAuthentication = async (authData: { token: string; user: User }) => {
    const { token, user } = authData
    console.log("Données utilisateur après authentification:", user)

    // Sauvegarder les informations d'authentification de façon sécurisée
    try {
      if (token) localStorage.setItem("token", token)
      
      // S'assurer que l'utilisateur est un objet valide avant de le sérialiser
      if (user && typeof user === 'object') {
        const userString = JSON.stringify(user)
        localStorage.setItem("user", userString)
        
        // Ajouter l'ID utilisateur pour le composant Profile-popover
        if (user._id) {
          localStorage.setItem("userId", user._id)
        } else if (user.id) {
          localStorage.setItem("userId", user.id)
        }
      } else {
        console.error("Erreur: Données utilisateur invalides", user)
      }
    } catch (storageError) {
      console.error("Erreur lors de l'enregistrement des données utilisateur:", storageError)
    }

    // Configurer axios pour les futures requêtes
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Mettre à jour l'état
    setUser(user)

    // Déclencher l'événement pour mettre à jour le Header
    window.dispatchEvent(new Event("authStateChanged"))
    
    // Déclencher l'événement userLoggedIn avec toutes les informations nécessaires
    // pour le ProfilePopover
    window.dispatchEvent(
      new CustomEvent("userLoggedIn", {
        detail: {
          _id: user._id || user.id,
          id: user.id || user._id,
          email: user.email,
          name: user.name || user.username || 'Utilisateur',
          username: user.username || user.name || 'user',
          userType: user.userType || 'touriste',
          profileImage: user.profileImage || '/placeholder.svg?height=200&width=200',
        },
      })
    )
    
    console.log("Événements déclenchés après authentification")

    return user
  }

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (storedUser && token) {
          try {
            // Configurer axios pour inclure le token dans les en-têtes
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
          } catch (parseError) {
            console.error("Erreur lors du parsing des données utilisateur:", parseError)
            // Réinitialiser les données corrompues
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Add listener for logoutRequested event from ProfilePopover
    const handleLogoutRequested = () => {
      window.dispatchEvent(new CustomEvent("openLogoutConfirmation"))
    }

    window.addEventListener("logoutRequested", handleLogoutRequested)

    return () => {
      window.removeEventListener("logoutRequested", handleLogoutRequested)
    }
  }, [])

  // Fonction de connexion avec l'API
  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Supprimer l'utilisateur local si déjà connecté
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      localStorage.removeItem("userId")

      console.log("Tentative de connexion via le backend API...")
      
      // Appel API direct pour la connexion
      const response = await axios.post<ApiResponse>(
        "http://localhost:5001/api/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Réponse de connexion reçue:", response.data)

      // Extraire les données de la réponse
      const { token, user } = response.data
      
      if (!token || !user) {
        throw new Error("La réponse du serveur ne contient pas de token ou d'informations utilisateur")
      }

      // S'assurer que l'utilisateur a toutes les propriétés nécessaires
      const completeUser = {
        ...user,
        _id: user._id || user.id,
        id: user.id || user._id,
        name: user.name || user.username || 'Utilisateur',
        username: user.username || user.name || 'user',
        email: user.email || 'user@example.com',
        profileImage: user.profileImage || '/placeholder.svg?height=200&width=200',
        userType: user.userType || 'touriste'
      }

      return await handleUserAuthentication({ token, user: completeUser })
    } catch (error: any) {
      // Message d'erreur simple pour l'utilisateur - le système d'alerte s'en chargera
      setError("Identifiants incorrects ou problème de connexion au serveur")
      
      // Retourner null au lieu de lancer une exception pour éviter que l'application ne plante
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction d'inscription
  const register = async (userData: any): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Données d'inscription reçues:", { ...userData, password: userData.password ? '***' : undefined })

      // Préparer les données pour l'API
      const formData = new FormData()

      // Ajouter tous les champs texte au FormData
      Object.keys(userData).forEach((key) => {
        if (key !== "profileImage" && key !== "idCard" && key !== "certificate" && key !== "documents") {
          if (Array.isArray(userData[key])) {
            // Pour les tableaux, on ajoute chaque élément individuellement
            userData[key].forEach((item: any) => {
              formData.append(key, item)
            })
          } else if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key])
          }
        }
      })

      // Ajout des fichiers
      if (userData.profileImage instanceof File) {
        formData.append("profileImage", userData.profileImage)
      }

      if (userData.idCard instanceof File) {
        formData.append("idCard", userData.idCard)
      }

      if (userData.certificate instanceof File) {
        formData.append("certificate", userData.certificate)
      }

      if (Array.isArray(userData.documents)) {
        userData.documents.forEach((doc: File) => {
          if (doc instanceof File) {
            formData.append("documents", doc)
          }
        })
      }

      console.log("Envoi des données d'inscription au format FormData")

      // Envoyer les données au backend MongoDB
      const response = await axios.post<ApiResponse>(
        "http://localhost:5001/api/auth/register",
        userData.profileImage instanceof File ? formData : userData,
        {
          headers: {
            "Content-Type": userData.profileImage instanceof File ? "multipart/form-data" : "application/json",
          },
        },
      )

      console.log("Réponse d'inscription reçue:", response.data)

      const { token, user } = response.data

      if (!token || !user) {
        throw new Error("La réponse du serveur ne contient pas de token ou d'informations utilisateur")
      }

      return await handleUserAuthentication({ token, user })
    } catch (err: any) {
      console.error("Erreur détaillée lors de l'inscription:", err)

      let errorMessage = "Erreur lors de l'inscription"

      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        console.error("Réponse d'erreur du serveur:", err.response.data)
        errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          `Erreur ${err.response.status}: ${err.response.statusText}`
      } else if (err.request) {
        // La requête a été envoyée mais pas de réponse reçue
        console.error("Aucune réponse reçue du serveur")
        errorMessage =
          "Aucune réponse du serveur. Vérifiez votre connexion réseau et que le backend est en cours d'exécution."
      } else {
        // Erreur lors de la configuration de la requête
        console.error("Erreur de requête:", err.message)
        errorMessage = err.message
      }

      // Définir l'erreur dans l'état pour l'afficher à l'utilisateur
      setError(errorMessage)
      
      // Retourner null au lieu de lancer une exception pour éviter que l'application ne plante
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("userId")

    // Supprimer le token des en-têtes axios
    delete axios.defaults.headers.common["Authorization"]

    // Réinitialiser l'état
    setUser(null)
    
    // Déclencher l'événement pour mettre à jour le Header
    window.dispatchEvent(new Event("authStateChanged"))
    
    // Rediriger vers la page d'accueil
    router.push("/")
    
    // Déclencher un événement spécifique pour la déconnexion
    window.dispatchEvent(new Event("userLoggedOut"))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
