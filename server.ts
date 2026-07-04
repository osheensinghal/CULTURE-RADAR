import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Ensure the API Key is present, throw error on first use
function getGeminiAPI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
  }
  return ai;
}

// Preset guides profiles
const PRESET_GUIDES = [
  {
    city: "Tokyo",
    name: "Kenji",
    role: "Artisan Soba Chef & Neighborhood Historian",
    avatarSeed: "kenji",
    bio: "Kenji maintains a small, centuries-old noodle shop in Yanaka, Tokyo's historical district. He spends his mornings milling buckwheat by hand and his evenings studying local Edo-period maps. He is an expert on traditional dining etiquette, hidden shrines, and the vanishing wooden architecture of old Tokyo."
  },
  {
    city: "Cairo",
    name: "Amira",
    role: "Egyptologist & Street Food Explorer",
    avatarSeed: "amira",
    bio: "Amira is a licensed archaeologist who guides travelers through the labyrinthine streets of Islamic Cairo. She blends deep historic knowledge of Pharaonic and Islamic dynasties with a modern passion for finding the absolute best koshary stalls. She loves explaining oral legends and local architectural symbols."
  },
  {
    city: "Jaipur",
    name: "Rajesh",
    role: "Block-Printing Textile Master & Folk Music Archivist",
    avatarSeed: "rajesh",
    bio: "Rajesh is a hereditary master of dabu block printing from a village near Jaipur. He has dedicated his life to preserving natural vegetable dyes and documenting local Rajasthani folk musicians. He knows the royal palaces, but his true love is the bustling artisan alleyways of Johari Bazaar."
  },
  {
    city: "Rome",
    name: "Sofia",
    role: "Historic Preservation Architect & Bakery Archivist",
    avatarSeed: "sofia",
    bio: "Sofia works on restoring Rome's historic fountains and buildings. By night, she is an expert on Roman food history and local social centers. She knows every hidden courtyard in Trastevere and loves sharing stories of how Roman neighborhoods evolved around ancient bakeries."
  },
  {
    city: "Rio de Janeiro",
    name: "Thiago",
    role: "Samba School Director & Community Activist",
    avatarSeed: "thiago",
    bio: "Thiago lives in Santa Teresa and helps coordinate music workshops for youth. He is deeply connected to Rio's Afro-Brazilian musical heritage, the history of carnival, and local favela-led ecological trails. He is the ultimate guide to street samba blocks and authentic local life."
  }
];

// Endpoint: Explore Destination (Uses Structured JSON Schema)
app.post("/api/destination/explore", async (req, res) => {
  try {
    const { destination, travelerStyle = "cultural explorer" } = req.body;
    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "Destination name is required" });
    }

    const aiClient = getGeminiAPI();

    const prompt = `Perform a comprehensive cultural discovery and guide generation for "${destination}". 
Target traveler type: "${travelerStyle}".
Provide highly detailed local, authentic information. Highlight 3-4 key cultural attractions and 3-4 lesser-known local "hidden gems". Offer heritage summaries, traditional culinary/social items, events/festivals, and a detailed 3-day immersive cultural itinerary. Be respectful, rich, and highly engaging. Do not use generic explanations.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning cultural anthropologist, local heritage expert, and world-class travel writer. Your writing is highly descriptive, engaging, warm, respectful of local traditions, and focused on deep, authentic experiences rather than commercialized tourism.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            country: { type: Type.STRING },
            tagline: { type: Type.STRING, description: "A catchy cultural tagline summarizing the spirit of the place" },
            overview: { type: Type.STRING, description: "Detailed description of the destination, its vibes, and welcoming nature." },
            heritageSummary: { type: Type.STRING, description: "Summary of the historical and cultural roots of this place." },
            
            attractions: {
              type: Type.ARRAY,
              description: "List of 3-4 major cultural attractions, each with unique lore.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the attraction" },
                  location: { type: Type.STRING, description: "Specific neighborhood or district" },
                  description: { type: Type.STRING, description: "Vivid description of its sights, sounds, and physical beauty." },
                  culturalSignificance: { type: Type.STRING, description: "Why does this matter to local identity or history?" },
                  heritageStory: { type: Type.STRING, description: "An interesting, short immersive historical tale, myth, or legend about this place." },
                  audioGuideDraft: { type: Type.STRING, description: "A first-person welcoming audio-guide voiceover script (1-2 paragraphs) that visitors can play while walking there." }
                },
                required: ["name", "location", "description", "culturalSignificance", "heritageStory", "audioGuideDraft"]
              }
            },

            hiddenGems: {
              type: Type.ARRAY,
              description: "List of 3 key authentic, lesser-known secret locations favored by locals.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING },
                  whySecret: { type: Type.STRING, description: "Why is it hidden or off the beaten path, and how do locals engage with it?" },
                  culturalSignificance: { type: Type.STRING, description: "What aspect of local craftsmanship, culinary tradition, or neighborhood community life does this represent?" },
                  visitingTips: { type: Type.STRING, description: "Insider tip on how to visit respectfully, best time, or specific local codes." }
                },
                required: ["name", "location", "description", "whySecret", "culturalSignificance", "visitingTips"]
              }
            },

            heritageAndTraditions: {
              type: Type.ARRAY,
              description: "Examples of local craft, music, performance, or social etiquette.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "e.g., Kintsugi pottery, Fado chanting, bowing etiquettes" },
                  category: { type: Type.STRING, description: "e.g., Craft, Music, Dance, Culinary Heritage, Etiquette" },
                  description: { type: Type.STRING, description: "Detailed explanation of the tradition, history, and practice." },
                  howToExperience: { type: Type.STRING, description: "Practical and respectful ways for a traveler to support or witness this tradition." }
                },
                required: ["title", "category", "description", "howToExperience"]
              }
            },

            events: {
              type: Type.ARRAY,
              description: "Major cultural festivals or spiritual celebrations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  timeOfYear: { type: Type.STRING, description: "e.g., Mid-October, Cherry blossom season, Spring Equinox" },
                  description: { type: Type.STRING, description: "Vivid description of the event, what happens, sights, and colors." },
                  culturalMeaning: { type: Type.STRING, description: "The spiritual, historical, or seasonal meaning behind the celebration." },
                  travelerTip: { type: Type.STRING, description: "Practical advice on where to stand, what to wear, and how to respect local participants." }
                },
                required: ["name", "timeOfYear", "description", "culturalMeaning", "travelerTip"]
              }
            },

            itinerary: {
              type: Type.ARRAY,
              description: "A 3-day immersive day-by-day itinerary.",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "e.g., Day 1: Ancient Echoes & Whispers" },
                  morning: { type: Type.STRING, description: "Morning exploration and historical immersion" },
                  afternoon: { type: Type.STRING, description: "Afternoon culinary craft workshop or local food walk" },
                  evening: { type: Type.STRING, description: "Evening community event, sunset overlook, or traditional performance" },
                  localVibeTip: { type: Type.STRING, description: "Mindful practice: e.g., Take 10 minutes to sit in the temple gardens, or avoid talking loudly on public transits." }
                },
                required: ["day", "morning", "afternoon", "evening", "localVibeTip"]
              }
            }
          },
          required: ["destination", "country", "tagline", "overview", "heritageSummary", "attractions", "hiddenGems", "heritageAndTraditions", "events", "itinerary"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in explore endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate cultural data." });
  }
});

// Endpoint: Interactive Narrative Storytelling
app.post("/api/story/narrate", async (req, res) => {
  try {
    const { destination, landmarkName, theme = "Legend and Lore", step = 1, previousStory = "", selectedChoice = "" } = req.body;
    if (!destination || !landmarkName) {
      return res.status(400).json({ error: "Destination and Landmark Name are required" });
    }

    const aiClient = getGeminiAPI();

    let userInstruction = "";
    if (step === 1) {
      userInstruction = `Start an interactive story about the landmark "${landmarkName}" in "${destination}". The theme is "${theme}". Write a rich, atmospheric first paragraph (step 1) setting the scene. Offer 3 choices for how the user would like to continue exploring or what they want to examine.`;
    } else {
      userInstruction = `Continue the interactive story about the landmark "${landmarkName}" in "${destination}". 
Previous Story Content so far:
"${previousStory}"

The user just selected this path/choice: "${selectedChoice}".
Write the next engaging, atmospheric paragraph (Step ${step}) reacting to their choice. Introduce new details, mystery, or character interaction. Then, provide 3 new choices for how they proceed or what they ask.`;
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userInstruction,
      config: {
        systemInstruction: "You are a master storyteller who specializes in historical fiction and travel mythology. You write with deep sensory detail (scents, sounds, textures, shadows). You draft short, compelling narrative segments that make travelers feel like they are directly exploring the destination. Always provide a draft for a spoken audio guide voice-over, and 3 clear next choices that lead to different historical or cultural perspectives.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storySegment: { type: Type.STRING, description: "The next narrative paragraph. Keep it around 100-150 words. Richly detailed." },
            audioScript: { type: Type.STRING, description: "A beautiful spoken audio script translating the visual mood of this scene for a physical explorer." },
            choices: {
              type: Type.ARRAY,
              description: "Exactly 3 logical options or questions for the next step of the journey.",
              items: { type: Type.STRING }
            }
          },
          required: ["storySegment", "audioScript", "choices"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in storytelling endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate storytelling segment." });
  }
});

// Endpoint: Guide Persona Generator (Dynamic or Custom)
app.post("/api/guide/get-or-create", async (req, res) => {
  try {
    const { destination, customCity = "" } = req.body;
    const targetCity = (customCity || destination || "").trim();

    if (!targetCity) {
      return res.status(400).json({ error: "Destination name is required" });
    }

    // Check if preset exists
    const matched = PRESET_GUIDES.find(g => g.city.toLowerCase() === targetCity.toLowerCase());
    if (matched) {
      return res.json({ guide: matched });
    }

    // Otherwise, dynamically generate a local guide persona using Gemini!
    const aiClient = getGeminiAPI();
    const prompt = `Generate a captivating local guide persona for the city/destination of "${targetCity}". 
The persona must represent local heritage, community, and authenticity. They could be an old archivist, a traditional artisan, a street market seller, a folk musician, or a community park ranger.
Provide their Name, their precise Role/Profession, a short Bio (2-3 sentences explaining their lineage, daily life, and what they care about), and a single-word seed for an avatar (e.g. "elder", "merchant", "musician").`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            name: { type: Type.STRING },
            role: { type: Type.STRING, description: "Authentic profession or role with cultural depth" },
            avatarSeed: { type: Type.STRING, description: "A simple single word seed for styling the avatar" },
            bio: { type: Type.STRING, description: "Short authentic background" }
          },
          required: ["city", "name", "role", "avatarSeed", "bio"]
        }
      }
    });

    const generated = JSON.parse(response.text || "{}");
    res.json({ guide: generated });
  } catch (error: any) {
    console.error("Error creating guide persona:", error);
    // Return a default safety guide
    res.json({
      guide: {
        city: req.body.destination || "Local Neighborhood",
        name: "Elena",
        role: "Community Heritage Coordinator",
        avatarSeed: "elena",
        bio: "Elena is a local researcher and community organizer who collects oral histories from neighborhood elders. She is passionate about preserving traditional cooking, family craft stores, and secret green spots."
      }
    });
  }
});

// Endpoint: Chat with Guide Persona
app.post("/api/guide/chat", async (req, res) => {
  try {
    const { message, history, guide } = req.body;
    if (!message || !guide) {
      return res.status(400).json({ error: "Message and Guide profile are required" });
    }

    const aiClient = getGeminiAPI();

    // Prepare history to feed into Gemini.
    // Format must match: parts: [{ text: string }] or chat-friendly formatting
    const formattedHistory = (history || []).map((h: any) => {
      return {
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      };
    });

    const systemInstruction = `You are playing the role of ${guide.name}, whose role is: "${guide.role}".
Your background: "${guide.bio}".
You live in ${guide.city}.
Your tone should be incredibly welcoming, authentic, and knowledgeable. Speak using local context, terms of endearment or common local idioms (with quick friendly translations if needed). You love sharing hidden gems, secret food places, community values, and proper cultural etiquette. Avoid sounding like an AI or a generic corporate travel agent. Be a humble, proud local friend sharing their home with a respectful guest. Keep responses to 2-3 short, highly engaging paragraphs.`;

    // We can use the chats interface or standard contents with system instruction
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.8
      }
    });

    const reply = response.text || "I apologize, my thoughts got a bit lost in the wind. What else would you like to explore together?";
    res.json({ reply });
  } catch (error: any) {
    console.error("Error in guide chat:", error);
    res.status(500).json({ error: error.message || "Failed to generate guide reply." });
  }
});

// Endpoint: Fetch Real-Time Weather
app.get("/api/weather", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
    }

    // 1. Geocode city to find lat, lon, and timezone
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geocodeRes = await fetch(geocodeUrl);
    if (!geocodeRes.ok) {
      throw new Error("Failed to fetch coordinates for city");
    }
    const geocodeData = await geocodeRes.json();
    if (!geocodeData.results || geocodeData.results.length === 0) {
      return res.status(404).json({ error: `Could not locate coordinates for city: ${city}` });
    }

    const { latitude, longitude, name, country, timezone } = geocodeData.results[0];

    // 2. Fetch current weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=${encodeURIComponent(timezone || "auto")}`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error("Failed to fetch current weather");
    }
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    res.json({
      city: name,
      country,
      latitude,
      longitude,
      timezone,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      isDay: current.is_day,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
      unit: weatherData.current_units?.temperature_2m || "°C"
    });
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    res.status(500).json({ error: error.message || "Failed to fetch real-time weather." });
  }
});


// Serve static files in production / Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
