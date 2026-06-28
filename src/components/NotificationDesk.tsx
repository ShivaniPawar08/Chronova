import React, { useState } from "react";
import { DBState, AppNotification } from "../types.js";
import { MessageSquare, Mail, Bell, Smartphone, Send, Check } from "lucide-react";

interface NotificationDeskProps {
  state: DBState;
}

export default function NotificationDesk({ state }: NotificationDeskProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "whatsapp" | "email" | "push">("all");

  const { notifications } = state;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotifs = notifications.filter(notif => {
    if (activeTab === "all") return true;
    if (activeTab === "whatsapp") return !!notif.whatsappTemplate;
    if (activeTab === "email") return !!notif.emailTemplate;
    if (activeTab === "push") return !!notif.pushChannel;
    return true;
  });

  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-6 space-y-6 shadow-sm">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-pink-600 w-5 h-5 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Multi-Channel Accountability Alerts</h3>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg overflow-hidden border border-pink-100 p-1 bg-pink-50/50 self-start sm:self-center text-[10px]">
          {([
            { id: "all", label: "All Alerts" }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 font-bold rounded-md transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-pink-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Streams */}
      <div className="space-y-4">
        {filteredNotifs.map((notif) => (
          <div 
            key={notif.id}
            className="bg-white border border-pink-100 p-5 rounded-xl space-y-4 transition-all hover:border-pink-200 animate-in fade-in duration-200 shadow-sm"
          >
            {/* Base alert summary */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  notif.type === "humor" ? "bg-amber-400" : notif.type === "warning" ? "bg-red-400" : "bg-pink-400"
                }`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{notif.timestamp}</span>
                </div>
              </div>

              <span className="text-[10px] bg-pink-50 text-pink-700 font-mono py-0.5 px-2 rounded-full uppercase font-bold border border-pink-100">
                {notif.type} style
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-pink-50/10 p-3 rounded-lg border border-pink-100">
              {notif.message}
            </p>

            {/* Render detail view based on tabs or show inline boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
              
              {/* WhatsApp Mock Panel */}
              {notif.whatsappTemplate && (activeTab === "all" || activeTab === "whatsapp") && (
                <div className="bg-emerald-50/30 border border-emerald-200 p-3.5 rounded-lg space-y-2">
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-700 font-mono font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Sandbox Template
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-snug">{notif.whatsappTemplate}</p>
                  <button
                    onClick={() => handleCopy(notif.id + "_wa", notif.whatsappTemplate || "")}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 hover:text-emerald-600 cursor-pointer"
                  >
                    {copiedId === notif.id + "_wa" ? <Check className="w-3 h-3 text-emerald-600" /> : <Send className="w-3 h-3 text-emerald-600" />}
                    <span>{copiedId === notif.id + "_wa" ? "Copied Sandbox Payload!" : "Copy WhatsApp text"}</span>
                  </button>
                </div>
              )}

              {/* Email Mock Panel */}
              {notif.emailTemplate && (activeTab === "all" || activeTab === "email") && (
                <div className="bg-pink-50/20 border border-pink-150 p-3.5 rounded-lg space-y-2">
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-pink-700 font-mono font-bold">
                    <Mail className="w-3.5 h-3.5 text-pink-600" /> Email Digest Dispatcher
                  </span>
                  <pre className="text-[10px] text-pink-800 font-sans leading-relaxed whitespace-pre-wrap">{notif.emailTemplate}</pre>
                  <button
                    onClick={() => handleCopy(notif.id + "_em", notif.emailTemplate || "")}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-pink-700 hover:text-pink-600 cursor-pointer"
                  >
                    {copiedId === notif.id + "_em" ? <Check className="w-3 h-3 text-pink-600" /> : <Send className="w-3 h-3 text-pink-600" />}
                    <span>{copiedId === notif.id + "_em" ? "Copied Digest Layout!" : "Copy Digest Mail Body"}</span>
                  </button>
                </div>
              )}

              {/* Push alert panel */}
              {notif.pushChannel && (activeTab === "all" || activeTab === "push") && (
                <div className="bg-pink-50/30 border border-pink-100 p-3.5 rounded-lg space-y-1 md:col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-pink-600 font-mono block font-bold">
                    Standard Browser Notification Sandbox
                  </span>
                  <p className="text-[11px] text-slate-700 italic">"{notif.pushChannel}"</p>
                </div>
              )}

            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="p-10 text-center bg-pink-50/20 rounded-xl border border-pink-100">
            <Bell className="w-8 h-8 text-pink-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-mono">No notifications logged for the selected filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
