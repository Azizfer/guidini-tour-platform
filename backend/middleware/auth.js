const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification pour vérifier les tokens JWT
 */
module.exports = async (req, res, next) => {
  try {
    console.log('Middleware auth: URL demandée:', req.originalUrl);
    console.log('Middleware auth: Méthode:', req.method);
    
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    console.log('Middleware auth: Header Authorization:', authHeader || 'Non présent');
    
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    console.log('Middleware auth: Token extrait:', token ? 'Présent' : 'Non présent');
    
    // For development: create a default user if no token is provided
    if (!token) {
      console.log('Middleware auth: Creating default user for development');
      // Create a default user for development purposes
      req.user = {
        id: "682e10803651e668c119fbaf", // Aziz Ferchichi's ID
        _id: "682e10803651e668c119fbaf", // Also set _id for mongoose compatibility
        name: "Aziz Ferchichi",
        email: "aziz@example.com"
      };
      return next();
    }
    
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Middleware auth: Token décodé:', decoded);
      
      // Vérifier que l'utilisateur existe toujours dans la base de données
      const userId = decoded._id || decoded.userId;
      console.log('Middleware auth: ID utilisateur extrait du token:', userId);
      
      if (!userId) {
        console.error('Middleware auth: Aucun ID utilisateur trouvé dans le token');
        // For development: create a default user if userId is missing
        req.user = {
          id: "682e10803651e668c119fbaf", // Aziz Ferchichi's ID
          _id: "682e10803651e668c119fbaf", // Also set _id for mongoose compatibility
          name: "Aziz Ferchichi",
          email: "aziz@example.com"
        };
        return next();
      }
      
      const user = await User.findById(userId);
      console.log('Middleware auth: Utilisateur trouvé:', user ? 'Oui' : 'Non');
      
      if (!user) {
        // For development: create a default user if user not found
        req.user = {
          id: "682e10803651e668c119fbaf", // Aziz Ferchichi's ID
          _id: "682e10803651e668c119fbaf", // Also set _id for mongoose compatibility
          name: "Aziz Ferchichi",
          email: "aziz@example.com"
        };
        return next();
      }
      
      // Ajouter les informations de l'utilisateur à la requête
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Erreur de vérification JWT:', jwtError);
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Erreur d\'authentification générale:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};