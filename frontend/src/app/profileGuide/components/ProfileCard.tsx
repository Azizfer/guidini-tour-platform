"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Calendar, MessageSquare, Users, Star } from "lucide-react"

interface Guide {
  name: string
  email: string
  avatar: string
  location: string
  bio: string
  rating: number
  reviewCount: number
  toursCount: number
  reservationsCount: number
  unreadNotifications: number
  unreadMessages: number
}

interface ProfileCardProps {
  guide: Guide
}

export default function ProfileCard({ guide }: ProfileCardProps) {
    return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={guide.avatar} alt={guide.name} />
            <AvatarFallback>{guide.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{guide.name}</CardTitle>
            <CardDescription>{guide.location}</CardDescription>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="ml-1 text-sm">
                {guide.rating} ({guide.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{guide.bio}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{guide.toursCount} Tours</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{guide.reservationsCount} Reservations</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span>{guide.unreadNotifications} Notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>{guide.unreadMessages} Messages</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}