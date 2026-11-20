const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const { body, validationResult } = require('express-validator');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Contact form validation
const validateContactForm = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

router.post('/send', validateContactForm, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await sendContactEmail(name, email, subject, message);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
