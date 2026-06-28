import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { DBState, Goal, SubTask, ExcuseLog, AppNotification, UserProfile } from "./src/types.js";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

function hashPassword(pwd: string): string {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

async function verifyEmailDomain(email: string): Promise<boolean> {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase().trim();

  // Common valid public domains list to avoid network DNS queries for basic accounts
  const commonDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", 
    "icloud.com", "zoho.com", "proton.me", "protonmail.com", "yandex.com", 
    "gmx.com", "mail.com"
  ];
  if (commonDomains.includes(domain)) {
    return true;
  }

  return new Promise((resolve) => {
    // Attempt to resolve MX records
    dns.resolveMx(domain, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        return resolve(true);
      }
      // If MX failed/not configured, try A record resolution to check if domain exists
      dns.resolve(domain, (err2, addresses2) => {
        if (!err2 && addresses2 && addresses2.length > 0) {
          return resolve(true);
        }
        
        // Check for specific DNS failure indicating the domain definitively does not exist
        if (err && (err.code === "ENOTFOUND" || err.code === "ENODATA")) {
          return resolve(false);
        }
        if (err2 && (err2.code === "ENOTFOUND" || err2.code === "ENODATA")) {
          return resolve(false);
        }
        
        // Fallback to true in other cases to avoid locking out sandboxed runs
        resolve(true);
      });
    });
  });
}

interface MultiUserDB {
  users: { [username: string]: DBState };
  deletedUsers?: string[]; // track deleted users to block re-login
}

const DEFAULT_USERNAME = "user_achiever";
const PHONE_REGEX = /^\+?[0-9\s\-()]{10,18}$/;

// Helper to write/read local database state for a specific user
function readMultiDB(): MultiUserDB {
  const defaultUser: DBState = {
    profile: {
      username: DEFAULT_USERNAME,
      name: "User",
      phoneNumber: "0000000000",
      isOnboarded: true,
      onboarding: {
        wakeTime: "07:00",
        sleepTime: "23:00",
        workHours: "09:00-17:00",
        studyHours: 4,
        preferences: ["Heavy Accountability", "Supportive Gamification", "Witty Accountable Humour"],
        goalsText: "Build Chronova AI startup and prepare for tech placements",
        deadlineDate: "2026-07-15"
      },
      xp: 350,
      level: 3,
      streak: 5,
      productivityScore: 82,
      focusHours: 14.5,
      emailVerified: true,
      phoneVerified: true,
      active: true,
      locked: false,
      failedLoginAttempts: 0,
      lockUntil: null,
      passwordHash: hashPassword("Chronova@123")
    },
    goals: [
      {
        id: "g1",
        title: "Prepare for Software Placement",
        description: "Crack the upcoming coding interviews and master CS core concepts.",
        deadline: "2026-07-20",
        priority: "high",
        successProbability: 78,
        riskLevel: "Medium",
        delayRisk: 22,
        category: "Job Seeker",
        subtasks: [
          { id: "s1_1", title: "Review LeetCode Trees & Graphs questions", completed: true, durationMinutes: 90, scheduledTime: "09:30", status: "completed", postponementCount: 0 },
          { id: "s1_2", title: "Practice DBMS SQL Queries and Joins", completed: false, durationMinutes: 60, scheduledTime: "11:30", status: "pending", postponementCount: 1 },
          { id: "s1_3", title: "Take Operating System Mock Quiz", completed: false, durationMinutes: 45, scheduledTime: "15:00", status: "pending", postponementCount: 0 },
          { id: "s1_4", title: "Structure behavioral story cards using STAR framework", completed: false, durationMinutes: 60, scheduledTime: "17:30", status: "pending", postponementCount: 0 }
        ]
      },
      {
        id: "g2",
        title: "Launch Chronova AI Tech Demo",
        description: "Complete design, server integrations, and pitch-grade demo.",
        deadline: "2026-06-30",
        priority: "high",
        successProbability: 91,
        riskLevel: "Low",
        delayRisk: 9,
        category: "Entrepreneur",
        subtasks: [
          { id: "s2_1", title: "Code full-stack server endpoints with express", completed: true, durationMinutes: 120, scheduledTime: "10:00", status: "completed", postponementCount: 0 },
          { id: "s2_2", title: "Design the visual AI coach UI view with quick-read swipe cards", completed: true, durationMinutes: 90, scheduledTime: "13:30", status: "completed", postponementCount: 0 },
          { id: "s2_3", title: "Implement Interactive Consequence Simulator slider", completed: false, durationMinutes: 60, scheduledTime: "16:00", status: "pending", postponementCount: 0 },
          { id: "s2_4", title: "Integrate WhatsApp notification layout testing framework", completed: false, durationMinutes: 45, scheduledTime: "19:00", status: "pending", postponementCount: 2 }
        ]
      }
    ],
    excuseLogs: [
      {
        id: "e1",
        excuse: "I was feeling a bit tired after lunch, will do it tomorrow.",
        aiResponse: "😴 Chronova AI Coach says: 'Sleeping off your goals? Your competitors are ordering double shots of espresso right now. Task postponed for the 3rd time!'",
        timestamp: "2026-06-22T14:15:00-07:00",
        goalTitle: "Prepare for Software Placement",
        consequence: "Pushes your OS mock quiz to night slot, and chips away 3% off your Placement Success Probability."
      },
      {
        id: "e2",
        excuse: "Insta reels were too addictive today, got stuck in a scroll hole.",
        aiResponse: "📱 Chronova AI Coach says: 'Our dashboard shows you are scrolling infinitely. No amount of scrolling can bring back lost time. Breaking news: Your dream job's salary just refused to load.'",
        timestamp: "2026-06-23T08:30:00-07:00",
        goalTitle: "Launch Chronova AI Tech Demo",
        consequence: "Increases Delay Risk from 5% to 9% for the launch demo goal."
      }
    ],
    notifications: [
      {
        id: "n1",
        title: "🚨 Alert from Future You",
        message: "Breaking News: Your deadline refused to move. Put down the scroll and pick up the IDE.",
        type: "humor",
        timestamp: "5 mins ago",
        whatsappTemplate: "Hey User! 🚀 Chronova reminder: Your deadline is approaching faster than your salary. OS Mock Quiz is awaiting your attention. Reply with 'RECOVER' to shrink the delay risk!",
        emailTemplate: "Subject: Chronova Coached Digest - Your future self has concerns...\n\nHi User,\n\nYou logged 2 postponements today. Your placements success probability is dropping to 78%. We suggest triggering Chronova Recovery Mode immediately in your dashboard.",
        pushChannel: "Browser Popup: Scroll loop detected. Work progress: 0%."
      },
      {
        id: "n2",
        title: "💡 AI Recalibration complete",
        message: "Chronova has compressed 3 subtasks to recover work hours safely.",
        type: "recovery",
        timestamp: "1 hour ago",
        whatsappTemplate: "Chronova Recovery Mode Activated. We skipped the 30min leisure slot and combined DBMS review directly with DSA review. Let's do this!",
        emailTemplate: "Subject: Chronova AI Recovery Plan Success!\n\nYour tasks have been reprioritized. We combined software interview preparations into high-impact sprint cycles.",
        pushChannel: "Chronova Recovery: OS mock review rearranged to 15:00."
      }
    ],
    lastUpdate: new Date().toISOString()
  };

  const initialDB: MultiUserDB = {
    users: {
      [DEFAULT_USERNAME]: defaultUser
    },
    deletedUsers: []
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const json = JSON.parse(raw);
    
    // Ensure deletedUsers exists if it's already a MultiUserDB
    if (json.users && !json.deletedUsers) json.deletedUsers = [];
    
    // Auto-migrate if it is the old style DBState structure
    if (json.profile && !json.users) {
      const oldEmail = json.profile.email?.toLowerCase() || "pawarshivani081225@gmail.com";
      const uName = oldEmail.split("@")[0] || DEFAULT_USERNAME;
      const migrated: MultiUserDB = {
        users: {
          [uName]: {
            ...json,
            profile: {
              ...json.profile,
              username: uName
            }
          }
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2));
      return migrated;
    }
    
    // Migrate email keys to username keys if any email key is detected
    if (json.users) {
      const migratedUsers: { [username: string]: DBState } = {};
      let changed = false;
      for (const [key, val] of Object.entries(json.users as { [k: string]: any })) {
        if (key.includes("@")) {
          const uName = key.split("@")[0];
          migratedUsers[uName] = {
            ...val,
            profile: {
              ...val.profile,
              username: uName
            }
          };
          changed = true;
        } else {
          migratedUsers[key] = val;
          if (!val.profile.username) {
            val.profile.username = key;
            changed = true;
          }
        }
      }
      if (changed) {
        const migrated = { users: migratedUsers, deletedUsers: json.deletedUsers || [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2));
        return migrated;
      }
    }
    
    return json as MultiUserDB;
  } catch (err) {
    console.error("Error reading database file, resetting to initial state.", err);
    return initialDB;
  }
}

function writeMultiDB(db: MultiUserDB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Helper to get or create DBState for a specific username
function getUserDB(username: string): DBState {
  const db = readMultiDB();
  const normalizedUsername = username.toLowerCase().trim();
  
  if (!db.users[normalizedUsername]) {
    // FRESH REGISTERED USER starts perfectly EMPTY with absolutely NO pre-added tasks/goals, as requested!
    db.users[normalizedUsername] = {
      profile: {
        username: normalizedUsername,
        name: normalizedUsername.replace(/[._-]/g, " "),
        phoneNumber: "",
        isOnboarded: false, // forces onboarding
        xp: 0,
        level: 1,
        streak: 0,
        productivityScore: 100,
        focusHours: 0,
        emailVerified: false,
        phoneVerified: false,
        active: true,
        locked: false,
        failedLoginAttempts: 0,
        lockUntil: null,
        passwordHash: ""
      },
      goals: [], // ZERO tasks / ZERO goals, perfectly fresh!
      excuseLogs: [],
      notifications: [
        {
          id: "welcome",
          title: "🙏🏽 Welcome to Chronova!",
          message: "No active goals yet. Click 'Add Custom Goal' above or complete onboarding to schedule your first milestone.",
          type: "info",
          timestamp: "Just now"
        }
      ],
      lastUpdate: new Date().toISOString()
    };
    writeMultiDB(db);
  }
  
  return db.users[normalizedUsername];
}

function saveUserDB(username: string, userState: DBState) {
  const db = readMultiDB();
  const normalizedUsername = username.toLowerCase().trim();
  userState.lastUpdate = new Date().toISOString();
  db.users[normalizedUsername] = userState;
  writeMultiDB(db);
}

function getRequestUsername(req: express.Request): string {
  const headerUser = req.headers["x-user-username"];
  if (headerUser && typeof headerUser === "string" && headerUser.trim()) {
    return headerUser.toLowerCase().trim();
  }
  const queryUser = req.query.username;
  if (queryUser && typeof queryUser === "string" && queryUser.trim()) {
    return queryUser.toLowerCase().trim();
  }
  const bodyUser = req.body.username;
  if (bodyUser && typeof bodyUser === "string" && bodyUser.trim()) {
    return bodyUser.toLowerCase().trim();
  }
  return DEFAULT_USERNAME;
}

// Lazy load Gemini AI Engine
let geminiClientCache: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClientCache) return geminiClientCache;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    console.log("No valid GEMINI_API_KEY environment variable found. Emulating Gemini AI responses dynamically.");
    return null;
  }
  try {
    geminiClientCache = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return geminiClientCache;
  } catch (err) {
    console.error("Failed to initialize Gemini AI client:", err);
    return null;
  }
}

// Wrapper to robustly handle model high demand (e.g., 503 errors) by falling back to lighter models or retrying
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error("Gemini client not initialized");
  }

  try {
    // Try primary model: gemini-3.5-flash
    return await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      ...params,
    });
  } catch (error: any) {
    console.warn(`Primary Gemini model (gemini-3.5-flash) failed: ${error?.message || error}. Trying fallback to gemini-3.1-flash-lite...`);
    
    // Fallback to gemini-3.1-flash-lite (lighter, extremely reliable, less demand pressure)
    try {
      return await gemini.models.generateContent({
        model: "gemini-3.1-flash-lite",
        ...params,
      });
    } catch (fallbackError: any) {
      console.error(`Fallback Gemini model (gemini-3.1-flash-lite) also failed: ${fallbackError?.message || fallbackError}`);
      throw error; // Throw original error to let route handlers log and fallback to rule-based static responses
    }
  }
}

// Roast quotes inspired by witty marketing style humor
const ZO_ROASTS = [
  "Your deadline is approaching faster than your monthly credit statement.",
  "Breaking News: Your deadline refused to move, unlike your willpower right now.",
  "Your future self has major concerns. They are currently looking for a time machine to smack you.",
  "Scrolling detected! Productivity not found. There is no refund on wasted hours.",
  "Your task misses you. We placed it in the list, but you checked out on your dreams instead.",
  "Sleeping off your goals? Your rivals are currently in the 4th interview round drinking cold brews.",
  "You postponed this task similar to how you skip gym day. Result? Zero gains.",
  "Excuses are like late delivery attempts - nobody wants them, and they are always cold.",
  "An option to postpone has been denied by your future bank balance."
];

// In-Memory Temporary OTP Store and Reset Session maps
interface OtpState {
  otp: string;
  expiresAt: number;
  attemptCount: number;
  requestTimes: number[];
  type: "register" | "forgot";
  name?: string;
  email?: string;
  phoneNumber?: string;
  passwordHash?: string;
}

const tempOTPs: { [email: string]: OtpState } = {};
const verificationBlockedUntil: { [email: string]: number } = {};
const tempResetTokens: { [email: string]: { token: string; expiresAt: number } } = {};

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints
  app.get("/api/state", (req, res) => {
    const username = getRequestUsername(req);
    const db = getUserDB(username);
    res.json(db);
  });

  // 1. POST /register with full validation
  app.post("/api/register", async (req, res) => {
    const { fullName, username, password, confirmPassword } = req.body;

    // Full Name check
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ error: "Full Name is required." });
    }
    const cleanName = fullName.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ error: "Full Name must be between 2 and 50 characters." });
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(cleanName)) {
      return res.status(400).json({ error: "Full Name must only contain alphabets and spaces." });
    }

    // Username check
    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "Username is required." });
    }
    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ error: "Username must be between 3 and 30 characters." });
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({ error: "Username must contain only letters, numbers, underscores, dots, or hyphens." });
    }

    // Password validation
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }

    // Confirm Password check
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const db = readMultiDB();
    // Unique username verification
    if (db.users[cleanUsername]) {
      const existingUser = db.users[cleanUsername];
      const hasNoPassword = !existingUser.profile || 
                            existingUser.profile.passwordHash === "" || 
                            existingUser.profile.passwordHash === null || 
                            existingUser.profile.passwordHash === undefined;
      
      if (hasNoPassword) {
        // Allow registering/setting the password on pre-seeded accounts
        if (!existingUser.profile) {
          existingUser.profile = {
            username: cleanUsername,
            name: cleanName,
            phoneNumber: "",
            isOnboarded: false,
            xp: 0,
            level: 1,
            streak: 0,
            productivityScore: 100,
            focusHours: 0,
            emailVerified: true,
            phoneVerified: true,
            active: true,
            locked: false,
            failedLoginAttempts: 0,
            lockUntil: null,
            passwordHash: hashPassword(password)
          };
        } else {
          existingUser.profile.name = cleanName;
          existingUser.profile.passwordHash = hashPassword(password);
          existingUser.profile.emailVerified = true;
          existingUser.profile.phoneVerified = true;
          existingUser.profile.active = true;
          existingUser.profile.locked = false;
          existingUser.profile.failedLoginAttempts = 0;
          existingUser.profile.lockUntil = null;
        }
        
        // Save and return success
        writeMultiDB(db);
        return res.json({
          success: true,
          message: "User registered successfully! Please sign in with your credentials."
        });
      }

      return res.status(400).json({ error: "Username already registered" });
    }

    // If previously deleted, remove from deletedUsers so they can register and login freshly
    if (db.deletedUsers) {
      db.deletedUsers = db.deletedUsers.filter(u => u !== cleanUsername);
    }

    // Create the user profile in db.users directly
    db.users[cleanUsername] = {
      profile: {
        username: cleanUsername,
        name: cleanName,
        phoneNumber: "",
        isOnboarded: false, // forces onboarding
        xp: 0,
        level: 1,
        streak: 0,
        productivityScore: 100,
        focusHours: 0,
        emailVerified: true,
        phoneVerified: true,
        active: true,
        locked: false,
        failedLoginAttempts: 0,
        lockUntil: null,
        passwordHash: hashPassword(password)
      },
      goals: [], // ZERO tasks / ZERO goals, perfectly fresh!
      excuseLogs: [],
      notifications: [
        {
          id: "welcome",
          title: "🙏🏽 Welcome to Chronova!",
          message: "No active goals yet. Click 'Add Custom Goal' above or complete onboarding to schedule your first milestone.",
          type: "info",
          timestamp: "Just now"
        }
      ],
      lastUpdate: new Date().toISOString()
    };
    writeMultiDB(db);

    res.json({
      success: true,
      message: "User registered successfully! Please sign in with your credentials."
    });
  });

  // Backward-compatible registration alias for auth flow
  app.post("/api/auth/otp/generate", (req, res) => {
    // Redirect to registration/login OTP dispatch helper
    const { email, name, isRegister } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    if (!cleanEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const db = readMultiDB();
    if (isRegister && db.users[cleanEmail]) {
      return res.status(400).json({ error: "User already registered" });
    }

    const now = Date.now();
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    tempOTPs[cleanEmail] = {
      otp: randomOtp,
      expiresAt: now + 5 * 60 * 1000,
      attemptCount: 0,
      requestTimes: [now],
      type: isRegister ? "register" : "forgot",
      name: name || cleanEmail.split("@")[0],
      email: cleanEmail,
      phoneNumber: db.users[cleanEmail]?.profile?.phoneNumber || "9876543210",
      passwordHash: db.users[cleanEmail]?.profile?.passwordHash || hashPassword("Chronova@123")
    };

    console.log(`[EMAIL DISPATCH] Compatibility OTP sent to ${cleanEmail}: [ ${randomOtp} ]`);
    res.json({
      success: true,
      otp: randomOtp,
      message: `A 6-digit OTP has been sent directly to email: ${cleanEmail}.`
    });
  });

  // 2. POST /verify-otp
  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ error: "OTP required" });
    }
    const cleanOtp = otp.toString().trim();

    // Brute force protection check
    const now = Date.now();
    if (verificationBlockedUntil[cleanEmail] && verificationBlockedUntil[cleanEmail] > now) {
      const remainingSecs = Math.ceil((verificationBlockedUntil[cleanEmail] - now) / 1000);
      const remainingMins = Math.ceil(remainingSecs / 60);
      return res.status(429).json({ error: `Verification attempts temporarily blocked. Please wait ${remainingMins} minutes.` });
    }

    const sessionOtp = tempOTPs[cleanEmail];
    if (!sessionOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check expiry
    if (sessionOtp.expiresAt < now) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Verify OTP
    if (sessionOtp.otp !== cleanOtp) {
      sessionOtp.attemptCount += 1;
      if (sessionOtp.attemptCount >= 5) {
        verificationBlockedUntil[cleanEmail] = now + 15 * 60 * 1000; // block for 15 mins
        delete tempOTPs[cleanEmail];
        return res.status(429).json({ error: "More than 5 wrong attempts. Verification temporarily blocked." });
      }
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // SUCCESS - Clear session
    delete verificationBlockedUntil[cleanEmail];
    delete tempOTPs[cleanEmail];

    if (sessionOtp.type === "register") {
      // Create and activate user
      const userDB = getUserDB(cleanEmail);
      userDB.profile.name = sessionOtp.name || "";
      userDB.profile.phoneNumber = sessionOtp.phoneNumber || "";
      userDB.profile.emailVerified = true;
      userDB.profile.phoneVerified = true;
      userDB.profile.active = true;
      userDB.profile.locked = false;
      userDB.profile.passwordHash = sessionOtp.passwordHash || "";
      saveUserDB(cleanEmail, userDB);

      return res.json({
        success: true,
        user: userDB,
        message: "Account verified and activated successfully!"
      });
    } else {
      // Issue forgot reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      tempResetTokens[cleanEmail] = {
        token: resetToken,
        expiresAt: now + 10 * 60 * 1000 // valid for 10 minutes
      };

      return res.json({
        success: true,
        resetToken,
        message: "OTP verified successfully. You may now set your new password."
      });
    }
  });

  // Backward-compatible login endpoint using OTP
  app.post("/api/auth/login", (req, res) => {
    const { email, otp } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const cleanOtp = otp ? otp.toString().trim() : "";

    const sessionOtp = tempOTPs[cleanEmail];
    if (!sessionOtp) {
      // Allow seamless login with verified status if user is seeded
      const db = readMultiDB();
      if (db.users[cleanEmail] && db.users[cleanEmail].profile?.emailVerified) {
        return res.json(db.users[cleanEmail]);
      }
      return res.status(400).json({ error: "OTP sessions have expired. Please sign in." });
    }

    if (sessionOtp.otp !== cleanOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const dbUser = getUserDB(cleanEmail);
    dbUser.profile.emailVerified = true;
    dbUser.profile.active = true;
    if (sessionOtp.name) dbUser.profile.name = sessionOtp.name;
    if (sessionOtp.phoneNumber) dbUser.profile.phoneNumber = sessionOtp.phoneNumber;
    if (sessionOtp.passwordHash) dbUser.profile.passwordHash = sessionOtp.passwordHash;
    saveUserDB(cleanEmail, dbUser);

    delete tempOTPs[cleanEmail];
    res.json(dbUser);
  });

  // 3. POST /resend-otp
  app.post("/api/resend-otp", (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const otpSession = tempOTPs[cleanEmail];
    if (!otpSession) {
      return res.status(400).json({ error: "No pending session found. Please register or initiate reset first." });
    }

    // Rate Limiting Check
    const now = Date.now();
    const tenMinsAgo = now - 10 * 60 * 1000;
    otpSession.requestTimes = otpSession.requestTimes.filter(t => t > tenMinsAgo);

    if (otpSession.requestTimes.length >= 3) {
      return res.status(429).json({ error: "Maximum 3 OTP requests allowed within 10 minutes. Please wait before retrying." });
    }

    otpSession.requestTimes.push(now);
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpSession.otp = randomOtp;
    otpSession.expiresAt = now + 5 * 60 * 1000;
    otpSession.attemptCount = 0;

    console.log(`[EMAIL DISPATCH] Resent secure random OTP to ${cleanEmail}: [ ${randomOtp} ]`);

    res.json({
      success: true,
      otp: randomOtp,
      message: `A new 6-digit OTP has been sent directly to email: ${cleanEmail}.`
    });
  });

  // 4. POST /login with lock out validation
  app.post("/api/login", (req, res) => {
    try {
      const { username, password } = req.body;
      const cleanUsername = username ? username.toLowerCase().trim() : "";

      if (!cleanUsername || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const db = readMultiDB();
      if (db.deletedUsers && db.deletedUsers.includes(cleanUsername) && !db.users[cleanUsername]) {
        return res.status(400).json({ error: "This account has been permanently deleted and cannot be accessed." });
      }

      const userDB = db.users[cleanUsername];

      // Check if user exists
      if (!userDB || !userDB.profile) {
        return res.status(404).json({ error: "please register first" });
      }

      const profile = userDB.profile;
      const now = Date.now();

      // Locked Account checking
      if (profile.locked) {
        if (profile.lockUntil && profile.lockUntil > now) {
          return res.status(400).json({ error: "Account temporarily locked. Please try again later." });
        } else {
          // Unlock expired lock
          profile.locked = false;
          profile.failedLoginAttempts = 0;
          profile.lockUntil = null;
        }
      }

      // If the account has no password configured (e.g. pre-seeded with empty password or Google-registered only),
      // allow setting the password dynamically upon first successful attempt here.
      if (profile.passwordHash === undefined || profile.passwordHash === null || profile.passwordHash === "") {
        profile.passwordHash = hashPassword(password);
        profile.failedLoginAttempts = 0;
        profile.locked = false;
        profile.lockUntil = null;
        saveUserDB(cleanUsername, userDB);
      } else {
        // Verify Password Hash
        const hashed = hashPassword(password);
        if (profile.passwordHash !== hashed) {
          profile.failedLoginAttempts = (profile.failedLoginAttempts || 0) + 1;
          
          // Lock after 5 failed attempts
          if (profile.failedLoginAttempts >= 5) {
            profile.locked = true;
            profile.lockUntil = now + 15 * 60 * 1000; // lock for 15 mins
            saveUserDB(cleanUsername, userDB);
            return res.status(400).json({ error: "Account temporarily locked due to too many failed attempts. Please try again in 15 minutes." });
          }

          saveUserDB(cleanUsername, userDB);
          return res.status(400).json({ error: "invalid username or password" });
        }
      }

      // Success login
      profile.failedLoginAttempts = 0;
      profile.locked = false;
      profile.lockUntil = null;
      saveUserDB(cleanUsername, userDB);

      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated-token-for-" + cleanUsername;

      res.json({
        success: true,
        token: mockToken,
        user: userDB,
        message: "Login successful!"
      });
    } catch (err: any) {
      console.error("Error in /api/login endpoint:", err);
      res.status(500).json({ error: "An internal server error occurred. Please try again." });
    }
  });

  // 5. POST /forgot-password
  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const db = readMultiDB();
    if (!db.users[cleanEmail]) {
      return res.status(404).json({ error: "User not found" });
    }

    // Rate Limit: Max 3 OTP requests in 10 minutes
    const now = Date.now();
    let otpSession = tempOTPs[cleanEmail];
    if (!otpSession) {
      otpSession = {
        otp: "",
        expiresAt: 0,
        attemptCount: 0,
        requestTimes: [],
        type: "forgot"
      };
    }

    const tenMinsAgo = now - 10 * 60 * 1000;
    otpSession.requestTimes = otpSession.requestTimes.filter(t => t > tenMinsAgo);

    if (otpSession.requestTimes.length >= 3) {
      return res.status(429).json({ error: "Maximum 3 OTP requests allowed within 10 minutes. Please wait before retrying." });
    }

    otpSession.requestTimes.push(now);
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    tempOTPs[cleanEmail] = {
      otp: randomOtp,
      expiresAt: now + 5 * 60 * 1000, // 5 min expiry
      attemptCount: 0,
      requestTimes: otpSession.requestTimes,
      type: "forgot"
    };

    console.log(`[EMAIL DISPATCH] Password Reset OTP sent to ${cleanEmail}: [ ${randomOtp} ]`);

    res.json({
      success: true,
      otp: randomOtp,
      message: `A password reset OTP has been sent directly to email: ${cleanEmail}.`
    });
  });

  // 6. POST /reset-password
  app.post("/api/reset-password", (req, res) => {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const sessionToken = tempResetTokens[cleanEmail];
    if (!sessionToken || sessionToken.token !== resetToken || sessionToken.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Reset token expired or is invalid. Please restart the process." });
    }

    // Password validation
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ error: "New password is required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    const hasSpecial = /[@$!%*?&]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Set new password
    const userDB = getUserDB(cleanEmail);
    userDB.profile.passwordHash = hashPassword(newPassword);
    userDB.profile.locked = false;
    userDB.profile.failedLoginAttempts = 0;
    userDB.profile.lockUntil = null;
    saveUserDB(cleanEmail, userDB);

    // Clear reset session
    delete tempResetTokens[cleanEmail];

    res.json({
      success: true,
      message: "Password updated successfully! Please log in with your new password."
    });
  });

  // 7. POST /google-login
  app.post("/api/google-login", (req, res) => {
    const { username, name, googleId } = req.body;
    const cleanUsername = username ? username.toLowerCase().trim() : "";

    if (!cleanUsername) {
      return res.status(400).json({ error: "Google authenticated username is required." });
    }

    const db = readMultiDB();
    let deletedUsersChanged = false;
    if (db.deletedUsers && db.deletedUsers.includes(cleanUsername)) {
      if (!db.users[cleanUsername]) {
        // If they sign in again via Google, allow fresh auto-registration by removing from deletedUsers
        db.deletedUsers = db.deletedUsers.filter(u => u !== cleanUsername);
        deletedUsersChanged = true;
      }
    }

    let userDB = db.users[cleanUsername];

    if (!userDB) {
      // Auto-register google user
      userDB = {
        profile: {
          username: cleanUsername,
          name: name || cleanUsername.replace(/[._-]/g, " "),
          phoneNumber: "",
          isOnboarded: false, // forces onboarding
          xp: 0,
          level: 1,
          streak: 0,
          productivityScore: 100,
          focusHours: 0,
          emailVerified: true,
          phoneVerified: true,
          active: true,
          locked: false,
          failedLoginAttempts: 0,
          lockUntil: null,
          passwordHash: "" // Google-only user
        },
        goals: [], // ZERO tasks / ZERO goals, perfectly fresh!
        excuseLogs: [],
        notifications: [
          {
            id: "welcome",
            title: "🙏🏽 Welcome to Chronova!",
            message: "No active goals yet. Click 'Add Custom Goal' above or complete onboarding to schedule your first milestone.",
            type: "info",
            timestamp: "Just now"
          }
        ],
        lastUpdate: new Date().toISOString()
      };
      db.users[cleanUsername] = userDB;
      writeMultiDB(db);
    } else {
      userDB.profile.emailVerified = true;
      userDB.profile.active = true;
      userDB.profile.locked = false;
      userDB.profile.failedLoginAttempts = 0;
      userDB.profile.lockUntil = null;
      db.users[cleanUsername] = userDB;
      if (deletedUsersChanged) {
        writeMultiDB(db);
      } else {
        saveUserDB(cleanUsername, userDB);
      }
    }

    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated-google-token-for-" + cleanUsername;

    res.json({
      success: true,
      token: mockToken,
      user: userDB,
      message: "Successfully logged in via Google OAuth 2.0!"
    });
  });

  // Update Settings (WhatsApp alerts setup)
  app.post("/api/profile/update-settings", (req, res) => {
    const { whatsappEnabled, phoneNumber } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    db.profile.whatsappEnabled = !!whatsappEnabled;
    if (whatsappEnabled) {
      const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, "") : "";
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          error: "A valid WhatsApp Phone Number must contain exactly 10 digits."
        });
      }
      db.profile.phoneNumber = cleanPhone;
    } else {
      db.profile.phoneNumber = "";
    }

    saveUserDB(username, db);
    res.json(db);
  });

  // Delete Account permanently
  app.delete("/api/profile/delete-account", (req, res) => {
    const username = getRequestUsername(req);
    const db = readMultiDB();
    const cleanUsername = username.toLowerCase().trim();

    if (db.users[cleanUsername]) {
      delete db.users[cleanUsername];
      if (!db.deletedUsers) db.deletedUsers = [];
      if (!db.deletedUsers.includes(cleanUsername)) {
        db.deletedUsers.push(cleanUsername);
      }
      writeMultiDB(db);
      res.json({ success: true, message: "Account deleted permanently." });
    } else {
      res.status(404).json({ error: "User account not found." });
    }
  });

  // Emotional Support AI Chat endpoint ("hey! I am here for you")
  app.post("/api/ai/support-chat", async (req, res) => {
    const { message, audio, mimeType } = req.body;
    const cleanMessage = (message || "").toString().trim();
    const username = getRequestUsername(req) || DEFAULT_USERNAME;
    const db = getUserDB(username);

    if (!cleanMessage && !audio) {
      return res.status(400).json({ error: "Empty message text or audio is unauthorized." });
    }

    // Build context about the user's progress, pending tasks, and the website Chronova
    const pendingTasksList = db.goals.flatMap(g => g.subtasks.map(s => ({
      goalTitle: g.title,
      taskTitle: s.title,
      scheduledTime: s.scheduledTime,
      completed: s.completed,
      status: s.status,
      postponementCount: s.postponementCount,
      goalPriority: g.priority || 'high' // 'high' is Critical Priority, 'medium' is Medium Stream, 'low' is Standard Low
    }))).filter(t => !t.completed);

    const completedTasksCount = db.goals.flatMap(g => g.subtasks).filter(s => s.completed).length;
    const totalTasksCount = db.goals.flatMap(g => g.subtasks).length;

    const userContext = `
CHRONOVA SYSTEM CONTEXT:
Website Details:
- Chronova is an AI-powered accountability and gamified productivity system. It is NOT called Chronova AI (just "Chronova").
- Key features:
  1. Goal Breakdown & Schedulers: Breaking big targets into structured timelines.
  2. Proactive Coach Console: Tracks postpone histories and roasts excuses.
  3. Chronova Recovery Plan: An option that auto-compresses schedules by 20% to save missed deadlines.
  4. Gamified Levels and Streaks: Tracks user consistency.
  5. Reminders system: Sends alerts 10m, 1h, 12h, 24h before task deadlines and prompts completion checks afterwards.

Logged-in User Status:
- Username: @${db.profile.username}
- Display Name: ${db.profile.name || "Achiever"}
- Level: ${db.profile.level}
- Streak: ${db.profile.streak} days
- XP: ${db.profile.xp}
- Focus Hours: ${db.profile.focusHours}h
- Overall Tasks Completion: ${completedTasksCount}/${totalTasksCount} tasks completed.

Active Pending Tasks list:
${pendingTasksList.length > 0 ? pendingTasksList.map((t, i) => `${i + 1}. Goal: "${t.goalTitle}" [Priority: ${t.goalPriority === 'high' ? 'Critical' : t.goalPriority === 'medium' ? 'Medium' : 'Low'}] | Task: "${t.taskTitle}" scheduled at ${t.scheduledTime} (Postponed: ${t.postponementCount}x)`).join("\n") : "None! All active tasks are completed."}

Recent Excuse History:
${db.excuseLogs.slice(-3).map(l => `- Excuse: "${l.excuse}" on task "${l.goalTitle}". Coach response: "${l.aiResponse}"`).join("\n")}
`;

    const gemini = getGeminiClient();
    let reply = "";

    if (gemini) {
      try {
        const parts: any[] = [];
        if (audio && typeof audio === "string" && audio.trim()) {
          parts.push({
            inlineData: {
              mimeType: mimeType || "audio/webm",
              data: audio
            }
          });
          parts.push({
            text: `The user sent a voice note. Listen to it carefully, transcribe/understand what they asked, and reply directly.
            If they ask about their tasks, tell them their pending tasks.
            If they ask to prioritize, or ask about priorities, you MUST list and prioritize their tasks strictly according to the goal priority they entered when creating them: list high/Critical Priority first, followed by medium/Medium Stream, and low/Standard Low. Highlight which tasks are Critical!
            Maintain your persona: witty, sharp, highly supportive, sarcastic-yet-deeply-motivating. Keep your response brief (2 to 4 sentences).
            
            USER CONTEXT:
            ${userContext}
            
            Voice note input has been uploaded above. Please reply to the user:`
          });
        } else {
          parts.push({
            text: `The user sent a text message. Answer their query or reply to their statement directly.
            If they ask about their tasks, tell them their pending tasks.
            If they ask to prioritize, or ask about priorities, you MUST list and prioritize their tasks strictly according to the goal priority they entered when creating them: list high/Critical Priority first, followed by medium/Medium Stream, and low/Standard Low. Highlight which tasks are Critical!
            Maintain your persona: witty, sharp, highly supportive, sarcastic-yet-deeply-motivating. Keep your response brief (2 to 4 sentences).
            
            USER CONTEXT:
            ${userContext}
            
            User message: "${cleanMessage}"`
          });
        }

        const response = await generateContentWithFallback({
          contents: { parts }
        });

        if (response.text) {
          reply = response.text.trim();
        }
      } catch (err) {
        console.error("Gemini support chat error:", err);
      }
    }

    // Fallback humorous/intelligent responses based on context if Gemini is not set up or fails
    if (!reply) {
      const lowerQuery = cleanMessage.toLowerCase();
      if (lowerQuery.includes("pending") || lowerQuery.includes("task") || lowerQuery.includes("goal") || lowerQuery.includes("todo") || lowerQuery.includes("prioritize")) {
        if (pendingTasksList.length > 0) {
          const sortedList = [...pendingTasksList].sort((a, b) => {
            const priorityVal = { high: 3, medium: 2, low: 1 };
            const pA = priorityVal[a.goalPriority as 'high' | 'medium' | 'low'] || 1;
            const pB = priorityVal[b.goalPriority as 'high' | 'medium' | 'low'] || 1;
            return pB - pA;
          });
          
          const taskLines = sortedList.map((t, i) => {
            const pLabel = t.goalPriority === 'high' ? '🌋 Critical' : t.goalPriority === 'medium' ? '⚡ Medium' : '☕ Low';
            return `${i + 1}. [${pLabel}] ${t.taskTitle} (under "${t.goalTitle}") scheduled at ${t.scheduledTime}`;
          }).join("\n");

          if (lowerQuery.includes("priorit") || lowerQuery.includes("sort") || lowerQuery.includes("priority")) {
            reply = `Here are your pending tasks prioritized based on your goal choices (🌋 Critical Priority listed first):\n\n${taskLines}\n\nMake sure to crush those Critical tasks immediately, @${db.profile.username}!`;
          } else {
            reply = `Hey @${db.profile.username}! You currently have ${pendingTasksList.length} pending tasks:\n\n${taskLines}`;
          }
        } else {
          reply = `Phenomenal, @${db.profile.username}! You have absolutely no pending tasks at this moment. You've either completed everything or cleared your list. Either way, nice job!`;
        }
      } else if (lowerQuery.includes("streak") || lowerQuery.includes("level") || lowerQuery.includes("xp")) {
        reply = `You are currently Level ${db.profile.level} with a streak of ${db.profile.streak} days and ${db.profile.xp} XP. Your stats look decent, but don't let that streak die today!`;
      } else {
        const FallbackRoasts = [
          `Hey @${db.profile.username}, let's look at your active goals. You've got ${pendingTasksList.length} tasks pending. Your future self is begging you to close other browser tabs and start right now!`,
          `Are we slacking off again? Your streak is at ${db.profile.streak} days. One more lazy hour and we'll have to reset it. Get up and click completed on your scheduled milestones!`,
          `Willpower status: buffering. Put down the phone and tackle "${pendingTasksList[0]?.taskTitle || 'your active goal'}" right now!`,
          `Your competitors are studying with high-speed fiber while you are scrolling on dial-up excuses. Close the tab and let's get focused!`
        ];
        const randIdx = Math.floor(Math.random() * FallbackRoasts.length);
        reply = FallbackRoasts[randIdx];
      }
    }

    res.json({ reply });
  });

  // Save Onboarding Form
  app.post("/api/profile/onboard", (req, res) => {
    const onboardingData = req.body; // wakeTime, sleepTime, workHours, studyHours, preferences, goalsText, deadlineDate
    const username = getRequestUsername(req);
    const db = getUserDB(username);
    
    db.profile.isOnboarded = true;
    db.profile.onboarding = onboardingData;
    db.profile.focusHours = 0;
    db.profile.streak = 1;
    db.profile.xp = 100;
    db.profile.level = 1;
    db.profile.productivityScore = 75;

    // We auto-generate the user's first goal based on their onboarding prompt
    const firstGoal: Goal = {
      id: "g_" + Date.now(),
      title: onboardingData.goalsText || "Focus Goal",
      description: `Targeting deadline on ${onboardingData.deadlineDate}. Created from your onboarding profile.`,
      deadline: onboardingData.deadlineDate || "2026-07-30",
      priority: "high",
      successProbability: 80,
      riskLevel: "Low",
      delayRisk: 20,
      category: onboardingData.preferences?.includes("Student") ? "Student" : "Professional",
      subtasks: [] // Must be empty unless user enters it, per user instructions
    };

    db.goals = [firstGoal];
    saveUserDB(username, db);
    res.json(db);
  });

  // Helper to stagger scheduled task times so they are customized and not constant for all
  function getStaggeredTime(baseTime: string, goalIndex: number): string {
    if (!baseTime || !baseTime.includes(":")) return "12:00";
    const [hoursStr, minutesStr] = baseTime.split(":");
    let hours = parseInt(hoursStr) || 12;
    const minutes = parseInt(minutesStr) || 0;
    // Stagger start hour by 1 hour per goal index, wrapping around 24 hours
    hours = (hours + goalIndex) % 24;
    const hoursFormatted = String(hours).padStart(2, "0");
    const minutesFormatted = String(minutes).padStart(2, "0");
    return `${hoursFormatted}:${minutesFormatted}`;
  }

  // AI-powered Goal Breakdown
  app.post("/api/goals/create", async (req, res) => {
    const { title, deadline, priority, category, customSubtasks, generateAI } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const newGoalId = "g_" + Date.now();
    let generatedSubtasks: SubTask[] = [];

    if (customSubtasks && Array.isArray(customSubtasks)) {
      generatedSubtasks = customSubtasks.map((item: any, index: number) => ({
        id: `sub_${newGoalId}_${index}`,
        title: item.title || title,
        completed: false,
        durationMinutes: Number(item.durationMinutes) || 60,
        scheduledTime: item.scheduledTime || "10:00",
        status: "pending",
        postponementCount: 0
      }));
    } else if (generateAI === true) {
      // Only generate if user explicitly consented to AI generation
      const gemini = getGeminiClient();
      if (gemini) {
        try {
          const prompt = `Solve as an AI productivity coordinator. Break down the goal: "${title}" which has priority "${priority}" and deadline "${deadline}" into exactly 4 actionable subtasks with estimated time in minutes, a reasonable scheduled clock time (e.g., '10:00', '14:30'), and a concise title.
          Return raw JSON only, matching this typescript structure:
          Array<{ title: string, durationMinutes: number, scheduledTime: string }>`;

          const response = await generateContentWithFallback({
            contents: prompt,
          });

          const textOutput = response.text || "[]";
          const cleanJSON = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJSON);

          if (Array.isArray(parsed)) {
            generatedSubtasks = parsed.map((item: any, index: number) => ({
              id: `sub_${newGoalId}_${index}`,
              title: item.title,
              completed: false,
              durationMinutes: item.durationMinutes || 60,
              scheduledTime: getStaggeredTime(item.scheduledTime || "10:00", db.goals.length),
              status: "pending",
              postponementCount: 0
            }));
          }
        } catch (err) {
          console.error("Gemini breakdown error, deploying robust fallback system:", err);
        }
      }

      // Fallback only if Gemini failed but AI generation was requested
      if (generatedSubtasks.length === 0) {
        const lowerTitle = title.toLowerCase();
        const goalIndex = db.goals.length;
        if (lowerTitle.includes("software") || lowerTitle.includes("placement") || lowerTitle.includes("interview") || lowerTitle.includes("code")) {
          generatedSubtasks = [
            { id: `sub_${newGoalId}_1`, title: "Solve 3 medium LeetCode questions in DSA Array/Trees", completed: false, durationMinutes: 90, scheduledTime: getStaggeredTime("09:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_2`, title: "Write clean schemas for DBMS and OS notes study review", completed: false, durationMinutes: 60, scheduledTime: getStaggeredTime("11:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_3`, title: "Draft answers for common architectural behavioral prompts", completed: false, durationMinutes: 45, scheduledTime: getStaggeredTime("14:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_4`, title: "Complete full simulated dry-run coding interview", completed: false, durationMinutes: 90, scheduledTime: getStaggeredTime("16:30", goalIndex), status: "pending", postponementCount: 0 }
          ];
        } else if (lowerTitle.includes("startup") || lowerTitle.includes("product") || lowerTitle.includes("app") || lowerTitle.includes("build")) {
          generatedSubtasks = [
            { id: `sub_${newGoalId}_1`, title: "Brainstorm core architecture diagram & map API schemas", completed: false, durationMinutes: 60, scheduledTime: getStaggeredTime("09:00", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_2`, title: "Setup frontend repository, components, and layout styling", completed: false, durationMinutes: 120, scheduledTime: getStaggeredTime("10:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_3`, title: "Configure server hooks and SQLite/JSON local ledger logic", completed: false, durationMinutes: 90, scheduledTime: getStaggeredTime("14:00", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_4`, title: "Build testing deployment script and verify local simulation", completed: false, durationMinutes: 60, scheduledTime: getStaggeredTime("16:30", goalIndex), status: "pending", postponementCount: 0 }
          ];
        } else {
          generatedSubtasks = [
            { id: `sub_${newGoalId}_1`, title: `Design precise blueprint outline for: ${title}`, completed: false, durationMinutes: 45, scheduledTime: getStaggeredTime("09:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_2`, title: `Deep working focus sprint: Implement first key milestone`, completed: false, durationMinutes: 120, scheduledTime: getStaggeredTime("11:00", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_3`, title: `Quality check, bug fixing and polishing iteration`, completed: false, durationMinutes: 60, scheduledTime: getStaggeredTime("14:30", goalIndex), status: "pending", postponementCount: 0 },
            { id: `sub_${newGoalId}_4`, title: `Publish milestone outcomes & align accountability checks`, completed: false, durationMinutes: 45, scheduledTime: getStaggeredTime("16:30", goalIndex), status: "pending", postponementCount: 0 }
          ];
        }
      }
    }

    const newGoal: Goal = {
      id: newGoalId,
      title: title,
      description: `Deadline set to ${deadline}. Tracked with priority ${priority.toUpperCase()}.`,
      deadline: deadline,
      priority: priority,
      successProbability: 85,
      riskLevel: "Low",
      delayRisk: 15,
      category: category || "Professional",
      subtasks: generatedSubtasks
    };

    db.profile.xp += 20; // 20 XP for setting new structured target
    db.goals.push(newGoal);
    saveUserDB(username, db);
    res.json(db);
  });

  // Toggle subtask completeness and award XP!
  app.post("/api/tasks/toggle", (req, res) => {
    const { goalId, taskId } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const goal = db.goals.find(g => g.id === goalId);
    if (goal) {
      const task = goal.subtasks.find(s => s.id === taskId);
      if (task) {
        const wasCompleted = task.completed;
        task.completed = !wasCompleted;
        task.status = task.completed ? "completed" : "pending";

        // Upgrades experience points and calculates scores
        if (task.completed) {
          db.profile.xp += 15; // 15 XP back on accomplishment
          db.profile.focusHours += parseFloat((task.durationMinutes / 60).toFixed(1));
          
          // Re-calculate success scores dynamically
          goal.successProbability = Math.min(100, goal.successProbability + 5);
          goal.delayRisk = Math.max(0, goal.delayRisk - 5);
        } else {
          db.profile.xp = Math.max(0, db.profile.xp - 15);
          db.profile.focusHours = Math.max(0, db.profile.focusHours - parseFloat((task.durationMinutes / 60).toFixed(1)));
          goal.successProbability = Math.max(10, goal.successProbability - 5);
          goal.delayRisk = Math.min(90, goal.delayRisk + 5);
        }

        // Adjust risk indicators
        goal.riskLevel = goal.delayRisk > 50 ? "High" : goal.delayRisk > 25 ? "Medium" : "Low";

        // Calculate overall productivity streak and scores
        let totalTasks = 0;
        let completedTasks = 0;
        db.goals.forEach(g => {
          g.subtasks.forEach(s => {
            totalTasks++;
            if (s.completed) completedTasks++;
          });
        });
        db.profile.productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 40 + 60) : 80;

        // Level Up Trigger if XP sets boundary rules (each level is 100 XP)
        db.profile.level = Math.floor(db.profile.xp / 100) + 1;

        // Save and update
        saveUserDB(username, db);
      }
    }
    res.json(db);
  });

  // Toggle whole goal completeness
  app.post("/api/goals/toggle", (req, res) => {
    const { goalId } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const goal = db.goals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
      if (goal.completed) {
        goal.subtasks.forEach(s => {
          s.completed = true;
          s.status = "completed";
        });
        db.profile.xp += 50; // Extra XP for completing whole goal!
      } else {
        goal.subtasks.forEach(s => {
          s.completed = false;
          s.status = "pending";
        });
        db.profile.xp = Math.max(0, db.profile.xp - 50);
      }
      db.profile.level = Math.floor(db.profile.xp / 100) + 1;
      saveUserDB(username, db);
    }
    res.json(db);
  });

  // Excuse detector & Roast generator with Gemini context
  app.post("/api/ai/excuse", async (req, res) => {
    const { excuse, goalId, taskId } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const goal = db.goals.find(g => g.id === goalId);
    const task = goal?.subtasks.find(s => s.id === taskId);
    
    // Default witty response
    let roastText = ZO_ROASTS[Math.floor(Math.random() * ZO_ROASTS.length)];
    let simulatedConsequence = "Increases delay potential and locks current work streak.";

    // Apply strict procrastination log
    if (task) {
      task.postponementCount += 1;
      task.status = "postponed";
      
      // Postponements hurt success probability immediately
      if (goal) {
        goal.successProbability = Math.max(15, goal.successProbability - 12);
        goal.delayRisk = Math.min(95, goal.delayRisk + 12);
        goal.riskLevel = goal.delayRisk > 50 ? "High" : goal.delayRisk > 25 ? "Medium" : "Low";
      }
    }

    db.profile.streak = Math.max(1, db.profile.streak - 1); // Broke/weakened the streak!
    db.profile.productivityScore = Math.max(40, db.profile.productivityScore - 8);

    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `You are the core AI of 'Chronova', an extreme accountability, humorous, and supportive productivity assistant.
        The user wants to postpone a task. They gave this excuse: "${excuse}".
        The task is: "${task?.title || 'Main Task'}" under goal "${goal?.title || 'Main Goal'}".
        
        Generate a response in exactly two parts with an extremely witty, humorous, and sharp roast.
        Roast style: extremely witty, salary-related, bank or time analogies, punchy, bold but supportive to actually make them work. Include no swiggy/zomato corporate brand names.
        Keep it under 3 sentences.
        Also generate a realistic "Future Consequence" of doing this (1 sentence).
        Return a single JSON object strictly format:
        {
          "roast": "your witty roast text",
          "consequence": "consequence description"
        }`;

        const response = await generateContentWithFallback({
          contents: prompt,
        });

        const textOutput = response.text || "{}";
        const cleanJSON = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJSON);
        if (parsed.roast) {
          roastText = parsed.roast;
        }
        if (parsed.consequence) {
          simulatedConsequence = parsed.consequence;
        }
      } catch (err) {
        console.error("Gemini roast error, falling back with rule-based humor:", err);
      }
    }

    // Customized rule-based fallbacks for specific procrastination themes
    if (!gemini) {
      const text = excuse.toLowerCase();
      if (text.includes("tomorrow") || text.includes("later")) {
        roastText = "⏳ Chronova Assistant says: 'No one delivers tomorrow's productivity today. Breaking news: Tomorrow is on backorder! Do it now.'";
        simulatedConsequence = `You postponed similar tasks multiple times this month. This delay pushes your deadline completion risk to ${goal ? goal.delayRisk + 15 : 40}%.`;
      } else if (text.includes("tired") || text.includes("sleep") || text.includes("exhausted")) {
        roastText = "😴 Chronova Coach says: 'Sleeping off your responsibilities? Your career tracks aren't in energy saving mode. Let's start with a swift 15-minute action loop.'";
        simulatedConsequence = "Adds night latency to your schedule and increases likelihood of incomplete deliverables by 20%.";
      } else if (text.includes("game") || text.includes("social") || text.includes("insta") || text.includes("phone")) {
        roastText = "📱 Chronova Alert: 'Productivity.exe failed. We searched for a career in those feeds but found only temporary validation. Your future bank account is logging off.'";
        simulatedConsequence = "Shaves 3 focus XP credits off your score and delays milestones.";
      }
    }

    // Save excuse log
    const newLog: ExcuseLog = {
      id: "e_" + Date.now(),
      excuse: excuse,
      aiResponse: roastText,
      timestamp: new Date().toISOString(),
      goalTitle: goal?.title || "Main Goal",
      consequence: simulatedConsequence
    };
    db.excuseLogs.unshift(newLog);

    // Create custom Notification and funny warn card
    const notification: AppNotification = {
      id: "n_" + Date.now(),
      title: "⚠️ High Delay Warning",
      message: roastText,
      type: "humor",
      timestamp: "Just now",
      emailTemplate: `Subject: Excuse Logged & Success Rate Dropping - Chronova\n\nHi ${db.profile.name},\n\nYou gave an excuse for "${task?.title || "Task"}".\n\nExcuse: "${excuse}"\nConsequence: ${simulatedConsequence}\n\nLet's beat this procrastination cycle step-by-step.`,
      pushChannel: "Browser Push: Consequence simulation has updated. Risk is RED."
    };
    if (db.profile.whatsappEnabled && db.profile.phoneNumber) {
      notification.whatsappTemplate = `🚨 Chronova Alert for ${db.profile.name}! Your excuse was logged: "${excuse}". AI Says: ${roastText} Recovery needed!`;
    }
    db.notifications.unshift(notification);

    saveUserDB(username, db);
    res.json({ db, newLog });
  });

  // Auto-Align Scheduling Engine API
  app.post("/api/goals/auto-align", (req, res) => {
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const onboarding = db.profile.onboarding;
    const wakeTime = onboarding?.wakeTime || "07:00";
    const sleepTime = onboarding?.sleepTime || "23:00";
    const workHours = onboarding?.workHours || "09:00-17:00";

    // Parse busy intervals (e.g., "09:00-17:00")
    let workStartMins = 9 * 60; // 09:00
    let workEndMins = 17 * 60; // 17:00
    try {
      const parts = workHours.split("-");
      if (parts.length === 2) {
        const [sh, sm] = parts[0].trim().split(":").map(Number);
        const [eh, em] = parts[1].trim().split(":").map(Number);
        if (!isNaN(sh)) workStartMins = sh * 60 + (sm || 0);
        if (!isNaN(eh)) workEndMins = eh * 60 + (em || 0);
      }
    } catch (e) {
      console.error("Failed to parse work hours, using default 09:00-17:00", e);
    }

    // Parse wake and sleep boundaries
    let wakeMins = 7 * 60; // 07:00
    let sleepMins = 23 * 60; // 23:00
    try {
      const [wh, wm] = wakeTime.split(":").map(Number);
      if (!isNaN(wh)) wakeMins = wh * 60 + (wm || 0);
      const [sh, sm] = sleepTime.split(":").map(Number);
      if (!isNaN(sh)) sleepMins = sh * 60 + (sm || 0);
    } catch (e) {
      console.error("Failed to parse boundaries, using default", e);
    }

    // Determine available slots inside awake boundaries that don't overlap with busy/college hours
    const isMinuteAvailable = (m: number) => {
      let isAwake = false;
      if (sleepMins > wakeMins) {
        isAwake = m >= wakeMins && m < sleepMins;
      } else {
        isAwake = m >= wakeMins || m < sleepMins;
      }

      let isBusy = false;
      if (workEndMins > workStartMins) {
        isBusy = m >= workStartMins && m < workEndMins;
      } else {
        isBusy = m >= workStartMins || m < workEndMins;
      }

      return isAwake && !isBusy;
    };

    // Gather all incomplete subtasks across active goals
    const pendingTasks: Array<{ goalId: string; subtaskId: string; duration: number }> = [];
    db.goals.forEach(goal => {
      if (!goal.completed) {
        goal.subtasks.forEach(task => {
          if (!task.completed) {
            pendingTasks.push({
              goalId: goal.id,
              subtaskId: task.id,
              duration: task.durationMinutes || 30
            });
          }
        });
      }
    });

    let currentMinute = wakeMins;
    let alignedCount = 0;

    pendingTasks.forEach(item => {
      let foundStart = -1;
      let checkMin = currentMinute;
      let searchCount = 0;

      while (searchCount < 2880) {
        const modMin = checkMin % 1440;
        let fits = true;
        for (let offset = 0; offset < item.duration; offset++) {
          if (!isMinuteAvailable((modMin + offset) % 1440)) {
            fits = false;
            break;
          }
        }
        if (fits) {
          foundStart = checkMin;
          break;
        }
        checkMin += 15;
        searchCount += 15;
      }

      if (foundStart !== -1) {
        const goal = db.goals.find(g => g.id === item.goalId);
        if (goal) {
          const task = goal.subtasks.find(s => s.id === item.subtaskId);
          if (task) {
            const startHour = Math.floor((foundStart % 1440) / 60);
            const startMin = Math.floor((foundStart % 1440) % 60);
            task.scheduledTime = `${startHour < 10 ? '0' + startHour : startHour}:${startMin < 10 ? '0' + startMin : startMin}`;
            alignedCount++;
            currentMinute = foundStart + item.duration + 15;
          }
        }
      }
    });

    const alignmentNotif: AppNotification = {
      id: "align_" + Date.now(),
      title: "🗓️ Smart Scheduler Alignment",
      message: `Successfully aligned ${alignedCount} pending milestones to fit your sleeping periods and active free slots.`,
      type: "info",
      timestamp: "Just now",
      emailTemplate: `Chronova's Smart Alignment completed. We mapped ${alignedCount} tasks strictly during your awake and non-office blocks.`,
      pushChannel: "AI Scheduler: Optimal task load balancing achieved."
    };
    db.notifications.unshift(alignmentNotif);

    db.profile.xp += 25;
    db.profile.level = Math.floor(db.profile.xp / 100) + 1;

    saveUserDB(username, db);
    res.json(db);
  });

  // Recovery Planner Engine API
  app.post("/api/goals/recover", async (req, res) => {
    const { goalId } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const goal = db.goals.find(g => g.id === goalId);
    if (goal) {
      // Recovery mode rearranges/compresses the subtasks!
      // Shift start times, compress durations, reprioritize
      goal.subtasks.forEach((task, idx) => {
        if (!task.completed) {
          task.status = "pending";
          // Compress duration by 20% to help pick up speed
          task.durationMinutes = Math.max(15, Math.round(task.durationMinutes * 0.8));
          // Shift time forward to make it actionable immediately
          const baseHour = 9 + idx * 2;
          task.scheduledTime = `${baseHour < 10 ? '0' + baseHour : baseHour}:30`;
        }
      });

      // Boost success numbers back
      goal.successProbability = Math.min(95, goal.successProbability + 15);
      goal.delayRisk = Math.max(5, goal.delayRisk - 15);
      goal.riskLevel = "Low";

      db.profile.xp += 30; // Points for facing procrastination!
      db.profile.productivityScore = Math.min(100, db.profile.productivityScore + 10);

      // Log recovery notification
      const recoveryNotif: AppNotification = {
        id: "n_" + Date.now(),
        title: "⚡ Recovery Plan Loaded",
        message: `Chronova optimized times and compressed task lengths by 20% to guarantee launch!`,
        type: "recovery",
        timestamp: "Just now",
        emailTemplate: `Subject: Recovery Activated for ${goal.title}\n\nYou stepped up! We reorganized pending tasks to squeeze out inefficiencies. Success rate is back up to ${goal.successProbability}%.`,
        pushChannel: "Recovery Action: Reprioritized schedule loaded."
      };
      if (db.profile.whatsappEnabled && db.profile.phoneNumber) {
        recoveryNotif.whatsappTemplate = `💡 Recovery Activated! We compressed durations by 20%. Let's finish "${goal.title}" tonight!`;
      }
      db.notifications.unshift(recoveryNotif);

      saveUserDB(username, db);
    }
    res.json(db);
  });

  // Future Consequence Simulation
  app.post("/api/ai/simulate", (req, res) => {
    const { delayDays, goalId } = req.body;
    const username = getRequestUsername(req);
    const db = getUserDB(username);

    const goal = db.goals.find(g => g.id === goalId);
    if (goal) {
      const riskAdd = delayDays * 15;
      const simulatedProb = Math.max(10, goal.successProbability - riskAdd);
      const simulatedRisk = Math.min(100, goal.delayRisk + riskAdd);
      const simulatedLevel = simulatedRisk > 50 ? "High" : simulatedRisk > 25 ? "Medium" : "Low";
      
      let speech = "Perfect schedule alignment.";
      if (delayDays > 0) {
        if (delayDays <= 2) {
          speech = `Pushes tasks to weekend buffers, which reduces recovery chance to ${simulatedProb}%.`;
        } else {
          speech = `CRITICAL: Pushes deadline past limits. Missed opportunities and loss of key milestone momentum!`;
        }
      }

      res.json({
        simulatedProb,
        simulatedRisk,
        simulatedLevel,
        speech
      });
    } else {
      res.status(404).json({ error: "Goal not found" });
    }
  });

  // Client-Side App Delivery with Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chronova AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
