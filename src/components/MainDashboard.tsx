import React, { useState } from "react";
import { DBState, Goal, SubTask } from "../types.js";
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Zap, 
  Target, 
  RefreshCw, 
  Share2, 
  Smile, 
  ChevronRight, 
  TrendingUp, 
  Sliders,
  Bell,
  Infinity
} from "lucide-react";

interface MainDashboardProps {
  state: DBState;
  onToggleTask: (goalId: string, taskId: string) => void;
  onPostponeTask: (goal: Goal, task: SubTask | null) => void;
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (title: string, deadline: string, priority: string, category: string, customSubtasks?: Array<{ title: string, durationMinutes: number, scheduledTime: string }>, generateAI?: boolean) => void;
  onTriggerRecovery: (goalId: string) => void;
  onUpdateSettings: (whatsappEnabled: boolean, phoneNumber: string) => Promise<void>;
  onDeleteAccount: () => void;
  onOpenReminderModal: () => void;
  reminders: any[];
}

export default function MainDashboard({ 
  state, 
  onToggleTask, 
  onPostponeTask, 
  onToggleGoal,
  onAddGoal,
  onTriggerRecovery,
  onUpdateSettings,
  onDeleteAccount,
  onOpenReminderModal,
  reminders
}: MainDashboardProps) {
  const { profile, goals } = state;

  const [goalTitle, setGoalTitle] = useState("");
  const [deadline, setDeadline] = useState("2026-07-20");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("high");
  const [category, setCategory] = useState("Professional");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingGoalStatus, setAddingGoalStatus] = useState(false);

  // Subtask strategy state
  const [subtaskStrategy, setSubtaskStrategy] = useState<"single" | "custom" | "ai">("single");
  const [customSubtasks, setCustomSubtasks] = useState<Array<{ title: string; durationMinutes: number; scheduledTime: string }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDuration, setNewSubtaskDuration] = useState(60);
  const [newSubtaskTime, setNewSubtaskTime] = useState("10:00");

  const handleAddCustomSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setCustomSubtasks(prev => [
      ...prev,
      {
        title: newSubtaskTitle.trim(),
        durationMinutes: Number(newSubtaskDuration) || 60,
        scheduledTime: newSubtaskTime || "10:00"
      }
    ]);
    setNewSubtaskTitle("");
  };

  const handleRemoveCustomSubtask = (idx: number) => {
    setCustomSubtasks(prev => prev.filter((_, i) => i !== idx));
  };

  // Settings states
  const [whatsappEnabled, setWhatsappEnabled] = useState(profile.whatsappEnabled || false);
  const [phoneNumberInput, setPhoneNumberInput] = useState(profile.phoneNumber || "");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSettings = async () => {
    if (whatsappEnabled) {
      const cleanPhone = phoneNumberInput.trim();
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setSettingsStatus("Error: Phone number must contain exactly 10 digits.");
        return;
      }
    }

    setIsSavingSettings(true);
    setSettingsStatus("");
    try {
      await onUpdateSettings(whatsappEnabled, phoneNumberInput);
      setSettingsStatus("Preferences updated successfully!");
    } catch (err) {
      setSettingsStatus("Error: Failed to save preferences.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
  };
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.successProbability < 100).length;
  const completedGoals = goals.filter(g => g.subtasks.every(s => s.completed)).length;

  let totalTasks = 0;
  let completedTodayCount = 0;
  let pendingTasksCount = 0;

  goals.forEach(g => {
    g.subtasks.forEach(s => {
      totalTasks++;
      if (s.completed) {
        completedTodayCount++;
      } else {
        pendingTasksCount++;
      }
    });
  });

  // Calculate generic success probability average
  // Strict check: if no task is completed by a fresh user, show 0% for productivity and success probability.
  const avgSuccessProb = (goals.length > 0 && completedTodayCount > 0)
    ? Math.round(goals.reduce((acc, curr) => acc + curr.successProbability, 0) / goals.length)
    : 0;

  const productivityScoreCalculated = (totalTasks > 0 && completedTodayCount > 0)
    ? Math.round((completedTodayCount / totalTasks) * 100)
    : 0;

  const dynamicFocusHours = (totalTasks > 0 && completedTodayCount > 0)
    ? (completedTodayCount * 1.5).toFixed(1)
    : "0.0";

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setAddingGoalStatus(true);
    
    if (subtaskStrategy === "custom") {
      if (customSubtasks.length === 0) {
        alert("Please add at least one custom subtask or choose 'Single Main Task' mode!");
        setAddingGoalStatus(false);
        return;
      }
      await onAddGoal(goalTitle, deadline, priority, category, customSubtasks, false);
    } else if (subtaskStrategy === "single") {
      await onAddGoal(goalTitle, deadline, priority, category, [], false);
    } else if (subtaskStrategy === "ai") {
      await onAddGoal(goalTitle, deadline, priority, category, undefined, true);
    } else {
      await onAddGoal(goalTitle, deadline, priority, category, [], false);
    }

    setGoalTitle("");
    setCustomSubtasks([]);
    setAddingGoalStatus(false);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Deck with Namaste Woman Hands Logo */}
      <div className="bg-black border border-zinc-800 p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 text-center sm:text-left">
          <div className="w-14 h-14 bg-zinc-950 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-heartbeat">
            <Infinity className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">CHRONOVA</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 font-mono py-0.5 px-2 rounded-full border border-amber-500/30 font-bold uppercase">
                LEVEL {profile.level}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Active accountability engine calibrated for <span className="text-white font-bold">{profile.name}</span>
            </p>
          </div>
        </div>

        {/* Level & Streak Gamified Controls */}
        <div className="flex items-center gap-4 bg-zinc-900/85 border border-zinc-800 p-4 rounded-2xl relative z-10 w-full sm:w-auto justify-around">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-white font-bold text-lg font-mono">
              <Flame className="w-5 h-5 fill-orange-500 animate-bounce" />
              <span>{profile.streak} Days</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono font-medium uppercase">Current Streak</span>
          </div>
          
          <div className="w-[1px] h-10 bg-zinc-800" />

          <div className="text-center px-2">
            <div className="text-amber-400 font-bold text-lg font-mono">
              ★ {profile.xp} XP
            </div>
            <span className="text-[10px] text-zinc-400 font-mono font-medium uppercase">Total Score Credits</span>
          </div>

          <div className="w-[1px] h-10 bg-zinc-800" />

          <div className="text-center px-2">
            <div className="text-white font-bold text-lg font-mono">
              {profile.focusHours}h
            </div>
            <span className="text-[10px] text-zinc-400 font-mono font-medium uppercase">Hours Logged</span>
          </div>
        </div>
      </div>
            {/* Hero Bento Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Productivity Index Card */}
        <div className="bg-black border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-xl text-white">
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] tracking-wider text-zinc-400 font-mono uppercase block">Success Score Index</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white font-mono">{productivityScoreCalculated}%</span>
            {productivityScoreCalculated > 0 ? (
              <span className="text-xs text-emerald-400 flex items-center font-mono gap-0.5 font-bold">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-mono">No tasks yet</span>
            )}
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${productivityScoreCalculated}%` }} />
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1.5 block">Calculated from completed vs total subtasks</span>
        </div>

        {/* Prediction Accuracy Dial */}
        <div className="bg-black border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-xl text-white">
          <span className="text-[10px] tracking-wider text-zinc-400 font-mono uppercase block">Success Probability</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-extrabold font-mono ${
              avgSuccessProb >= 75 ? "text-emerald-400" : avgSuccessProb >= 50 ? "text-amber-400" : avgSuccessProb > 0 ? "text-rose-400" : "text-zinc-500"
            }`}>{avgSuccessProb > 0 ? `${avgSuccessProb}%` : "0%"}</span>
            <span className="text-[10px] text-zinc-400 font-mono">Confidence Coach</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full transition-all ${
              avgSuccessProb >= 75 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : avgSuccessProb >= 50 ? "bg-yellow-500" : "bg-red-500"
            }`} style={{ width: `${avgSuccessProb}%` }} />
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1.5 block">AI prediction based on history</span>
        </div>

        {/* Daily Execution Counter */}
        <div className="bg-black border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-xl text-white">
          <span className="text-[10px] tracking-wider text-zinc-400 font-mono uppercase block">Daily Focus hours</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-500 font-mono">{dynamicFocusHours}h</span>
            <span className="text-xs text-zinc-400 font-mono">/ {totalTasks} in backlog</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${totalTasks > 0 ? (completedTodayCount/totalTasks)*100 : 0}%` }} />
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1.5 block">Keep checking items off to stack XP</span>
        </div>

        {/* Target Goals Overlord */}
        <div className={`${activeGoals > 0 ? "bg-black border border-orange-500/30 text-white" : "bg-black border border-zinc-800 text-white"} rounded-2xl p-5 relative overflow-hidden shadow-xl`}>
          <p className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-wider italic">Deadline Risk</p>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-extrabold font-mono ${activeGoals > 0 ? "text-orange-400" : "text-zinc-500"}`}>{activeGoals > 0 ? "HIGH" : "NONE"}</span>
            {activeGoals > 0 && <div className="px-2 py-0.5 bg-orange-500/20 rounded text-[9px] font-bold text-orange-400 border border-orange-500/20">ACTIVE</div>}
          </div>
          <span className="text-[10px] text-zinc-400 mt-2 block font-mono">{activeGoals} active goal paths</span>
        </div>
      </div>

      {/* Goal Breakdown & Task Track Section */}
      <div className="space-y-4">
        
        {/* Your Megan Companion Promo/Info Card */}
        <div className="bg-black border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono py-0.5 px-2 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider animate-pulse">
                Empathetic Partner
              </span>
              <span className="text-xs text-zinc-400 font-medium font-mono">Meet Your Megan</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">Your Megan AI Companion is Online</h4>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Facing emotional dips, procrastination peaks, or just need clear guidance? <strong className="text-white">Megan</strong> is integrated directly into your Chronova Dashboard. Reach out via the <strong className="text-amber-400">"Your Megan"</strong> navigation tab for a safe space, supportive coaching, and smart daily habit adjustments tailored to your workflow.
            </p>
          </div>
          <div className="shrink-0 relative z-10">
            <div className="w-12 h-12 rounded-full bg-zinc-950 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Smile className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-pink-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Durable Action Schedules</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReminderModal}
              className="inline-flex items-center gap-1.5 bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" /> Set Task Reminder
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-md shadow-pink-500/15 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Goal Map
            </button>
          </div>
        </div>

        {/* Create Goal Overlay / Accordion Container */}
        {showAddForm && (
          <form onSubmit={handleCreateGoal} className="bg-white border border-pink-150 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-pink-600 font-mono">Create Mission Goal & Invoke AI Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Ultimate Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master OS concepts or Revamp portfolio website"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Target End Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono cursor-pointer"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Mission Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="high">🌋 Critical Priority</option>
                  <option value="medium">⚡ Medium Stream</option>
                  <option value="low">☕ Standard Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Onboarding Role Segment</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="Student">Student</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Professional">Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                </select>
              </div>
            </div>

            {/* Subtask Strategy Selector (Direct User Prompt) */}
            <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 space-y-3">
              <span className="block text-xs font-mono font-bold uppercase text-pink-600 tracking-wider">
                Do you want to add subtasks to this task?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSubtaskStrategy("single")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                    subtaskStrategy === "single"
                      ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/10"
                      : "bg-white border-pink-100 text-slate-600 hover:text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  No, single main task
                </button>
                <button
                  type="button"
                  onClick={() => setSubtaskStrategy("custom")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                    subtaskStrategy === "custom"
                      ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/10"
                      : "bg-white border-pink-100 text-slate-600 hover:text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  Yes, let me add custom subtasks
                </button>
                <button
                  type="button"
                  onClick={() => setSubtaskStrategy("ai")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                    subtaskStrategy === "ai"
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto-generate with Gemini AI
                </button>
              </div>

              {/* Custom Subtasks Builder Form */}
              {subtaskStrategy === "custom" && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-bold text-slate-400">Custom Subtasks List:</span>
                    {customSubtasks.length === 0 && (
                      <span className="text-[10px] text-rose-400 font-mono font-semibold animate-pulse">
                        ⚠️ Please add at least one subtask below
                      </span>
                    )}
                  </div>
                  
                  {customSubtasks.length === 0 && (
                    <div className="p-3 bg-black border border-rose-500/35 rounded-xl text-[11px] text-rose-300 leading-normal space-y-1">
                      <p className="font-semibold text-rose-200">📌 Subtasks Required</p>
                      <p>
                        Please enter a subtask title below and click the bright pink <strong className="text-white">+ Add Subtask</strong> button, or switch to <strong className="text-white">"No, single main task"</strong> above.
                      </p>
                    </div>
                  )}

                  {customSubtasks.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto bg-slate-900/60 p-2 rounded-xl">
                      {customSubtasks.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-white/5 text-xs">
                          <span className="text-white truncate font-medium">{sub.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[10px]">{sub.scheduledTime} | {sub.durationMinutes}m</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSubtask(idx)}
                              className="text-red-400 hover:text-red-300 font-mono text-[10px] cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Subtask Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Gather study materials"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 text-white p-2 rounded-lg text-xs focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Scheduled Time</label>
                      <input
                        type="time"
                        value={newSubtaskTime}
                        onChange={(e) => setNewSubtaskTime(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 text-white p-2 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-400 font-semibold">Duration (min):</label>
                      <input
                        type="number"
                        min="5"
                        value={newSubtaskDuration}
                        onChange={(e) => setNewSubtaskDuration(Number(e.target.value) || 60)}
                        className="w-16 bg-slate-900 border border-white/10 text-white p-1 rounded text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSubtask}
                      className="bg-pink-600 hover:bg-pink-700 text-white border border-pink-500 hover:scale-[1.02] text-xs py-1.5 px-4 rounded-xl font-extrabold shadow-md shadow-pink-600/25 transition-all duration-150 cursor-pointer flex items-center gap-1"
                    >
                      ✨ + Add Subtask
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-800 hover:bg-slate-750 text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingGoalStatus}
                className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 hover:from-pink-700 hover:to-rose-750 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all duration-150 shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {addingGoalStatus ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Gemini is planning task maps...</span>
                  </>
                ) : (
                  <span>Build Goal Plan</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Active Goals Map Loop */}
        <div className="grid grid-cols-1 gap-6">
          {goals.map((goal) => {
            const isAtRisk = goal.successProbability < 80;
            return (
              <div 
                key={goal.id} 
                className="bg-black border border-zinc-800 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/40 shadow-xl hover:shadow-2xl hover:shadow-amber-500/[0.02]"
              >
                {/* Visual Header of the Goal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20 font-mono font-medium">
                        {goal.category}
                      </span>
                      {goal.priority === "high" && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded border border-red-500/20 font-mono font-bold uppercase">
                          🌋 High Priority
                        </span>
                      )}
                      <span className="text-xs text-zinc-400 font-mono">
                        Target Deadline: <span className="text-zinc-200 font-semibold">{goal.deadline}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mt-2.5">
                      <input
                        type="checkbox"
                        checked={goal.completed || false}
                        onChange={() => onToggleGoal(goal.id)}
                        className="w-5 h-5 shrink-0 accent-pink-500 cursor-pointer rounded border-white/10 bg-slate-950 text-pink-500 mt-1"
                        id={`goal_check_${goal.id}`}
                      />
                      <div>
                        <label 
                          htmlFor={`goal_check_${goal.id}`}
                          className={`text-lg font-bold tracking-tight text-white block cursor-pointer select-none ${goal.completed ? "line-through text-slate-500" : ""}`}
                        >
                          {goal.title}
                        </label>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xl">{goal.description}</p>

                        {!goal.completed && (
                          <div className="mt-2.5">
                            <button
                              onClick={() => onPostponeTask(goal, null)}
                              className="text-[10px] bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 font-bold py-1 px-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0 text-red-500 animate-pulse" />
                              <span>Delay / Excuse Goal</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                       {/* Goal Risk Indicator Box */}
                  <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block font-bold">Success Forecast</span>
                      <span className={`text-base font-extrabold font-mono ${
                        goal.successProbability >= 85 ? "text-emerald-400" : goal.successProbability >= 70 ? "text-amber-400" : "text-red-400"
                      }`}>{goal.successProbability}% Success</span>
                    </div>

                    <div className="w-[1px] h-8 bg-zinc-800" />

                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block font-bold">Risk Index</span>
                      <span className={`text-xs px-2 py-0.5 rounded uppercase font-mono font-bold inline-block text-center mt-0.5 border ${
                        goal.riskLevel === "High" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" : goal.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {goal.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task List Grid Section */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 font-mono">Action Backlog Subtasks ({goal.subtasks.filter(s=>s.completed).length}/{goal.subtasks.length}):</h5>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {goal.subtasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          task.completed 
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                            : task.status === "postponed" 
                              ? "bg-red-950/20 border-red-500/30 text-red-300"
                              : "bg-zinc-950 border border-zinc-800 text-zinc-100 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleTask(goal.id, task.id)}
                            className="w-4.5 h-4.5 shrink-0 accent-indigo-600 cursor-pointer rounded border-white/10 bg-slate-950 text-indigo-500 mt-0.5"
                          />
                          <div>
                            <span className={`text-sm font-semibold leading-snug block ${task.completed ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-500" /> {task.scheduledTime}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono font-medium">
                                Duration: {task.durationMinutes} mins
                              </span>
                              {task.postponementCount > 0 && (
                                <span className="text-[10px] text-red-400 font-mono font-bold flex items-center gap-0.5 bg-red-950/40 px-1.5 py-0.2 rounded border border-red-500/20">
                                  ⚠️ Delayed {task.postponementCount}x
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons if not completed */}
                        {!task.completed && (
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => onPostponeTask(goal, task)}
                              className="text-[11px] bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 font-bold py-1 px-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Delay / Excuse</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proactive Coaching Recovery trigger if successProbability drops below 80% */}
                {isAtRisk && (
                  <div className="mt-4 p-4 rounded-xl bg-radial from-red-950/30 to-transparent border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 text-center sm:text-left">
                      <AlertTriangle className="text-red-400 w-5 h-5 shrink-0 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-red-300 block font-mono">CRITICAL DELAY RISK PREDICTED BY CHRONOVA</span>
                        <span className="text-[11px] text-red-400 block mt-0.5">Tasks have been postponed excessively. Activating Chronova Recovery Plan will auto-compress schedules.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onTriggerRecovery(goal.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg transition-all shadow-md shadow-red-500/20 cursor-pointer text-center w-full sm:w-auto"
                    >
                      ⚡ Activate Recovery Plan
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronova Control & Settings Panel */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mt-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Sliders className="text-indigo-400 w-5 h-5" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Chronova Settings & Security</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Danger Zone: Permanent Account Deletion */}
          <div className="space-y-4 pt-6 md:pt-0 md:pl-0 col-span-2">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono text-left">Danger Zone</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed text-left">
              Once you delete your Chronova account, all your logged goals, active subtask schedules, historical coaching excuse logs, and settings will be permanently erased. This operation cannot be undone.
            </p>

            <div className="text-left">
              <button
                type="button"
                onClick={handleDeleteAccountClick}
                className="bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/20 hover:border-red-500/40 font-bold py-1.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Delete Chronova Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-red-500/30 max-w-md w-full rounded-3xl p-6 shadow-[0_20px_50px_rgba(239,68,68,0.15)] space-y-6 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Red alert gradient backdrop glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
              <AlertTriangle className="w-7 h-7 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-lg font-black text-white tracking-tight">Delete Account Permanently?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is irreversible. All of your saved goals, subtask schedules, emotional support history, and Chronova custom preferences will be completely deleted.
              </p>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-3.5 text-[11px] text-red-300 font-medium leading-relaxed relative z-10">
              ⚠️ Warning: You will be logged out instantly and all progress will be lost.
            </div>

            <div className="flex gap-3 relative z-10">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer border border-white/5 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-red-950/50 hover:shadow-red-500/20 active:scale-95"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
