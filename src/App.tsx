import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  User, 
  MessageSquare, 
  Calendar, 
  Search, 
  ChevronRight, 
  Volume2, 
  Send, 
  ArrowUpRight, 
  Info,
  Clock,
  RotateCcw,
  CheckCircle2,
  Map,
  Layers,
  Heart,
  Globe,
  Utensils,
  Award,
  Sliders,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DestinationInfo, GuideProfile, ChatMessage } from "./types";
import AudioGuidePlayer from "./components/AudioGuidePlayer";
import InteractiveStory from "./components/InteractiveStory";
import InteractiveGlobe from "./components/InteractiveGlobe";
import ImmersivePlaceViewer from "./components/ImmersivePlaceViewer";
import CultureExplorer from "./components/CultureExplorer";
import FoodDiscovery from "./components/FoodDiscovery";
import AITravelPlanner from "./components/AITravelPlanner";

// Static default Tokyo data to ensure instant, visually stunning load
const DEFAULT_TOKYO: DestinationInfo = {
  destination: "Tokyo",
  country: "Japan",
  tagline: "The quiet harmony of paper walls and neon rain",
  overview: "Tokyo is a sublime study in contradictions. Here, centuries-old Shinto shrines sit tucked away behind soaring skyscraper cathedrals, and the quiet ritual of hand-milled buckwheat noodle craftsmanship persists in quiet neighborhood alleys beneath the digital hum of the world's most hyper-modern metropolis.",
  heritageSummary: "Rooted in Edo-period grit and post-war resilience, Tokyo's culture is shaped by the philosophy of 'iki' (spontaneous elegance) and 'wabi-sabi' (the appreciation of fleeting transience). It is a community of makers, micro-neighborhoods, and deep respect for public space.",
  attractions: [
    {
      name: "Senso-ji Temple",
      location: "Asakusa District",
      description: "Tokyo's oldest temple, built in 645 AD. The giant red Kaminarimon (Thunder Gate) welcomes visitors into a lively sensory array of incense smoke and traditional souvenir stands.",
      culturalSignificance: "The temple is dedicated to Bodhisattva Kannon, the goddess of compassion. It remains a sacred focal point for traditional festivals, representing the indestructible spiritual heart of old Edo.",
      heritageStory: "According to legend, two fishermen brothers caught a golden statue of Kannon in their nets in the Sumida River. Despite returning it multiple times, it kept returning to them. The village chief recognized its divinity and transformed his home into a temple.",
      audioGuideDraft: "Welcome, traveler. Let the heavy aroma of burning incense wrap around you. As you walk beneath the massive red paper lantern of the Thunder Gate, look closely at the dragon carved into its base—a guardian carved to appease the gods of rain and fire."
    },
    {
      name: "Meiji Jingu Shrine",
      location: "Yoyogi Forest Park",
      description: "A dense, silent forest of over 100,000 trees donated from across Japan, shielding a grand, austere wooden Shinto shrine complex.",
      culturalSignificance: "Constructed in honor of Emperor Meiji and Empress Shoken, who guided Japan's rapid transition from a feudal state to a modern power while actively honoring spiritual foundations.",
      heritageStory: "Every tree in this forest was planted by hand by volunteers in 1920. It was carefully designed to self-sustain, creating a permanent forest sanctuary where nature and ancestral spirits live in eternal harmony.",
      audioGuideDraft: "Step off the concrete of the city and feel the ground soften. The air cool. You are walking under a colossal torii gate made from 1,500-year-old Shinto cypress. This is not just a garden; it is a sacred transition zone where the worldly noise dissolves into the wind."
    }
  ],
  hiddenGems: [
    {
      name: "Yanaka District Alleyways",
      location: "Taito Ward",
      description: "One of Tokyo's few surviving pre-war wooden residential districts, rich with old-style temples, craft shops, and wandering community cats.",
      whySecret: "It was spared from both the Great Kanto Earthquake of 1923 and the air raids of WWII, preserving the intimate human-scale density of traditional Tokyo.",
      culturalSignificance: "It represents 'Shitamachi'—the traditional low-city merchant and artisan culture, emphasizing community bonds and slow-paced neighborhood living.",
      visitingTips: "Rent a vintage bicycle, buy a hand-roasted senbei rice cracker, and avoid speaking in loud tones in the narrow, silent resident alleyways."
    },
    {
      name: "Nezu Shrine Azalea Gardens",
      location: "Bunkyo Ward",
      description: "A brilliant, hillside sanctuary lined with a winding path of vermillion torii gates and thousands of vibrant, carefully manicured azalea shrubs.",
      whySecret: "While tourists crowd Fushimi Inari in Kyoto, Nezu Shrine offers a serene, intimate Shinto path with almost identical historical charm, entirely hidden from main avenues.",
      culturalSignificance: "One of Japan's oldest shrine structures, surviving intact since 1706. It represents classic Edo architectural layout and floral seasonal cycles.",
      visitingTips: "Visit in late April to see the blossoms in peak form, or at sunset when the lanterns flicker to life along the wooden walkways."
    }
  ],
  heritageAndTraditions: [
    {
      title: "The Art of Sado (Tea Ceremony)",
      category: "Culinary Heritage",
      description: "A highly ritualistic hospitality practice involving the preparation and presentation of powdered green tea (matcha). It is structured around the principles of Harmony, Respect, Purity, and Tranquility.",
      howToExperience: "Participate in a quiet, non-touristy tea gathering in a traditional garden house, paying close attention to the host's choreographed hand movements and the seasons reflected in the selected ceramic bowl."
    },
    {
      title: "Edo Kiriko Glass Cutting",
      category: "Craftsmanship",
      description: "A traditional glass-working technique dating back to 1834. Skilled artisans hand-carve intricate, geometric patterns onto colored layered glass, producing gorgeous light-refracting objects.",
      howToExperience: "Visit the artisan workshops in Sumida, observe the extreme concentration required to carve glass without guidelines, and purchase a cup to support generational glassmakers."
    }
  ],
  events: [
    {
      name: "Sanja Matsuri",
      timeOfYear: "Third Weekend of May",
      description: "One of Tokyo's wildest and most massive festivals, celebrating the founders of Senso-ji. Thousands carry dozens of heavy, golden mikoshi (portable shrines) through the roaring streets with continuous chanting and taiko drumming.",
      culturalMeaning: "A ritualistic celebration of community strength, spiritual purification, and honoring local neighborhood ancestors.",
      travelerTip: "Stand respectfully on the sidewalks, wear lightweight summer clothing, and join in the infectious 'Saiya, saiya!' chants from a safe, appreciative distance."
    }
  ],
  itinerary: [
    {
      day: "Day 1: Edo Roots & Spiritual Quiet",
      morning: "Walk through Asakusa before the crowds arrive. Stand in the courtyard of Senso-ji, listen to the morning monks chanting, and watch the incense smoke rise.",
      afternoon: "Stroll down the river to Sumida to see the Edo Kiriko glass blowers. Enjoy a simple, hot bowl of hand-cut buckwheat soba noodles nearby.",
      evening: "Witness the dramatic twilight lanterns at Nezu Shrine. Have a slow, multi-course seasonal izakaya dinner in Yanaka.",
      localVibeTip: "Keep your phone on silent, walk on the left side of the paths, and accept objects with both hands as a silent sign of respect."
    }
  ]
};

const PRESET_CITIES = ["Tokyo", "Cairo", "Jaipur", "Rome", "Rio de Janeiro"];

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDestination, setActiveDestination] = useState<string>("Tokyo");
  const [travelerStyle, setTravelerStyle] = useState<string>("Cultural Anthropologist");
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo>(DEFAULT_TOKYO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guide Persona States
  const [guide, setGuide] = useState<GuideProfile>({
    city: "Tokyo",
    name: "Kenji",
    role: "Artisan Soba Chef & Neighborhood Historian",
    avatarSeed: "kenji",
    bio: "Kenji maintains a small, centuries-old noodle shop in Yanaka, Tokyo's historical district. He spends his mornings milling buckwheat by hand and his evenings studying local Edo-period maps. He is an expert on traditional dining etiquette, hidden shrines, and the vanishing wooden architecture of old Tokyo."
  });
  const [loadingGuide, setLoadingGuide] = useState(false);
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Okaeri (welcome), respectful traveler! I am Kenji. Grab a seat by the counter. Ask me anything about our neighborhood's history, where to find authentic crafts, or the proper etiquette when entering Shinto shrines.",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Active elements
  const [selectedAttractionIdx, setSelectedAttractionIdx] = useState(0);
  
  // High-Tech Futuristic Control Room Tabs
  const [activeTab, setActiveTab] = useState<"globe" | "atmosphere" | "culture" | "food" | "planner" | "chronicles">("globe");

  // Ref for chat scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // Load a destination
  const handleLoadDestination = async (city: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/destination/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: city, travelerStyle })
      });

      if (!response.ok) {
        throw new Error("Failed to explore the coordinates. The library records might be locked.");
      }

      const data = await response.json();
      setDestinationInfo(data);
      setActiveDestination(city);
      setSelectedAttractionIdx(0);

      // Load or generate guide for this city
      await handleLoadGuide(city);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while connecting with the chronicler.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Guide persona
  const handleLoadGuide = async (city: string) => {
    setLoadingGuide(true);
    try {
      const response = await fetch("/api/guide/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: city })
      });
      const data = await response.json();
      if (data.guide) {
        setGuide(data.guide);
        setChatMessages([
          {
            id: "welcome-" + Date.now(),
            role: "model",
            text: `Welcome to ${data.guide.city}! I am ${data.guide.name}, working as a ${data.guide.role}. ${data.guide.bio} Let us chat and discover our deep roots together.`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading guide:", err);
    } finally {
      setLoadingGuide(false);
    }
  };

  // Submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleLoadDestination(searchTerm.trim());
    }
  };

  // Guide Chat submission
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput("");
    setSendingMessage(true);

    try {
      // Prepare simple history format for endpoint
      const historyToSend = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          history: historyToSend,
          guide
        })
      });

      if (!response.ok) {
        throw new Error("I lost my train of thought. Please ask again.");
      }

      const data = await response.json();
      const replyMsg: ChatMessage = {
        id: "reply-" + Date.now(),
        role: "model",
        text: data.reply,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "model",
          text: `Forgive me, my connection is a bit weak right now. (Error: ${err.message})`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Get Avatar visual placeholder based on name
  const getAvatarEmoji = (seed: string) => {
    const s = seed.toLowerCase();
    if (s.includes("kenji")) return "🍜";
    if (s.includes("amira")) return "🏺";
    if (s.includes("rajesh")) return "🎨";
    if (s.includes("sofia")) return "🏛️";
    if (s.includes("thiago")) return "🥁";
    return "🧭";
  };

  const selectedAttraction = destinationInfo.attractions && destinationInfo.attractions[selectedAttractionIdx] 
    ? destinationInfo.attractions[selectedAttractionIdx] 
    : null;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 font-sans flex overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-white">
      
      {/* Dynamic atmospheric background lights (Aurora gradient) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-aurora-purple" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-3xl animate-aurora-cyan" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-aurora-pink" />
      </div>

      {/* Floating Interactive HUD Navigation Bar */}
      <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 h-16 glass-panel rounded-full px-6 flex items-center justify-between z-50 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Compass className="h-5 w-5 text-white animate-spin-slow" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold block uppercase">LOCI COGNITIVE COMPASS</span>
            <h1 className="text-sm font-display font-black tracking-tight text-white uppercase">CULTURAL RADAR</h1>
          </div>
        </div>

        {/* Dynamic Nav Controls inside HUD */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2">
            {PRESET_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleLoadDestination(city)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-full border cursor-pointer transition-all ${
                  activeDestination.toLowerCase() === city.toLowerCase()
                    ? "bg-[#8a7251] border-amber-900 text-white shadow-[0_0_12px_rgba(138,114,81,0.5)]"
                    : "bg-white/5 border-white/5 text-stone-400 hover:text-white hover:border-white/10"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <span className="w-[1px] h-6 bg-white/15 hidden lg:block" />

          {/* Expandable smart search widget */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Inject Coordinates..."
              className="w-36 md:w-52 bg-[#0d0d12]/80 border border-white/10 focus:border-cyan-500 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none transition-all font-mono"
            />
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
          </form>

          {/* Toggle chat control button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-full border cursor-pointer transition-all ${
              isChatOpen
                ? "bg-purple-950/40 border-purple-800 text-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                : "bg-white/5 border-white/10 text-stone-400 hover:text-white"
            }`}
            title="Toggle Guide Companion Chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Left Sidebar decorative rail */}
      <aside id="left-rail" className="hidden lg:flex w-20 border-r border-white/10 flex-col justify-between py-10 items-center shrink-0 h-screen sticky top-0 pt-24 z-10">
        <div className="writing-mode-vertical rotate-180 text-[10px] font-mono tracking-[0.4em] text-stone-500 uppercase select-none font-bold">
          TERRA DISCOVERY • 2026
        </div>
        <div className="writing-mode-vertical rotate-180 text-[10px] font-mono tracking-[0.5em] text-[#8a7251] font-bold uppercase select-none">
          COGNITIVE LEVEL 5
        </div>
        <div className="relative">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
        </div>
      </aside>

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 pt-24 z-10">
        
        {/* Global Loading / Error Panels */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px] bg-[#030303]/80 backdrop-blur-md z-40"
            >
              <div className="relative w-24 h-24 mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-white/5 border-t-[#8a7251]"
                />
                <Compass className="absolute inset-0 m-auto h-10 w-10 text-[#8a7251] animate-pulse" />
              </div>
              <h3 className="text-xl font-display text-white mb-2 tracking-wide font-extrabold uppercase">Summoning Historical Archives...</h3>
              <p className="text-xs font-mono text-stone-400 max-w-sm text-center leading-relaxed font-light">
                Our Gemini neural network is compiling traditional recipes, modeling the local atmosphere, designing itinerary timetables, and structuring guide personalities.
              </p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 mx-6 md:mx-12 my-6 glass-panel border border-red-500/30 rounded-2xl flex flex-col items-center text-center max-w-2xl self-center"
            >
              <div className="text-red-400 font-mono text-xs mb-2 uppercase tracking-widest font-bold">ARCHIVAL SYNCHRONIZATION FAILURE</div>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">{error}</p>
              <button 
                onClick={() => handleLoadDestination(activeDestination)}
                className="px-5 py-2 bg-[#8a7251] hover:bg-[#735e42] text-white text-xs font-mono rounded-full transition-all cursor-pointer shadow-lg"
              >
                Restore Coordinates
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Page Layout */}
        {!loading && !error && (
          <div className="flex-1 flex flex-col xl:flex-row min-w-0">
            
            {/* Left Content Column */}
            <div className="flex-1 border-r border-white/10 flex flex-col min-w-0">
              
              {/* Massive Cinematic Hero Block */}
              <section id="hero-section" className="p-6 md:p-12 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-[#09090d] to-[#030303]">
                <div className="absolute right-10 top-10 opacity-5 pointer-events-none select-none text-[150px] md:text-[220px] font-display font-extrabold tracking-tighter leading-none text-white uppercase">
                  {destinationInfo.country}
                </div>

                <div className="max-w-4xl relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs text-[#8a7251] uppercase tracking-widest font-bold bg-[#8a7251]/10 px-3 py-1 rounded-full border border-[#8a7251]/20">
                      Vol. 003 / COORDINATE Locks: {destinationInfo.destination}, {destinationInfo.country}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter uppercase leading-none mb-4 bg-gradient-to-r from-white via-stone-200 to-stone-500 bg-clip-text text-transparent">
                    {destinationInfo.destination}
                  </h1>

                  <h2 className="text-xl md:text-2xl font-serif italic text-[#8a7251] mb-6 font-light leading-relaxed">
                    &ldquo;{destinationInfo.tagline}&rdquo;
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10 mt-6">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block mb-2 font-bold">HISTORICAL IDENTITY MATRIX</span>
                      <p className="text-sm text-stone-300 leading-relaxed font-sans font-light">
                        {destinationInfo.overview}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block mb-2 font-bold">CULTURAL ORIGIN SUMMARY</span>
                      <p className="text-sm text-stone-300 leading-relaxed font-sans font-light">
                        {destinationInfo.heritageSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cockpit Instrument control sub-tabs (Apple Vision Pro cockpit style) */}
              <div className="border-b border-white/10 bg-[#07070a]/90 sticky top-[73px] z-20 flex overflow-x-auto p-2 gap-1 backdrop-blur-md">
                {[
                  { id: "globe", label: "Orbit Radar", icon: Globe, color: "text-purple-400" },
                  { id: "atmosphere", label: "Immersive Sky", icon: Sliders, color: "text-cyan-400" },
                  { id: "culture", label: "Anthropology Corner", icon: Award, color: "text-amber-400" },
                  { id: "food", label: "Taste Archive", icon: Utensils, color: "text-orange-400" },
                  { id: "planner", label: "AI Scheduler", icon: Calendar, color: "text-emerald-400" },
                  { id: "chronicles", label: "Monuments & Lore", icon: Layers, color: "text-pink-400" }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                        activeTab === tab.id 
                          ? "bg-white/10 text-white shadow-lg border border-white/10" 
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${tab.color}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Content Panels based on Active Tab */}
              <div className="p-6 md:p-12 flex-1">
                
                {/* 1. ORBIT RADAR (Globe) */}
                {activeTab === "globe" && (
                  <div className="space-y-8">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-bold">Active Earth Lock</span>
                      <h3 className="text-xl font-display font-bold text-white mt-1">Immersive Rotating Earth Console</h3>
                      <p className="text-xs text-stone-400 font-light mt-0.5">Orbit, rotate, and lock onto historic cultural centers with real-time flight route trails.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-7">
                        <InteractiveGlobe activeCity={activeDestination} onSelectCity={handleLoadDestination} />
                      </div>
                      
                      {/* Destination Highlight details side panel */}
                      <div className="lg:col-span-5 bg-[#09090d] border border-white/10 rounded-2xl p-6 space-y-4">
                        <span className="text-xs font-mono text-purple-400 uppercase font-bold tracking-wider block">LOCK DATA STATUS</span>
                        <div className="space-y-2">
                          <div className="text-2xl font-display font-bold text-white">{destinationInfo.destination}</div>
                          <div className="text-xs text-[#8a7251] font-mono uppercase">{destinationInfo.country} • EARTH INDEX</div>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed font-light">
                          Our sensory satellites indicate pleasant conditions across key neighborhoods. Lock on other coordinate points in the globe control to synchronize archives.
                        </p>

                        <div className="border-t border-white/5 pt-4 space-y-3">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block font-bold">SUGGESTED EMBARK SENSORS</span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="bg-black/40 p-2.5 rounded border border-white/5 text-stone-300">
                              <span className="text-stone-500 block">DENSITY</span>
                              <span className="text-white font-bold">8.4M Coords</span>
                            </div>
                            <div className="bg-black/40 p-2.5 rounded border border-white/5 text-stone-300">
                              <span className="text-stone-500 block">ELEVATION</span>
                              <span className="text-white font-bold">34 Meters</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ATMOSPHERE VIEWER */}
                {activeTab === "atmosphere" && (
                  <div className="space-y-8">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">SENSORY SIMULATION</span>
                      <h3 className="text-xl font-display font-bold text-white mt-1">Atmospheric Parallax Projection</h3>
                      <p className="text-xs text-stone-400 font-light mt-0.5">Toggle weather anomalies, slide daylight coordinates, and observe local storytelling transformations.</p>
                    </div>

                    <ImmersivePlaceViewer city={activeDestination} />
                  </div>
                )}

                {/* 3. CULTURE EXPLORER */}
                {activeTab === "culture" && (
                  <CultureExplorer city={activeDestination} />
                )}

                {/* 4. FOOD DISCOVERY */}
                {activeTab === "food" && (
                  <FoodDiscovery city={activeDestination} />
                )}

                {/* 5. TRAVEL PLANNER */}
                {activeTab === "planner" && (
                  <AITravelPlanner city={activeDestination} />
                )}

                {/* 6. CHRONICLES, LORE & AUDIO */}
                {activeTab === "chronicles" && (
                  <div className="space-y-12">
                    
                    {/* Selected Landmark Details + Audio + Story */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Attractions list sidebar selector */}
                      <div className="lg:col-span-4 space-y-3">
                        <span className="text-xs font-mono text-[#8a7251] uppercase tracking-widest block mb-4 font-bold">HERITAGE MARKS</span>
                        {destinationInfo.attractions?.map((attr, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAttractionIdx(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              selectedAttractionIdx === idx
                                ? "bg-white/5 border-pink-500/40 text-white shadow-lg"
                                : "bg-[#121216]/40 border-white/5 hover:border-white/10 text-stone-400"
                            }`}
                          >
                            <div>
                              <h4 className="text-sm font-display font-bold">{attr.name}</h4>
                              <p className="text-[10px] font-mono text-stone-500 mt-0.5">{attr.location}</p>
                            </div>
                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedAttractionIdx === idx ? "text-pink-400 translate-x-1" : "text-stone-600"}`} />
                          </button>
                        ))}
                      </div>

                      {/* Monument Lore Details Panel */}
                      {selectedAttraction && (
                        <div className="lg:col-span-8 space-y-6 bg-[#0c0c10]/40 border border-white/5 rounded-2xl p-6 shadow-2xl">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
                            <div>
                              <span className="text-xs font-mono text-pink-400 uppercase tracking-wider font-bold">{selectedAttraction.location}</span>
                              <h3 className="text-2xl font-display font-extrabold text-white mt-1">{selectedAttraction.name}</h3>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-2 font-bold">PHYSICAL DIMENSION</span>
                            <p className="text-sm text-stone-300 leading-relaxed font-light">{selectedAttraction.description}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-2 font-bold">CULTURAL ESSENCE</span>
                            <p className="text-sm text-stone-300 leading-relaxed font-light">{selectedAttraction.culturalSignificance}</p>
                          </div>

                          <div className="bg-[#101015] border border-white/5 rounded-lg p-5">
                            <span className="text-xs font-mono text-[#8a7251] uppercase tracking-widest block mb-2 font-bold">📜 ANCIENT FOLKLORE</span>
                            <p className="text-sm text-stone-300 font-serif italic leading-relaxed">{selectedAttraction.heritageStory}</p>
                          </div>

                          {/* Beautiful Dark Custom Audio Walk */}
                          <AudioGuidePlayer 
                            draft={selectedAttraction.audioGuideDraft} 
                            landmarkName={selectedAttraction.name}
                            narratorName={guide.name}
                          />
                        </div>
                      )}
                    </div>

                    {/* Interactive Choice Story Simulator */}
                    {selectedAttraction && (
                      <div className="mt-8">
                        <InteractiveStory destination={destinationInfo.destination} landmarkName={selectedAttraction.name} />
                      </div>
                    )}

                    {/* Hidden Gems fallback items */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                      <span className="text-xs font-mono text-pink-400 uppercase tracking-wider font-bold block">SAVED LANDMARK SECRETS</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {destinationInfo.hiddenGems?.map((gem, index) => (
                          <div key={index} className="bg-[#121216]/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-stone-500 uppercase">{gem.location}</span>
                              <h4 className="text-base font-display font-bold text-white mt-1">{gem.name}</h4>
                              <p className="text-xs text-stone-350 leading-relaxed font-light mt-2">{gem.description}</p>
                            </div>
                            <div className="border-t border-white/5 pt-4 mt-4 text-[10px] font-mono text-stone-500">
                              <span className="text-amber-500 font-bold block">INSIDER SECRECY:</span>
                              <p className="text-stone-300 italic mt-0.5">{gem.whySecret}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Local Guide Companion Panel (Holographic sidebar chat) */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.aside 
                  id="guide-sidebar"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "380px" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="w-full xl:w-96 shrink-0 bg-[#07070a] border-t xl:border-t-0 xl:border-l border-white/10 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-24 overflow-hidden z-20"
                >
                  {/* Companion Profile */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full border border-purple-500 bg-purple-950/20 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(139,92,246,0.3)] relative shrink-0">
                        {getAvatarEmoji(guide.avatarSeed)}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#07070a] rounded-full" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-bold block">GUIDE PROTON PORTAL</span>
                        <h3 className="text-base font-display font-extrabold text-white leading-tight">{guide.name}</h3>
                        <p className="text-xs text-stone-400 font-serif italic mt-0.5 leading-none">{guide.role}</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#121216]/50 p-4 rounded-xl border border-white/5 text-xs leading-relaxed text-stone-300 font-light font-sans">
                      {guide.bio}
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[350px] xl:max-h-[none]">
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block mb-2 text-center">SECURE PROTOCOL TRANSCRIPT</span>
                    
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <div className="text-[9px] font-mono text-stone-500 mb-1">
                          {msg.role === "user" ? "You" : guide.name}
                        </div>
                        <div 
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.role === "user" 
                              ? "bg-[#8a7251] text-white rounded-tr-none shadow-lg" 
                              : "bg-[#121218] border border-white/5 text-stone-200 rounded-tl-none shadow-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {sendingMessage && (
                      <div className="flex flex-col items-start max-w-[80%]">
                        <span className="text-[9px] font-mono text-stone-500 mb-1">{guide.name} is speaking...</span>
                        <div className="bg-[#121218] border border-white/5 text-stone-400 p-3 rounded-lg text-xs italic flex items-center gap-2">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 bg-[#8a7251] rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-[#8a7251] rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-[#8a7251] rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Console Bar */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/10 bg-[#09090c] flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Whisper to ${guide.name}...`}
                      className="flex-1 bg-[#121216] border border-white/10 focus:border-cyan-500 text-xs text-white placeholder-stone-500 rounded-full py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || sendingMessage}
                      className="h-10 w-10 bg-[#8a7251] hover:bg-[#735e42] disabled:opacity-40 text-white flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-lg hover:scale-105"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                </motion.aside>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  );
}
