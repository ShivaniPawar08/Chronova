import React, { useState } from "react";
import { DBState, Goal, SubTask } from "../types.js";
import { 
  Dumbbell, 
  Smile, 
  Skull, 
  HelpCircle, 
  Sliders, 
  Send, 
  AlertCircle, 
  MessageSquare, 
  Clock, 
  ShieldAlert, 
  ArrowRight
} from "lucide-react";

interface AICoachConsoleProps {
  state: DBState;
  selectedTaskForDelayedExcuse: { goal: Goal; task: SubTask | null } | null;
  onPostExcuse: (excuseText: string, goalId: string, taskId?: string) => Promise<void>;
  onCloseExcuseForm: () => void;
}

export default function AICoachConsole({ 
  state, 
  selectedTaskForDelayedExcuse,
  onPostExcuse,
  onCloseExcuseForm
}: AICoachConsoleProps) {
  const [excuseText, setExcuseText] = useState("");
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  
  // Consequence Slider Simulator state
  const [delayDays, setDelayDays] = useState(0);
  const [simGoalId, setSimGoalId] = useState(state.goals[0]?.id || "");

  // Simulated metrics derivation
  const selectedSimGoal = state.goals.find(g => g.id === simGoalId) || state.goals[0];
  const originalSuccessChance = selectedSimGoal ? selectedSimGoal.successProbability : 80;
  const originalDelayRisk = selectedSimGoal ? selectedSimGoal.delayRisk : 20;

  const simSuccessChance = Math.max(10, originalSuccessChance - (delayDays * 12));
  const simDelayRisk = Math.min(95, originalDelayRisk + (delayDays * 12));

  let simOutputText = "Perfect alignment. Your milestones match expectations. No warnings logged.";
  if (selectedSimGoal && delayDays > 0) {
    if (delayDays <= 2) {
      simOutputText = `Shifts schedule onto weekend buffers. By delaying "${selectedSimGoal.title}", you miss your planned study and execution blocks, dropping success estimation directly to ${simSuccessChance}%.`;
    } else if (delayDays <= 4) {
      simOutputText = `HIGH DANGER: Goal milestones for "${selectedSimGoal.title}" collide! You log multiple consecutive skips. Crucial steps for your "${selectedSimGoal.category || "target"}" milestone are missed entirely. Success probability is down.`;
    } else {
      simOutputText = `CRITICAL CRASH: Target schedule collapse for "${selectedSimGoal.title}". Future self is sending signals of regret. Your chances of successfully completing your "${selectedSimGoal.title}" target are severely compromised.`;
    }
  }

  const handleExcuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseText.trim() || !selectedTaskForDelayedExcuse) return;
    setIsSubmittingExcuse(true);
    await onPostExcuse(
      excuseText,
      selectedTaskForDelayedExcuse.goal.id,
      selectedTaskForDelayedExcuse.task?.id || ""
    );
    setExcuseText("");
    setIsSubmittingExcuse(false);
    onCloseExcuseForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-transparent">
      
      {/* Dynamic Excuse / Procrastination Input form (loads if task is active or stays constant for free-writing procs) */}
      <div className="bg-white border border-pink-100 p-6 rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-pink-600 w-5 h-5 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">AI Excuse Accountability Advisor</h3>
          </div>
          <p className="text-xs text-slate-600">
            Tell us why you are postponing your task, and our witty accountability AI Coach will analyze your excuse and offer custom guidance to get you back on track.
          </p>

          {selectedTaskForDelayedExcuse ? (
            <div className="bg-pink-50/30 border border-red-500/20 p-4 rounded-xl space-y-2">
              <span className="text-[10px] bg-red-500/10 text-red-600 px-2.5 py-0.5 rounded font-mono font-bold uppercase border border-red-500/15">
                {selectedTaskForDelayedExcuse.task ? "Delaying Active Task" : "Delaying Core Goal"}
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-1">
                {selectedTaskForDelayedExcuse.task ? selectedTaskForDelayedExcuse.task.title : `Goal: ${selectedTaskForDelayedExcuse.goal.title}`}
              </h4>
              {selectedTaskForDelayedExcuse.task && (
                <p className="text-xs text-slate-500 font-medium">Under: {selectedTaskForDelayedExcuse.goal.title}</p>
              )}
              
              <form onSubmit={handleExcuseSubmit} className="mt-3 space-y-3">
                <textarea
                  value={excuseText}
                  onChange={(e) => setExcuseText(e.target.value)}
                  placeholder="e.g. 'I will do it tomorrow, feeling super tired' or 'Got lost on Instagram reels'"
                  className="w-full bg-white border border-pink-200 text-slate-800 p-3 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 min-h-[80px]"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCloseExcuseForm}
                    className="bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingExcuse}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-pink-600/15"
                  >
                    {isSubmittingExcuse ? "Logging Procrastination metrics..." : "Get Coached & Postpone Task"}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-pink-50/30 border border-pink-100 p-6 rounded-xl text-center space-y-3 font-medium">
              <Smile className="text-pink-600 w-10 h-10 mx-auto animate-bounce" />
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                No active delays queued. Backlog looks green! If you want to delay a subtask, click the <span className="text-pink-600 font-bold">Delay/Excuse</span> button on items in the dashboard index.
              </p>
            </div>
          )}
        </div>

        {/* Historic excuse roasts log */}
        <div className="space-y-3 pt-4 border-t border-pink-100">
          <span className="text-[10px] text-slate-500 font-mono font-medium uppercase">Procrastination Log Logs ({state.excuseLogs.length})</span>
          
          <div className="max-h-[190px] overflow-y-auto space-y-2.5 pr-1">
            {state.excuseLogs.map((log) => (
              <div key={log.id} className="bg-pink-50/10 p-3.5 border border-pink-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-pink-600 font-bold font-mono">{log.goalTitle}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-semibold quote text-slate-700 italic">"{log.excuse}"</p>
                
                <div className="p-2.5 rounded-lg bg-pink-50 border border-pink-100 text-[11px] text-pink-700 leading-snug">
                  {log.aiResponse}
                </div>
                <p className="text-[10px] text-red-500 font-mono italic">
                  Future consequence: {log.consequence}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Simulator slider */}
      <div className="bg-white border border-pink-150 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="text-pink-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Future Consequence Simulator</h3>
          </div>
          <p className="text-xs text-slate-600">
            Slide other deadlines and dates to simulate what happens if you delay assignments or studies. This is a real-time risk predictor.
          </p>

          {/* Goal Selector for Simulator */}
          {state.goals.length > 0 && (
            <div className="bg-pink-50/20 p-3.5 rounded-xl border border-pink-100">
              <label className="block text-[10px] uppercase tracking-wider text-pink-600 font-mono mb-1.5 font-bold">Select Goal to Simulate</label>
              <select
                value={simGoalId}
                onChange={(e) => setSimGoalId(e.target.value)}
                className="w-full bg-white border border-pink-150 text-slate-800 p-2 rounded-lg text-xs focus:outline-none focus:border-pink-500"
              >
                {state.goals.map(g => (
                  <option key={g.id} value={g.id} className="text-slate-800">{g.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Interactive Consequence Slider widget */}
          <div className="space-y-4 bg-pink-50/20 p-5 rounded-xl border border-pink-100">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-600">Milestone Skip Buffer</span>
              <span className="text-red-500 font-bold uppercase">{delayDays} Days Delayed</span>
            </div>

            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value))}
              className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 Days (Perfect)</span>
              <span>2 Days (Delay Risk)</span>
              <span>5 Days (Complete Crash)</span>
            </div>
          </div>
        </div>

        {/* Live Predictor output view */}
        {selectedSimGoal && (
          <div className="space-y-3.5 pt-4 border-t border-pink-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50/20 p-3 rounded-xl text-center border border-pink-100">
                <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Simulated Probability</span>
                <span className={`text-sm font-extrabold font-mono ${
                  simSuccessChance >= 75 ? "text-emerald-600" : simSuccessChance >= 50 ? "text-yellow-600" : "text-red-600"
                }`}>{simSuccessChance}% Success</span>
              </div>

              <div className="bg-pink-50/20 p-3 rounded-xl text-center border border-pink-100">
                <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Simulated Risk</span>
                <span className={`text-sm font-extrabold font-mono ${
                  simDelayRisk <= 25 ? "text-emerald-600" : simDelayRisk <= 50 ? "text-yellow-600" : "text-red-600"
                }`}>{simDelayRisk}% Danger</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="text-orange-500 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-orange-600 block font-mono">SIMULATION FEEDBACK LOG</span>
                <span className="text-xs text-orange-800 block mt-1 leading-snug">{simOutputText}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
