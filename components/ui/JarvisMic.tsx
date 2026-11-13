'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface JarvisMicProps {
  onSnippetGenerated: (generatedSnippet: any) => void;
}

export function JarvisMic({ onSnippetGenerated }: JarvisMicProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // 🔥 AUTO-STOP ON PAUSE: Jaise hi tu bolna band karega, ye khud stop ho jayega!
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMsg('Listening... Speak now!');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setStatusMsg(null);

      if (!transcript.trim()) {
        setStatusMsg("No voice detected.");
        setTimeout(() => setStatusMsg(null), 3000);
        return;
      }

      setIsProcessing(true);

      try {
        const res = await fetch('/api/jarvis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: transcript })
        });
        
        const data = await res.json();
        if (data.success && data.snippet) {
          onSnippetGenerated(data.snippet);
        } else {
          alert("Jarvis Core Engine could not decode command sequence.");
        }
      } catch (err) {
        console.error(err);
        alert("Network failure in Jarvis neural sync.");
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied! Allow in browser settings.");
      } else if (event.error === 'no-speech') {
        setStatusMsg("No speech detected.");
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg(`Mic error: ${event.error}`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`flex items-center justify-center p-2 sm:p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
          isListening 
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
            : 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:border-purple-500/70 hover:bg-purple-500/20 shadow-lg'
        }`}
        title={isListening ? "Listening... Speak now" : "Activate Jarvis Mode"}
        aria-label="Voice command assistant"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 sm:h-[18px] sm:w-[18px] animate-spin text-cyan-400" />
        ) : isListening ? (
          <MicOff className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        ) : (
          <Mic className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        )}
      </button>

      <AnimatePresence>
        {/* Processing State */}
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute top-14 right-0 w-48 rounded-xl border border-cyan-500/30 bg-[#0a0516]/90 p-2 text-center shadow-xl z-50"
          >
            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center justify-center gap-1">
              <Sparkles size={10} className="animate-spin" /> Synthesizing...
            </p>
          </motion.div>
        )}

        {/* Status Messages (Listening or Error) */}
        {statusMsg && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className={`absolute top-14 right-0 w-48 rounded-xl border p-2 text-center shadow-xl z-50 bg-[#0a0516]/90 ${
              isListening ? 'border-red-500/30' : 'border-amber-500/30'
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isListening ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {statusMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}