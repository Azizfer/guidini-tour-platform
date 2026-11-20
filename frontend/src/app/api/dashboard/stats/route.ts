import { NextResponse } from 'next/server'
import { db } from '../../../../lib/mongodb'

export async function GET() {
  try {
    const database = await db
    
    // Get counts from collections
    const usersCount = await database.collection('users').countDocuments()
    const guidesCount = await database.collection('users').countDocuments({ userType: 'guide' })
    const reservationsCount = await database.collection('reservations').countDocuments()
    
    // Get total revenue from guidestats
    const totalRevenue = await database.collection('guidestats').aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]).toArray()

    const stats = {
      usersTotal: usersCount,
      guidesActive: guidesCount,
      reservations: reservationsCount,
      revenue: totalRevenue[0]?.totalRevenue || 0
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
