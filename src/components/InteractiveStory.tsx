import { useState, useEffect } from "react";
import { BookOpen, MapPin, Sparkles, VolumeX, Volume2, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InteractiveStoryProps {
  destination: string;
  landmarkName: string;
}

interface StoryState {
  storySegment: string;
  audioScript: string;
  choices: string[];
}

export default function InteractiveStory({ destination, landmarkName }: InteractiveStoryProps) {
  const [theme, setTheme] = useState("Legend and Lore");
  const [step, setStep] = useState(1);
  const [storyLogs, setStoryLogs] = useState<{ segment: string; choice?: string }[]>([]);
  const [currentStory, setCurrentStory] = useState<StoryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAudio, setShowAudio] = useState(false);

  useEffect(() => {
    // Reset and start new story whenever landmark or theme changes
    resetStory();
  }, [landmarkName, theme]);

  const resetStory = async () => {
    setStep(1);
    setStoryLogs([]);
    setCurrentStory(null);
    setError(null);
    await fetchNextStorySegment(1, "", "");
  };

  const fetchNextStorySegment = async (
    targetStep: number,
    accumulatedStory: string,
    choiceSelected: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/story/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          landmarkName,
          theme,
          step: targetStep,
          previousStory: accumulatedStory,
          selectedChoice: choiceSelected
        })
      });

      if (!response.ok) {
        throw new Error("The ancient scrolls are temporarily unreadable. Please try again.");
      }

      const data = await response.json();
      setCurrentStory(data);

      if (targetStep === 1) {
        setStoryLogs([{ segment: data.storySegment }]);
      } else {
        setStoryLogs(prev => [
          ...prev,
          { segment: data.storySegment, choice: choiceSelected }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to summon the local chronicler.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = async (selectedChoice: string) => {
    if (loading) return;
    const nextStep = step + 1;
    setStep(nextStep);

    // Build the previous story string for Gemini's context
    const fullPrevStory = storyLogs.map(log => log.segment).join("\n\n");
    await fetchNextStorySegment(nextStep, fullPrevStory, selectedChoice);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative Stamp Background */}
      <div className="absolute right-4 top-4 text-white/5 font-display text-7xl font-bold select-none pointer-events-none uppercase opacity-40">
        LORE
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono text-[#8a7251] uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <BookOpen className="h-4.5 w-4.5" /> Historical Chronicles
          </span>
          <h3 className="text-xl font-display font-bold text-white mt-1">
            Story Simulator: {landmarkName}
          </h3>
        </div>

        {/* Theme selector */}
        <div className="flex gap-2 bg-[#121216] p-1 rounded-lg border border-white/10 self-start">
          {["Legend and Lore", "A Day in the Life", "Architectural Secrets"].map(t => (
            <button
              key={t}
              onClick={() => {
                if (!loading) setTheme(t);
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all cursor-pointer whitespace-nowrap ${
                theme === t
                  ? "bg-[#8a7251] text-white shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Story Content Board */}
      <div className="bg-[#101015]/90 border border-white/5 rounded-xl p-5 md:p-6 mb-6 min-h-[220px] flex flex-col justify-between shadow-inner relative overflow-hidden">
        {/* Parchment futuristic holographic effect */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0d0d12]/20 to-transparent pointer-events-none rounded-xl" />

        {error && (
          <div className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 p-4 rounded-lg z-10 my-auto text-center">
            {error}
            <button
              onClick={resetStory}
              className="mt-2 block mx-auto text-xs underline font-medium text-red-300 cursor-pointer"
            >
              Consult the chronicler again
            </button>
          </div>
        )}

        {!error && (
          <div className="space-y-4 z-10 overflow-y-auto max-h-[350px] pr-2">
            {/* Previous chapters history */}
            {storyLogs.slice(0, -1).map((log, index) => (
              <div key={index} className="opacity-40 text-xs italic border-l-2 border-[#8a7251]/30 pl-3 py-1 space-y-1">
                {log.choice && (
                  <p className="text-[#8a7251] font-semibold font-mono">Selected: {log.choice}</p>
                )}
                <p className="text-stone-300 leading-relaxed font-serif">{log.segment}</p>
              </div>
            ))}

            {/* Current chapter */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-2 border-stone-800 border-t-[#8a7251] mb-2"
                />
                <span className="text-xs font-mono text-stone-500 italic">Unrolling the digital scrolls...</span>
              </div>
            ) : (
              currentStory && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Selected previous choice badge */}
                  {storyLogs.length > 1 && storyLogs[storyLogs.length - 1].choice && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#8a7251]/10 text-[#8a7251] border border-[#8a7251]/20">
                      <Sparkles className="h-3 w-3 animate-pulse" /> Step {step}: {storyLogs[storyLogs.length - 1].choice}
                    </span>
                  )}
                  
                  {/* The actual paragraph */}
                  <p className="text-stone-200 font-serif leading-relaxed text-base md:text-lg">
                    {currentStory.storySegment}
                  </p>

                  {/* Audio Narrator Script Draft */}
                  <div className="border border-white/5 rounded-lg p-3.5 bg-black/40 flex flex-col gap-2">
                    <button
                      onClick={() => setShowAudio(!showAudio)}
                      className="text-xs font-mono font-semibold text-[#8a7251] hover:text-[#705c41] flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      {showAudio ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5" /> Hide Voiceover Concept
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 animate-pulse" /> Show Voiceover Concept
                        </>
                      )}
                    </button>
                    {showAudio && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-stone-400 italic bg-black/60 p-2.5 rounded border border-white/5 leading-relaxed font-sans"
                      >
                        🎙️ <strong>Spoken Voiceover:</strong> {currentStory.audioScript}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>

      {/* Choices panel */}
      <AnimatePresence>
        {!loading && !error && currentStory && currentStory.choices && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <span className="text-xs font-mono text-stone-400 uppercase tracking-widest block mb-2 font-bold">
              Choose your path:
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {currentStory.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectChoice(choice)}
                  className="group w-full text-left p-3.5 border border-white/10 hover:border-purple-500 hover:bg-purple-950/10 rounded-xl transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer bg-[#121216]/60 backdrop-blur-md"
                >
                  <div className="flex gap-3 items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:text-white text-xs font-mono text-stone-300 transition-all">
                      {index + 1}
                    </span>
                    <span className="text-sm font-sans font-medium text-stone-200 group-hover:text-white leading-tight transition-colors">
                      {choice}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
            
            <div className="flex justify-end mt-4 pt-2">
              <button
                onClick={resetStory}
                className="text-xs font-mono text-stone-500 hover:text-stone-300 transition-colors cursor-pointer flex items-center gap-1 underline"
              >
                <RotateCcw className="h-3 w-3" /> Restart chronicle from beginning
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
