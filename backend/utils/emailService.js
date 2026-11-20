const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const OTP = require('../models/OTP');

// Set SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP for a user
 * @param {string} email - User's email
 * @param {string} purpose - Purpose of OTP (registration, password-reset)
 * @returns {Promise<string>} Generated OTP
 */
const storeOTP = async (email, purpose) => {
  const otp = generateOTP();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
  try {
    // Rechercher un OTP existant pour cet email et ce but
    const existingOTP = await OTP.findOne({ email, purpose });
    
    if (existingOTP) {
      // Mettre à jour l'OTP existant
      existingOTP.otp = otp;
      existingOTP.expiryTime = expiryTime;
      existingOTP.createdAt = new Date();
      await existingOTP.save();
      console.log(`OTP mis à jour pour ${email} (${purpose})`);
    } else {
      // Créer un nouvel OTP
      await OTP.create({
        email,
        purpose,
        otp,
        expiryTime
      });
      console.log(`Nouvel OTP créé pour ${email} (${purpose})`);
    }
    
    console.log(`Code généré pour ${email} (${purpose})`);
    return otp;
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for a user
 * @param {string} email - User's email
 * @param {string} purpose - Purpose of OTP (registration, password-reset)
 * @param {string} otp - OTP to verify
 * @returns {Promise<boolean>} Whether OTP is valid
 */
const verifyOTP = async (email, purpose, otp) => {
  console.log(`Verifying OTP for ${email} (${purpose})`);
  
  try {
    // Rechercher l'OTP dans la base de données
    const storedOTP = await OTP.findOne({ email, purpose });
    
    if (!storedOTP) {
      console.log('No OTP found for this email and purpose');
      return false;
    }
    
    console.log('Vérification du code OTP en cours...');
    
    // Vérifier si l'OTP a expiré
    if (Date.now() > storedOTP.expiryTime) {
      console.log('OTP expired, deleting it');
      await OTP.deleteOne({ _id: storedOTP._id });
      return false;
    }
    
    // Convertir les deux en chaînes pour la comparaison et éviter les problèmes de type
    const storedOtpStr = String(storedOTP.otp).trim();
    const receivedOtpStr = String(otp).trim();
    
    // Comparaison des codes OTP sans afficher les valeurs
    
    if (storedOtpStr === receivedOtpStr) {
      console.log('OTP verified successfully, deleting it');
      await OTP.deleteOne({ _id: storedOTP._id });
      return true;
    }
    
    console.log('OTP verification failed - codes do not match');
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

/**
 * Send verification email for account creation
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise} SendGrid response
 */
const sendVerificationEmail = async (email, name) => {
  const otp = await storeOTP(email, 'registration');
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@guidini.com',
    subject: 'Vérifiez votre compte Guidini',
    text: `Bonjour ${name},\n\nVotre code de vérification est: ${otp}\n\nCe code expirera dans 10 minutes.\n\nL'équipe Guidini`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #008080; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Guidini</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur Guidini. Pour finaliser votre inscription, veuillez saisir le code de vérification suivant :</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #008080; padding: 15px; border: 1px dashed #ccc; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe Guidini</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} Guidini. Tous droits réservés.</p>
        </div>
      </div>
    `
  };
  
  try {
    return await sgMail.send(msg);
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email via SendGrid:', error);
    if (error.response) {
      console.error('Détails de l\'erreur SendGrid:', error.response.body);
    }
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @returns {Promise} SendGrid response
 */
const sendPasswordResetEmail = async (email) => {
  const otp = await storeOTP(email, 'password-reset');
  
  // Afficher le code dans la console pour faciliter le développement
  console.log('====================================================');
  console.log(`CODE DE RÉINITIALISATION POUR ${email}: ${otp}`);
  console.log('Ce code expirera dans 10 minutes');
  console.log('====================================================');
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@guidini.com',
    subject: 'Réinitialisation de votre mot de passe Guidini',
    text: `Bonjour,\n\nVotre code de réinitialisation de mot de passe est: ${otp}\n\nCe code expirera dans 10 minutes.\n\nL'équipe Guidini`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #008080; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Guidini</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Bonjour,</p>
          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Veuillez saisir le code suivant pour continuer :</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #008080; padding: 15px; border: 1px dashed #ccc; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe Guidini</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} Guidini. Tous droits réservés.</p>
        </div>
      </div>
    `
  };
  
  try {
    return await sgMail.send(msg);
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email via SendGrid:', error);
    if (error.response) {
      console.error('Détails de l\'erreur SendGrid:', error.response.body);
    }
    // Même en cas d'erreur, on continue car le code est affiché dans la console
    return { id: 'email-error-but-otp-generated' };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyOTP
};
