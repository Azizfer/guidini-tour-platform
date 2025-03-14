"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Check, MapPin, Phone, Save, User } from "lucide-react"

export default function GuideSettings() {
  // Données fictives pour le guide - dans une vraie application, cela viendrait de votre API
  const [guide, setGuide] = useState({
    name: "Ahmed Ben Salah",
    email: "ahmed@guidini.com",
    phone: "+216 12 345 678",
    location: "Sousse",
    bio: "Guide touristique professionnel avec 5 ans d'expérience en mettant en valeur la beauté de la Tunisie",
    languages: ["Anglais", "Arabe", "Français"],
    specialties: ["Histoire", "Culture", "Plages"],
    avatar: "/placeholder.svg?height=100&width=100",
    coverImage: "/placeholder.svg?height=300&width=900",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showPhone: false,
      showEmail: false,
      publicProfile: true,
    },
  })

  const [isSuccess, setIsSuccess] = useState(false)

  const handleSave = () => {
    // Dans une vraie application, cela enregistrerait les données dans l'API
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>Met à jour les informations de ton profil visibles par les touristes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={guide.avatar} alt={guide.name} />
                    <AvatarFallback>{guide.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{guide.name}</h3>
                  <p className="text-sm text-muted-foreground">{guide.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="name">Nom Complet</Label>
                  <Input id="name" value={guide.name} onChange={(e) => setGuide({ ...guide, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guide.email}
                      onChange={(e) => setGuide({ ...guide, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      value={guide.phone}
                      onChange={(e) => setGuide({ ...guide, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Select value={guide.location} onValueChange={(value) => setGuide({ ...guide, location: value })}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Sélectionnez votre ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sousse">Sousse</SelectItem>
                      <SelectItem value="Monastir">Monastir</SelectItem>
                      <SelectItem value="Tunis">Tunis</SelectItem>
                      <SelectItem value="Hammamet">Hammamet</SelectItem>
                      <SelectItem value="Djerba">Djerba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={guide.bio}
                    onChange={(e) => setGuide({ ...guide, bio: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Langues</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Anglais", "Arabe", "Français", "Allemand", "Espagnol", "Italien"].map((language) => (
                      <Button
                        key={language}
                        variant={guide.languages.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (guide.languages.includes(language)) {
                            setGuide({
                              ...guide,
                              languages: guide.languages.filter((l) => l !== language),
                            })
                          } else {
                            setGuide({
                              ...guide,
                              languages: [...guide.languages, language],
                            })
                          }
                        }}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Spécialités</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Histoire", "Culture", "Plages", "Cuisine", "Aventure", "Nature", "Photographie"].map(
                      (specialty) => (
                        <Button
                          key={specialty}
                          variant={guide.specialties.includes(specialty) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (guide.specialties.includes(specialty)) {
                              setGuide({
                                ...guide,
                                specialties: guide.specialties.filter((s) => s !== specialty),
                              })
                            } else {
                              setGuide({
                                ...guide,
                                specialties: [...guide.specialties, specialty],
                              })
                            }
                          }}
                        >
                          {specialty}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSave}>
                {isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistré
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>Gérer les paramètres de ton compte et ton mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Mettre à jour le mot de passe</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zone de danger</CardTitle>
              <CardDescription>Supprimer définitivement ton compte et toutes tes données</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Une fois que tu as supprimé ton compte, il n'y a pas de retour en arrière. Sois certain avant de continuer.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Supprimer le compte</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des notifications</CardTitle>
              <CardDescription>Choisir comment tu veux être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={guide.notifications.email}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      notifications: { ...guide.notifications, email: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications sur ton appareil</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={guide.notifications.push}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      notifications: { ...guide.notifications, push: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications par SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={guide.notifications.sms}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      notifications: { ...guide.notifications, sms: checked },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSave}>
                {isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistré
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de confidentialité</CardTitle>
              <CardDescription>Contrôler les informations visibles par les touristes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <Label htmlFor="show-phone">Afficher le numéro de téléphone</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Permettre aux touristes de voir ton numéro de téléphone</p>
                </div>
                <Switch
                  id="show-phone"
                  checked={guide.privacy.showPhone}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      privacy: { ...guide.privacy, showPhone: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <Label htmlFor="show-email">Afficher l'email</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Permettre aux touristes de voir ton adresse email</p>
                </div>
                <Switch
                  id="show-email"
                  checked={guide.privacy.showEmail}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      privacy: { ...guide.privacy, showEmail: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <Label htmlFor="public-profile">Profil public</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Rendre ton profil visible à tous les utilisateurs</p>
                </div>
                <Switch
                  id="public-profile"
                  checked={guide.privacy.publicProfile}
                  onCheckedChange={(checked) =>
                    setGuide({
                      ...guide,
                      privacy: { ...guide.privacy, publicProfile: checked },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSave}>
                {isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistré
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}