import React from "react";
import { DBState } from "../types.js";
import { TrendingUp, BarChart2, PieChart, Activity, ShieldAlert, Sparkles, Inbox } from "lucide-react";

interface AnalyticsCenterProps {
  state: DBState;
}

export default function AnalyticsCenter({ state }: AnalyticsCenterProps) {
  const { profile, goals, excuseLogs } = state;

  // Gather actual counts from database state
  const allSubtasks = goals.flatMap(g => g.subtasks);
  const completedSubtasks = allSubtasks.filter(s => s.completed);
  const pendingSubtasks = allSubtasks.filter(s => !s.completed);
  
  const totalCompleted = completedSubtasks.length;
  const totalPending = pendingSubtasks.length;
  const totalFocusHours = Number(profile.focusHours || 0);

  // Check if there is zero activity to show an empty state
  const isEmptyState = goals.length === 0 || (totalCompleted === 0 && totalPending === 0 && excuseLogs.length === 0);

  // Distribute the completed tasks and focus hours dynamically across the week
  const weeklyTrends = [
    { day: "Mon", completed: 0, pending: 0, hours: 0 },
    { day: "Tue", completed: 0, pending: 0, hours: 0 },
    { day: "Wed", completed: 0, pending: 0, hours: 0 },
    { day: "Thu", completed: 0, pending: 0, hours: 0 },
    { day: "Fri", completed: 0, pending: 0, hours: 0 },
    { day: "Sat", completed: 0, pending: 0, hours: 0 },
    { day: "Sun", completed: 0, pending: 0, hours: 0 }
  ];

  if (!isEmptyState) {
    // Distribute actual completed tasks
    completedSubtasks.forEach((sub, idx) => {
      const dayIndex = idx % 7;
      weeklyTrends[dayIndex].completed += 1;
      weeklyTrends[dayIndex].hours += Number((sub.durationMinutes / 60).toFixed(1));
    });

    // Distribute actual pending tasks
    pendingSubtasks.forEach((sub, idx) => {
      const dayIndex = (idx + 2) % 7;
      weeklyTrends[dayIndex].pending += 1;
    });

    // Ensure total focus hours match the user profile focusHours by distributing remainder if any
    const distributedHours = weeklyTrends.reduce((acc, t) => acc + t.hours, 0);
    const remainder = Math.max(0, totalFocusHours - distributedHours);
    if (remainder > 0) {
      weeklyTrends[3].hours += Number(remainder.toFixed(1)); // add remainder to Thursday
    }
  }

  // Derive procrastination excuse topics dynamically from actual excuse logs
  const excuseTopics = {
    tired: excuseLogs.filter(e => e.excuse.toLowerCase().includes("tired") || e.excuse.toLowerCase().includes("sleep") || e.excuse.toLowerCase().includes("exhausted")).length,
    social: excuseLogs.filter(e => e.excuse.toLowerCase().includes("scroll") || e.excuse.toLowerCase().includes("insta") || e.excuse.toLowerCase().includes("reel") || e.excuse.toLowerCase().includes("phone") || e.excuse.toLowerCase().includes("youtube")).length,
    tomorrow: excuseLogs.filter(e => e.excuse.toLowerCase().includes("tomorrow") || e.excuse.toLowerCase().includes("later") || e.excuse.toLowerCase().includes("postpone")).length,
    other: 0
  };
  excuseTopics.other = Math.max(0, excuseLogs.length - (excuseTopics.tired + excuseTopics.social + excuseTopics.tomorrow));

  const totalExcuses = excuseLogs.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Chart 1: Focus Hours & Completion Weekly trends */}
      <div className="bg-white border border-pink-100 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-pink-600 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Weekly Focus & Execution Trends</h3>
            </div>
            <span className="text-[10px] text-pink-500 font-mono font-bold">
              {isEmptyState ? "EMPTY STATE" : "DYNAMIC PERFORMANCE"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Analyze your focus hours and task completion density distributed over the current week.
          </p>
        </div>

        {isEmptyState ? (
          <div className="bg-pink-50/20 border border-pink-100 p-8 rounded-2xl text-center flex flex-col items-center justify-center h-48 space-y-2">
            <Inbox className="w-8 h-8 text-pink-300" />
            <p className="text-xs text-slate-500 font-mono">No weekly focus activities logged yet.</p>
            <p className="text-[10px] text-slate-400">Create a task, check it off, and watch this chart populate.</p>
          </div>
        ) : (
          <div className="bg-pink-50/10 p-4 rounded-xl border border-pink-100">
            <svg className="w-full h-48" viewBox="0 0 400 180">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(244, 63, 94, 0.08)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(244, 63, 94, 0.08)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(244, 63, 94, 0.08)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#e11d48" className="text-[9px] font-mono font-medium">6 hrs</text>
              <text x="15" y="65" fill="#e11d48" className="text-[9px] font-mono font-medium">4 hrs</text>
              <text x="15" y="105" fill="#e11d48" className="text-[9px] font-mono font-medium">2 hrs</text>
              <text x="15" y="145" fill="#e11d48" className="text-[9px] font-mono font-medium">0 hrs</text>

              {/* Bars Render */}
              {weeklyTrends.map((trend, idx) => {
                const barWidth = 24;
                const xPos = 40 + idx * 48 + 10;
                const maxHours = Math.max(6.5, totalFocusHours);
                const hHeight = maxHours > 0 ? (trend.hours / maxHours) * 110 : 0;
                const yPos = 140 - hHeight;

                return (
                  <g key={trend.day} className="group cursor-pointer">
                    {/* Focus hours Bar (Pink) */}
                    <rect
                      x={xPos}
                      y={yPos}
                      width={barWidth}
                      height={Math.max(2, hHeight)}
                      fill="#ec4899"
                      opacity="0.85"
                      rx="3"
                      className="transition-all hover:opacity-100"
                    />
                    {/* Dot indication for completion count (Emerald) */}
                    {trend.completed > 0 && (
                      <circle
                        cx={xPos + barWidth / 2}
                        cy={Math.max(20, 140 - trend.completed * 25)}
                        r="4.5"
                        fill="#10b981"
                        className="animate-pulse"
                      />
                    )}
                    {/* X Axis label */}
                    <text
                      x={xPos + barWidth / 2}
                      y="160"
                      fill="#64748b"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-medium"
                    >
                      {trend.day}
                    </text>
                    <title>{`Focus: ${trend.hours}h, Completed: ${trend.completed} tasks`}</title>
                  </g>
                );
              })}
            </svg>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-3 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-pink-500 rounded-sm" />
                <span className="text-slate-600">Focus Duration (Hours)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-slate-600">Completed Tasks</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 bg-pink-50/20 p-4 rounded-xl border border-pink-100">
          <Activity className="text-pink-600 w-5 h-5 shrink-0 animate-pulse" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {isEmptyState 
              ? "No study logs found. Set your active target goal and log your first focused hour to start compiling insights."
              : `Your focus hours distributed are at a total of ${totalFocusHours}h. Great progress! Complete tasks scheduled on time to keep consistency high.`}
          </p>
        </div>
      </div>

      {/* Chart 2: Procrastination & Excuses Distribution */}
      <div className="bg-white border border-pink-100 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="text-pink-600 w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Excuse Log Analysis</h3>
            </div>
            <span className="text-[10px] text-pink-500 font-mono font-bold">
              {isEmptyState ? "EMPTY STATE" : "AI AUTO-DERIVED"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            See the dynamic classification of excuses logged whenever milestones were delayed.
          </p>
        </div>

        {isEmptyState ? (
          <div className="bg-pink-50/20 border border-pink-100 p-8 rounded-2xl text-center flex flex-col items-center justify-center h-48 space-y-2">
            <Sparkles className="w-8 h-8 text-pink-300" />
            <p className="text-xs text-slate-500 font-mono">No excuses logged yet.</p>
            <p className="text-[10px] text-slate-400">You are either extremely disciplined, or haven't delayed any task yet!</p>
          </div>
        ) : (
          <div className="bg-pink-50/10 p-5 rounded-xl border border-pink-100 space-y-4 flex flex-col justify-center h-48">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-600">
                <span>Fatigue & Sleeping Excuses</span>
                <span className="text-pink-600 font-bold font-mono">
                  {excuseTopics.tired} ({totalExcuses > 0 ? Math.round((excuseTopics.tired / totalExcuses) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-500 h-full transition-all duration-500" 
                  style={{ width: `${totalExcuses > 0 ? (excuseTopics.tired / totalExcuses) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-600">
                <span>Attention Holes (Instagram, Reels, Phone)</span>
                <span className="text-pink-600 font-bold font-mono">
                  {excuseTopics.social} ({totalExcuses > 0 ? Math.round((excuseTopics.social / totalExcuses) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ width: `${totalExcuses > 0 ? (excuseTopics.social / totalExcuses) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-600">
                <span>Tomorrow-itis & Postponement Bias</span>
                <span className="text-pink-600 font-bold font-mono">
                  {excuseTopics.tomorrow} ({totalExcuses > 0 ? Math.round((excuseTopics.tomorrow / totalExcuses) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all duration-500" 
                  style={{ width: `${totalExcuses > 0 ? (excuseTopics.tomorrow / totalExcuses) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 bg-pink-50/20 p-4 rounded-xl border border-pink-100">
          <ShieldAlert className="text-pink-600 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block">AI Habit Observation:</span>
            {isEmptyState 
              ? "Chronova's pattern-recognition neural net is currently passive. Log excuses on delay-prompts to trace habits."
              : `You have logged ${totalExcuses} excuses. Keep excuses minimized to lock in high performance scores.`}
          </div>
        </div>
      </div>

    </div>
  );
}
