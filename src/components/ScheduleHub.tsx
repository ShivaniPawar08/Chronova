import React, { useState } from "react";
import { DBState, Goal, SubTask } from "../types.js";
import { Calendar, Clock, BookOpen, AlertTriangle, Play, CheckCircle, RefreshCw, Bell, Target, List, Moon, Briefcase, Sparkles, Smile, Info } from "lucide-react";

interface ScheduleHubProps {
  state: DBState;
  onTriggerRecovery: (goalId: string) => void;
  reminders?: any[];
  onToggleReminder?: (reminderId: string) => void;
  onOpenReminderModal?: () => void;
  onAutoAlign?: () => void;
}

export default function ScheduleHub({ state, onTriggerRecovery, reminders = [], onToggleReminder, onOpenReminderModal, onAutoAlign }: ScheduleHubProps) {
  const [activePlanTab, setActivePlanTab] = useState<"daily" | "weekly" | "revision" | "recovery">("daily");
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [aligning, setAligning] = useState(false);
  
  const { onboarding } = state.profile;
  const wakeTime = onboarding?.wakeTime || "07:00";
  const sleepTime = onboarding?.sleepTime || "23:00";
  const workHours = onboarding?.workHours || "09:00-17:00";

  // Gather all subtasks across goals
  const allSubtasks: Array<{ goal: Goal; task: SubTask }> = [];
  state.goals.forEach(goal => {
    goal.subtasks.forEach(task => {
      allSubtasks.push({ goal, task });
    });
  });

  // Sort subtasks by their scheduled time
  allSubtasks.sort((a, b) => a.task.scheduledTime.localeCompare(b.task.scheduledTime));

  const getHourCategory = (h: number) => {
    let wakeH = 7;
    let sleepH = 23;
    let workStartH = 9;
    let workEndH = 17;

    try {
      wakeH = parseInt(wakeTime.split(":")[0]);
      sleepH = parseInt(sleepTime.split(":")[0]);
    } catch (e) {}

    try {
      const parts = workHours.split("-");
      if (parts.length === 2) {
        workStartH = parseInt(parts[0].split(":")[0]);
        workEndH = parseInt(parts[1].split(":")[0]);
      }
    } catch (e) {}

    // Check Sleep
    let isSleep = false;
    if (sleepH > wakeH) {
      isSleep = h >= sleepH || h < wakeH;
    } else {
      isSleep = h >= sleepH && h < wakeH;
    }

    if (isSleep) return "sleep";

    // Check Work
    let isWork = false;
    if (workEndH > workStartH) {
      isWork = h >= workStartH && h < workEndH;
    } else {
      isWork = h >= workStartH || h < workEndH;
    }

    if (isWork) return "work";

    return "available";
  };

  const getTasksInHour = (h: number) => {
    return allSubtasks.filter(({ task }) => {
      if (!task.scheduledTime) return false;
      const taskH = parseInt(task.scheduledTime.split(":")[0]);
      return taskH === h;
    });
  };

  const handleRunAlignment = async () => {
    if (!onAutoAlign) return;
    setAligning(true);
    try {
      await onAutoAlign();
    } finally {
      setAligning(false);
    }
  };

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm text-slate-100">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-pink-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-white tracking-tight uppercase">Scheduling Deck</h3>
          </div>
          <p className="text-xs text-slate-400">
            Automatically aligns your milestones with sleeping periods, blocked college/office slots, and active availability.
          </p>
        </div>

        {/* Schedule Mode Switchers */}
        <div className="flex rounded-xl overflow-hidden border border-zinc-800 p-1 bg-[#030712] self-start sm:self-center">
          {([
            { id: "daily", label: "Daily Agenda" }
          ] as const).map(tab => (
            <button
               key={tab.id}
               onClick={() => setActivePlanTab(tab.id)}
               className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                 activePlanTab === tab.id
                   ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                   : "text-slate-400 hover:text-pink-500"
               }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Metadata Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#030712] p-4 rounded-xl border border-zinc-800 text-xs font-mono text-slate-300">
        <div>
          <span className="text-slate-500 text-[10px] block font-bold uppercase">Wake Up Boundary</span>
          <span className="text-pink-500 font-bold">{wakeTime} AM</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block font-bold uppercase">Sleep Target</span>
          <span className="text-pink-500 font-bold">{sleepTime} PM</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block font-bold uppercase">Office / Busy Slate</span>
          <span className="text-pink-500 font-bold">{workHours}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block font-bold uppercase">Daily Intended Focus</span>
          <span className="text-pink-500 font-bold">{onboarding?.studyHours || 4} Hours</span>
        </div>
      </div>

      {/* Dynamic AI Automatic Alignment Optimizer Panel */}
      <div className="bg-[#09090b] text-white p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl relative">
        {/* Glow effect contained to avoid outer panel clipping */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-1.5 text-pink-500 text-xs font-bold uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Alignment Engine
            </div>
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">Chronova Auto-Align Workspace</h4>
            <p className="text-[11px] text-zinc-400">
              Chronova scans your awake hours and locks down sleep target hours (<strong>{sleepTime} PM - {wakeTime} AM</strong>) and work blocks (<strong>{workHours}</strong>) to compute your <strong>Active Availability windows</strong>. Click below to re-pack and align all milestones optimally into your free slots.
            </p>
          </div>
          
          <button
            onClick={handleRunAlignment}
            disabled={aligning}
            className="self-start md:self-center bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-pink-500/20 font-mono flex items-center gap-2 whitespace-nowrap z-10"
          >
            {aligning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Aligning Blocks...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Auto-Align Milestones
              </>
            )}
          </button>
        </div>

        {/* 24-Hour Timeline Visualizer Track */}
        <div className="space-y-2 pt-2 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>24-Hour Daily Workspace Timeline</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-800 border border-zinc-700 inline-block" /> Sleep Period
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500 inline-block" /> Work/College Lock
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500 inline-block" /> Active Window
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 select-none">
            {Array.from({ length: 24 }).map((_, hour) => {
              const cat = getHourCategory(hour);
              const tasks = getTasksInHour(hour);
              const hasTasks = tasks.length > 0;
              const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;

              let catStyle = "bg-zinc-850 text-zinc-500 border-zinc-800/40";
              if (cat === "sleep") catStyle = "bg-zinc-900 border-zinc-850 text-zinc-600";
              else if (cat === "work") catStyle = "bg-amber-500/10 border-amber-500/30 text-amber-500";
              else if (cat === "available") catStyle = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";

              return (
                <div
                  key={hour}
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className={`relative p-1.5 text-center text-[10px] font-mono border rounded-lg transition-all duration-150 cursor-help flex flex-col items-center justify-between min-h-[44px] ${catStyle} ${
                    hoveredHour === hour ? "scale-105 ring-1 ring-pink-500 border-pink-500 z-30" : ""
                  }`}
                >
                  <span className="font-bold">{formattedHour}</span>
                  
                  {/* Task indicators inside blocks */}
                  {hasTasks ? (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse mt-1" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                  )}

                  {/* Hourly tasks popover */}
                  {hoveredHour === hour && (() => {
                    let alignmentClass = "left-1/2 -translate-x-1/2";
                    if (hour < 5) alignmentClass = "left-0";
                    else if (hour > 18) alignmentClass = "right-0";
                    return (
                      <div className={`absolute bottom-full mb-2 w-56 bg-[#09090b] border border-zinc-800 text-[10px] rounded-lg p-3 text-left text-zinc-200 z-50 shadow-2xl space-y-2 pointer-events-none ${alignmentClass}`}>
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-1 font-bold text-pink-500">
                          <span>Hour {formattedHour}:00</span>
                          <span className="capitalize">{cat}</span>
                        </div>
                        
                        {cat === "sleep" && <p className="text-zinc-500">🛌 Protected Sleep Boundary</p>}
                        {cat === "work" && <p className="text-amber-500/80">🏫 Busy Work/College block</p>}
                        {cat === "available" && !hasTasks && <p className="text-emerald-400">✨ Available Free Time Slot</p>}
                        
                        {hasTasks ? (
                          <div className="space-y-1">
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Scheduled Milestones:</p>
                            {tasks.map(({ goal, task }, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[9px] bg-zinc-900 p-1 rounded border border-zinc-800 text-zinc-100">
                                <span className="w-1 h-1 rounded-full bg-pink-500" />
                                <span className="truncate flex-1 font-bold">{task.title}</span>
                                <span className="text-[8px] text-pink-400 font-mono">{task.scheduledTime}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Rendering depending on Active Agenda category tab */}
      {activePlanTab === "daily" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PART 1: All Tasks & Deadlines */}
          <div className="space-y-4 bg-[#030712]/50 p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Target className="w-4 h-4 text-pink-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-500 font-mono">Tasks and Deadlines</h4>
            </div>

            <div className="space-y-4">
              {/* Display Goals & Deadlines */}
              {state.goals.map(goal => (
                <div key={goal.id} className="bg-[#030712] p-4 rounded-xl border border-zinc-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">{goal.title}</span>
                    <span className="text-[10px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20 font-mono">
                      Deadline: {goal.deadline}
                    </span>
                  </div>

                  {/* Goal Subtasks list */}
                  <div className="space-y-2">
                    {goal.subtasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between bg-[#09090b] p-2.5 rounded border border-zinc-800/80 text-xs text-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${task.completed ? "bg-emerald-500" : "bg-pink-500"}`} />
                          <span className={`truncate ${task.completed ? "line-through text-slate-500" : ""}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-slate-400">
                          <Clock className="w-3 h-3 text-pink-500" />
                          <span>{task.scheduledTime}</span>
                        </div>
                      </div>
                    ))}
                    {goal.subtasks.length === 0 && (
                      <p className="text-[11px] text-slate-500 font-mono italic">No tasks listed for this goal.</p>
                    )}
                  </div>
                </div>
              ))}

              {state.goals.length === 0 && (
                <p className="text-xs text-slate-500 font-mono italic">No tasks or goals onboarded yet. Create a goal to begin.</p>
              )}
            </div>
          </div>

          {/* PART 2: Reminders Set by User */}
          <div className="space-y-4 bg-[#030712]/50 p-5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-500 font-mono">Reminders Set by User</h4>
              </div>
              {onOpenReminderModal && (
                <button
                  onClick={onOpenReminderModal}
                  className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                >
                  <Bell className="w-3 h-3" /> + Set Reminder
                </button>
              )}
            </div>

            <div className="space-y-3">
              {reminders.map(rem => (
                <div key={rem.id} className="bg-[#030712] p-4 rounded-xl border border-zinc-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rem.status === "completed"}
                        onChange={() => onToggleReminder?.(rem.id)}
                        className="w-4 h-4 text-pink-500 border-zinc-700 rounded bg-zinc-950 focus:ring-pink-500 cursor-pointer"
                      />
                      <span className={`text-xs font-bold text-white truncate max-w-[180px] ${rem.status === "completed" ? "line-through text-slate-500 font-normal" : ""}`}>{rem.taskName}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      rem.status === "completed" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : rem.status === "declined" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-pink-500/10 text-pink-400 border border-pink-500/20 animate-pulse"
                    }`}>
                      {rem.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-1.5 border-t border-zinc-800">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-500" />
                      <span>{rem.dateTime ? rem.dateTime.replace("T", " ") : "Not set"}</span>
                    </div>

                    {rem.testMode && (
                      <span className="text-pink-400 font-semibold bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                        Demo Mode Active
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {reminders.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-8 h-8 mx-auto text-pink-500 mb-2 opacity-50" />
                  <p className="text-xs font-mono italic">No reminders scheduled yet.</p>
                  {onOpenReminderModal ? (
                    <button
                      onClick={onOpenReminderModal}
                      className="mt-2 inline-flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-md cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" /> Set Task Reminder
                    </button>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1">Use the "Set Task Reminder" button in the navigation bar to schedule one.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
