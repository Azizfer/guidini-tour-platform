import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function GET() {
  try {
    const dbInstance = await db;
    
    const reservationsCollection = dbInstance.collection('reservations');
    
    const reservations = await reservationsCollection.find({}).toArray();
    
    // First, create a map of guide IDs to their names
    const guidesCollection = dbInstance.collection('guides');
    const guideIds = reservations.map(r => r.guideId).filter(id => id);
    const guides = await guidesCollection.find({ _id: { $in: guideIds } }).toArray();
    const guideMap = new Map(guides.map(g => [g._id.toString(), g.name]));

    // Get unique tour IDs and fetch their names and times
    const toursCollection = dbInstance.collection('tours');
    const tourIds = reservations.map(r => r.tourId).filter(id => id);
    const tours = await toursCollection.find({ _id: { $in: tourIds } }).toArray();
    const tourMap = new Map(tours.map(t => [t._id.toString(), {
      name: t.name,
      time: t.time,
      duration: t.duration,
      date: t.date
    }]));

    return NextResponse.json({
      reservations: reservations.map(reservation => {
        const tour = tourMap.get(reservation.tourId?.toString());
        return {
          ...reservation,
          touristName: reservation.touristName || 'Unknown Tourist',
          touristEmail: reservation.touristEmail || 'Unknown Email',
          touristProfileImage: reservation.touristProfileImage || '/placeholder.svg',
          guideId: reservation.guideId,
          guideName: guideMap.get(reservation.guideId?.toString()) || 'Unknown Guide',
          tourName: tour?.name || reservation.tourName || 'Unknown Tour',
          tourTime: tour?.time || 'Unknown Time',
          tourDuration: tour?.duration || 'Unknown Duration',
          date: tour?.date || new Date(reservation.date).toLocaleDateString('fr-FR'),
          time: tour?.time || reservation.time,
          participants: reservation.participants || 0,
          totalPrice: reservation.totalPrice || 0,
          status: reservation.status || 'Unknown',
          paymentStatus: reservation.paymentStatus || 'Unknown',
          createdAt: reservation.createdAt?.toISOString() || new Date().toISOString()
        };
      })
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement des réservations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
