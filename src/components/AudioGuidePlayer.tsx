import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface AudioGuidePlayerProps {
  draft: string;
  landmarkName: string;
  narratorName: string;
}

export default function AudioGuidePlayer({ draft, landmarkName, narratorName }: AudioGuidePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSupported(true);
    }
    // Split draft into words for active highlight tracking
    setWords(draft.split(/\s+/));
    return () => {
      stopPlayback();
    };
  }, [draft]);

  const startPlayback = () => {
    if (!draft) return;
    setIsPlaying(true);

    if (speechSupported && window.speechSynthesis) {
      // Cancel any current speaking
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(draft);
      utteranceRef.current = utterance;

      // Try to find a warm, natural local or standard English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredKeywords = ["google", "natural", "local", "en-GB", "en-IN", "en-US"];
      let selectedVoice = voices[0];

      for (const kw of preferredKeywords) {
        const found = voices.find(v => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw));
        if (found) {
          selectedVoice = found;
          break;
        }
      }
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.95; // Slightly slower, more immersive story pacing
      utterance.pitch = 1.0;

      // Track active word speaking if supported
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const textUpToBoundary = event.utterance.text.substring(0, event.charIndex);
          const wordCount = textUpToBoundary.trim().split(/\s+/).length;
          setCurrentWordIndex(wordCount);
          setProgress((event.charIndex / draft.length) * 100);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentWordIndex(-1);
        clearInterval(progressInterval.current);
      };

      utterance.onerror = () => {
        // Fall back to typewriter simulation
        simulateSpeech();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Simulation mode
      simulateSpeech();
    }
  };

  const simulateSpeech = () => {
    let charIdx = 0;
    const totalChars = draft.length;
    setProgress(0);
    clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      charIdx += 6; // simulate reading 6 chars per tick
      if (charIdx >= totalChars) {
        setIsPlaying(false);
        setProgress(100);
        setCurrentWordIndex(-1);
        clearInterval(progressInterval.current);
      } else {
        const wordCount = draft.substring(0, charIdx).trim().split(/\s+/).length;
        setCurrentWordIndex(wordCount - 1);
        setProgress((charIdx / totalChars) * 100);
      }
    }, 100);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    clearInterval(progressInterval.current);
    if (speechSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleReset = () => {
    stopPlayback();
    setProgress(0);
    setCurrentWordIndex(-1);
  };

  return (
    <div id="audio-guide-player" className="glass-panel-neon-purple rounded-xl p-5 shadow-2xl border border-[#8b5cf6]/20 bg-[#121218]/90">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block font-bold">Acoustic Field Guide</span>
          <h4 className="text-sm font-display font-bold text-white mt-0.5">{landmarkName} Walk</h4>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#8a7251]" />
          <span className="text-xs font-mono text-stone-300">Guide: {narratorName}</span>
        </div>
      </div>

      {/* Futuristic Tape / Wave Visualizer Card */}
      <div className="bg-[#09090b] border border-white/5 rounded-lg p-4 mb-4 flex flex-col items-center relative overflow-hidden h-28 justify-center">
        {/* Neon wave simulation */}
        <div className="absolute inset-0 opacity-20 flex justify-around items-end px-4 py-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-[#8b5cf6] rounded-full"
              animate={{
                height: isPlaying ? [15, 75, 25, 90, 20, 50, 30][i % 7] : 5
              }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.04
              }}
            />
          ))}
        </div>

        {/* Tape Reels with neon shadows */}
        <div className="flex gap-10 z-10">
          <motion.div 
            className="w-10 h-10 rounded-full border border-dashed border-[#8b5cf6]/40 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.15)]"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-4 h-4 rounded-full bg-[#121218] border border-[#8b5cf6]/30" />
          </motion.div>
          <motion.div 
            className="w-10 h-10 rounded-full border border-dashed border-[#8b5cf6]/40 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.15)]"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-4 h-4 rounded-full bg-[#121218] border border-[#8b5cf6]/30" />
          </motion.div>
        </div>

        <span className="text-[9px] font-mono text-[#8a7251] mt-2.5 tracking-widest z-10 font-bold uppercase">
          {isPlaying ? "COGNITIVE NARRATIVE DECK ACTIVE" : "DECK STANDBY"}
        </span>
      </div>

      {/* Controls & Progress */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          id="btn-toggle-play"
          className="w-10 h-10 rounded-full bg-[#8a7251] hover:bg-[#735e42] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
        </button>

        <button
          onClick={handleReset}
          id="btn-reset-play"
          className="w-8 h-8 rounded-full border border-white/10 hover:bg-white/5 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          title="Restart Playback"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="h-1.5 w-full bg-[#1e1e24] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#8a7251] to-purple-500" 
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Scrolling subtitles */}
      <div className="bg-[#09090c] border border-white/5 rounded-lg p-3 max-h-36 overflow-y-auto text-sm leading-relaxed">
        <p className="select-none text-stone-300">
          {words.map((word, idx) => {
            const isHighlighted = idx <= currentWordIndex;
            return (
              <span
                key={idx}
                className={`transition-colors duration-200 mr-1 inline-block ${
                  isHighlighted ? "text-[#8a7251] font-bold underline decoration-purple-500" : "text-stone-500 font-light"
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
      
      {!speechSupported && (
        <p className="text-[10px] text-stone-500 italic mt-2.5 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 inline" /> 
          Audio simulated using mechanical pacing due to preview constraints.
        </p>
      )}
    </div>
  );
}
