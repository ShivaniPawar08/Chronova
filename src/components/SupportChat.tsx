import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Send, RefreshCw, Heart, AlertTriangle, Mic, Square, Volume2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

interface SupportChatProps {
  userEmail: string; // This prop contains the current logged-in username
}

const PRESET_PROMPTS = [
  "i am unable to focus or do tasks",
  "I feel tired and want to snooze",
  "Insta reels are highly addictive today",
  "I have absolutely zero motivation"
];

// Curated simulated voice note queries for reliable accessibility in sandbox environments
const VOICE_SIMULATION_QUERIES = [
  { label: "Simulate: 'What are my pending tasks?'", query: "What are my pending tasks?" },
  { label: "Simulate: 'How is my level and streak?'", query: "What is my current streak and level?" },
  { label: "Simulate: 'Explain what is Chronova and its recovery option.'", query: "Tell me what Chronova is and how schedule recovery works." },
  { label: "Simulate: 'Give me a motivation roast'", query: "Give me an aggressive motivation roast to help me focus!" }
];

export default function SupportChat({ userEmail }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chronova_megan_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: "Hey there! I am Megan, your Empathetic AI Companion. I am always here for you to support you through your struggles and celebrate your wins. As your Chronova partner, I care about your progress deeply, which is why I refuse to let you slack off. You can ask me anything about your active goals, pending tasks, levels, streaks, or general website features. Feel free to type or send a voice note!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Persist chat history on message change
  useEffect(() => {
    localStorage.setItem("chronova_megan_chat", JSON.stringify(messages));
  }, [messages]);

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          handleSendVoice(base64Audio);
        };
        // Close stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("Microphone access could not be acquired. Please ensure permissions are allowed or use our 'Simulate Voice Query' helper below!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleSendVoice = async (base64Audio: string) => {
    setLoading(true);
    const userMsg: Message = {
      id: "user_voice_" + Date.now(),
      sender: "user",
      text: "Sent a voice note request",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": userEmail
        },
        body: JSON.stringify({ 
          audio: base64Audio,
          mimeType: "audio/webm"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: "bot_" + Date.now(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      console.error("Support chat audio error:", err);
      const errMsg: Message = {
        id: "err_" + Date.now(),
        sender: "bot",
        text: "Audio transcription failed or server is temporarily busy. But I heard you slacking off! Put down your distractions and focus on your active goals now!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Triggers simulated voice query
  const handleSimulateVoiceQuery = async (queryText: string) => {
    if (loading) return;
    setLoading(true);

    const userMsg: Message = {
      id: "user_sim_" + Date.now(),
      sender: "user",
      text: `Simulated Voice Note: "${queryText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": userEmail
        },
        body: JSON.stringify({ message: queryText })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: "bot_" + Date.now(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      console.error("Support chat simulated voice error:", err);
      const errMsg: Message = {
        id: "err_" + Date.now(),
        sender: "bot",
        text: "Connection error. Put down your phone, take a deep breath, and check off your active goals. You've got this!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: "user_" + Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": userEmail
        },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: "bot_" + Date.now(),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      console.error("Support chat error:", err);
      const errMsg: Message = {
        id: "err_" + Date.now(),
        sender: "bot",
        text: "Uh oh! Zoom! My servers are overwhelmed by your massive delay risk. But jokes aside: Put down your phone, close your eyes for 30 seconds, and start working. You don't need a server to tell you your dreams are on backorder!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const initial = [
      {
        id: "welcome",
        sender: "bot",
        text: "Hey there! I am Megan, your Empathetic AI Companion. I am always here for you to support you through your struggles and celebrate your wins. As your Chronova partner, I care about your progress deeply, which is why I refuse to let you slack off. You can ask me anything about your active goals, pending tasks, levels, streaks, or general website features. Feel free to type or send a voice note!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    localStorage.setItem("chronova_megan_chat", JSON.stringify(initial));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white border border-pink-100 rounded-3xl overflow-hidden flex flex-col h-[580px] shadow-sm relative">
      {/* Decorative colored glow bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-600" />

      {/* Header */}
      <div className="bg-white p-4 border-b border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center animate-pulse border border-pink-100">
            <Heart className="w-5 h-5 fill-pink-500/10" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              Your Megan
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">Empathetic AI Companion</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs text-pink-600 hover:text-white hover:bg-pink-600 transition-all bg-pink-50 px-2 py-1.5 rounded-lg border border-pink-200 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} max-w-[85%] ${
              msg.sender === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                msg.sender === "user"
                  ? "bg-pink-600 border border-pink-500 text-white rounded-br-none"
                  : "bg-white border border-pink-100 text-slate-800 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.isVoice && <Volume2 className="w-4 h-4 inline-block mr-1.5 text-pink-500 animate-bounce" />}
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 p-3 bg-pink-50/30 border border-pink-100 rounded-2xl w-fit mr-auto">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-75" />
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-150" />
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-300" />
            <span className="text-[10px] text-slate-500 font-mono ml-1">AI Coach is listening and formulating...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Preset Fast Text Prompts */}
      <div className="p-3 bg-pink-50/30 border-t border-pink-100 space-y-1.5">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Preset Excuses:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!loading) {
                  setInputVal(prompt);
                  handleSendMessage(prompt);
                }
              }}
              disabled={loading}
              className="text-[10px] bg-white hover:bg-pink-50 border border-pink-100 text-slate-700 px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Voice Notes Dropdown */}
      <div className="px-3 pb-3 pt-1.5 bg-pink-50/30 border-b border-pink-100 space-y-1.5">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Sandbox Voice Simulator:</span>
        <div className="flex flex-wrap gap-1.5">
          {VOICE_SIMULATION_QUERIES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateVoiceQuery(item.query)}
              disabled={loading}
              className="text-[10px] bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Tray with Microphone Support */}
      <div className="p-3 bg-white border-t border-pink-100 space-y-2">
        {isRecording && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 p-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[11px] font-mono font-bold text-red-700">
                Recording Audio ({formatTime(recordingSeconds)})
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-white" /> Stop & Send Note
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="flex gap-2 items-center"
        >
          {/* Real Audio Record Button */}
          {!isRecording && (
            <button
              type="button"
              onClick={startRecording}
              disabled={loading}
              title="Record Voice Note"
              className="w-9 h-9 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-40"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
            }}
            placeholder={isRecording ? "Listening..." : "Ask me anything about your tasks, streak, or levels..."}
            disabled={loading || isRecording}
            className="flex-1 bg-pink-50/20 border border-pink-100 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-sans disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || loading || isRecording}
            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
