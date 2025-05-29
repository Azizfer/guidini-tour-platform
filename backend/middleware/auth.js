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
      return res.status(401).json({ message: 'Authentification requise. Aucun token fourni.' });
    }
    
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Récupérer l'ID utilisateur du token
      const userId = decoded._id || decoded.userId || decoded.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Token invalide. ID utilisateur manquant.' });
      }
      
      // Vérifier que l'utilisateur existe dans la base de données
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé. Veuillez vous reconnecter.' });
      }
      
      // Ajouter les informations de l'utilisateur à la requête
      req.user = user;
      next();
    } catch (jwtError) {
      // Gestion des erreurs JWT
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};