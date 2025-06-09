const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');

// Initialize Gemini API with improved error handling
if (process.env.GEMINI_API_KEY) {
  try {
    console.log('Gemini API key is configured');
    
    // Create the Gemini client with error handling
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error.message);
    // Continue without Gemini functionality
  }
} else {
  console.warn('Gemini API key not configured - chat AI features disabled');
}

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
    // Get active tours with more details
    const activeTours = await Tour.find({ tourStatus: 'active' })
      .select('title location duration price date time category maxParticipants bookings')
      .sort({ date: 1 }) // Sort by nearest date first
      .limit(8)
      .lean();

    if (!activeTours || activeTours.length === 0) return "Actuellement, il n'y a pas de tours actifs disponibles.";

    let toursInfo = "\nVoici les tours actifs disponibles:\n";
    activeTours.forEach((tour, index) => {
      // Calculate available spots
      const availableSpots = tour.maxParticipants - tour.bookings;
      const spotsInfo = availableSpots > 0 ? `${availableSpots} places disponibles` : "Complet";
      
      toursInfo += `${index + 1}. "${tour.title}" - ${tour.location} - ${tour.duration}\n`;
      toursInfo += `   ${tour.date} à ${tour.time} - ${tour.price} TND - ${tour.category} - ${spotsInfo}\n`;
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

When users ask about available tours, active tours, or what activities they can join, always provide the current list of active tours from the information below. If they ask for specific types of tours (like adventure tours or cultural tours), filter the list mentally and only show relevant tours from the categories they're interested in.

If a user asks about booking a tour, tell them they can click on the tour details on the Activities page and use the reservation button there.

${toursInfo}`;
};

// Validate and extract text from Gemini 1.5 Pro response
const validateGeminiResponse = (response) => {
  try {
    // Handle null or undefined response
    if (!response) {
      throw new Error('Invalid Gemini response: response is null or undefined');
    }
    
    // Handle Gemini 1.5 Pro response format (primary format)
    if (response.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        if (text && typeof text === 'string') {
          return text;
        }
      }
    }
    
    // Handle chat response format
    if (response.response) {
      // Handle function response
      if (typeof response.response.text === 'function') {
        const text = response.response.text();
        if (text && typeof text === 'string') {
          return text;
        }
      }
      
      // Handle direct text property
      if (typeof response.response.text === 'string') {
        return response.response.text;
      }
      
      // Handle parts array
      if (response.response.parts && Array.isArray(response.response.parts)) {
        const text = response.response.parts.map(part => part.text).join('');
        if (text) {
          return text;
        }
      }
    }
    
    // Handle direct text property
    if (response.text && typeof response.text === 'string') {
      return response.text;
    }
    
    // Handle content with parts
    if (response.content && response.content.parts && Array.isArray(response.content.parts)) {
      const text = response.content.parts.map(part => part.text).join('');
      if (text) {
        console.log('Successfully extracted text from content.parts array');
        return text;
      }
    }
    
    // Last resort: try to convert the entire response to a string
    if (response.toString && typeof response.toString === 'function') {
      const text = response.toString();
      if (text && text !== '[object Object]') {
        console.log('Using toString() as last resort');
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
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        response: "Chat service is currently unavailable.",
        error: "SERVICE_DOWN"
      });
    }

    // Configure for Gemini 1.5 Flash (confirmed working with your API key)
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024, // Reduced for Flash model
        responseMimeType: "text/plain",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    });

    // Get system prompt with available tours
    const systemPrompt = await getSystemPrompt();
    
    // Create history with system prompt and user message
    const history = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Je comprends. Je suis l'assistant virtuel de Guidini pour le tourisme en Tunisie. Comment puis-je vous aider aujourd'hui?" }]
      }
    ];
    
    // Add user message history if provided
    if (req.body.history && Array.isArray(req.body.history)) {
      req.body.history.forEach(msg => {
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Start chat session with history
    const chat = model.startChat({ history });
    
    // Try with chat method first (preferred for conversations)
    let result;
    try {
      result = await chat.sendMessage(message);
    } catch (chatError) {
      // Fallback to direct content generation
      result = await model.generateContent(message);
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