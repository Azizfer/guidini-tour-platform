"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const handleSave = () => {
    // Dans une vraie application, cela enregistrerait les données dans l'API
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="profile">
          <TabsList className="bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-md">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
            >
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
            >
              Compte
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
            >
              Confidentialité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  Informations du profil
                </CardTitle>
                <CardDescription>Met à jour les informations de ton profil visibles par les touristes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  className="flex flex-col items-center space-y-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white/80 shadow-lg">
                      <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-500 text-white">
                        {guide.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-teal-600">{guide.name}</h3>
                    <p className="text-sm text-gray-500">{guide.email}</p>
                  </div>
                </motion.div>

                <div className="grid gap-4">
                  <motion.div variants={itemVariants} className="grid grid-cols-1 gap-2">
                    <Label htmlFor="name">Nom Complet</Label>
                    <Input
                      id="name"
                      value={guide.name}
                      onChange={(e) => setGuide({ ...guide, name: e.target.value })}
                      className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants} className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guide.email}
                        onChange={(e) => setGuide({ ...guide, email: e.target.value })}
                        className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants} className="grid gap-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <Input
                        id="phone"
                        value={guide.phone}
                        onChange={(e) => setGuide({ ...guide, phone: e.target.value })}
                        className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                      />
                    </motion.div>
                  </div>

                  <motion.div variants={itemVariants} className="grid gap-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Select value={guide.location} onValueChange={(value) => setGuide({ ...guide, location: value })}>
                      <SelectTrigger id="location" className="bg-white/50 border-white/20">
                        <SelectValue placeholder="Sélectionnez votre ville" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-sm border-white/20">
                        <SelectItem value="Sousse">Sousse</SelectItem>
                        <SelectItem value="Monastir">Monastir</SelectItem>
                        <SelectItem value="Tunis">Tunis</SelectItem>
                        <SelectItem value="Hammamet">Hammamet</SelectItem>
                        <SelectItem value="Djerba">Djerba</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid gap-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={guide.bio}
                      onChange={(e) => setGuide({ ...guide, bio: e.target.value })}
                      className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid gap-2">
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
                          className={
                            guide.languages.includes(language)
                              ? "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                              : "border-teal-200 hover:bg-teal-50 text-teal-600"
                          }
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid gap-2">
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
                            className={
                              guide.specialties.includes(specialty)
                                ? "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                                : "border-teal-200 hover:bg-teal-50 text-teal-600"
                            }
                          >
                            {specialty}
                          </Button>
                        ),
                      )}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="ml-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleSave}
                >
                  {isSuccess ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Enregistré
                    </motion.div>
                  ) : (
                    <motion.div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </motion.div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-6">
            <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  Paramètres du compte
                </CardTitle>
                <CardDescription>Gérer les paramètres de ton compte et ton mot de passe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={itemVariants} className="grid gap-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="grid gap-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  Mettre à jour le mot de passe
                </Button>
              </CardFooter>
            </Card>

            <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-red-500">Zone de danger</CardTitle>
                <CardDescription>Supprimer définitivement ton compte et toutes tes données</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Une fois que tu as supprimé ton compte, il n'y a pas de retour en arrière. Sois certain avant de
                  continuer.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" className="hover:bg-red-600 transition-colors duration-300">
                  Supprimer le compte
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  Paramètres des notifications
                </CardTitle>
                <CardDescription>Choisir comment tu veux être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-teal-600">
                      Notifications par email
                    </Label>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-teal-600">
                      Notifications push
                    </Label>
                    <p className="text-sm text-gray-500">Recevoir des notifications sur ton appareil</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications" className="text-teal-600">
                      Notifications SMS
                    </Label>
                    <p className="text-sm text-gray-500">Recevoir des notifications par SMS</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button
                  className="ml-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleSave}
                >
                  {isSuccess ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Enregistré
                    </motion.div>
                  ) : (
                    <motion.div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </motion.div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  Paramètres de confidentialité
                </CardTitle>
                <CardDescription>Contrôler les informations visibles par les touristes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-teal-500" />
                      <Label htmlFor="show-phone" className="text-teal-600">
                        Afficher le numéro de téléphone
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">Permettre aux touristes de voir ton numéro de téléphone</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-500" />
                      <Label htmlFor="show-email" className="text-teal-600">
                        Afficher l'email
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">Permettre aux touristes de voir ton adresse email</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      <Label htmlFor="public-profile" className="text-teal-600">
                        Profil public
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">Rendre ton profil visible à tous les utilisateurs</p>
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
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-blue-500"
                  />
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button
                  className="ml-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleSave}
                >
                  {isSuccess ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Enregistré
                    </motion.div>
                  ) : (
                    <motion.div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </motion.div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
