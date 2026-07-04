import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  CloudSun, 
  Plane, 
  Train, 
  Footprints, 
  TrendingUp,
  Sparkles,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  cost: number;
  location: string;
  transport: "walking" | "train" | "flight" | "taxi";
}

interface AITravelPlannerProps {
  city: string;
}

// Pre-loaded stunning itineraries for all 5 cities
const PRESET_ITINERARIES: Record<string, ItineraryItem[]> = {
  Tokyo: [
    { id: "t1", time: "09:00 AM", title: "Sunrise ritual at Senso-ji Temple", cost: 0, location: "Asakusa", transport: "train" },
    { id: "t2", time: "12:30 PM", title: "Hand-rolled sushi lunch & green tea tasting", cost: 35, location: "Toyosu Market", transport: "walking" },
    { id: "t3", time: "03:00 PM", title: "Holographic art maze exploration", cost: 28, location: "teamLab Borderless", transport: "train" },
    { id: "t4", time: "07:30 PM", title: "Cyberpunk alleyway ramen tour & neon photography", cost: 20, location: "Shinjuku Omoide Yokocho", transport: "taxi" }
  ],
  Cairo: [
    { id: "c1", time: "08:00 AM", title: "Desert camel expedition & Sphinx sunrise walk", cost: 45, location: "Giza Plateau", transport: "taxi" },
    { id: "c2", time: "01:00 PM", title: "Mamluk bazaar spice hunt & cold hibiscus infusion", cost: 12, location: "Khan el-Khalili", transport: "walking" },
    { id: "c3", time: "04:30 PM", title: "Pharaonic mummy gold vault tour", cost: 25, location: "Grand Egyptian Museum", transport: "taxi" },
    { id: "c4", time: "08:00 PM", title: "Traditional Nile sailboat felucca sailing under starlight", cost: 30, location: "Nile Corniche", transport: "walking" }
  ],
  Jaipur: [
    { id: "j1", time: "08:30 AM", title: "Pink stone balcony photography & Venturi breeze study", cost: 5, location: "Hawa Mahal", transport: "walking" },
    { id: "j2", time: "11:00 AM", title: "Royal Amber Fort elephant-free stone fortress hike", cost: 15, location: "Amer Hills", transport: "taxi" },
    { id: "j3", time: "02:30 PM", title: "Indigo hand-block print workshop", cost: 22, location: "Anokhi Handcraft Center", transport: "train" },
    { id: "j4", time: "07:00 PM", title: "Traditional spiced dal-baati royal feast under lanterns", cost: 18, location: "Chokhi Dhani Folk Village", transport: "taxi" }
  ],
  Rome: [
    { id: "r1", time: "08:30 AM", title: "Skip-the-line gladiator floor tour", cost: 38, location: "Colosseum", transport: "train" },
    { id: "r2", time: "12:00 PM", title: "Roman concrete dome engineering observation", cost: 0, location: "The Pantheon", transport: "walking" },
    { id: "r3", time: "03:00 PM", title: "Coin toss ritual & lemon sorbet walk", cost: 3, location: "Trevi Fountain", transport: "walking" },
    { id: "r4", time: "07:30 PM", title: "Handmade Pecorino Romano carbonara tossing", cost: 26, location: "Trastevere Trattorias", transport: "taxi" }
  ],
  "Rio de Janeiro": [
    { id: "d1", time: "09:00 AM", title: "Cable car ride up Sugarloaf dome", cost: 32, location: "Pão de Açúcar", transport: "train" },
    { id: "d2", time: "01:00 PM", title: "Fresh coconut water & boardwalk stroll", cost: 4, location: "Copacabana Beach", transport: "walking" },
    { id: "d3", time: "04:00 PM", title: "Hike up Corcovado mountain to the Christ statue", cost: 20, location: "Tijuca National Park", transport: "taxi" },
    { id: "d4", time: "08:30 PM", title: "Live Samba drumming circle & feijoada pots", cost: 15, location: "Lapa Arches", transport: "walking" }
  ]
};

// Travel Suggestions depending on weather parameters
const WEATHER_PRESETS: Record<string, { temp: number; desc: string; outfit: string }> = {
  Tokyo: { temp: 21, desc: "Light breeze & pleasant afternoon", outfit: "Casual layer coat, comfortable mesh sneakers" },
  Cairo: { temp: 34, desc: "Dry intense heat & dust advisory", outfit: "Linen shirt, desert sun hat, polarized eyewear" },
  Jaipur: { temp: 32, desc: "Sunny blue skies & clear horizon", outfit: "Breathable cottons, walking slip-ons" },
  Rome: { temp: 24, desc: "Mild Mediterranean sunset", outfit: "Smart-casual loafers, light cotton scarf" },
  "Rio de Janeiro": { temp: 28, desc: "Humid tropical breeze with sun rays", outfit: "Bermuda shorts, flip-flops, linen top" }
};

export default function AITravelPlanner({ city }: AITravelPlannerProps) {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
    return PRESET_ITINERARIES[city] || PRESET_ITINERARIES["Tokyo"];
  });

  const [customItemTitle, setCustomItemTitle] = useState("");
  const [customItemCost, setCustomItemCost] = useState("15");
  const [customItemLoc, setCustomItemLoc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Sync state if city changes
  useState(() => {
    setItinerary(PRESET_ITINERARIES[city] || PRESET_ITINERARIES["Tokyo"]);
  });

  // Calculate stats
  const totalCost = itinerary.reduce((acc, curr) => acc + curr.cost, 0);
  const totalItems = itinerary.length;
  const weather = WEATHER_PRESETS[city] || WEATHER_PRESETS["Tokyo"];

  // Re-order simulation
  const shiftItem = (index: number, direction: "up" | "down") => {
    const updated = [...itinerary];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setItinerary(updated);
  };

  const deleteItem = (id: string) => {
    setItinerary(itinerary.filter(item => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemTitle.trim()) return;

    const newItem: ItineraryItem = {
      id: "custom_" + Date.now(),
      time: "12:00 PM",
      title: customItemTitle,
      cost: Number(customItemCost) || 0,
      location: customItemLoc || "Local neighborhood",
      transport: "walking"
    };

    setItinerary([...itinerary, newItem]);
    setCustomItemTitle("");
    setCustomItemLoc("");
    setIsAdding(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative">
      
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-white/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Calendar className="h-4.5 w-4.5 text-emerald-400 animate-spin-slow" /> DYNAMIC SCHEDULING SYSTEM
          </span>
          <h3 className="text-2xl font-display font-bold text-white mt-1">AI Interactive Travel Planner</h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">Customize daily schedules, manage expenses, and adapt to live regional guidelines.</p>
        </div>

        {/* Live Weather Integration Box */}
        <div className="bg-[#101015] border border-white/15 px-4 py-3 rounded-xl flex items-center gap-3 w-full lg:w-auto">
          <CloudSun className="h-7 w-7 text-amber-400 shrink-0" />
          <div className="text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">{weather.temp}°C</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300 font-light">{weather.desc}</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-light mt-0.5">Outfit recommendation: {weather.outfit}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Interactive drag-to-shift timeline (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono text-[#8a7251] uppercase tracking-wider block font-bold">ACTIVE TIMELINE DAY 01</span>
            
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer bg-cyan-950/20 px-2.5 py-1.5 rounded-md border border-cyan-900/60 font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> ADD EVENT
            </button>
          </div>

          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddItem}
              className="bg-[#121216] border border-cyan-900/60 p-4 rounded-xl space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Activity (e.g., Hidden Tea Ceremony)"
                  value={customItemTitle}
                  onChange={(e) => setCustomItemTitle(e.target.value)}
                  className="bg-[#09090b] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Neighborhood/Location"
                  value={customItemLoc}
                  onChange={(e) => setCustomItemLoc(e.target.value)}
                  className="bg-[#09090b] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  placeholder="Cost in USD"
                  value={customItemCost}
                  onChange={(e) => setCustomItemCost(e.target.value)}
                  className="bg-[#09090b] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8a7251] hover:bg-[#735e42] text-white px-4 py-1.5 rounded font-bold cursor-pointer"
                >
                  Inject Event
                </button>
              </div>
            </motion.form>
          )}

          <div className="space-y-3 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[1px] before:bg-white/10">
            <AnimatePresence initial={false}>
              {itinerary.map((item, idx) => {
                // Determine transport icon
                const TransportIcon = item.transport === "walking" 
                  ? Footprints 
                  : item.transport === "train" 
                    ? Train 
                    : Plane;

                return (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-start gap-4 bg-[#111116] border border-white/5 rounded-xl p-4 relative group hover:border-[#8a7251]/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  >
                    {/* Clock point */}
                    <div className="w-6 h-6 rounded-full bg-[#121218] border-2 border-[#8a7251] flex items-center justify-center shrink-0 relative z-10 text-[9px] font-mono text-white">
                      •
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#8a7251] flex items-center gap-1 font-bold">
                          <Clock className="h-3 w-3" /> {item.time}
                        </span>
                        
                        {/* Shifter / Rearrange controls */}
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => shiftItem(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-[#121218] hover:bg-white/10 text-stone-400 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1 rounded bg-[#121218] hover:bg-red-950/40 text-red-400 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-display font-bold text-white">{item.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-stone-400 pt-1">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <MapPin className="h-3 w-3 text-cyan-400" /> {item.location}
                        </span>
                        <span className="text-stone-500">•</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <DollarSign className="h-3 w-3" /> {item.cost === 0 ? "FREE" : `${item.cost} USD`}
                        </span>
                        <span className="text-stone-500">•</span>
                        <span className="flex items-center gap-1 text-amber-500 uppercase">
                          <TransportIcon className="h-3 w-3" /> {item.transport}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {itinerary.length === 0 && (
              <div className="text-center py-8 text-xs font-mono text-stone-500">
                Itinerary timeline is empty. Click "Add Event" to plan your custom route.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Budget and Analytics Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Budget Widget Card */}
          <div className="bg-[#121218] border border-white/15 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono text-[#8a7251] font-bold block uppercase tracking-wider">LIVE BUDGET BREAKDOWN</span>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-light">Sightseeing Activities</span>
                <span className="font-mono text-white font-medium">${totalCost} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-light">Est. Transport/Transit</span>
                <span className="font-mono text-white font-medium">$35 USD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-light">Local Diner Buffer</span>
                <span className="font-mono text-white font-medium">$40 USD</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <strong className="text-xs text-[#8a7251] uppercase">Est. Day Total</strong>
                <strong className="font-mono text-base text-emerald-400 font-bold">${totalCost + 75} USD</strong>
              </div>
            </div>

            {/* Budget Meter visual */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-stone-500">
                <span>CONSERVATIVE</span>
                <span>MAX THRESHOLD</span>
              </div>
              <div className="h-1.5 w-full bg-[#1e1e24] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((totalCost + 75) / 350) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Travel Suggestion Card */}
          <div className="bg-[#101015] border border-cyan-950 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute right-3 top-3">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-widest">AI ROUTING TIP</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light">
              We recommend taking the local rapid train line rather than taxi models between 03:00 PM and 06:00 PM to bypass heavy central urban road blockages and save up to 40% of estimated transit fees.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
