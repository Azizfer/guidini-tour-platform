// middleware/admin.js
// Middleware to ensure the authenticated user has admin privileges
// Assumes that `auth` middleware has already populated `req.user`
module.exports = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé. Privilèges administrateur requis.' });
    }
    next();
  } catch (error) {
    console.error('Erreur dans le middleware admin:', error);
    return res.status(500).json({ message: 'Erreur serveur dans le middleware admin.' });
  }
};
