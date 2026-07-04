import React, { useState, useEffect, useRef } from "react";
import { Sun, CloudRain, CloudSnow, SunMoon, Sparkles, Navigation, CloudLightning, Eye, Wind, Droplets, Thermometer, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImmersivePlaceViewerProps {
  city: string;
}

// Custom storytelling statements depending on selected atmospheric combos
const ATMOSPHERE_STORY: Record<string, Record<string, Record<string, string>>> = {
  Tokyo: {
    noon: {
      sunny: "High noon rays reflect off the steel peaks of Shinjuku. The sky is crystal blue as thousands scramble across Shibuya crossing in perfect mechanical synchronicity.",
      rainy: "Rain droplets create slick mirrors on the asphalt. Thousands of transparent umbrellas unfurl at once, matching the neon flashing signs reflecting on the wet streets."
    },
    sunset: {
      sunny: "Mount Fuji emerges as a sharp indigo silhouette against a burning copper horizon. Shinto temple arches cast deep red shadows as lanterns flicker on.",
      rainy: "The violet dusk is punctuated by yellow train lights slicing through the light Tokyo mist. Streamers of steam rise from traditional basement ramen bars."
    },
    night: {
      sunny: "A cool electric night. The city's digital billboards paint the dark sky in blue, green, and pink hues. Bullet trains slice through elevated highways like streaks of light.",
      rainy: "Laser-sharp reflections on the streets of Akihabara. Drops of rain scatter the light of a million LED panels, turning the metropolis into a digital neon dreamscape."
    }
  },
  Cairo: {
    noon: {
      sunny: "Blinding white light douses the ancient Giza sands. The desert air ripples with heat, refracting the colossal limestone blocks of the Great Pyramid of Khufu.",
      rainy: "A rare desert downpour settles the dust. The ancient stones of Cairo shine with moisture, catching a brilliant cool breeze sweeping from the Mediterranean."
    },
    sunset: {
      sunny: "The sky morphs into a spectacular crimson and gold. Minarets cast long slender needles of shadow across the Nile, as local wooden feluccas unfurl their white sails.",
      rainy: "A purple haze descends over the Citadel. Rain clouds carry orange rays from the distant Sahara, creating a mystical double rainbow over the Old Cairo skyline."
    },
    night: {
      sunny: "A cool breeze replaces the heavy desert heat. Stars emerge in infinite clarity above the dark pyramid triangular shadows. Fire torches guide local camel guides back to camp.",
      rainy: "Thunder rumbles over the Nile. Flash lightning illuminates the colossal Sphinx face, casting long shadows across the ancient tomb complexes."
    }
  },
  Jaipur: {
    noon: {
      sunny: "The sun strikes the pink sandstones of Hawa Mahal, turning the facade into a glowing palace of rose-quartz. Locals seek shade in temple arcades, sipping cardamom lassi.",
      rainy: "A warm monsoon rain washes the terracotta streets. The city scent of wet soil ('Sondhi mitti') mixes with street vendors frying hot spicy onion kachoris."
    },
    sunset: {
      sunny: "A golden dust storm filters the orange sun rays, draping the Amber fort hills in a majestic imperial haze. Folk singers pluck sarangis on high balcony towers.",
      rainy: "Monsoon clouds are dyed in shades of soft pink and crimson. Water cascades down the hills of Jaigarh Fort, feeding the palace lily pools below."
    },
    night: {
      sunny: "A pitch-black sky framed by thousands of yellow lights illuminating Nahargarh Fort. Cool desert wind sweeps across palace rooftops under a crescent moon.",
      rainy: "Lightning flashes behind the Hawa Mahal, illuminating its 953 windows like a glowing hive of red fireflies."
    }
  },
  Rome: {
    noon: {
      sunny: "Sunlight floods the open 9-meter oculus of the Pantheon, casting a massive circular beam of pure light onto the polished yellow marble floor below.",
      rainy: "Rain pours through the open dome of the Pantheon, hitting the ancient draining holes. The sound of water echoing inside the concrete dome is deeply spiritual."
    },
    sunset: {
      sunny: "The Roman sky turns to a warm apricot hue. Travertine marble arches of the Colosseum cast long columns of shadow as tourists toss coins into the Trevi fountain.",
      rainy: "Slick cobblestone alleys of Trastevere reflect the warm amber lamps. Droplets of rain fall into outdoor wine glasses as couples laugh under canvas awnings."
    },
    night: {
      sunny: "The ruins of the Roman Forum are bathed in dramatic yellow spotlights. Stars hang low over the Tiber river, as acoustic guitar melodies drift from bridge arches.",
      rainy: "Mist rolls over the Roman bridges. The reflecting lights of St. Peter's Basilica dome cast shimmering gold ripples across the dark Tiber river water."
    }
  },
  "Rio de Janeiro": {
    noon: {
      sunny: "Dazzling turquoise waves crash on Copacabana beach. The golden sun shines directly onto the Christ statue atop Corcovado mountain, framing it in a solar crown.",
      rainy: "A tropical rain storm sweeps across the Atlantic. Clouds hug the sheer granite face of Sugarloaf Mountain as rainforest canopy leaves rustle with wind."
    },
    sunset: {
      sunny: "The sun slips behind the dramatic peaks of Two Brothers. The sky is painted in wild shades of pink, orange, and purple as crowds applaud the sunset at Arpoador.",
      rainy: "Rain clouds scatter the final sun rays into a brilliant orange mist. The wet sands of Ipanema shine like polished steel under the glowing storm clouds."
    },
    night: {
      sunny: "The favela hills are illuminated by a million tiny twinkling amber lights, looking like a cascade of gold dust. Samba rhythms drift from Lapa's crowded bars.",
      rainy: "A warm tropical drizzle. The wet streets of Lapa reflect the red arches and yellow tram lines, while bass drums echo through the misty ocean air."
    }
  }
};

export default function ImmersivePlaceViewer({ city }: ImmersivePlaceViewerProps) {
  const [timeOfDay, setTimeOfDay] = useState<"noon" | "sunset" | "night">("sunset");
  const [weather, setWeather] = useState<"sunny" | "rainy" | "snowy">("sunny");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-Time weather states
  const [realTimeWeather, setRealTimeWeather] = useState<{
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    isDay: number;
    weatherCode: number;
    windSpeed: number;
    unit: string;
    city: string;
    country: string;
  } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Map weather code to our simpler simulator options
  const mapCodeToWeatherType = (code: number): "sunny" | "rainy" | "snowy" => {
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "rainy";
    return "sunny";
  };

  // Map isDay status to simulation time of day
  const mapIsDayToTime = (isDay: number): "noon" | "sunset" | "night" => {
    return isDay === 1 ? "noon" : "night";
  };

  // Get human friendly weather status & icon
  const getWeatherDescription = (code: number): { label: string; icon: any } => {
    switch (code) {
      case 0: return { label: "Clear Sky", icon: Sun };
      case 1:
      case 2:
      case 3: return { label: "Partly Cloudy", icon: SunMoon };
      case 45:
      case 48: return { label: "Foggy Mist", icon: SunMoon };
      case 51:
      case 53:
      case 55: return { label: "Drizzling Rain", icon: CloudRain };
      case 56:
      case 57: return { label: "Freezing Drizzle", icon: CloudRain };
      case 61:
      case 63:
      case 65: return { label: "Heavy Rain", icon: CloudRain };
      case 66:
      case 67: return { label: "Freezing Rain", icon: CloudRain };
      case 71:
      case 73:
      case 75: return { label: "Snowfall", icon: CloudSnow };
      case 77: return { label: "Snow Grains", icon: CloudSnow };
      case 80:
      case 81:
      case 82: return { label: "Rain Showers", icon: CloudRain };
      case 85:
      case 86: return { label: "Snow Showers", icon: CloudSnow };
      case 95:
      case 96:
      case 99: return { label: "Thunderstorm", icon: CloudLightning };
      default: return { label: "Unknown Conditions", icon: Sparkles };
    }
  };

  // Fetch real-time weather from our server endpoint
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      setWeatherError(null);
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (!res.ok) {
          throw new Error("Failed to load real-time atmosphere telemetry.");
        }
        const data = await res.json();
        setRealTimeWeather(data);

        // Sync local simulation properties to real-world status on load
        setWeather(mapCodeToWeatherType(data.weatherCode));
        setTimeOfDay(mapIsDayToTime(data.isDay));
      } catch (err: any) {
        console.error("Error loading weather telemetry:", err);
        setWeatherError(err.message || "Failed to load live weather.");
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [city]);

  // Fallback defaults for missing combos
  const currentStory = ATMOSPHERE_STORY[city]?.[timeOfDay]?.[weather === "sunny" ? "sunny" : "rainy"] 
    || ATMOSPHERE_STORY["Tokyo"]["sunset"]["sunny"];

  // Custom visual background gradients depending on time of day
  const skyGradients = {
    noon: "from-sky-500 via-cyan-400 to-sky-600",
    sunset: "from-amber-600 via-orange-500 to-indigo-900",
    night: "from-[#050510] via-[#0b0c20] to-[#010103]"
  };

  // Weather overlay rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Set up particles
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      length: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const count = weather === "rainy" ? 60 : weather === "snowy" ? 50 : 15; // clouds or stars instead

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: weather === "rainy" ? 4 + Math.random() * 5 : 0.8 + Math.random() * 1.5,
        speedX: weather === "rainy" ? -0.5 : -0.2 + Math.random() * 0.4,
        length: weather === "rainy" ? 10 + Math.random() * 15 : 2 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.6
      });
    }

    // Bird particles flying in the sky
    interface Bird {
      x: number;
      y: number;
      speedX: number;
      phase: number;
    }
    const birds: Bird[] = Array.from({ length: 4 }).map(() => ({
      x: Math.random() * width,
      y: 50 + Math.random() * 60,
      speedX: 0.5 + Math.random() * 0.8,
      phase: Math.random() * Math.PI
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Weather Effects
      if (weather === "rainy") {
        ctx.strokeStyle = "rgba(174, 219, 240, 0.4)";
        ctx.lineWidth = 1;
        particles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
      } else if (weather === "snowy") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length * 0.5, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else {
        // Draw subtle floating clouds or dust
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 40 + p.length * 5, 0, Math.PI * 2);
          ctx.fill();

          p.x += 0.15;
          if (p.x > width + 100) {
            p.x = -100;
          }
        });
      }

      // 2. Draw Birds Flying
      ctx.strokeStyle = timeOfDay === "night" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1.2;
      birds.forEach(b => {
        b.x += b.speedX;
        b.phase += 0.12;
        if (b.x > width + 20) {
          b.x = -20;
          b.y = 50 + Math.random() * 60;
        }

        // Simulating wing flap using cosine
        const wingOffset = Math.cos(b.phase) * 3;
        
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + wingOffset);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(b.x + 4, b.y + wingOffset);
        ctx.stroke();
      });

      // 3. Draw Water Reflections (Simulating river or waves in lower bound)
      const waterY = height - 40;
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, waterY, width, 40);

      ctx.strokeStyle = timeOfDay === "noon" 
        ? "rgba(6, 182, 212, 0.12)" 
        : timeOfDay === "sunset" 
          ? "rgba(249, 115, 22, 0.12)" 
          : "rgba(139, 92, 246, 0.1)";
      ctx.lineWidth = 1.5;
      
      const waveOffset = Date.now() * 0.002;
      for (let y = waterY + 4; y < height; y += 8) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const wave = Math.sin(x * 0.05 + waveOffset + y) * 2;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [weather, timeOfDay]);

  return (
    <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:h-[450px]">
      
      {/* Immersive Window Sky View */}
      <div className={`flex-1 relative bg-gradient-to-b ${skyGradients[timeOfDay]} transition-all duration-1000 p-6 flex flex-col justify-between overflow-hidden`}>
        
        {/* Sky glow artifacts */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-white/5 via-transparent to-transparent opacity-60 mix-blend-overlay" />
        
        {/* Dynamic celestial bodies */}
        <AnimatePresence mode="wait">
          {timeOfDay === "noon" && (
            <motion.div 
              key="sun"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-10 right-16 w-14 h-14 rounded-full bg-amber-100 shadow-[0_0_50px_rgba(255,255,200,0.8)] border border-amber-200 pointer-events-none"
            />
          )}
          {timeOfDay === "sunset" && (
            <motion.div 
              key="sunset"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 30 }}
              exit={{ opacity: 0, y: -80 }}
              className="absolute top-14 right-20 w-16 h-16 rounded-full bg-gradient-to-b from-orange-400 to-red-600 shadow-[0_0_60px_rgba(249,115,22,0.9)] pointer-events-none"
            />
          )}
          {timeOfDay === "night" && (
            <motion.div 
              key="moon"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="absolute top-8 right-16 w-10 h-10 rounded-full bg-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.3)] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Rain Fog Density Screen overlay */}
        {weather === "rainy" && (
          <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[0.5px] pointer-events-none" />
        )}

        {/* Floating Real-Time Weather HUD Card */}
        <div className="absolute top-16 left-6 z-30 bg-black/75 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-64 text-xs font-mono space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">LIVE TELEMETRY</span>
            </div>
            <span className="text-[8px] text-stone-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              {realTimeWeather ? "SYNCED" : "PULSING"}
            </span>
          </div>

          {loadingWeather ? (
            <div className="py-2 flex items-center gap-2 text-stone-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-stone-600 border-t-white rounded-full"
              />
              <span className="text-[10px]">Interrogating satellites...</span>
            </div>
          ) : weatherError ? (
            <div className="py-1 text-red-400 text-[10px] leading-tight">
              ⚠️ sync fail: {weatherError}
            </div>
          ) : realTimeWeather ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-bold font-display text-white tracking-tight flex items-baseline leading-none">
                    {realTimeWeather.temperature}
                    <span className="text-xs text-stone-400 font-sans ml-0.5">{realTimeWeather.unit}</span>
                  </div>
                  <div className="text-[10px] text-[#8a7251] font-bold uppercase mt-1 leading-none">
                    {getWeatherDescription(realTimeWeather.weatherCode).label}
                  </div>
                </div>
                {/* Dynamic Weather Icon */}
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0">
                  {(() => {
                    const WeatherIcon = getWeatherDescription(realTimeWeather.weatherCode).icon;
                    return <WeatherIcon className="h-5 w-5 text-amber-400 animate-pulse" />;
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-white/5 pt-2 text-[9px] text-stone-300">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-stone-500 shrink-0" />
                  <div>
                    <span className="text-stone-500 block text-[7px] leading-none uppercase">APPARENT</span>
                    <span className="text-white font-bold leading-none">{realTimeWeather.apparentTemperature}{realTimeWeather.unit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-stone-500 shrink-0" />
                  <div>
                    <span className="text-stone-500 block text-[7px] leading-none uppercase">HUMIDITY</span>
                    <span className="text-white font-bold leading-none">{realTimeWeather.humidity}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <Wind className="h-3 w-3 text-stone-500 shrink-0" />
                  <div>
                    <span className="text-stone-500 block text-[7px] leading-none uppercase">WIND SPEED</span>
                    <span className="text-white font-bold leading-none">{realTimeWeather.windSpeed} km/h • {realTimeWeather.timezone.split("/").pop()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (realTimeWeather) {
                      setWeather(mapCodeToWeatherType(realTimeWeather.weatherCode));
                      setTimeOfDay(mapIsDayToTime(realTimeWeather.isDay));
                    }
                  }}
                  className="text-[8px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider"
                  title="Resynchronize projection with current coordinates weather"
                >
                  <RefreshCw className="h-2.5 w-2.5" /> Reset Proj Sync
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Dynamic canvas element for rain, snow, birds, waves */}
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Absolute Header */}
        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Eye className="h-4 w-4 text-[#8a7251] animate-pulse" />
            <span className="text-[10px] font-mono text-stone-300 tracking-widest font-bold">ATMOSPHERIC PARALLAX PROJECTION</span>
          </div>

          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 uppercase font-bold">
            TIME LOCK: {timeOfDay}
          </span>
        </div>

        {/* Storytelling Text Overlay - responsive text block */}
        <div className="relative z-20 bg-black/65 border border-white/10 p-5 rounded-xl backdrop-blur-md max-w-xl self-start mt-12 md:mt-auto shadow-2xl space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">AI HISTORICAL LORE OVERLAY</span>
          </div>
          <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-light">
            {currentStory}
          </p>
        </div>

      </div>

      {/* Atmospheric Environment control console panel */}
      <div className="bg-[#101015] border-t border-white/10 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-35">
        
        {/* Time sliders */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-stone-400 font-bold uppercase tracking-wider block">CHRONOLOGICAL POSITION</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "noon", label: "Noon", desc: "12:00 PM" },
              { id: "sunset", label: "Sunset", desc: "06:30 PM" },
              { id: "night", label: "Midnight", desc: "12:00 AM" }
            ].map(time => (
              <button
                key={time.id}
                onClick={() => setTimeOfDay(time.id as any)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  timeOfDay === time.id
                    ? "bg-[#8a7251] border-amber-900/60 text-white shadow-lg"
                    : "bg-[#121216] border-white/5 text-stone-400 hover:border-white/10 hover:text-stone-200"
                }`}
              >
                <div className="text-xs font-bold leading-none">{time.label}</div>
                <div className="text-[9px] font-mono mt-1 opacity-70">{time.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weather switches */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-stone-400 font-bold uppercase tracking-wider block">METEOROLOGICAL SIMULATION</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "sunny", label: "Sunny", icon: Sun },
              { id: "rainy", label: "Rainy", icon: CloudRain },
              { id: "snowy", label: "Snowy", icon: CloudSnow }
            ].map(w => {
              const Icon = w.icon;
              return (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id as any)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    weather === w.id
                      ? "bg-[#8a7251] border-amber-900/60 text-white shadow-lg"
                      : "bg-[#121216] border-white/5 text-stone-400 hover:border-white/10 hover:text-stone-200"
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <div className="text-xs font-bold mt-2 leading-none">{w.label}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
