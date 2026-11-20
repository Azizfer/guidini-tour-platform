import { NextResponse } from 'next/server'
import { db } from '@/lib/mongodb'

function buildTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 60) return `Il y a ${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays}j`
}

export async function GET() {
  try {
    const database = await db

    // Recent user sign-ups (last 5)
    const usersCursor = database
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
    const recentUsers = await usersCursor.toArray()

    // Recent reservations (last 5)
    const reservationsCursor = database
      .collection('reservations')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
    const recentReservations = await reservationsCursor.toArray()

    // Recent guide approvals (last 5 guides where verificationStatus became 'verified')
    const guidesCursor = database
      .collection('guides')
      .find({ verificationStatus: 'verified' })
      .sort({ updatedAt: -1 })
      .limit(5)
    const recentGuides = await guidesCursor.toArray()

    const activities: Array<{ user: string; action: string; time: string; status: 'success' | 'warning' | 'error' }> = []

    // Users sign-ups
    recentUsers.forEach((u) => {
      activities.push({
        user: u.name || u.username || 'Utilisateur',
        action: 'a rejoint la communauté Guidini',
        time: buildTimeAgo(u.createdAt ? new Date(u.createdAt) : new Date()),
        status: 'success',
      })
    })

    // Reservations
    recentReservations.forEach((r) => {
      activities.push({
        user: r.touristName || 'Utilisateur',
        action: `a réservé un tour à ${r.tourName || 'un lieu'}`,
        time: buildTimeAgo(r.createdAt ? new Date(r.createdAt) : new Date()),
        status: 'success',
      })
    })

    // Guide approvals
    recentGuides.forEach((g) => {
      activities.push({
        user: `Guide ${g.name || g.username || ''}`.trim(),
        action: 'a été approuvé comme guide',
        time: buildTimeAgo(g.updatedAt ? new Date(g.updatedAt) : new Date()),
        status: 'success',
      })
    })

    // Sort by time descending using rough parse of string (we can sort by date object rather than string)
    activities.sort((a, b) => (a.time < b.time ? 1 : -1))

    return NextResponse.json({ activities: activities.slice(0, 10) })
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json({ error: 'Failed to fetch recent activities' }, { status: 500 })
  }
}
