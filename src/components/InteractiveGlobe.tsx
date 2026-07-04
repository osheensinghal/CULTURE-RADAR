import React, { useEffect, useRef, useState } from "react";
import { Compass, Globe, Navigation, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

interface GlobeMarker {
  city: string;
  lat: number;  // -90 to 90
  lon: number;  // -180 to 180
  color: string;
  emoji: string;
}

const MARKERS: GlobeMarker[] = [
  { city: "Tokyo", lat: 35.6762, lon: 139.6503, color: "#a855f7", emoji: "🗼" }, // Purple
  { city: "Cairo", lat: 30.0444, lon: 31.2357, color: "#f97316", emoji: "🕌" }, // Orange
  { city: "Jaipur", lat: 26.9124, lon: 75.7873, color: "#ec4899", emoji: "🏛️" }, // Pink
  { city: "Rome", lat: 41.9028, lon: 12.4964, color: "#3b82f6", emoji: "🏟️" }, // Blue
  { city: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, color: "#10b981", emoji: "🌴" } // Emerald
];

interface InteractiveGlobeProps {
  activeCity: string;
  onSelectCity: (city: string) => void;
}

export default function InteractiveGlobe({ activeCity, onSelectCity }: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showSatellite, setShowSatellite] = useState(true);
  const [isNight, setIsNight] = useState(true);

  // Auto-rotation effect
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotation(prev => ({
        ...prev,
        y: prev.y + 0.005
      }));
    }, 30);
    return () => clearInterval(interval);
  }, [isDragging]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) * 0.38;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw space stars/background
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric star dust
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 1234.5) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 5432.1) * 0.5 + 0.5) * height;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Draw glow behind the sphere
      const radGlow = ctx.createRadialGradient(
        width / 2, height / 2, radius * 0.8,
        width / 2, height / 2, radius * 1.2
      );
      if (isNight) {
        radGlow.addColorStop(0, "rgba(8, 6, 24, 0.4)");
        radGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.15)");
        radGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
      } else {
        radGlow.addColorStop(0, "rgba(12, 15, 30, 0.4)");
        radGlow.addColorStop(0.5, "rgba(249, 115, 22, 0.15)");
        radGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
      }
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Globe base sphere
      const sphereGrad = ctx.createRadialGradient(
        width / 2 - radius * 0.3, height / 2 - radius * 0.3, radius * 0.1,
        width / 2, height / 2, radius
      );
      if (isNight) {
        sphereGrad.addColorStop(0, "#090d1e");
        sphereGrad.addColorStop(0.8, "#020409");
        sphereGrad.addColorStop(1, "#010204");
      } else {
        sphereGrad.addColorStop(0, "#111b30");
        sphereGrad.addColorStop(0.8, "#060914");
        sphereGrad.addColorStop(1, "#020306");
      }
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw shiny rim edge
      ctx.strokeStyle = isNight ? "rgba(139, 92, 246, 0.35)" : "rgba(249, 115, 22, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Draw Latitudes & Longitudes (Wireframe globe grid)
      ctx.lineWidth = 0.5;
      const gridColor = isNight ? "rgba(139, 92, 246, 0.08)" : "rgba(6, 182, 212, 0.08)";
      ctx.strokeStyle = gridColor;

      // Draw Latitude rings
      for (let lat = -75; lat <= 75; lat += 15) {
        const phi = (lat * Math.PI) / 180;
        const ringRadius = radius * Math.cos(phi);
        const yOffset = radius * Math.sin(phi);

        // Render as squashed ellipses representing 3D projection
        ctx.beginPath();
        for (let theta = 0; theta <= 360; theta += 5) {
          const rad = (theta * Math.PI) / 180;
          const x = width / 2 + ringRadius * Math.sin(rad + rotation.y);
          const z = ringRadius * Math.cos(rad + rotation.y);
          if (z > 0) { // Only draw front hemisphere
            if (theta === 0) ctx.moveTo(x, height / 2 - yOffset);
            else ctx.lineTo(x, height / 2 - yOffset);
          }
        }
        ctx.stroke();
      }

      // Draw Longitude rings
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 2) {
          const phi = (lat * Math.PI) / 180;
          const lam = ((lon + rotation.y * (180 / Math.PI)) * Math.PI) / 180;
          const x = width / 2 + radius * Math.cos(phi) * Math.sin(lam);
          const y = height / 2 - radius * Math.sin(phi);
          const z = radius * Math.cos(phi) * Math.cos(lam);

          if (z > 0) {
            if (lat === -90) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 5. Draw Flight Routes / Connections
      // Draw dynamic arcs from the active city to other cities
      const activeObj = MARKERS.find(m => m.city === activeCity);
      if (activeObj) {
        MARKERS.forEach(other => {
          if (other.city === activeObj.city) return;

          // Convert lat/lon of active and other to 3D coords
          const get3D = (marker: GlobeMarker) => {
            const phi = (marker.lat * Math.PI) / 180;
            const lam = ((marker.lon + rotation.y * (180 / Math.PI)) * Math.PI) / 180;
            const x = width / 2 + radius * Math.cos(phi) * Math.sin(lam);
            const y = height / 2 - radius * Math.sin(phi);
            const z = radius * Math.cos(phi) * Math.cos(lam);
            return { x, y, z };
          };

          const p1 = get3D(activeObj);
          const p2 = get3D(other);

          // Only draw if both are somewhat in the front side
          if (p1.z > -20 && p2.z > -20) {
            // Draw smooth bezier curve between coordinates
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - radius * 0.25; // arch upward

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            
            const routeGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            routeGrad.addColorStop(0, "rgba(139, 92, 246, 0.4)");
            routeGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.5)");
            routeGrad.addColorStop(1, "rgba(16, 185, 129, 0.4)");
            ctx.strokeStyle = routeGrad;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Animated airplane/photon particle flying along the route
            const time = (Date.now() % 3000) / 3000;
            // Quadratic bezier formula
            const px = (1 - time) * (1 - time) * p1.x + 2 * (1 - time) * time * midX + time * time * p2.x;
            const py = (1 - time) * (1 - time) * p1.y + 2 * (1 - time) * time * midY + time * time * p2.y;

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#06b6d4";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
          }
        });
      }

      // 6. Draw City Markers
      MARKERS.forEach(marker => {
        const phi = (marker.lat * Math.PI) / 180;
        const lam = ((marker.lon + rotation.y * (180 / Math.PI)) * Math.PI) / 180;
        const x = width / 2 + radius * Math.cos(phi) * Math.sin(lam);
        const y = height / 2 - radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.cos(lam);

        // Only render markers on the front of the globe
        if (z > 0) {
          const isActive = marker.city === activeCity;
          const isHovered = marker.city === hoveredCity;

          // Glowing aura pulse
          const pulse = (Math.sin(Date.now() / 250) + 1.2) * 4;
          ctx.beginPath();
          ctx.arc(x, y, (isActive ? 8 : 4) + pulse * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? "rgba(139, 92, 246, 0.2)" : "rgba(6, 182, 212, 0.15)";
          ctx.fill();

          // Core point
          ctx.beginPath();
          ctx.arc(x, y, isActive ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = marker.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text label
          ctx.fillStyle = isActive ? "#fff" : "rgba(255,255,255,0.75)";
          ctx.font = isActive 
            ? "bold 11px var(--font-mono)" 
            : "10px var(--font-mono)";
          ctx.textAlign = "center";
          
          // Background bubble for label if hovered or active
          if (isActive || isHovered) {
            ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
            const textWidth = ctx.measureText(marker.city).width;
            ctx.fillRect(x - textWidth / 2 - 6, y - 24, textWidth + 12, 14);
            ctx.strokeStyle = marker.color;
            ctx.strokeRect(x - textWidth / 2 - 6, y - 24, textWidth + 12, 14);
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(marker.emoji + " " + marker.city, x, y - 13);
          } else {
            ctx.fillText(marker.city, x, y - 10);
          }
        }
      });

      // 7. Draw satellite rotating around the globe
      if (showSatellite) {
        const satTime = Date.now() * 0.0006;
        const satRadius = radius * 1.35;
        const satX = width / 2 + satRadius * Math.sin(satTime);
        const satY = height / 2 + satRadius * Math.cos(satTime) * 0.25; // tilted orbit
        const satZ = Math.cos(satTime); // used to draw over or behind

        if (satZ > 0) {
          ctx.fillStyle = "#22d3ee";
          ctx.beginPath();
          ctx.arc(satX, satY, 3, 0, Math.PI * 2);
          ctx.fill();

          // Satellite solar wings
          ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(satX - 6, satY);
          ctx.lineTo(satX + 6, satY);
          ctx.stroke();

          // Signal beam to earth
          ctx.beginPath();
          ctx.moveTo(satX, satY);
          ctx.lineTo(width / 2, height / 2);
          ctx.strokeStyle = "rgba(34, 211, 238, 0.05)";
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [rotation, hoveredCity, activeCity, showSatellite, isNight]);

  // Handle Drag / Spin Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      setRotation(prev => ({
        ...prev,
        y: prev.y + dx * 0.005
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover detection
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.38;

      let found: string | null = null;
      MARKERS.forEach(marker => {
        const phi = (marker.lat * Math.PI) / 180;
        const lam = ((marker.lon + rotation.y * (180 / Math.PI)) * Math.PI) / 180;
        const x = width / 2 + radius * Math.cos(phi) * Math.sin(lam);
        const y = height / 2 - radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.cos(lam);

        if (z > 0) {
          const dist = Math.hypot(mouseX - x, mouseY - y);
          if (dist < 15) {
            found = marker.city;
          }
        }
      });
      setHoveredCity(found);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    
    // If clicked a marker
    if (hoveredCity) {
      onSelectCity(hoveredCity);
    }
  };

  return (
    <div className="relative glass-panel rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden border border-white/10 group shadow-2xl">
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-[#8a7251] animate-spin-slow" />
          <span className="text-xs font-mono text-stone-300 tracking-wider">IMMERSIVE PLANETARY RADAR</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Day/Night Toggle */}
          <button 
            onClick={() => setIsNight(!isNight)}
            className="p-1.5 rounded-md bg-[#121216] border border-white/10 hover:border-white/20 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Night/Day Filter"
          >
            {isNight ? <Moon className="h-3.5 w-3.5 text-violet-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          </button>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/60 flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" /> LIVE TELEMETRY
          </span>
        </div>
      </div>

      {/* The interactive globe canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={320}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDragging(false); setHoveredCity(null); }}
        className="cursor-grab active:cursor-grabbing max-w-full drop-shadow-[0_0_20px_rgba(139,92,246,0.15)]"
      />

      {/* Bottom controls & overlay */}
      <div className="w-full mt-2 flex flex-col gap-2 relative z-10 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
          <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> Drag to orbit, click marker to travel</span>
          <span>SPEED: 0.95 Mach</span>
        </div>

        {/* Orbit indicator dots */}
        <div className="flex gap-2 justify-center mt-1">
          {MARKERS.map(m => (
            <button
              key={m.city}
              onClick={() => onSelectCity(m.city)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                activeCity === m.city 
                  ? "bg-[#8a7251] scale-125 shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
                  : "bg-white/10 hover:bg-white/30"
              }`}
              title={`Simulate orbit lock on ${m.city}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
