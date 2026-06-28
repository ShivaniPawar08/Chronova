import React, { useState } from "react";
import { OnboardingData } from "../types.js";
import { Flame, Clock, Brain, User, AlertCircle, ArrowRight } from "lucide-react";

interface OnboardingProps {
  onSave: (data: OnboardingData) => void;
  username: string;
}

export default function Onboarding({ onSave, username }: OnboardingProps) {
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [workHours, setWorkHours] = useState("09:00-17:00");
  const [studyHours, setStudyHours] = useState(4);
  const [preferences, setPreferences] = useState<string[]>(["Heavy Accountability", "Witty Accountable Humour"]);
  const [goalsText, setGoalsText] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("2026-07-20");
  const [enableReminders, setEnableReminders] = useState(true); // default to checked/true so they set reminder
  const [errorCheck, setErrorCheck] = useState("");

  const handlePrefToggle = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalsText.trim()) {
      setErrorCheck("Please define your main active target goal, so Chronova can auto-schedule tasks.");
      return;
    }
    onSave({
      wakeTime,
      sleepTime,
      workHours,
      studyHours,
      preferences,
      goalsText,
      deadlineDate,
      enableReminders,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-rose-50/25">
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-pink-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-3xl bg-white border border-pink-100 rounded-[40px] shadow-xl p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Grid Grid Layout Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fda4af10_1px,transparent_1px),linear-gradient(to_bottom,#fda4af10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        {/* Branding & Logo */}
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center bg-pink-50 border border-pink-200 rounded-full py-2 px-5 shadow-inner mb-6">
            <Brain className="w-4 h-4 text-pink-500 mr-2 animate-pulse" />
            <span className="text-pink-600 font-mono text-xs tracking-wider uppercase font-bold">
              CHRONOVA • Onboarding Engine
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-800">
            Welcome, <span className="text-pink-600">Achiever</span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Logged in as <span className="text-slate-600 font-mono font-bold">@{username}</span>. Configure your sleep and active metrics so our AI can predict delay risks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {errorCheck && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorCheck}</span>
            </div>
          )}

          {/* Time and Sleep Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-50/30 p-4 rounded-xl border border-pink-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Wake Up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-white border border-pink-200 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="bg-pink-50/30 p-4 rounded-xl border border-pink-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Night Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full bg-white border border-pink-200 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Busy & Study Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-50/30 p-4 rounded-xl border border-pink-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2 font-mono">
                Locked Office/College Hours
              </label>
              <input
                type="text"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="e.g. 09:00-17:00"
                className="w-full bg-white border border-pink-200 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 font-mono text-center"
              />
            </div>

            <div className="bg-pink-50/30 p-4 rounded-xl border border-pink-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2 font-mono">
                Intended Daily Focus Hours
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStudyHours(Math.max(1, studyHours - 1))}
                  className="bg-white hover:bg-pink-50 text-slate-700 px-3 py-1.5 rounded-lg font-mono border border-pink-200"
                >
                  -
                </button>
                <span className="text-xl font-bold font-mono text-pink-600">{studyHours} Hours</span>
                <button
                  type="button"
                  onClick={() => setStudyHours(Math.min(12, studyHours + 1))}
                  className="bg-white hover:bg-pink-50 text-slate-700 px-3 py-1.5 rounded-lg font-mono border border-pink-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Main User Goal Intake - Core Focus */}
          <div className="bg-pink-50/30 p-5 rounded-xl border border-pink-100">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-pink-600 font-mono">
                Core Ultimate Mission Goal
              </label>
              <span className="text-[10px] uppercase font-mono bg-pink-50 px-2 py-0.5 rounded text-pink-600 border border-pink-200">
                Auto-Breakdown Task List
              </span>
            </div>
            <textarea
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              placeholder="e.g. Prepare for software placement, study DSA OS; or Build Chronova Tech Demo MVP"
              className="w-full bg-white border border-pink-200 text-slate-800 p-3 rounded-lg text-sm focus:outline-none focus:border-pink-500 min-h-[80px]"
            />
            <div className="mt-3">
              <label className="block text-xs text-slate-500 font-medium mb-1">Target Deadline Date</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onFocus={(e) => e.currentTarget.showPicker?.()}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-pink-200 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 font-mono text-center cursor-pointer"
              />
            </div>
          </div>

          {/* Account Onboarding Options */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 font-mono">
              Accountability Settings & Preferences
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                "Heavy Accountability",
                "Witty Accountable Humour",
                "Supportive Gamification",
                "Student Model",
                "Weekly Summaries",
                "WhatsApp Alert Mock",
                "Low Completion Alert",
                "Consequence Simulator"
              ].map((pref) => {
                const active = preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => handlePrefToggle(pref)}
                    className={`p-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                      active
                        ? "bg-pink-600/10 border-pink-400 text-pink-600"
                        : "bg-white border-pink-100 text-slate-600 hover:border-pink-200 hover:text-pink-600"
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Set Task Reminder Checkbox Option */}
          <div className="bg-pink-50/40 p-4 rounded-xl border border-pink-100 flex items-start gap-3 mt-4">
            <input
              type="checkbox"
              id="enableReminders"
              checked={enableReminders}
              onChange={(e) => setEnableReminders(e.target.checked)}
              className="w-4.5 h-4.5 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer mt-0.5 shrink-0"
            />
            <div className="cursor-pointer select-none">
              <label htmlFor="enableReminders" className="text-xs font-bold text-slate-800 cursor-pointer block">
                🔔 Enable Proactive Task Reminders
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically enable alert notifications and calendar logs to keep your daily focus blocks strictly accountable.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-pink-600/20 flex items-center justify-center gap-2 text-sm mt-4 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
          >
            <span>Activate Chronova Proactive Coach Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
