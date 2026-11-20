"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Eye, Ban, CheckCircle, Users, UserCheck, UserX, Calendar, ShieldCheck, Crown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  name: string
  email: string
  userType: string
  profileImage?: string | null
  createdAt: string
  phone?: string
  status?: string
  isAdmin?: boolean
}

interface UsersTabProps {
  onNewCount?: (count: number) => void
}

export default function UsersTab({ onNewCount }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "guide":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Guide</Badge>
      case "tourist":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Touriste</Badge>
      case "admin":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Admin</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Touriste</Badge>
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${BACKEND_URL}/api/users`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        const data = await response.json()
        setUsers(data)
        setIsLoading(false)
        // compute new users since last visit
        if (typeof window !== 'undefined' && onNewCount) {
          const lastVisited = parseInt(localStorage.getItem('admin_users_lastVisited') || '0')
          const newCount = data.filter((u: any) => {
            const created = new Date(u.createdAt || u._id?.toString().substring(0,8))
            return created.getTime() > lastVisited
          }).length
          onNewCount(newCount)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setUsers([])
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const totalUsers = users.length
  const guidesCount = users.filter(u => u.userType === 'guide').length
  const touristsCount = users.filter(u => u.userType === 'tourist').length
  
  const adminsCount = users.filter(u => u.isAdmin).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600 mt-1">Gérez tous les utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48 font-semibold">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-semibold">Tous les utilisateurs</SelectItem>
                <SelectItem value="tourist" className="font-semibold">Touristes</SelectItem>
                <SelectItem value="guide" className="font-semibold">Guides</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Touristes</p>
                <p className="text-xl font-bold text-gray-900">{touristsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Guides</p>
                <p className="text-xl font-bold text-gray-900">{guidesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-xl font-bold text-gray-900">{adminsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : Array.isArray(users) ? (
              users.filter(u => {
                const matchesFilter = filter === 'all' || u.userType === filter
                const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
                return matchesFilter && matchesSearch
              }).map((user) => (
                <div
                  key={user._id}
                  className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {user.name
                          .split(" ")
                          .map((initial: string) => initial[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                            {/* Placeholder for reservations & total spent if available */}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">{getUserTypeBadge(user.isAdmin ? 'admin' : user.userType)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
