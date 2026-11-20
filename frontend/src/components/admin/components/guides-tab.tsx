"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Eye, CheckCircle, XCircle, Clock, FileText, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Guide } from "@/types/guide"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface GuidesTabProps {
  onNewCount?: (count: number) => void
}

export default function GuidesTab({ onNewCount }: GuidesTabProps) {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [guides, setGuides] = useState<Guide[]>([])

  const fetchGuides = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/guides`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      const data = await response.json()
      setGuides(data)
      if (typeof window !== 'undefined' && onNewCount) {
        const lastVisited = parseInt(localStorage.getItem('admin_guides_lastVisited') || '0')
        const newPending = data.filter((g: any) => g.verificationStatus === 'pending' && new Date(g.createdAt || g.updatedAt || Date.now()).getTime() > lastVisited).length
        onNewCount(newPending)
      }
    } catch (error) {
      console.error('Error fetching guides:', error)
      toast.error('Erreur lors du chargement des guides')
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  const getStatusBadge = (verificationStatus: string) => {
    switch (verificationStatus) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vérifié</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejeté</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const handleApprove = async (guideId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      await fetch(`${BACKEND_URL}/api/admin/guides/${guideId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast.success('Guide approuvé avec succès')
      fetchGuides()
    } catch (error) {
      console.error('Error approving guide:', error)
      toast.error('Erreur lors de l\'approbation du guide')
    }
  }

  const handleReject = async (guideId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      await fetch(`${BACKEND_URL}/api/admin/guides/${guideId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast.success('Guide rejeté avec succès')
      fetchGuides()
    } catch (error) {
      console.error('Error rejecting guide:', error)
      toast.error('Erreur lors du rejet du guide')
    }
  }

  const filteredGuides = guides.filter((guide) => {
    const matchesFilter = filter === "all" || guide.verificationStatus === filter
    const matchesSearch =
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getIdCardUrl = (g: Guide) => g.documents?.idCard || g.idCard || '';
  const getCertificateUrl = (g: Guide) => g.documents?.certificate || g.certificate || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Guides</h2>
          <p className="text-gray-600 mt-1">Gérez les candidatures et les guides actifs</p>
        </div>

      </div>

      {/* Filters */}
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
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-semibold">Tous les statuts</SelectItem>
                <SelectItem value="pending" className="font-semibold">En attente</SelectItem>
                <SelectItem value="verified" className="font-semibold">Vérifiés</SelectItem>
                <SelectItem value="rejected" className="font-semibold">Rejetés</SelectItem>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold text-gray-900">{guides.filter((g) => g.verificationStatus === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vérifiés</p>
                <p className="text-xl font-bold text-gray-900">{guides.filter((g) => g.verificationStatus === "verified").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejetés</p>
                <p className="text-xl font-bold text-gray-900">{guides.filter((g) => g.verificationStatus === "rejected").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Guides List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Liste des Guides</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredGuides.map((guide) => (
              <div
                key={guide._id}
                className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={guide.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {guide.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{guide.name}</h3>
                        <p className="text-sm text-gray-600">{guide.email}</p>
                        <div className="text-sm text-gray-500">
                          {guide.yearsOfExperience} ans d'expérience
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {guide.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill.charAt(0).toUpperCase() + skill.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">{getStatusBadge(guide.verificationStatus)}</div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {/* View Documents Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1 px-4">
                            <FileText className="h-3 w-3" />
                            Documents
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Documents de {guide.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                  <h4 className="font-medium">Carte d'identité</h4>
                                  {getIdCardUrl(guide) ? (
                                    <a
                                      href={getIdCardUrl(guide)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block mt-2"
                                    >
                                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                                        <Eye className="h-3 w-3 mr-1" /> Voir
                                      </Button>
                                    </a>
                                  ) : (
                                    <Button variant="outline" disabled size="sm" className="mt-2 w-full opacity-50 cursor-not-allowed">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Non fourni
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                  <h4 className="font-medium">Certificat</h4>
                                  {getCertificateUrl(guide) ? (
                                    <a
                                      href={getCertificateUrl(guide)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block mt-2"
                                    >
                                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                                        <Eye className="h-3 w-3 mr-1" /> Voir
                                      </Button>
                                    </a>
                                  ) : (
                                    <Button variant="outline" disabled size="sm" className="mt-2 w-full opacity-50 cursor-not-allowed">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Non fourni
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {guide.verificationStatus === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(guide._id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(guide._id)}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
