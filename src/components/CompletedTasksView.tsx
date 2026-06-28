import React, { useState } from "react";
import { CheckSquare, Calendar, Search, Trash2, Award, Flame, Filter } from "lucide-react";

interface CompletedTaskRecord {
  id: string;
  title: string;
  type: 'Reminder' | 'Subtask' | 'Main Goal';
  completedAt: string; // "YYYY-MM-DD"
  timestamp: string; // ISO string
  motivationalMessage: string;
}

interface CompletedTasksViewProps {
  completedTasks: CompletedTaskRecord[];
  onClearLog?: () => void;
}

export default function CompletedTasksView({ completedTasks, onClearLog }: CompletedTasksViewProps) {
  const [filterType, setFilterType] = useState<"all" | "Reminder" | "Subtask" | "Main Goal">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter completed tasks
  const filtered = completedTasks.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group by date
  const groupedByDate: { [date: string]: CompletedTaskRecord[] } = {};
  filtered.forEach(item => {
    const date = item.completedAt || new Date(item.timestamp).toISOString().split("T")[0];
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="bg-white border border-pink-100 p-6 rounded-3xl relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 text-center md:text-left flex-col md:flex-row">
          <div className="w-14 h-14 bg-pink-50 border border-pink-200 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
            <Award className="w-7 h-7 text-pink-600 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-800">
              Your Accomplishment Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              A chronological history of every conquered task, goal, and reminder.
            </p>
          </div>
        </div>

        {/* Dynamic Stats Box */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-100 p-4 rounded-2xl relative z-10 w-full md:w-auto justify-around shrink-0">
          <div className="text-center px-4">
            <div className="text-pink-600 font-extrabold text-2xl font-mono">
              {completedTasks.length}
            </div>
            <span className="text-[10px] text-slate-600 font-mono font-medium uppercase block">Total Completed</span>
          </div>
          <div className="w-[1px] h-10 bg-pink-100" />
          <div className="text-center px-4">
            <div className="text-rose-500 font-extrabold text-2xl font-mono flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
              <span>{Object.keys(groupedByDate).length}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono font-medium uppercase block">Active Days</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-pink-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search completed items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 pl-9 pr-4 py-1.5 rounded-xl text-xs focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto justify-end">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(["all", "Reminder", "Subtask", "Main Goal"] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterType === type
                  ? "bg-pink-600 border-pink-500 text-white"
                  : "bg-white border-pink-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              {type === "all" ? "All Types" : type === "Main Goal" ? "Main Goals" : type + "s"}
            </button>
          ))}
          {onClearLog && completedTasks.length > 0 && (
            <button
              onClick={onClearLog}
              title="Clear Accomplishment Ledger"
              className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date-wise Grouping Table / Layout */}
      <div className="space-y-6">
        {sortedDates.map(date => {
          // Format date beautifully
          const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <div key={date} className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-pink-50">
                <Calendar className="w-4.5 h-4.5 text-pink-600" />
                <h4 className="text-sm font-extrabold text-slate-800 font-mono tracking-tight">{formattedDate}</h4>
                <span className="text-xs bg-pink-100 text-pink-700 py-0.5 px-2 rounded-full border border-pink-200 font-bold font-mono">
                  {groupedByDate[date].length} {groupedByDate[date].length === 1 ? "task" : "tasks"}
                </span>
              </div>

              {/* Table format */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-pink-50 text-slate-500 font-mono font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-2">Task / Goal Title</th>
                      <th className="py-2.5 px-2 w-28">Type</th>
                      <th className="py-2.5 px-2">Compliment Boost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate[date].map(item => (
                      <tr key={item.id} className="border-b border-pink-50/50 hover:bg-pink-50/10 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-800 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{item.title}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                            item.type === "Main Goal"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : item.type === "Reminder"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-teal-50 text-teal-700 border-teal-200"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-pink-700 italic font-mono bg-pink-50/20 rounded-lg max-w-sm pl-3 border-l-2 border-pink-400">
                          "{item.motivationalMessage}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="bg-white border border-pink-100 p-12 rounded-3xl text-center space-y-3 shadow-sm">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No completed items found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Check tasks off your list on the active dashboard. We will prompt you to celebrate your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
