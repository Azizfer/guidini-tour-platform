const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Tour = require('../models/Tour');
const GuideStats = require('../models/GuideStats');

// Get all reservations for a guide
exports.getGuideReservations = async (req, res) => {
  try {
    const guideId = req.params.guideId;
    
    // Validate that the guide exists
    const guide = await User.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide non trouvé' });
    }
    
    // Get all reservations for this guide
    const reservations = await Reservation.find({ guideId })
      .sort({ createdAt: -1 })
      .populate('tourId', 'name description')
      .populate('touristId', 'name email');
    
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching guide reservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
  }
};

// Create a new reservation for a guide
exports.createReservation = async (req, res) => {
  try {
    const guideId = req.params.guideId;
    const { 
      tourId, 
      tourName,
      touristId, 
      touristName, 
      touristEmail, 
      touristPhone, 
      date, 
      time, 
      participants, 
      totalPrice,
      status,
      paymentRef
    } = req.body;
    
    // Validate required fields
    if (!tourId || !tourName || !touristName || !date || !totalPrice) {
      return res.status(400).json({ 
        message: 'Données de réservation incomplètes',
        required: ['tourId', 'tourName', 'touristName', 'date', 'totalPrice'] 
      });
    }
    
    // Create the reservation
    const newReservation = new Reservation({
      tourId,
      tourName,
      guideId,
      touristId: touristId || req.user.id, // Use authenticated user ID as fallback
      touristName,
      touristEmail,
      touristPhone,
      date,
      time,
      participants: participants || 1,
      totalPrice,
      status: status || 'pending',
      paymentRef
    });
    
    // Save the reservation
    const savedReservation = await newReservation.save();
    
    // Update guide stats - increment tourists count
    try {
      // Find or create stats for this guide
      let stats = await GuideStats.findOne({ guideId });
      if (!stats) {
        stats = new GuideStats({ guideId });
      }
      
      // Increment tourists count based on participants
      const participantsNumber = participants || 1;
      stats.touristsCount += participantsNumber;
      
      // Also increment revenue if totalPrice is available
      if (totalPrice) {
        stats.totalRevenue += totalPrice;
      }
      
      // Save the updated stats
      await stats.save();
    } catch (statsError) {
      console.error('Error updating guide stats:', statsError);
      // Continue even if stats update fails - don't block the reservation creation
    }
    
    res.status(201).json(savedReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation', error: error.message });
  }
};

// Update reservation status
exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Statut de réservation invalide' });
    }
    
    // Find and update the reservation
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la réservation', error: error.message });
  }
};

// Get all reservations for a tourist
exports.getTouristReservations = async (req, res) => {
  try {
    const touristId = req.user.id; // Use authenticated user ID
    
    // Get all reservations for this tourist
    const reservations = await Reservation.find({ touristId })
      .sort({ createdAt: -1 })
      .populate('tourId', 'name description')
      .populate('guideId', 'name email profileImage');
    
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching tourist reservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: error.message });
  }
};

// Get a single reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const reservation = await Reservation.findById(reservationId)
      .populate('tourId', 'name description')
      .populate('guideId', 'name email profileImage')
      .populate('touristId', 'name email');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la réservation', error: error.message });
  }
};

// Check if tourist participated in a specific tour (by reservation)
exports.checkParticipation = async (req, res) => {
  try {
    const { tourId, touristId } = req.query;

    if (!tourId || !touristId) {
      return res.status(400).json({ message: 'tourId et touristId sont requis' });
    }

    // Find a reservation matching tour & tourist where status is confirmed or completed
    const reservation = await Reservation.findOne({
      tourId,
      touristId,
      status: { $in: ['confirmed', 'completed'] },
    });

    return res.status(200).json({ participated: !!reservation });
  } catch (error) {
    console.error('Error checking participation:', error);
    return res.status(500).json({ message: 'Erreur lors de la vérification de participation', error: error.message });
  }
};
