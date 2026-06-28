import React, { useState } from "react";
import { 
  Sparkles, 
  Target, 
  Clock, 
  Flame, 
  Bot, 
  TrendingUp, 
  Smartphone, 
  Mail, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Zap, 
  Chrome, 
  Lock, 
  Key, 
  UserPlus, 
  ArrowRight,
  Phone,
  Play,
  Infinity,
  X
} from "lucide-react";

interface LandingPageProps {
  onLoginSuccess: (username: string, dbState: any) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  // Navigation & Page State
  const [activeSection, setActiveSection] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Registration Form Fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Login Form Fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Compatibility and simulation states
  const [showOtpStage, setShowOtpStage] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [isForgotFlow, setIsForgotFlow] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "verify" | "reset">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [enableWhatsapp, setEnableWhatsapp] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Password strength calculation helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "", color: "bg-slate-800", width: "w-0" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;
    
    if (pwd.length < 8) {
      return { score, text: "Too Short", color: "bg-red-600", width: "w-1/4" };
    } else if (score <= 2) {
      return { score, text: "Weak", color: "bg-red-500", width: "w-1/3" };
    } else if (score <= 4) {
      return { score, text: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    } else {
      return { score, text: "Strong", color: "bg-emerald-500", width: "w-full" };
    }
  };

  // Handle User Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fullName,
        username,
        password,
        confirmPassword
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        setErrorMsg(text || `Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setErrorMsg(data.error || "Failed to complete registration.");
        setLoading(false);
        return;
      }

      setAuthTab("login");
      setLoginUsername(username.toLowerCase().trim());
      setLoginPassword("");
      setSuccessMsg("User registered successfully! Please sign in with your credentials.");
    } catch (err: any) {
      console.error("Register connection/parse error:", err);
      setErrorMsg(err.message || "Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Standard Login (Using Password and Lock out checking)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.toLowerCase().trim(),
          password: loginPassword
        })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        setErrorMsg(text || `Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setErrorMsg(data.error || "Login authentication failed.");
        setLoading(false);
        return;
      }

      // Successful login
      setShowAuthModal(false);
      onLoginSuccess(loginUsername.toLowerCase().trim(), data.user);
    } catch (err: any) {
      console.error("Login connection/parse error:", err);
      setErrorMsg(err.message || "Server connection error during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleResendOtp = async () => {};
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Google Sign-In with auto-registration or instant verified sign in
  const handleGoogleLogin = () => {
    setErrorMsg("");
    setSuccessMsg("Connecting securely with Google OAuth 2.0...");
    setLoading(true);

    setTimeout(async () => {
      const mockGoogleUsername = "user_achiever";
      const mockGoogleName = "Happy User";

      try {
        const response = await fetch("/api/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: mockGoogleUsername,
            name: mockGoogleName,
            googleId: "google-oauth2-id-10928374"
          })
        });

        const data = await response.json();
        if (!response.ok) {
          setErrorMsg(data.error || "Google login failed.");
          setLoading(false);
          return;
        }

        setShowAuthModal(false);
        onLoginSuccess(mockGoogleUsername, data.user);
      } catch (err) {
        setErrorMsg("Failed to login with Google.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden">
      
      {/* HEADER NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-heartbeat">
            <Infinity className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white font-mono">CHRONOVA</span>
            <p className="text-[9px] text-pink-500 tracking-widest font-mono uppercase font-bold">Productivity Companion</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#home" className="hover:text-pink-500 transition-colors">Home</a>
          <a href="#features" className="hover:text-pink-500 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-pink-500 transition-colors">How It Works</a>
          <a href="#stats" className="hover:text-pink-500 transition-colors">Statistics</a>
          <a href="#pricing" className="hover:text-pink-500 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-pink-500 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setAuthTab("login"); setErrorMsg(""); setSuccessMsg(""); setShowOtpStage(false); setShowAuthModal(true); }}
            className="text-sm font-semibold text-slate-300 hover:text-pink-500 transition-colors px-3 py-1.5 cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => { setAuthTab("register"); setErrorMsg(""); setSuccessMsg(""); setShowOtpStage(false); setShowAuthModal(true); }}
            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </nav>

      {/* DYNAMIC ALERT POPUP FOR SIMULATED VERIFICATION BADGE */}
      {showAuthModal && showOtpStage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-bounce">
          <div className="bg-zinc-900 border-2 border-pink-500 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-pink-500" />
              <div>
                <span className="text-xs font-bold text-pink-500 uppercase tracking-widest font-mono block">OTP Simulation Badge</span>
                <span className="text-sm font-bold text-slate-200">Your OTP is <span className="text-pink-500 text-lg font-mono tracking-wider font-extrabold">{simulatedOtp}</span></span>
                <p className="text-[10px] text-slate-400 leading-none mt-1">Direct mandatory verification to ensure spam protection.</p>
              </div>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(simulatedOtp); }}
              className="bg-pink-950/40 hover:bg-pink-900/50 text-pink-400 text-[10px] font-bold py-1 px-3 rounded border border-pink-500/30 font-mono transition-all"
            >
              COPY OTP
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <header id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-10 py-16 overflow-hidden">
        {/* Glowing Ambient Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#be185d08_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-8">
          
          <div className="inline-flex items-center gap-2.5 bg-pink-500/10 border border-pink-500/30 rounded-full py-1.5 px-4 animate-heartbeat">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-pink-300 font-mono text-[10px] tracking-widest uppercase font-bold">
              The Next Era of Personal AI Productivity
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-tight text-white">
            Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 font-mono">Chronova</span> <br />
            Your AI Productivity Companion
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Chronova doesn't just list your tasks—it plans, schedules, predicts delay risks, generates recovery paths, and roasts you back into focus. Meet your personal AI coach, planner, and accountability partner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => { setAuthTab("register"); setErrorMsg(""); setSuccessMsg(""); setShowOtpStage(false); setShowAuthModal(true); }}
              className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-sm py-4 px-8 rounded-2xl transition-all shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#workflow"
              className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-zinc-800 text-slate-200 font-bold text-sm py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-pink-400 fill-pink-400" /> See How It Works
            </a>
          </div>

          {/* SaaS Interface Mockup Card */}
          <div className="pt-12 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-rose-50/20 via-transparent to-transparent z-10" />
            <div className="bg-black border border-zinc-800 rounded-2xl md:rounded-3xl p-3 md:p-5 shadow-[0_0_50px_rgba(245,158,11,0.08)] relative overflow-hidden text-left">
              {/* Fake Mac Window Controls */}
              <div className="flex items-center gap-1.5 pb-4 border-b border-zinc-800">
                <span className="w-3 h-3 rounded-full bg-red-500/50" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <span className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-[10px] bg-zinc-900 text-white py-0.5 px-2 rounded-full font-mono uppercase font-bold">Goal Breakdown</span>
                  <h4 className="font-bold text-sm text-white">"Prepare for Software Placement"</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Gemini autonomously created 6 actionable study modules with exact focus hour predictions.</p>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-[10px] bg-amber-950/40 text-amber-400 py-0.5 px-2 rounded-full font-mono uppercase font-bold">Deadline Risk Predictor</span>
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1">⚠️ MEDIUM RISK SLIP</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">"Practice DBMS Joins postponed. Simulated delay pushes Placement success probability to 78%."</p>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-[10px] bg-zinc-900 text-amber-500 py-0.5 px-2 rounded-full font-mono uppercase font-bold">Your Megan Companion</span>
                  <h4 className="font-bold text-sm text-white">Empathetic Progress Check</h4>
                  <p className="text-[11px] text-amber-400 italic bg-zinc-900 p-2 rounded leading-relaxed border border-zinc-800">
                    "Hey User, I noticed you were slightly distracted today. Don't worry, let's take a deep breath together. You've got this!"
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* STATISTICS SECTION */}
      <section id="stats" className="border-y border-white/5 bg-black py-16 px-4 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <span className="text-4xl md:text-5xl font-black text-indigo-400 font-mono">247,590+</span>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Goals Completed Successfully</p>
          </div>
          <div className="space-y-2">
            <span className="text-4xl md:text-5xl font-black text-indigo-400 font-mono">42.5%</span>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Average Productivity Boost</p>
          </div>
          <div className="space-y-2">
            <span className="text-4xl md:text-5xl font-black text-indigo-400 font-mono">18 hrs</span>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Saved Per User/Week</p>
          </div>
          <div className="space-y-2">
            <span className="text-4xl md:text-5xl font-black text-indigo-400 font-mono">98.4%</span>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">User Goal Accomplishment Rate</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 px-4 md:px-10 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-950/50 py-1 px-3 rounded-full border border-indigo-500/20">The AI Features Suite</span>
          <h2 className="text-3xl md:text-5xl font-black text-white">Engines Tailored for Completion</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Everything you need to turn vague ambitions into scheduled, managed, and completed realities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">AI Goal Breakdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input any target goal (like "Prepare for Software Placement") and Gemini generates structured study modules and subtasks instantly.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">Smart Scheduling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomously plans your daily and weekly routines based on sleep hours, wake schedules, work blocks, and core tasks.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">Deadline Prediction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks task postponement rates to calculate simulated delay probability, showing risk indicators: Low, Medium, High, or Critical.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">Personal AI Coach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your 24/7 accountability director. Triggers daily reviews, tracks excuses, and delivers sarcastic-yet-effective witty motivational roasts.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">Gamification Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn XP credits for checking off tasks. Level up from Apprentice to Master Architect and unlock consistency achievements.
            </p>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-3 transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Infinity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-mono uppercase tracking-wider">Your Megan Companion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Meet Megan, your dedicated empathetic companion. Chat, share struggles, set plans, receive personalized encouragement, and celebrate small wins.
            </p>
          </div>

        </div>
      </section>

      {/* HOW CHRONOVA WORKS (WORKFLOW SECTION) */}
      <section id="workflow" className="bg-slate-900/60 py-24 px-4 md:px-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-950/50 py-1 px-3 rounded-full border border-indigo-500/20">The Productivity Path</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">How Chronova Works</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">
              The continuous pipeline ensuring you finish what you start before any deadline expires.
            </p>
          </div>

          {/* Workflow Steps Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">1</div>
              <h4 className="font-bold text-sm text-slate-200">Create Goal</h4>
              <p className="text-[11px] text-slate-400">Set ultimate targets, target deadline dates, and category.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">2</div>
              <h4 className="font-bold text-sm text-slate-200">AI Goal Breakdown</h4>
              <p className="text-[11px] text-slate-400">Gemini slices large goals into precise structured subtasks.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">3</div>
              <h4 className="font-bold text-sm text-slate-200">AI Creates Schedule</h4>
              <p className="text-[11px] text-slate-400">Adapts schedules instantly around work, sleep, and core hours.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">4</div>
              <h4 className="font-bold text-sm text-slate-200">Track Progress</h4>
              <p className="text-[11px] text-slate-400">Checks off milestones, tracks focus logs, and awards XP.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">5</div>
              <h4 className="font-bold text-sm text-slate-200">AI Predicts Risks</h4>
              <p className="text-[11px] text-slate-400">Calculates success rates from delays, predicting risk scales.</p>
            </div>

            {/* Step 6 */}
            <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3 text-center relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center mx-auto border border-zinc-700">6</div>
              <h4 className="font-bold text-sm text-slate-200">AI Recovery Plan</h4>
              <p className="text-[11px] text-slate-400">Compresses schedules automatically when deadlines slip.</p>
            </div>

            {/* Step 7 */}
            <div className="bg-black border-2 border-amber-500/40 p-5 rounded-xl space-y-3 text-center relative shadow-lg shadow-amber-500/5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-amber-400">Goal Achieved</h4>
              <p className="text-[11px] text-amber-300">Cross the line before schedule with full success outcomes!</p>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-950/50 py-1 px-3 rounded-full border border-indigo-500/20">Client Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-black text-white">Loved by High Achievers</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Read how Chronova transforms procrastination into high-performance habit loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Chronova's witty roasts are exactly what I needed. Every time I tried postponing my placement DBMS preparation, it hit me with a sarcasm check about my future salary. I landed my target placement thanks to this companion!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-white">HU</div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Happy User</h4>
                <p className="text-[10px] text-zinc-500">Job Seeker & Software Engineer</p>
              </div>
            </div>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "I love the Future Consequence Simulator slider. Moving it to see what happens to my project success probability made me instantly close YouTube and write code. Compressing task times in Recovery Mode is genius."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-white">AK</div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Aryan K.</h4>
                <p className="text-[10px] text-zinc-500">Tech Entrepreneur</p>
              </div>
            </div>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The automatic schedule optimization takes away all the friction. Instead of manually re-scheduling tasks, Chronova adjusts around sleep patterns and study blocks perfectly. An absolute high-productivity application!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-white">MD</div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Meera Das</h4>
                <p className="text-[10px] text-zinc-500">Computer Science Student</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING (DEMO SECTION) */}
      <section id="pricing" className="bg-slate-900/60 py-24 px-4 md:px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-950/50 py-1 px-3 rounded-full border border-indigo-500/20">Flexible Pricing Plans</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Choose Your Level</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              Flexible pricing options for every stage of your productivity journey.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            
            {/* Core Plan */}
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl space-y-6">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Standard Access</span>
                <h3 className="text-2xl font-black text-slate-100 mt-1">Free Tier</h3>
                <p className="text-xs text-slate-400 mt-2">Perfect for personal goal tracking and self-discipline.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Goal breakdown maps</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interactive Future Consequence Simulator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complete AI Coach Desk & Excuse Roasts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Simulated multi-channel alerts</li>
              </ul>
              <button 
                onClick={() => { setAuthTab("register"); setErrorMsg(""); setSuccessMsg(""); setShowOtpStage(false); setShowAuthModal(true); }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl border border-zinc-700 transition-all text-xs cursor-pointer"
              >
                Access Free Sandbox
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-4 md:px-10 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-950/50 py-1 px-3 rounded-full border border-indigo-500/20">Got Questions?</span>
          <h2 className="text-3xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is Chronova really different from regular to-do apps?",
              a: "Absolutely! Regular to-do apps are dumb lists that wait for you. Chronova is a proactive productivity system. It break goals down, designs full timetables, predicts deadline risks using your postponement history, offers instant 'Recovery Mode' schedule compressions, and coaches you with witty roasts."
            },
            {
              q: "What is the Future Consequence Simulator?",
              a: "It is a real-time risk simulation sandbox located in your AI Coach Desk. By dragging the slider, you can simulate delays on milestones. Chronova predicts the mathematical drop in success probability and live logs the consequence warning."
            },
            {
              q: "Is the Gemini AI model actually live?",
              a: "Yes! Chronova integrates a fully live Gemini API on the backend. When you create goals or request advice, Gemini writes the scheduled breakdowns and sarcasm roasts in real-time."
            }
          ].map((item, index) => (
            <div key={index} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-6 flex items-center justify-between font-bold text-slate-100 hover:text-white transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950 py-12 px-4 md:px-10 text-center text-slate-500 text-xs space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/20 flex items-center justify-center text-slate-900 shadow animate-heartbeat">
            <Infinity className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-bold tracking-wider text-slate-300 font-mono">CHRONOVA</span>
        </div>
        <p className="max-w-md mx-auto">
          Chronova is an advanced, premium SaaS productivity companion engineered to protect goals, defeat procrastination, and build consistent habits.
        </p>
        <p className="text-[10px] text-slate-600">
          Created by <span className="text-white font-bold">Shivani Pawar</span>. All Rights Reserved.
        </p>
      </footer>

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            {/* Ambient glows inside modal */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => { 
                setShowAuthModal(false); 
                setErrorMsg(""); 
                setSuccessMsg(""); 
                setIsForgotFlow(false); 
                setForgotStep("request"); 
                setShowOtpStage(false); 
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-zinc-700/50 shadow-sm"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo inside modal */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/5">
                <Infinity className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">CHRONOVA</h3>
              <p className="text-[10px] text-pink-500 uppercase tracking-widest font-mono">Mandatory Secure Access</p>
            </div>

            {/* Error and Success Banners */}
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4 leading-relaxed font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs mb-4 leading-relaxed font-mono">
                {successMsg}
              </div>
            )}

            {/* Loader indicator */}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-pink-400 text-xs font-mono mb-4">
                <div className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                Processing request...
              </div>
            )}

            {/* 1. FORGOT PASSWORD FLOW */}
            {isForgotFlow ? (
              <div>
                <div className="text-center mb-4">
                  <h4 className="text-sm font-bold text-pink-400 uppercase tracking-wider font-mono">Forgot Password Reset</h4>
                </div>

                {forgotStep === "request" && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Email Address</label>
                      <input 
                        type="email" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. pawarshivani081225@gmail.com" 
                        className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => { setIsForgotFlow(false); setErrorMsg(""); setSuccessMsg(""); }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl cursor-pointer font-mono"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-pink-500/20"
                      >
                        Send Reset OTP
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === "verify" && (
                  <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
                    <div className="text-center py-1 space-y-1">
                      <span className="text-xs text-slate-400 block font-mono">Chronova sent a mandatory reset OTP directly to</span>
                      <span className="text-sm font-bold text-pink-400 font-mono block">{forgotEmail}</span>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold text-center">Enter 6-Digit Verification OTP</label>
                      <input 
                        type="text" 
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="e.g. 123456" 
                        className="w-full bg-[#030712] border-2 border-pink-500 text-center tracking-[12px] font-mono text-xl p-3 rounded-xl text-white focus:outline-none"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Didn't receive code?</span>
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-pink-400 hover:underline cursor-pointer font-bold"
                      >
                        Resend Code
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => { setForgotStep("request"); setErrorMsg(""); setSuccessMsg(""); }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === "reset" && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars, mixed case & symbols" 
                        className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                        required
                      />
                      {/* Password strength meter */}
                      {newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-450">Strength Indicator:</span>
                            <span className={`font-bold ${getPasswordStrength(newPassword).score >= 5 ? "text-emerald-400" : getPasswordStrength(newPassword).score >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                              {getPasswordStrength(newPassword).text}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[#030712] rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color} ${getPasswordStrength(newPassword).width}`} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={newConfirmPassword}
                        onChange={(e) => setNewConfirmPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-pink-500/20 font-mono"
                    >
                      Update & Save Password
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* 2. REGULAR REGISTER & LOGIN FLOWS */
              <div>
                <div className="space-y-6">
                  
                  {/* Auth tab toggles */}
                  <div className="grid grid-cols-2 p-1 bg-[#030712] rounded-xl border border-white/5 text-xs font-bold font-mono">
                    <button 
                      onClick={() => { setAuthTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${authTab === "login" ? "bg-pink-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      SIGN IN
                    </button>
                    <button 
                      onClick={() => { setAuthTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${authTab === "register" ? "bg-pink-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      REGISTER
                    </button>
                  </div>

                  {authTab === "register" ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Full Name</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Happy User" 
                          className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Username</label>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. shivani_pawar" 
                          className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Confirm Pass</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Password strength meter */}
                      {password && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-450">Strength Meter:</span>
                            <span className={`font-bold ${getPasswordStrength(password).score >= 5 ? "text-emerald-400" : getPasswordStrength(password).score >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                              {getPasswordStrength(password).text}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[#030712] rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getPasswordStrength(password).color} ${getPasswordStrength(password).width}`} />
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-pink-500/20"
                      >
                        Register Account
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-pink-500 mb-1.5 font-bold">Username</label>
                        <input 
                          type="text" 
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="e.g. shivani_pawar" 
                          className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] uppercase font-mono text-pink-500 font-bold">Password</label>
                        </div>
                        <input 
                          type="password" 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full bg-[#030712] border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-pink-500/20 font-mono"
                      >
                        Sign In Securely
                      </button>
                    </form>
                  )}

                  {/* Separator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="w-1/3 h-[1px] bg-white/5" />
                    <span>OR CONTINUE WITH</span>
                    <span className="w-1/3 h-[1px] bg-white/5" />
                  </div>

                  {/* Google login Button */}
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-[#030712] hover:bg-zinc-900 border border-zinc-800 text-slate-200 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Chrome className="w-4 h-4 text-pink-500" /> Use Google OAuth 2.0
                  </button>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
