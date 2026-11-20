const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification pour vérifier les tokens JWT
 */
module.exports = async (req, res, next) => {
  
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    // Vérifier si le token existe
    if (!token) {
      console.log('❌ AUTH: Aucun token fourni dans la requête');
      return res.status(401).json({ message: 'Authentification requise. Aucun token fourni.' });
    }
    
    try {
      // Vérifier le token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret);
      
      // Récupérer l'ID utilisateur du token
      const userId = decoded._id || decoded.userId || decoded.id;
      
      if (!userId) {
        console.log('❌ AUTH: Token valide mais ID utilisateur manquant');
        return res.status(401).json({ message: 'Token invalide. ID utilisateur manquant.' });
      }
      
      // Vérifier que l'utilisateur existe dans la base de données
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`❌ AUTH: Utilisateur non trouvé pour l'ID: ${userId}`);
        return res.status(401).json({ message: 'Utilisateur non trouvé. Veuillez vous reconnecter.' });
      }
      
      // Authentification réussie - no logging
      
      // Ajouter les informations de l'utilisateur à la requête
      req.user = user;
      next();
    } catch (jwtError) {
      // Gestion des erreurs JWT
      console.log('❌ AUTH: Erreur de vérification JWT:', jwtError.message);
      return res.status(401).json({ message: 'Token invalide ou expiré', error: jwtError.message });
    }
  } catch (error) {
    console.error('❌ AUTH: Erreur serveur lors de l\'authentification:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};