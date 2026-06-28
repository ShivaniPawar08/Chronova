import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding.js";
import MainDashboard from "./components/MainDashboard.js";
import LandingPage from "./components/LandingPage.js";
import AICoachConsole from "./components/AICoachConsole.js";
import ScheduleHub from "./components/ScheduleHub.js";
import AnalyticsCenter from "./components/AnalyticsCenter.js";
import NotificationDesk from "./components/NotificationDesk.js";
import SupportChat from "./components/SupportChat.js";
import CompletedTasksView from "./components/CompletedTasksView.js";
import { DBState, Goal, SubTask } from "./types.js";
import { 
  Flame, 
  MessageSquare, 
  Calendar, 
  BarChart2, 
  Bell, 
  Target, 
  LogOut, 
  Sparkles,
  ArrowRight,
  Shield,
  RefreshCw,
  Mail,
  Lock,
  CheckSquare,
  Menu,
  X,
  Droplets,
  Heart,
  Activity,
  Infinity
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

const toLocalISOString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function App() {
  const [currentUsername, setCurrentUsername] = useState<string>(() => localStorage.getItem("verified_username") || "");
  const [dbState, setDbState] = useState<DBState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "coach" | "schedule" | "analytics" | "notifications" | "emotionalSupport" | "completedTasks">("dashboard");
  const [showNavMenu, setShowNavMenu] = useState(false);
  
  // Simulated Phone Notification Banner State
  const [simulatedPhoneAlert, setSimulatedPhoneAlert] = useState<{ id: string; title: string; body: string; timestamp: string } | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          try {
            new Notification("Chronova Alerts Active!", {
              body: "Native notifications are now successfully connected to your device!",
            });
          } catch (err) {
            console.warn("Notification error:", err);
          }
        }
      });
    }
  };

  const triggerNativeNotification = (title: string, options: { body: string }) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, options);
        } catch (e) {
          console.warn("Native Notification trigger error:", e);
        }
      }
    }

    // Automatically display floating, mock iPhone/Android notification alert overlay at the top for simulation
    setSimulatedPhoneAlert({
      id: "alert_" + Date.now(),
      title,
      body: options.body,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
  };

  // Auto-dismiss simulated phone alerts after 7 seconds
  useEffect(() => {
    if (simulatedPhoneAlert) {
      const timer = setTimeout(() => {
        setSimulatedPhoneAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [simulatedPhoneAlert]);
  
  // Completed tasks historic ledger
  const [completedTasksLog, setCompletedTasksLog] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chronova_completed_tasks_log");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("chronova_completed_tasks_log", JSON.stringify(completedTasksLog));
  }, [completedTasksLog]);

  // Intercept state for the completion check prompt: "Did you actually complete this?"
  const [activeCheckTarget, setActiveCheckTarget] = useState<{
    type: 'Reminder' | 'Subtask' | 'Main Goal';
    id: string;
    parentId?: string;
    title: string;
  } | null>(null);

  // Motivational compliment/celebration state
  const [celebrationMessage, setCelebrationMessage] = useState<{
    title: string;
    message: string;
    compliment: string;
  } | null>(null);

  // Login modal setup
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // OTP simulation states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [simulatedOtpBadge, setSimulatedOtpBadge] = useState<string | null>(null);

  // Active Excuse queue state
  const [selectedTaskToPostpone, setSelectedTaskToPostpone] = useState<{ goal: Goal; task: SubTask | null } | null>(null);

  // Reminders list state
  const [reminders, setReminders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chronova_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Reminder alerts & completion check prompts
  const [reminderAlerts, setReminderAlerts] = useState<string[]>([]);
  const [activeCheckReminder, setActiveCheckReminder] = useState<any | null>(null);
  const [reminderExcuseInput, setReminderExcuseInput] = useState("");
  const [showReminderExcuseForm, setShowReminderExcuseForm] = useState(false);
  const [reminderRoast, setReminderRoast] = useState<string | null>(null);
  const [reminderCompliment, setReminderCompliment] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Set Reminder Modal states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [modalTab, setModalTab] = useState<'custom' | 'health'>('custom');
  const [reminderTaskName, setReminderTaskName] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [reminderTestMode, setReminderTestMode] = useState(false);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTaskName.trim() || !reminderDateTime) return;

    const remTime = new Date(reminderDateTime).getTime();
    const now = Date.now();
    const diffMs = remTime - now;

    const notifiedMilestones = {
      "24h": diffMs <= 24 * 3600 * 1000 ? false : true,
      "12h": diffMs <= 12 * 3600 * 1000 ? false : true,
      "1h": diffMs <= 1 * 3600 * 1000 ? false : true,
      "10m": diffMs <= 10 * 60 * 1000 ? false : true,
      "exact": false,
      "completionCheck": false
    };

    // If setting a reminder for e.g. 10 mins from now, we should only enable milestones that are < 10 mins away.
    // Wait, the logic should be: if it's 10 mins away, 24h, 12h, and 1h are ALREADY "passed" effectively, so we mark them as true (already notified) to skip them.
    
    const initialNotified = {
      "24h": diffMs < 24 * 3600 * 1000,
      "12h": diffMs < 12 * 3600 * 1000,
      "1h": diffMs < 1 * 3600 * 1000,
      "10m": diffMs < 10 * 60 * 1000,
      "exact": false,
      "completionCheck": false
    };

    const newRem = {
      id: "rem_" + Date.now(),
      taskName: reminderTaskName.trim(),
      dateTime: reminderDateTime,
      testMode: reminderTestMode,
      notifiedMilestones: initialNotified,
      status: "pending"
    };

    handleAddReminder(newRem);
    setReminderTaskName("");
    setReminderDateTime("");
    setReminderTestMode(false);
    setShowReminderModal(false);
  };

  const handleCreateHealthReminder = (type: string) => {
    // Request permission to link device notifications
    requestNotificationPermission();

    let taskName = "";
    let repeatHours = 0;
    let targetTime = new Date();

    if (type === "water") {
      taskName = "💧 Drink Water & Hydrate";
      repeatHours = 2;
      targetTime.setHours(targetTime.getHours() + 2);
    } else if (type === "medicine_morning") {
      taskName = "💊 Take Morning Medicine";
      repeatHours = 24;
      targetTime.setHours(8, 0, 0, 0);
      if (targetTime.getTime() < Date.now()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
    } else if (type === "medicine_night") {
      taskName = "💊 Take Bedtime Medicine";
      repeatHours = 24;
      targetTime.setHours(21, 0, 0, 0);
      if (targetTime.getTime() < Date.now()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
    } else if (type === "stretch") {
      taskName = "🧘 Posture Check & Stretch Break";
      repeatHours = 1;
      targetTime.setHours(targetTime.getHours() + 1);
    } else if (type === "eyerest") {
      taskName = "👁️ 20-20-20 Eye Rest Break";
      repeatHours = 0.333; // 20 minutes
      targetTime.setMinutes(targetTime.getMinutes() + 20);
    }

    // Check if a health reminder of this type already exists
    const existing = reminders.find(r => r.healthType === type && r.isHealth);
    if (existing) {
      // Deactivate it
      setReminders(prev => prev.filter(r => r.id !== existing.id));
      setReminderAlerts(prev => [...prev, `Deactivated: "${taskName}" reminder.`]);
      return;
    }

    const remTime = targetTime.getTime();
    const now = Date.now();
    const diffMs = remTime - now;

    // Health reminders skip all milestones except the exact time
    const initialNotified = {
      "24h": true,
      "12h": true,
      "1h": true,
      "10m": true,
      "exact": false,
      "completionCheck": false
    };

    const newRem = {
      id: "rem_" + Date.now(),
      taskName,
      dateTime: toLocalISOString(targetTime),
      isHealth: true,
      healthType: type,
      repeatHours,
      notifiedMilestones: initialNotified,
      status: "pending"
    };

    handleAddReminder(newRem);
    setShowReminderModal(false);
  };

  // Load state on startup
  useEffect(() => {
    if (currentUsername) {
      fetchState(currentUsername);
    } else {
      setLoading(false);
    }
  }, [currentUsername]);

  // Save reminders to localStorage on update
  useEffect(() => {
    localStorage.setItem("chronova_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Periodic Reminder milestone scanner
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let updated = false;
      const nextReminders = reminders.map(rem => {
        if (rem.status !== "pending") return rem;
        const remTime = new Date(rem.dateTime).getTime();
        const diffMs = remTime - now;

        const notified = { ...rem.notifiedMilestones };
        let milestoneTriggered = false;
        let msg = "";

        // If it is a recurring health reminder and exact time has passed
        if (rem.isHealth && diffMs <= 0) {
          updated = true;
          const rHours = rem.repeatHours || 2;
          const nextMs = rHours * 60 * 60 * 1000;
          const nextTimeDate = new Date(Date.now() + nextMs);
          const nextTime = toLocalISOString(nextTimeDate);
          const alertMsg = `⏱️ Health Reminder: Time to "${rem.taskName}"! Next alert scheduled automatically.`;
          
          triggerNativeNotification("Chronova Health Alert", {
            body: alertMsg,
          });

          // Correctly calculate which milestones should be pre-marked as true for the NEXT cycle
          const nextInitialNotified = {
            "24h": nextMs < 24 * 3600 * 1000,
            "12h": nextMs < 12 * 3600 * 1000,
            "1h": nextMs < 1 * 3600 * 1000,
            "10m": nextMs < 10 * 60 * 1000,
            "exact": false,
            "completionCheck": false
          };

          return {
            ...rem,
            dateTime: nextTime,
            notifiedMilestones: nextInitialNotified
          };
        }

        // 24h before
        if (diffMs <= 24 * 3600 * 1000 && diffMs > 0 && !notified["24h"]) {
          notified["24h"] = true;
          milestoneTriggered = true;
          msg = `24h Reminder: "${rem.taskName}" is scheduled for tomorrow!`;
          triggerNativeNotification("Chronova 24h Reminder", { body: msg });
        }
        // 12h before
        else if (diffMs <= 12 * 3600 * 1000 && diffMs > 0 && !notified["12h"]) {
          notified["12h"] = true;
          milestoneTriggered = true;
          msg = `12h Reminder: "${rem.taskName}" starts in 12 hours!`;
          triggerNativeNotification("Chronova 12h Reminder", { body: msg });
        }
        // 1h before
        else if (diffMs <= 1 * 3600 * 1000 && diffMs > 0 && !notified["1h"]) {
          notified["1h"] = true;
          milestoneTriggered = true;
          msg = `1h Reminder: "${rem.taskName}" starts in 1 hour. Get ready!`;
          triggerNativeNotification("Chronova 1h Reminder", { body: msg });
        }
        // 10m before
        else if (diffMs <= 10 * 60 * 1000 && diffMs > 0 && !notified["10m"]) {
          notified["10m"] = true;
          milestoneTriggered = true;
          msg = `10m Reminder: "${rem.taskName}" starts in 10 minutes. Put down distractions!`;
          triggerNativeNotification("Chronova 10m Reminder", { body: msg });
        }
        // Exact time
        else if (diffMs <= 0 && diffMs > -5000 && !notified["exact"]) {
          notified["exact"] = true;
          milestoneTriggered = true;
          msg = `Time is UP! It's time to start "${rem.taskName}" right now!`;
          triggerNativeNotification("Chronova Milestone Reminder", { body: msg });
        }
        // Completion Check (past 30 mins, or past 15 seconds if in simulated testMode)
        else if (diffMs <= -30 * 60 * 1000 || (rem.testMode && diffMs <= -15 * 1000)) {
          if (!notified["completionCheck"]) {
            notified["completionCheck"] = true;
            milestoneTriggered = true;
            // Trigger the modal completion check
            setActiveCheckReminder(rem);
            setReminderExcuseInput("");
            setShowReminderExcuseForm(false);
            setReminderRoast(null);
            setReminderCompliment(null);
          }
        }

        if (milestoneTriggered) {
          updated = true;
          if (msg) {
            setReminderAlerts(prev => [...prev, msg]);
          }
          return { ...rem, notifiedMilestones: notified };
        }
        return rem;
      });

      if (updated) {
        setReminders(nextReminders);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reminders]);

  const fetchState = async (usernameToFetch?: string) => {
    const activeUsername = usernameToFetch || currentUsername;
    if (!activeUsername) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/state", {
        headers: { "x-user-username": activeUsername }
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Error fetching Rappel state metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!emailInput.trim()) {
      setLoginError("Please enter an Email Address!");
      return;
    }
    if (!phoneInput.trim()) {
      setLoginError("WhatsApp Phone Number is required to activate instant bot coaching notifications!");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, name: nameInput, phoneNumber: phoneInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedOtpBadge(data.otp);
        setShowOtpScreen(true);
      } else {
        const errJson = await res.json();
        setLoginError(errJson.error || "Failed to trigger verification code.");
      }
    } catch (err) {
      console.error("OTP trigger error:", err);
      setLoginError("Failed to issue secure connection OTP. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!otpInput.trim()) {
      setLoginError("Please enter the 6-digit verification code!");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, otp: otpInput }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("verified_username", emailInput.toLowerCase().trim());
        setCurrentUsername(emailInput.toLowerCase().trim());
        setDbState(data);
        setShowOtpScreen(false);
        setOtpInput("");
        setSimulatedOtpBadge(null);
      } else {
        const errJson = await res.json();
        setLoginError(errJson.error || "OTP Verification failed.");
      }
    } catch (err) {
      console.error("Login verification error:", err);
      setLoginError("Failed to reach authentication servers.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOnboardSave = async (onboardingData: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile/onboard", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify(onboardingData),
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
        setActiveTab("dashboard");
      }
    } catch (err) {
      console.error("Onboarding metrics submission failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const MOTIVATIONAL_COMPLIMENTS = [
    "Incredible! You are demonstrating pure discipline today. The horizon of your achievements is glowing brighter than ever!",
    "Spectacular execution! You are building real momentum, and there is no obstacle that can stand in your way. Keep going!",
    "You conquered it! Absolute brilliance. Your future self is smiling, thanking you for this exact moment of effort.",
    "Diligence in action! You didn't just plan—you executed flawlessly. Chronova is proud of your consistent power!",
    "A majestic win! Every ticked box is another step closer to mastering your time. Let this victory fuel your next leap!",
    "Outstanding focus! You ignored distractions and delivered. You are writing your own success story, line by line.",
    "Superb discipline! Truly impressive. Your commitment to excellence is what separates you from the crowd."
  ];

  const getRandomCompliment = () => {
    const index = Math.floor(Math.random() * MOTIVATIONAL_COMPLIMENTS.length);
    return MOTIVATIONAL_COMPLIMENTS[index];
  };

  const handleToggleTask = async (goalId: string, taskId: string) => {
    const goal = dbState?.goals.find(g => g.id === goalId);
    const subtask = goal?.subtasks.find(s => s.id === taskId);
    if (!subtask) return;

    if (!subtask.completed) {
      setActiveCheckTarget({
        type: 'Subtask',
        id: taskId,
        parentId: goalId,
        title: subtask.title
      });
    } else {
      await executeToggleSubtask(goalId, taskId);
    }
  };

  const executeToggleSubtask = async (goalId: string, taskId: string) => {
    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ goalId, taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Error toggling task completion status:", err);
    }
  };

  const handleToggleGoal = async (goalId: string) => {
    const goal = dbState?.goals.find(g => g.id === goalId);
    if (!goal) return;

    if (!goal.completed) {
      setActiveCheckTarget({
        type: 'Main Goal',
        id: goalId,
        title: goal.title
      });
    } else {
      await executeToggleGoal(goalId);
    }
  };

  const executeToggleGoal = async (goalId: string) => {
    try {
      const res = await fetch("/api/goals/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ goalId })
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Failed to toggle goal completeness:", err);
    }
  };

  const handleToggleReminder = async (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    if (reminder.status !== "completed") {
      setActiveCheckTarget({
        type: 'Reminder',
        id: reminderId,
        title: reminder.taskName
      });
    } else {
      setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: "pending" } : r));
    }
  };

  const handleConfirmCheck = async (confirmed: boolean) => {
    if (!activeCheckTarget) return;

    if (confirmed) {
      const compliment = getRandomCompliment();
      const newLog = {
        id: "comp_" + Date.now(),
        title: activeCheckTarget.title,
        type: activeCheckTarget.type,
        completedAt: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
        motivationalMessage: compliment
      };

      setCompletedTasksLog(prev => [newLog, ...prev]);

      setCelebrationMessage({
        title: "🌟 CELEBRATING DISCIPLINES! 🌟",
        message: `You successfully completed the ${activeCheckTarget.type}: "${activeCheckTarget.title}"!`,
        compliment: compliment
      });

      // Execute core action
      if (activeCheckTarget.type === 'Subtask') {
        await executeToggleSubtask(activeCheckTarget.parentId!, activeCheckTarget.id);
      } else if (activeCheckTarget.type === 'Main Goal') {
        await executeToggleGoal(activeCheckTarget.id);
      } else if (activeCheckTarget.type === 'Reminder') {
        setReminders(prev => prev.map(r => r.id === activeCheckTarget.id ? { ...r, status: "completed" } : r));
      }
    }

    setActiveCheckTarget(null);
  };

  const handlePostponeTaskTrigger = (goal: Goal, task: SubTask | null) => {
    setSelectedTaskToPostpone({ goal, task });
    setActiveTab("coach"); // Route user to coach tab to type excuse and get motivated
  };

  const handlePostExcuse = async (excuseText: string, goalId: string, taskId: string | null) => {
    try {
      const res = await fetch("/api/ai/excuse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ excuse: excuseText, goalId, taskId }),
      });
      if (res.ok) {
        const { db } = await res.json();
        setDbState(db);
        setSelectedTaskToPostpone(null);
      }
    } catch (err) {
      console.error("Procrastination logging sequence failed:", err);
    }
  };

  const handleAddGoal = async (title: string, deadline: string, priority: string, category: string, customSubtasks?: Array<{ title: string, durationMinutes: number, scheduledTime: string }>, generateAI?: boolean) => {
    try {
      const res = await fetch("/api/goals/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ title, deadline, priority, category, customSubtasks, generateAI }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Goal creation error:", err);
    }
  };

  const handleAddReminder = (reminder: any) => {
    setReminders(prev => [...prev, reminder]);
  };

  const handleReminderCompleted = async () => {
    if (!activeCheckReminder) return;
    setReminderLoading(true);
    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": currentUsername || "Guest"
        },
        body: JSON.stringify({ message: `I completed my scheduled task "${activeCheckReminder.taskName}" on time! Compliment me in a funny, witty, slightly sarcastic way.` })
      });
      if (res.ok) {
        const data = await res.json();
        setReminderCompliment(data.reply);
      } else {
        throw new Error("fail");
      }
    } catch {
      setReminderCompliment(`Wow! Look who decided to defy expectations and act like a functioning adult! You checked off "${activeCheckReminder.taskName}". Let's alert the media. Keep it up!`);
    } finally {
      setReminderLoading(false);
    }
    setReminders(prev => prev.map(r => r.id === activeCheckReminder.id ? { ...r, status: "completed" } : r));
  };

  const handleReminderExcuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckReminder || !reminderExcuseInput.trim()) return;
    setReminderLoading(true);
    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-username": currentUsername || "Guest"
        },
        body: JSON.stringify({ message: `I procrastinated on task "${activeCheckReminder.taskName}" because: ${reminderExcuseInput}. Roast me brutally for this excuse!` })
      });
      if (res.ok) {
        const data = await res.json();
        setReminderRoast(data.reply);
      } else {
        throw new Error("fail");
      }
    } catch {
      setReminderRoast(`Oh, "${reminderExcuseInput}"? What an absolute masterpiece of fiction! Put down your distractions and close the screen. Potentials don't work on snooze!`);
    } finally {
      setReminderLoading(false);
    }
    setReminders(prev => prev.map(r => r.id === activeCheckReminder.id ? { ...r, status: "declined" } : r));
  };

  const handleTriggerRecoveryPlan = async (goalId: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/goals/recover", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ goalId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
        setActiveTab("schedule"); // open schedule to show compressed blocks
      }
    } catch (err) {
      console.error("Recovery planner launch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAlign = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/goals/auto-align", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Auto alignment calculation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("verified_username");
    localStorage.removeItem("chronova_reminders");
    localStorage.removeItem("chronova_completed_tasks_log");
    setReminders([]);
    setCompletedTasksLog([]);
    setCurrentUsername("");
    setDbState(null);
    setShowOtpScreen(false);
    setOtpInput("");
    setSimulatedOtpBadge(null);
    setEmailInput("");
    setNameInput("");
    setPhoneInput("");
  };

  const handleUpdateSettings = async (whatsappEnabled: boolean, phoneNumber: string) => {
    try {
      const res = await fetch("/api/profile/update-settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-username": currentUsername
        },
        body: JSON.stringify({ whatsappEnabled, phoneNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      } else {
        const errJson = await res.json();
        alert(errJson.error || "Failed to update notification settings.");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/profile/delete-account", {
        method: "DELETE",
        headers: { 
          "x-user-username": currentUsername
        }
      });
      if (res.ok) {
        try {
          alert("Account deleted successfully! You will now be redirected to the landing page.");
        } catch (alertError) {
          console.warn("Alert was blocked by browser sandbox:", alertError);
        }
        handleLogout();
      } else {
        const errJson = await res.json();
        try {
          alert(errJson.error || "Could not delete account. Please try again.");
        } catch (alertError) {
          console.warn("Alert was blocked by browser sandbox:", alertError);
        }
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      try {
        alert("A network error occurred. Please check your connection.");
      } catch (alertError) {
        console.warn("Alert was blocked by browser sandbox:", alertError);
      }
    }
  };

  if (loading && !dbState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 mb-4 animate-heartbeat">
          {/* Glowing logo */}
          <div className="w-12 h-12 bg-zinc-950 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Infinity className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">CHRONOVA</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
          <span>Synchronizing accountability records...</span>
        </div>
      </div>
    );
  }

  // Login view if email is unprovided or session is missing
  if (!currentUsername) {
    return (
      <LandingPage 
        onLoginSuccess={(username, dbStateData) => {
          localStorage.setItem("verified_username", username.toLowerCase().trim());
          setCurrentUsername(username.toLowerCase().trim());
          setDbState(dbStateData);
        }}
      />
    );
  }

  // Onboarding screens triggers if first cycle
  if (dbState && !dbState.profile.isOnboarded) {
    return (
      <Onboarding 
        username={dbState.profile.username} 
        onSave={handleOnboardSave} 
      />
    );
  }

  // Dashboard Workspace Layout
  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20">
      
      {/* Top Universal Control Bar */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger button on top left corner */}
          <button
            onClick={() => setShowNavMenu(true)}
            className="flex items-center justify-center p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 font-extrabold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Small inline Namaste Hands Icon */}
          <div className="w-10 h-10 bg-zinc-950 border border-amber-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-heartbeat">
            <Infinity className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-mono">CHRONOVA</span>
          </div>
        </div>


        {/* User profile segment & logout option */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-600 font-medium">{dbState?.profile.name}</p>
              <p className="text-xs font-bold text-pink-600 font-mono text-right">LVL {dbState?.profile.level || 1} Architect</p>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 p-0.5">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center font-bold text-xs text-pink-600">
                {dbState?.profile.name ? dbState.profile.name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0,2) : "AS"}
              </div>
            </div>
 
            <button 
              onClick={handleLogout}
              title="Reset/logout session"
              className="p-2 border border-pink-100 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all text-slate-500 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 bg-transparent">
        {dbState && (
          <>
            {/* Relocated Dynamic Page Heading & Coach Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-pink-100/50">
              <div>
                <span className="text-[10px] font-mono font-black text-pink-600 uppercase tracking-widest block mb-1">Current Workspace</span>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {activeTab === "dashboard" && "Dashboard Hub"}
                  {activeTab === "coach" && "AI Coach Console"}
                  {activeTab === "schedule" && "AI Scheduler"}
                  {activeTab === "analytics" && "Analytics & Trends"}
                  {activeTab === "notifications" && "Smart Alerts Desk"}
                  {activeTab === "emotionalSupport" && "Support Companion"}
                  {activeTab === "completedTasks" && "Completed Ledger"}
                </h1>
              </div>

              <div className="flex items-center gap-2 bg-pink-50 self-start sm:self-center px-3 py-1.5 rounded-full border border-pink-200 shadow-sm">
                <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider font-mono">Coach Active</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            {activeTab === "dashboard" && (
              <MainDashboard 
                state={dbState} 
                onToggleTask={handleToggleTask}
                onPostponeTask={handlePostponeTaskTrigger}
                onToggleGoal={handleToggleGoal}
                onAddGoal={handleAddGoal}
                onTriggerRecovery={handleTriggerRecoveryPlan}
                onUpdateSettings={handleUpdateSettings}
                onDeleteAccount={handleDeleteAccount}
                onOpenReminderModal={() => setShowReminderModal(true)}
                reminders={reminders}
              />
            )}

            {activeTab === "coach" && (
              <AICoachConsole 
                state={dbState}
                selectedTaskForDelayedExcuse={selectedTaskToPostpone}
                onPostExcuse={handlePostExcuse}
                onCloseExcuseForm={() => setSelectedTaskToPostpone(null)}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleHub 
                state={dbState}
                onTriggerRecovery={handleTriggerRecoveryPlan}
                reminders={reminders}
                onToggleReminder={handleToggleReminder}
                onOpenReminderModal={() => setShowReminderModal(true)}
                onAutoAlign={handleAutoAlign}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsCenter 
                state={dbState}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationDesk 
                state={dbState}
              />
            )}

            {activeTab === "emotionalSupport" && (
              <SupportChat userEmail={currentUsername} />
            )}

            {activeTab === "completedTasks" && (
              <CompletedTasksView 
                completedTasks={completedTasksLog} 
                onClearLog={() => setCompletedTasksLog([])} 
              />
            )}
          </>
        )}
      </main>

      {/* Toast Reminder Alert Desk */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {reminderAlerts.map((alertText, idx) => (
          <div
            key={idx}
            className="pointer-events-auto bg-slate-950/95 border border-blue-500/30 text-slate-100 p-4 rounded-2xl shadow-2xl flex items-start gap-2.5 animate-in slide-in-from-right duration-300"
          >
            <div className="w-1.5 h-full bg-blue-500 rounded-l" />
            <div className="flex-1">
              <p className="text-xs font-mono font-medium leading-relaxed">{alertText}</p>
            </div>
            <button
              onClick={() => setReminderAlerts(prev => prev.filter((_, i) => i !== idx))}
              className="text-slate-500 hover:text-white font-mono text-[10px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>      {/* Completion Check Overlay & Custom Coach Roast Dialog */}
      {activeCheckReminder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-pink-100 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-600" />
            
            <div className="space-y-2">
              <span className="text-[10px] bg-pink-50 border border-pink-200 text-pink-700 py-0.5 px-2 rounded-full font-mono font-bold uppercase tracking-wider block w-fit">
                CHRONOVA OVERDUE ACCOUNTABILITY
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                Scheduled Task Completion Check
              </h3>
              <p className="text-xs text-slate-600">
                You scheduled the task <span className="text-slate-800 font-semibold">"{activeCheckReminder.taskName}"</span> to be finished.
              </p>
            </div>
 
            {!reminderCompliment && !reminderRoast ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-mono italic">
                  Did you complete this task on schedule? (Be honest. Chronova remembers everything).
                </p>
                
                {!showReminderExcuseForm ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleReminderCompleted}
                      disabled={reminderLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      {reminderLoading ? "Verifying..." : "Yes, I did!"}
                    </button>
                    <button
                      onClick={() => setShowReminderExcuseForm(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      No, not yet
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReminderExcuseSubmit} className="space-y-3">
                    <label className="block text-xs text-slate-500 font-mono">What is your excuse?</label>
                    <input
                      type="text"
                      required
                      value={reminderExcuseInput}
                      onChange={(e) => setReminderExcuseInput(e.target.value)}
                      placeholder="e.g. Spent 2 hours looking for the perfect Spotify playlist"
                      className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReminderExcuseForm(false)}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-pink-150"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reminderLoading}
                        className="bg-pink-600 hover:bg-pink-750 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                      >
                        {reminderLoading ? "Submitting..." : "Submit Excuse"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4 bg-pink-50/20 p-4 rounded-2xl border border-pink-100 relative">
                {reminderCompliment && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-700 leading-relaxed font-mono italic">
                      "{reminderCompliment}"
                    </p>
                  </div>
                )}
 
                {reminderRoast && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-pink-700 text-xs font-bold font-mono">
                      <span>COACH ROAST</span>
                    </div>
                    <p className="text-xs text-pink-800 leading-relaxed font-mono italic">
                      "{reminderRoast}"
                    </p>
                  </div>
                )}
 
                <button
                  onClick={() => setActiveCheckReminder(null)}
                  className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Close & Refocus
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⚠️ DID YOU ACTUALLY COMPLETE THIS TASK? - CONFIRMATION DIALOG */}
      {activeCheckTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden space-y-5">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
            
            <div className="text-center space-y-2 relative z-10">
              <div className="w-16 h-16 bg-pink-50 border border-pink-200 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckSquare className="w-8 h-8 text-pink-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mt-3 font-sans">
                Action Verification
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Chronova Accountability Engine requires honest milestone updates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center relative z-10 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                {activeCheckTarget.type}
              </span>
              <p className="text-sm font-extrabold text-slate-800 leading-snug">
                "{activeCheckTarget.title}"
              </p>
            </div>

            <p className="text-xs text-slate-700 text-center font-bold px-4 leading-relaxed relative z-10">
              ❔ Did you actually complete this task?
            </p>

            <div className="flex items-center gap-3 relative z-10 pt-2">
              <button
                onClick={() => handleConfirmCheck(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                No, not yet
              </button>
              <button
                onClick={() => handleConfirmCheck(true)}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:scale-[1.01] cursor-pointer"
              >
                Yes, absolutely!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 BEAUTIFUL CELEBRATION & MOTIVATIONAL COMPLIMENT MODAL */}
      {celebrationMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-white border-2 border-pink-200 rounded-3xl shadow-2xl p-6 md:p-8 relative overflow-hidden space-y-6">
            {/* Visual sparkles design */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/30 via-transparent to-transparent pointer-events-none" />
            
            <div className="text-center space-y-3 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-pink-600/30 animate-bounce">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-xl font-black text-pink-600 tracking-tight font-mono uppercase">
                {celebrationMessage.title}
              </h2>
              
              <p className="text-xs font-bold text-slate-600 bg-pink-50 border border-pink-100 py-1 px-3 rounded-full inline-block">
                {celebrationMessage.message}
              </p>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 p-5 rounded-2xl relative z-10 text-center space-y-2">
              <span className="text-[10px] text-pink-600 font-mono font-bold uppercase tracking-wider block">
                ✨ Chronova Proactive Coach Compliment ✨
              </span>
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                "{celebrationMessage.compliment}"
              </p>
            </div>

            <button
              onClick={() => setCelebrationMessage(null)}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 px-6 rounded-xl text-xs transition-all tracking-wider shadow-lg uppercase cursor-pointer"
            >
              Conquer the Next Milestone
            </button>
          </div>
        </div>
      )}

      {/* 🔔 CREATE PROACTIVE TASK REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-pink-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden space-y-5">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
            
            <div className="text-center space-y-1 relative z-10">
              <div className="w-12 h-12 bg-pink-50 border border-pink-200 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Bell className="w-6 h-6 text-pink-600 animate-bounce" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mt-2 font-sans">
                Set Proactive & Health Reminders
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Schedule direct device notifications to keep your mind sharp and body aligned.
              </p>
            </div>

            {/* Modal Internal Tabs */}
            <div className="relative z-10 flex border-b border-slate-100">
              {["custom", "health"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    // Simple local state switch: we can declare a modal mode if desired, or reuse a simple state
                    // Let's toggle via custom logic or simple inline state
                    // We'll declare a simple state variable for the active modal tab or use a local component state
                    // Wait, we can define a hook for modalTab! Let's write `const [modalTab, setModalTab] = useState<'custom' | 'health'>('custom');`
                    // Let's verify if modalTab is defined. If not, we can define it near the top of the file.
                    // For now let's use standard state in App.tsx! Let's check if we declared modalTab.
                    // Let's add it right here or use a React state in App.
                    setModalTab(t as 'custom' | 'health');
                  }}
                  className={`flex-1 pb-2 text-xs font-extrabold border-b-2 transition-all uppercase tracking-wider ${
                    modalTab === t 
                      ? "border-pink-600 text-pink-600" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === "custom" ? "✍️ Standard Goal Task" : "❤️ Health Reminders"}
                </button>
              ))}
            </div>

            {modalTab === "custom" ? (
              <form onSubmit={handleCreateReminder} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Task/Milestone Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Review OS scheduling algorithms"
                    value={reminderTaskName}
                    onChange={(e) => setReminderTaskName(e.target.value)}
                    className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Notification Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={reminderDateTime}
                    onChange={(e) => setReminderDateTime(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onFocus={(e) => e.currentTarget.showPicker?.()}
                    min={toLocalISOString(new Date())}
                    className="w-full bg-pink-50/20 border border-pink-100 text-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div className="bg-pink-50/35 border border-pink-100 p-3.5 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="reminderTestMode"
                    checked={reminderTestMode}
                    onChange={(e) => setReminderTestMode(e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 cursor-pointer mt-0.5"
                  />
                  <div>
                    <label htmlFor="reminderTestMode" className="block text-xs font-bold text-slate-800 cursor-pointer">
                      🧪 Fast Sandbox Testing Mode
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      If checked, the system will trigger a simulated completion check alert 10 seconds after creation for immediate validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            ) : (
              <div className="relative z-10 space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                <p className="text-[10px] text-slate-500 font-mono italic">
                  *Health templates configure repeating timers to automatically alert your device in background cycles!
                </p>

                {[
                  {
                    id: "water",
                    title: "💧 Hydrate (Water Intake)",
                    desc: "Reminds you every 2 hours to drink 250ml water to optimize cognitive focus.",
                    freq: "Every 2 Hours",
                    icon: Droplets,
                    color: "text-blue-500 bg-blue-50 border-blue-100"
                  },
                  {
                    id: "medicine_morning",
                    title: "💊 Morning Medication Intake",
                    desc: "Daily reminder scheduled for 08:00 AM to take prescription pills.",
                    freq: "Daily at 08:00 AM",
                    icon: Heart,
                    color: "text-rose-500 bg-rose-50 border-rose-100"
                  },
                  {
                    id: "medicine_night",
                    title: "💊 Bedtime Medication Intake",
                    desc: "Daily reminder scheduled for 09:00 PM to take prescription pills.",
                    freq: "Daily at 09:00 PM",
                    icon: Heart,
                    color: "text-indigo-500 bg-indigo-50 border-indigo-100"
                  },
                  {
                    id: "stretch",
                    title: "🧘 Posture & Muscle Stretch",
                    desc: "Hourly prompt to stand up, stretch, align spine and roll shoulders.",
                    freq: "Every 1 Hour",
                    icon: Activity,
                    color: "text-emerald-500 bg-emerald-50 border-emerald-100"
                  },
                  {
                    id: "eyerest",
                    title: "👁️ 20-20-20 Eye Rest Rule",
                    desc: "Every 20 mins, look at something 20 feet away for 20 seconds to reduce screen fatigue.",
                    freq: "Every 20 Mins",
                    icon: Sparkles,
                    color: "text-amber-500 bg-amber-50 border-amber-100"
                  }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActivated = reminders.some(r => r.healthType === item.id && r.isHealth);

                  return (
                    <div 
                      key={item.id} 
                      className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                          <span className="inline-block text-[9px] font-mono font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full uppercase">
                            {item.freq}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCreateHealthReminder(item.id)}
                        className={`font-extrabold py-1.5 px-3 rounded-xl text-[10px] cursor-pointer whitespace-nowrap transition-all ${
                          isActivated 
                            ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200" 
                            : "bg-slate-900 hover:bg-slate-950 text-white"
                        }`}
                      >
                        {isActivated ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Close Modal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🍔 HAMBURGER SIDEBAR NAVIGATION DRAWER */}
      {showNavMenu && (
        <div className="fixed inset-0 z-[120] flex justify-start">
          {/* Backdrop layer */}
          <div 
            onClick={() => setShowNavMenu(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          />
          
          {/* Sliding drawer card - Left Panel */}
          <div className="relative w-full max-w-[280px] bg-white border-r border-pink-100 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 overflow-hidden">
            {/* Header top background gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-pink-50 to-transparent pointer-events-none" />
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-pink-100 flex items-center justify-between relative z-10 bg-white/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-950 border border-amber-500/30 rounded-lg flex items-center justify-center shadow-md animate-heartbeat">
                  <Infinity className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 tracking-wider font-mono">CHRONOVA</h3>
                </div>
              </div>
              
              <button
                onClick={() => setShowNavMenu(false)}
                className="p-1 rounded-full hover:bg-pink-100/50 text-slate-500 hover:text-pink-600 transition-all cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Compact Profile Highlight Card */}
            <div className="p-2.5 mx-4 mt-3 bg-gradient-to-br from-amber-500/5 to-rose-500/5 border border-pink-100/65 rounded-xl relative z-10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] text-pink-600 font-mono font-bold uppercase tracking-widest">Architect Profile</span>
                <p className="text-xs font-black text-slate-800 truncate max-w-[140px]">{dbState?.profile.name}</p>
              </div>
              <span className="text-[8px] bg-pink-100 text-pink-700 font-mono font-bold py-0.5 px-2 rounded-full uppercase">
                LVL {dbState?.profile.level || 1}
              </span>
            </div>

            {/* Navigation options - Compact & STRICTLY NON-SCROLLABLE */}
            <div className="flex-1 py-3 px-4 space-y-1 relative z-10 flex flex-col justify-center overflow-hidden">
              {([
                { id: "dashboard", label: "Dashboard Hub", icon: Infinity },
                { id: "coach", label: "AI Coach Desk", icon: MessageSquare },
                { id: "schedule", label: "AI Scheduler", icon: Calendar },
                { id: "analytics", label: "Analytics Trends", icon: BarChart2 },
                { id: "notifications", label: "Smart Alerts", icon: Bell },
                { id: "emotionalSupport", label: "Your Megan", icon: Sparkles },
                { id: "completedTasks", label: "Completed Ledger", icon: CheckSquare }
              ] as const).map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "coach") {
                        setSelectedTaskToPostpone(null);
                      }
                      setShowNavMenu(false);
                    }}
                    className={`w-full text-left p-2 px-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center gap-3 group ${
                      isActive 
                        ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 text-pink-600 shadow-sm" 
                        : "bg-white border-transparent hover:border-pink-50 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? "bg-pink-600 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-pink-50 group-hover:text-pink-600"
                    }`}>
                      <TabIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-extrabold tracking-tight ${isActive ? "text-pink-600" : "text-slate-800"}`}>
                        {tab.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compact action controls footer */}
            <div className="p-4 border-t border-zinc-100 bg-slate-50 relative z-10 mt-auto">
              <button
                onClick={() => {
                  setShowNavMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 SIMULATED PHONE NOTIFICATION OVERLAY BANNER */}
      <AnimatePresence>
        {simulatedPhoneAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -120, x: "-50%", scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -120, x: "-50%", scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            className="fixed top-8 left-1/2 z-[10000] w-[380px] max-w-[95vw] bg-slate-900/95 backdrop-blur-2xl text-white px-5 py-5 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center shrink-0 border border-pink-500/30 shadow-inner">
                <Bell className="w-6 h-6 text-pink-400 animate-bounce" />
              </div>
              <div className="flex-1 space-y-1.5 pr-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 font-mono">Chronova Push Alert</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{simulatedPhoneAlert.timestamp}</span>
                </div>
                <p className="text-sm font-black leading-tight tracking-tight text-white">{simulatedPhoneAlert.title}</p>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{simulatedPhoneAlert.body}</p>
                
                <div className="flex items-center justify-between pt-3">
                  <p className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Directly pushed to device tray
                  </p>
                  <button 
                    type="button"
                    onClick={() => setSimulatedPhoneAlert(null)}
                    className="bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 font-bold py-2 px-6 rounded-2xl text-[10px] transition-all cursor-pointer border border-white/10 shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            {/* CUT SYMBOL (X) AS REQUESTED */}
            <button 
              onClick={() => setSimulatedPhoneAlert(null)}
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all border border-white/5 shadow-sm active:scale-90"
              aria-label="Close"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
