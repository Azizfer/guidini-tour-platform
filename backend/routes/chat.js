const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Tour = require('../models/Tour');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Cache tours for 5 minutes to reduce database calls
let toursCache = {
  data: '',
  timestamp: 0
};

const getAvailableTours = async () => {
  // Return cached data if still valid
  if (Date.now() - toursCache.timestamp < 300000 && toursCache.data) {
    return toursCache.data;
  }

  try {
    const tours = await Tour.find({ isPublic: true })
      .select('title location duration price')
      .limit(5)
      .lean();

    if (!tours || tours.length === 0) return "";

    let toursInfo = "\nVoici quelques activités disponibles:\n";
    tours.forEach((tour, index) => {
      toursInfo += `${index + 1}. "${tour.title}" - ${tour.location} - ${tour.duration} - ${tour.price} TND\n`;
    });

    // Update cache
    toursCache = {
      data: toursInfo,
      timestamp: Date.now()
    };

    return toursInfo;
  } catch (error) {
    console.error('Error fetching tours:', error);
    return "";
  }
};

const getSystemPrompt = async () => {
  const toursInfo = await getAvailableTours();
  return `You are Guidini's virtual assistant for tourism in Tunisia. Provide concise, helpful answers about:
- Tunisian tourism destinations
- Local culture and traditions
- Tunisian cuisine
- Guidini platform services
${toursInfo}`;
};

// Validate Gemini response
const validateGeminiResponse = (response) => {
  try {
    // Log the response structure for debugging
    console.log('Gemini response structure:', JSON.stringify(response, null, 2));
    
    // Handle different response formats based on Gemini version
    if (!response) {
      throw new Error('Invalid Gemini response: response is null or undefined');
    }
    
    // For Gemini 2.5
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        if (text && typeof text === 'string') {
          return text;
        }
      }
    }
    
    // For older Gemini versions
    if (response.response && typeof response.response.text === 'function') {
      const text = response.response.text();
      if (text && typeof text === 'string') {
        return text;
      }
    }
    
    // Try other possible response formats
    if (response.text && typeof response.text === 'string') {
      return response.text;
    }
    
    if (response.content && response.content.parts && response.content.parts.length > 0) {
      const text = response.content.parts[0].text;
      if (text && typeof text === 'string') {
        return text;
      }
    }
    
    throw new Error('Could not extract text from Gemini response');
  } catch (error) {
    console.error('Error validating Gemini response:', error);
    throw new Error(`Failed to process Gemini response: ${error.message}`);
  }
};

// Error handling middleware
const handleChatbotError = (error, req, res) => {
  console.error('Chatbot error:', error);

  const defaultResponse = {
    response: "Our chat service is currently unavailable. Please try again later.",
    error: "SERVICE_UNAVAILABLE"
  };

  // Rate limiting
  if (error.message.includes('429') || error.message.includes('quota')) {
    return res.status(429).json({
      response: "Our chat is experiencing high demand. Please try again shortly.",
      error: "RATE_LIMITED"
    });
  }

  // Authentication errors
  if (error.message.includes('401') || error.message.includes('API_KEY')) {
    return res.status(503).json({
      response: "Chat service is undergoing maintenance. Please check back later.",
      error: "SERVICE_DOWN"
    });
  }

  return res.status(500).json(defaultResponse);
};

// Chatbot endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        response: 'Please provide a valid message'
      });
    }

    // Check API availability
    if (!genAI) {
      return res.status(503).json({
        response: "Chat service is currently unavailable.",
        error: "SERVICE_DOWN"
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-0417",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    });

    const systemPrompt = await getSystemPrompt();
    const chat = model.startChat({
      history: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }],
    });

    // Pour Gemini 2.5, la méthode d'envoi de messages est différente
    console.log('Sending message to Gemini 2.5:', message);
    
    // Essayer d'abord avec la nouvelle méthode pour Gemini 2.5
    let result;
    try {
      result = await model.generateContent(message);
      console.log('Generated content with Gemini 2.5');
    } catch (genError) {
      console.log('Error with generateContent, trying chat method:', genError.message);
      // Fallback à l'ancienne méthode
      result = await chat.sendMessage(message);
    }
    
    const responseText = validateGeminiResponse(result);

    return res.json({ 
      response: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleChatbotError(error, req, res);
  }
});

module.exports = router;