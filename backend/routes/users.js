const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Route pour récupérer tous les guides
router.get('/guides', async (req, res) => {
  try {
    // Rechercher tous les utilisateurs de type "guide"
    const guides = await User.find({ userType: 'guide' })
      .select('-password') // Exclure le mot de passe
      .sort({ createdAt: -1 }); // Trier par date de création (plus récent d'abord)
    
    res.json(guides);
  } catch (error) {
    console.error('Erreur lors de la récupération des guides:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des guides' });
  }
});

// Route pour récupérer un guide par son ID
router.get('/guides/:id', async (req, res) => {
  try {
    const guide = await User.findOne({ 
      _id: req.params.id,
      userType: 'guide'
    }).select('-password');
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide non trouvé' });
    }
    
    res.json(guide);
  } catch (error) {
    console.error(`Erreur lors de la récupération du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération du guide' });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Route pour mettre à jour le profil d'un guide
router.put('/guides/:id', async (req, res) => {
  try {
    console.log(`Mise à jour du guide ${req.params.id}`);
    console.log('Données reçues:', req.body);
    
    // Pour le développement, nous ne vérifions pas l'authentification
    // En production, il faudrait vérifier si l'utilisateur est autorisé à modifier ce profil
    
    // Champs autorisés à être mis à jour
    const allowedUpdates = {
      name: req.body.name,
      email: req.body.email,
      description: req.body.description, // Vient de bio dans le frontend
      expertise: req.body.expertise, // Domaines d'expertise du guide
      website: req.body.website,
      location: req.body.location
    };

    console.log('Champs autorisés:', allowedUpdates);

    // Filtrer les champs non définis
    const updates = Object.entries(allowedUpdates)
      .filter(([_, value]) => value !== undefined)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    console.log('Mises à jour à appliquer:', updates);

    // Mettre à jour le profil
    const updatedGuide = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedGuide) {
      console.log('Guide non trouvé');
      return res.status(404).json({ error: 'Guide non trouvé' });
    }

    console.log('Guide mis à jour avec succès:', updatedGuide);
    res.json(updatedGuide);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du guide' });
  }
});

module.exports = router;
