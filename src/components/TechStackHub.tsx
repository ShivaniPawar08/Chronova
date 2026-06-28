import React, { useState } from "react";
import { Database, Server, Code, Play, Terminal, HelpCircle, Check, Copy } from "lucide-react";

export default function TechStackHub() {
  const [activeTab, setActiveTab] = useState<"mysql" | "springboot" | "api">("mysql");
  const [copiedText, setCopiedText] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("auth-register");
  const [apiResponse, setApiResponse] = useState<any>({
    message: "Click 'Send Request' to trigger simulated Spring Boot REST API endpoint."
  });
  const [loading, setLoading] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Mock responses for Spring Boot Endpoint Simulator
  const simulatedEndpoints: { [key: string]: { url: string; method: "GET" | "POST" | "PUT" | "DELETE"; desc: string; payload: any; response: any } } = {
    "auth-register": {
      url: "/api/v1/auth/register",
      method: "POST",
      desc: "Registers a fresh user, triggers BCrypt encryption, and delivers secure OTP code.",
      payload: {
        fullName: "Shivani Pawar",
        email: "pawarshivani081225@gmail.com",
        phoneNumber: "9876543210",
        password: "[PROTECTED]"
      },
      response: {
        status: "SUCCESS",
        message: "User registered. OTP sent to verified communications pipeline.",
        data: {
          userId: 104,
          email: "pawarshivani081225@gmail.com",
          emailVerified: false,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXdhcnNoaXZhbmkwODEyMjVAZ21haWwuY29tIiwiaWF0IjoxNzE2OTU2MTUxfQ..."
        }
      }
    },
    "auth-google": {
      url: "/api/v1/auth/google",
      method: "POST",
      desc: "OAuth2 exchange endpoint that automatically provisions JWT session tokens.",
      payload: {
        idToken: "ya29.a0AfB_byE8..."
      },
      response: {
        status: "SUCCESS",
        message: "Google OAuth exchange accomplished.",
        data: {
          userId: 104,
          email: "pawarshivani081225@gmail.com",
          emailVerified: true,
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXdhcnNoaXZhbmkwODEyMjVAZ21haWwuY29tIiwiaWF0IjoxNzE2OTU2MTUxfQ..."
        }
      }
    },
    "goals-create": {
      url: "/api/v1/goals",
      method: "POST",
      desc: "Creates a mission goal and triggers Gemini SpringAI task mapping.",
      payload: {
        title: "Prepare for Software Placement",
        deadline: "2026-07-20",
        priority: "CRITICAL",
        category: "Student"
      },
      response: {
        status: "SUCCESS",
        message: "Goal mapped, Gemini AI task breakdown completed.",
        goal: {
          id: 12,
          title: "Prepare for Software Placement",
          deadline: "2026-07-20",
          priority: "CRITICAL",
          successProbability: 80,
          delayRisk: 20,
          subtasks: [
            { id: 41, title: "Review LeetCode Trees & Graphs questions", completed: false, durationMinutes: 90 },
            { id: 42, title: "Practice DBMS SQL Queries and Joins", completed: false, durationMinutes: 60 }
          ]
        }
      }
    },
    "coach-roast": {
      url: "/api/v1/coach/excuse",
      method: "POST",
      desc: "Excuse analyzer endpoint. Triggers a sarcastic procrastination roast and consequence forecast.",
      payload: {
        goalId: 12,
        subtaskId: 42,
        excuse: "Instagram reels were highly addicting today, got trapped in scrolling"
      },
      response: {
        status: "WARNING",
        roast: "Scrolling detected! Productivity.exe failed. We searched for a career in those feeds but found only temporary validation. Your future salary is currently logging off.",
        consequence: "Reduces placement success probability to 78% and shaves 3 focus XP credits off your profile.",
        procrastinationCount: 1
      }
    },
    "recovery-trigger": {
      url: "/api/v1/goals/12/recover",
      method: "PUT",
      desc: "Rearranges and auto-compresses pending task structures when deadlines are slipping.",
      payload: {},
      response: {
        status: "RECOVERED",
        message: "Recovery pipeline activated. Remaining task durations compressed by 20% to safeguard deadline.",
        boostedSuccessProbability: 95,
        newRiskLevel: "LOW"
      }
    }
  };

  const triggerApiSim = () => {
    setLoading(true);
    setApiResponse({ status: "LOADING", message: "Connecting to virtual Spring Boot container..." });
    setTimeout(() => {
      setApiResponse(simulatedEndpoints[selectedEndpoint].response);
      setLoading(false);
    }, 800);
  };

  const mysqlDDL = `-- ==========================================
-- CHRONOVA AI - MYSQL DATABASE DDL BLUEPRINT
-- ==========================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak INT DEFAULT 0,
    productivity_score DOUBLE DEFAULT 100.0,
    focus_hours DOUBLE DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    priority VARCHAR(50) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    success_probability INT DEFAULT 80,
    delay_risk INT DEFAULT 20,
    category VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subtasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    goal_id BIGINT,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 60,
    scheduled_time VARCHAR(20), -- e.g. "10:00"
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, POSTPONED
    postponement_count INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE excuse_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    excuse TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    consequence VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

  const springBootCode = `// ===================================================
// CHRONOVA AI - SPRING BOOT JPA ENTITIES & CONTROLLERS
// ===================================================

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String passwordHash;
    private boolean emailVerified;
    private int xp;
    private int level;
    private int streak;
    private double productivityScore;
    private double focusHours;
    
    // JPA Getters, Setters, and Relationships
}

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest reg) {
        if(userService.existsByEmail(reg.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered!");
        }
        User user = userService.createUser(reg);
        String otp = userService.generateAndSendOtp(user.getEmail(), user.getPhoneNumber());
        return ResponseEntity.ok(new ApiResponse("SUCCESS", "Registration complete, OTP code generated: " + otp));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest token) {
        GoogleUser googleUser = googleAuthService.verifyIdToken(token.getIdToken());
        User user = userService.findOrCreateGoogleUser(googleUser);
        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(user, jwt));
    }
}

@RestController
@RequestMapping("/api/v1/coach")
public class CoachController {

    @Autowired
    private GeminiAiService geminiAiService;
    
    @Autowired
    private ExcuseLogRepository excuseLogRepo;

    @PostMapping("/excuse")
    public ResponseEntity<?> handleExcuse(@RequestBody ExcuseRequest request) {
        String roast = geminiAiService.generateRoast(request.getExcuse());
        String consequence = geminiAiService.predictConsequence(request.getExcuse());
        
        ExcuseLog log = new ExcuseLog(request.getUserId(), request.getExcuse(), roast, consequence);
        excuseLogRepo.save(log);
        
        return ResponseEntity.ok(new ExcuseResponse(roast, consequence));
    }
}`;

  return (
    <div className="bg-slate-900/80 border border-gray-800 rounded-3xl p-6 space-y-6">
      
      {/* Tab Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Database className="text-indigo-400 w-5 h-5" />
            <h3 className="text-lg font-bold text-white tracking-tight uppercase">Tech Stack & DB Design Blueprint</h3>
          </div>
          <p className="text-xs text-gray-400">
            Fully structured relational MySQL schema, Spring Boot JPA repositories, Spring Security architecture, and Live REST API Playground.
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-800 p-1 bg-slate-950 text-xs font-mono">
          <button
            onClick={() => setActiveTab("mysql")}
            className={`px-3.5 py-2 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "mysql" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            MySQL DDL
          </button>
          <button
            onClick={() => setActiveTab("springboot")}
            className={`px-3.5 py-2 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "springboot" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Spring Boot Java
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`px-3.5 py-2 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "api" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            API Playground
          </button>
        </div>
      </div>

      {/* RENDER MYSQL DDL TAB */}
      {activeTab === "mysql" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">MySQL 8.0 Relational Entity Tables</span>
            <button
              onClick={() => handleCopy(mysqlDDL)}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
            >
              {copiedText ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
              <span>Copy Schema DDL</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-5 rounded-2xl text-xs text-indigo-300 font-mono overflow-x-auto max-h-[400px] border border-white/5 leading-relaxed selection:bg-indigo-600 selection:text-white">
            {mysqlDDL}
          </pre>
        </div>
      )}

      {/* RENDER SPRING BOOT JAVA TAB */}
      {activeTab === "springboot" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">Spring Boot JPA Entity Relations & Auth RestControllers</span>
            <button
              onClick={() => handleCopy(springBootCode)}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
            >
              {copiedText ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
              <span>Copy Java Source</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-5 rounded-2xl text-xs text-emerald-300 font-mono overflow-x-auto max-h-[400px] border border-white/5 leading-relaxed selection:bg-indigo-600 selection:text-white">
            {springBootCode}
          </pre>
        </div>
      )}

      {/* RENDER API PLAYGROUND TAB */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List of endpoints */}
          <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block">Select Endpoint Request Route</span>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {Object.entries(simulatedEndpoints).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedEndpoint(key); setApiResponse({ message: "Click 'Send Request' to execute REST endpoint." }); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between gap-3 ${
                      selectedEndpoint === key
                        ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        item.method === "POST" ? "bg-emerald-950 text-emerald-400" : item.method === "PUT" ? "bg-amber-950 text-amber-400" : "bg-blue-950 text-blue-400"
                      }`}>{item.method}</span>
                      <span className="font-mono tracking-tight font-bold">{item.url}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium font-mono">Simulated</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Route Action Summary</span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{simulatedEndpoints[selectedEndpoint].desc}</p>
              </div>
            </div>

            <button
              onClick={triggerApiSim}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 mt-4"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Execute Endpoint Simulator
            </button>
          </div>

          {/* Console Output */}
          <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[350px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Virtual JPA Spring Boot Console
                </span>
                <span className="text-[9px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-mono">STATUS: ACTIVE</span>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                <span className="text-[10px] text-slate-500 font-bold">REQUEST PAYLOAD</span>
                <pre className="text-slate-300 overflow-x-auto max-h-[80px] text-[11px]">
                  {JSON.stringify(simulatedEndpoints[selectedEndpoint].payload, null, 2)}
                </pre>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-indigo-400 font-bold">RESPONSE DATA (JSON PAYLOAD)</span>
                {loading ? (
                  <div className="text-indigo-400 animate-pulse py-4 font-mono text-center">
                    [INFO] Hibernate: select user0_.id as id1_0_...
                  </div>
                ) : (
                  <pre className="text-emerald-400 overflow-x-auto max-h-[160px] leading-relaxed text-[11px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-3 mt-3">
              <span>Hibernate Logs: Enabled</span>
              <span>REST Response Mode: application/json</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
