import { useState, useRef, useEffect } from "react";
import { Sparkles, Music, Star, Volume2, VolumeX, Eye, BookOpen, Layers, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CultureExplorerProps {
  city: string;
}

// Cultural Database for all 5 cities
const CULTURAL_DB: Record<string, {
  attire: {
    title: string;
    description: string;
    elements: { name: string; desc: string }[];
    visualAccent: string;
  };
  sonic: {
    instrument: string;
    instrumentDesc: string;
    trackName: string;
    trackStyle: string;
    notes: number[]; // Frequencies for micro-melody synth
    rhythm: number[]; // Duration timings
  };
  architecture: {
    monument: string;
    style: string;
    builtIn: string;
    details: string;
    structuralSecret: string;
  };
  etiquette: {
    do: string;
    dont: string;
    socialCode: string;
  };
}> = {
  Tokyo: {
    attire: {
      title: "The Kimono & Yukata",
      description: "A T-shaped, straight-lined robe worn so that the left side is wrapped over the right, secured by an obi (wide belt) at the back.",
      elements: [
        { name: "Obi (帯)", desc: "A wide, decorated sash requiring precise ceremonial knots." },
        { name: "Tabi (足袋)", desc: "Ankle-high socks with a separation between the big toe and others." },
        { name: "Geta (下駄)", desc: "Traditional wooden clogs raised on supporting teeth-blocks." }
      ],
      visualAccent: "from-purple-600 via-pink-600 to-red-500"
    },
    sonic: {
      instrument: "The Koto (箏)",
      instrumentDesc: "A traditional Japanese stringed zither with 13 strings plucked with three finger picks.",
      trackName: "Cherry Blossom Whispers (Sakura-guma)",
      trackStyle: "Pensive Pentatonic Scale",
      notes: [293.66, 329.63, 349.23, 392.00, 440.00, 523.25, 587.33], // D E F G A C D
      rhythm: [400, 200, 400, 400, 600, 200, 800]
    },
    architecture: {
      monument: "Pagodas (Go-junoto)",
      style: "Edo Wooden Structural Joinery",
      builtIn: "645 AD",
      details: "Multi-layered wooden towers constructed entirely without metallic nails. The floors are designed to slide loosely during earthquakes.",
      structuralSecret: "The central pillar (Shinbashira) acts as an independent heavy pendulum, swaying counter-actively during tectonic vibrations to absorb shock waves."
    },
    etiquette: {
      do: "Bow slightly when greeting, and make soft eye contact rather than intense staring.",
      dont: "Never stick chopsticks vertically into a bowl of rice; this mimics traditional funeral offerings.",
      socialCode: "Embody 'Omotenashi'—selfless, meticulous hospitality prioritizing the comfort of others."
    }
  },
  Cairo: {
    attire: {
      title: "The Galabeya & Bisht",
      description: "A lightweight, ankle-length loose robe representing comfort, respiratory ease, and desert sun protection.",
      elements: [
        { name: "Keffiyeh", desc: "Traditional patterned head scarf held by an black agal rope." },
        { name: "Bisht", desc: "A flowing royal outer cloak trimmed with hand-spun golden threads." },
        { name: "Markoub", desc: "Handcrafted pointed leather slippers stitched by generations of Old Cairo shoemakers." }
      ],
      visualAccent: "from-amber-500 via-orange-600 to-yellow-400"
    },
    sonic: {
      instrument: "The Oud (العود)",
      instrumentDesc: "A pear-shaped stringed lute without frets, producing warm microtonal resonance.",
      trackName: "Sands of the Nile (Nila Maqam)",
      trackStyle: "Mystical Bayati Maqam",
      notes: [293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25], // Maqam Bayati steps
      rhythm: [300, 300, 600, 300, 300, 600, 900]
    },
    architecture: {
      monument: "Mosque-Madrasa of Sultan Hassan",
      style: "Mamluk Brutalist Architecture",
      builtIn: "1359 AD",
      details: "A colossal limestone mosque complex designed with massive towering iwans and interlocking stone masonry vaults.",
      structuralSecret: "The main portal stands at 38 meters tall, angled specifically to reflect afternoon desert rays while maintaining heavy shadow pockets below."
    },
    etiquette: {
      do: "Accept hot tea ('shai') or coffee when offered by vendors; refusing outright may hurt their pride.",
      dont: "Do not point the soles of your shoes towards anyone; it is considered disrespectful in local traditional codes.",
      socialCode: "The spirit of 'Karam'—unbounded generosity where strangers are welcomed as honored kin."
    }
  },
  Jaipur: {
    attire: {
      title: "Royal Rajput Poshak & Safa",
      description: "Highly colorful garments representing the pride of Rajasthan, utilizing heavy block-printing ('Dabu') and gold zari embroidery.",
      elements: [
        { name: "Safa (Pagri)", desc: "An 8-meter long, hand-wrapped multicolored cotton royal turban." },
        { name: "Lehenga Choli", desc: "Heavy pleated skirt adorned with glass mirrorwork reflecting the desert sun." },
        { name: "Mojari", desc: "Ornate curled slippers decorated with hand-punched brass accents." }
      ],
      visualAccent: "from-pink-500 via-red-500 to-orange-400"
    },
    sonic: {
      instrument: "The Sarangi (सारंगी)",
      instrumentDesc: "A bowed, short-necked string instrument carved from a single block of cedar, known to mimic the human voice.",
      trackName: "Desert Horizon (Raga Bhairav)",
      trackStyle: "Spiritual Raga Melodic Pattern",
      notes: [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88], // Bhairav notes
      rhythm: [500, 250, 250, 500, 500, 1000, 1200]
    },
    architecture: {
      monument: "Hawa Mahal (Palace of Winds)",
      style: "Rajput Red Sandstone Filigree",
      builtIn: "1799 AD",
      details: "A five-story exterior facade constructed with 953 tiny, intricately carved arched windows (jharokhas).",
      structuralSecret: "The structure utilizes the Venturi wind tunnel effect. The breeze enters through narrow holes and is cooled, creating air conditioning naturally."
    },
    etiquette: {
      do: "Join your hands together and greet locals with 'Namaste' or 'Khamma Ghani' (traditional Rajasthani welcome).",
      dont: "Never enter a kitchen or prayer room with leather footwear or shoes still worn.",
      socialCode: "The philosophy of 'Athithi Devo Bhava'—treating the traveler as an incarnation of the divine."
    }
  },
  Rome: {
    attire: {
      title: "The Roman Toga to Renaissance Silk",
      description: "Historically structured around the wrap-around white wool toga, now translated to high-fashion artisanal drapery and Roman leather armor craft.",
      elements: [
        { name: "Chlamys", desc: "A draped wool cloak pinned at the right shoulder." },
        { name: "Caligae", desc: "Heavy-soled open sandals strapped with hand-cut cowhide strips." },
        { name: "Zazzera Trim", desc: "Symmetrical Roman crop cuts honoring ancient sculptural statues." }
      ],
      visualAccent: "from-blue-600 via-indigo-600 to-purple-500"
    },
    sonic: {
      instrument: "The Mandolin (Mandolino)",
      instrumentDesc: "A small pear-shaped stringed instrument plucked with a plectrum, popular in traditional Roman folk circles.",
      trackName: "Tiber Serenade (Trastevere Folk)",
      trackStyle: "Rapid Double-Strum Tremolo",
      notes: [329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33], // Roman modal scale
      rhythm: [150, 150, 150, 150, 300, 300, 600]
    },
    architecture: {
      monument: "The Pantheon Dome",
      style: "Ancient Roman Concrete Casting",
      builtIn: "125 AD",
      details: "The largest unreinforced concrete dome in the world, featuring an open 9-meter oculus circular skylight.",
      structuralSecret: "The concrete recipe uses lightweight volcanic pumice rock, progressively thinned as it approaches the center to minimize dead load."
    },
    etiquette: {
      do: "Drink water from the 'nasoni' (curved metal street fountains) like locals, blocking the nozzle with your finger to direct the jet upward.",
      dont: "Never order a cappuccino after 11:00 AM; locals believe warm milk after mid-day ruins the digestive cycle.",
      socialCode: "The lifestyle of 'La Dolce Vita'—appreciating beauty, food, and the theater of public life."
    }
  },
  "Rio de Janeiro": {
    attire: {
      title: "Samba Carnival Plumage & Baiana",
      description: "A highly explosive, vibrant mixture of feathers, crystals, and traditional Afro-Brazilian layered lace hoop skirts ('Saia Rodada').",
      elements: [
        { name: "Samba Crown", desc: "Towering crystal tiaras framing hundreds of colored feathers." },
        { name: "Guia Beads", desc: "Sacred tribal bead necklets honoring regional nature deities." },
        { name: "Sandália", desc: "Platform heels custom strapped for high-speed samba footwork." }
      ],
      visualAccent: "from-emerald-500 via-yellow-500 to-cyan-500"
    },
    sonic: {
      instrument: "The Berimbau & Pandeiro",
      instrumentDesc: "A single-string bow instrument combined with a tambourine, used to dictate the speed of Capoeira.",
      trackName: "Ipanema Sunset Breeze",
      trackStyle: "Syncopated Bossa Nova Rhythm",
      notes: [293.66, 349.23, 440.00, 493.88, 523.25, 587.33, 659.25], // Bossa jazz mode
      rhythm: [250, 250, 500, 250, 250, 500, 1000]
    },
    architecture: {
      monument: "Metropolitan Cathedral of Rio",
      style: "Futuristic Mayan Brutalism",
      builtIn: "1979",
      details: "A massive cone structure designed with four 60-meter high floor-to-ceiling stained glass windows forming a cross.",
      structuralSecret: "The natural resonance inside the cone creates a physical sound-echo delay of up to 4 seconds, intensifying musical chants."
    },
    etiquette: {
      do: "Greet friends and acquaintances with a warm embrace and double kiss on the cheek.",
      dont: "Do not flush toilet paper down the drain; old plumbing systems across South American neighborhoods cannot process it.",
      socialCode: "The quality of 'Ginga'—the rhythmic, fluid way of walking, talking, and navigating adversity with grace."
    }
  }
};

export default function CultureExplorer({ city }: CultureExplorerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"attire" | "sonic" | "monument" | "etiquette">("attire");
  const [isPlayingSonic, setIsPlayingSonic] = useState(false);
  const [synthLoading, setSynthLoading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorInterval = useRef<any>(null);

  const culture = CULTURAL_DB[city] || CULTURAL_DB["Tokyo"];

  // Synth micro-melody play
  const startSynthMelody = () => {
    if (isPlayingSonic) {
      stopSynthMelody();
      return;
    }

    try {
      setSynthLoading(true);
      // Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      setIsPlayingSonic(true);
      setSynthLoading(false);

      const notes = culture.sonic.notes;
      const timings = culture.sonic.rhythm;
      let noteIndex = 0;

      const playNextNote = () => {
        if (!audioCtxRef.current || audioCtx.state === "closed") return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // Give a beautiful bell-like chime feel
        osc.type = city === "Tokyo" ? "triangle" : city === "Cairo" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtx.currentTime);

        // Slow warm attack, quick decay
        gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (timings[noteIndex % timings.length] / 1000) - 0.05);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + timings[noteIndex % timings.length] / 1000);

        const nextDelay = timings[noteIndex % timings.length];
        noteIndex++;

        oscillatorInterval.current = setTimeout(playNextNote, nextDelay);
      };

      playNextNote();
    } catch (err) {
      console.error("Audio Context initialization failed:", err);
      setIsPlayingSonic(false);
      setSynthLoading(false);
    }
  };

  const stopSynthMelody = () => {
    setIsPlayingSonic(false);
    clearTimeout(oscillatorInterval.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSynthMelody();
    };
  }, [city]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* Background radial soft lights */}
      <div className={`absolute -right-24 -top-24 w-56 h-56 rounded-full bg-gradient-to-br ${culture.attire.visualAccent} opacity-10 blur-3xl`} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Award className="h-4.5 w-4.5 text-cyan-400" /> ANTHROPOLOGY CORNER
          </span>
          <h3 className="text-2xl font-display font-bold text-white mt-1">Culture &amp; Heritage Museum</h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">Explore the physical dress, acoustic models, and microtonal systems of {city}.</p>
        </div>

        {/* Culture Subtabs */}
        <div className="flex bg-[#121216] border border-white/10 p-1 rounded-lg shrink-0 gap-1 w-full md:w-auto overflow-x-auto">
          {[
            { id: "attire", label: "Garments", icon: Layers },
            { id: "sonic", label: "Sonic", icon: Music },
            { id: "monument", label: "Monuments", icon: BookOpen },
            { id: "etiquette", label: "Etiquette", icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { stopSynthMelody(); setActiveSubTab(tab.id as any); }}
                className={`px-3 py-2 text-xs font-mono font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? "bg-[#8a7251] text-white shadow-lg shadow-amber-950/40"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab + city}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-[260px]"
        >
          {/* 1. ATTIRE / DRESS */}
          {activeSubTab === "attire" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-[#8a7251] uppercase tracking-wider block font-bold">Physical Identity Showcase</span>
                <h4 className="text-xl font-display font-bold text-white">{culture.attire.title}</h4>
                <p className="text-sm text-stone-300 leading-relaxed font-light">{culture.attire.description}</p>
                
                <div className="bg-[#101015] border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono text-cyan-400 font-bold block uppercase">KEY ATTRIBUTES:</span>
                  {culture.attire.elements.map((el, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-[#8a7251] font-mono font-bold">0{i+1}</span>
                      <div>
                        <strong className="text-white font-medium block">{el.name}</strong>
                        <span className="text-stone-400 font-light">{el.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Artistic Dress visual Card representing physical textiles */}
              <div className="h-64 rounded-xl border border-white/10 overflow-hidden relative group flex flex-col justify-end p-6 bg-[#121216]">
                <div className={`absolute inset-0 bg-gradient-to-tr ${culture.attire.visualAccent} opacity-30 group-hover:opacity-40 transition-opacity`} />
                {/* Visual textile patterns */}
                <div className="absolute inset-4 border border-dashed border-white/10 rounded-lg flex items-center justify-center pointer-events-none opacity-40">
                  <div className="text-7xl font-mono text-white/5 font-black uppercase">TEXTILE</div>
                </div>
                
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Handcrafted Weave</span>
                  <h4 className="text-lg font-display font-semibold text-white">Generational Craft Patterns</h4>
                  <p className="text-xs text-stone-300 font-light">Sourced directly from local weavers using vegetable dyes and traditional weaving racks.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SONIC HERITAGE (Music Player with Interactive Synthesizer) */}
          {activeSubTab === "sonic" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#101015] p-5 border border-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-[#8a7251]/20 border border-[#8a7251]/40 ${isPlayingSonic ? "animate-pulse" : ""}`}>
                    <Music className="h-5 w-5 text-[#8a7251]" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#8a7251] uppercase tracking-wider block font-bold">ACOUSTIC FIELD MODEL</span>
                    <h4 className="text-base font-display font-bold text-white">{culture.sonic.trackName}</h4>
                    <p className="text-xs text-stone-400 font-mono">{culture.sonic.trackStyle} / {culture.sonic.instrument}</p>
                  </div>
                </div>

                <button
                  onClick={startSynthMelody}
                  disabled={synthLoading}
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider cursor-pointer flex items-center gap-2 transition-all ${
                    isPlayingSonic
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                      : "bg-[#8a7251] hover:bg-[#735e42] text-white"
                  }`}
                >
                  {isPlayingSonic ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5" /> STOP SYNTH MODEL
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" /> SYNTHESIZE SOUND
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121218] p-5 border border-white/5 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block font-bold">ABOUT THE INSTRUMENT</span>
                  <h4 className="text-base font-display font-bold text-white">{culture.sonic.instrument}</h4>
                  <p className="text-sm text-stone-300 font-light leading-relaxed">{culture.sonic.instrumentDesc}</p>
                </div>

                {/* Oscilloscope simulation */}
                <div className="h-36 rounded-xl bg-black border border-white/10 flex flex-col items-center justify-center relative overflow-hidden p-4">
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">SPECTRUM ANALYSIS</span>
                  </div>

                  <div className="flex items-end gap-1.5 w-full h-16 px-4">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-cyan-500/40 rounded-t-sm"
                        animate={{
                          height: isPlayingSonic 
                            ? [20, 50, 80, 40, 10, 60, 30, 90][(i + Math.floor(Date.now() / 150)) % 8] + "%" 
                            : "5%"
                        }}
                        transition={{ duration: 0.15, ease: "linear" }}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-4">
                    {isPlayingSonic ? "RECEIVING MICROTONAL CHORD DATA..." : "SYNTH STANDBY"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. MONUMENTS & ARCHITECTURE */}
          {activeSubTab === "monument" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <span className="text-[10px] font-mono text-[#8a7251] uppercase tracking-wider block font-bold">Engineering Landmarks</span>
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-display font-bold text-white">{culture.architecture.monument}</h4>
                  <span className="bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    BUILT IN {culture.architecture.builtIn}
                  </span>
                </div>
                <p className="text-sm text-stone-300 leading-relaxed font-light">{culture.architecture.details}</p>
                
                <div className="bg-[#121218] p-4 rounded-lg border border-white/5">
                  <span className="text-xs font-mono text-amber-400 font-bold block uppercase mb-1">📐 INTERLOCKING DESIGN SECRET:</span>
                  <p className="text-xs text-stone-300 leading-relaxed font-serif italic">{culture.architecture.structuralSecret}</p>
                </div>
              </div>

              <div className="bg-[#121216] border border-white/10 rounded-xl p-5 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute right-0 top-0 text-white/5 text-9xl font-mono select-none pointer-events-none font-black">
                  CAD
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block tracking-wider mb-2">Style Formula</span>
                  <h4 className="text-base font-display font-semibold text-white leading-tight">{culture.architecture.style}</h4>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono text-[#8a7251] uppercase block mb-1">Acoustic Material</span>
                  <p className="text-xs text-stone-350">Hand-carved limestone blocks and cedar woods calculated for seismic absorption.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. ETIQUETTE & CUSTOMS */}
          {activeSubTab === "etiquette" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Respect Rules */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 md:p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">RESPECTFUL CODES (DO)</span>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed font-light">{culture.etiquette.do}</p>
                </div>

                {/* Taboo Rules */}
                <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-5 md:p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-widest">TABOO CODES (DON'T)</span>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed font-light">{culture.etiquette.dont}</p>
                </div>

              </div>

              {/* General Community Ethos */}
              <div className="bg-[#101015] p-5 border border-white/5 rounded-xl flex items-center gap-4">
                <BookOpen className="h-5 w-5 text-[#8a7251] shrink-0" />
                <div>
                  <strong className="text-xs font-mono text-[#8a7251] block uppercase tracking-wider">REGIONAL SOCIAL PHILOSOPHY:</strong>
                  <p className="text-xs text-stone-300 font-light mt-0.5">{culture.etiquette.socialCode}</p>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
