import React, { useState, useEffect } from 'react';
import { User, Student } from './types';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import AiAdvisor from './components/AiAdvisor';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Activity, 
  RefreshCw, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  UserCircle,
  Menu,
  Paintbrush
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('saas_attendance_theme') || 'violet';
  });

  useEffect(() => {
    localStorage.setItem('saas_attendance_theme', theme);
  }, [theme]);

  // Load user session on start if available
  useEffect(() => {
    const savedUser = localStorage.getItem('saas_attendance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (usr: User) => {
    setUser(usr);
    localStorage.setItem('saas_attendance_user', JSON.stringify(usr));
    
    // Choose initial active tab based on role requirements
    if (usr.role === 'student') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('saas_attendance_user');
    setActiveTab('dashboard');
  };

  // Pull global student array and dashboard sync logs from backend
  const refreshData = async () => {
    try {
      const sRes = await fetch('/api/students');
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudents(sData);
      }

      // Also pull recent synchronizations
      const aRes = await fetch('/api/analytics');
      if (aRes.ok) {
        const aData = await aRes.json();
        setRecentLogs(aData.recentLogs || []);
      }
    } catch (err) {
      console.error('Error refreshing system cache:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
      // Setup dynamic poll matching WebSocket broadcasts to synchronize dashboards instantly
      const interval = setInterval(() => {
        refreshData();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Render proper view depending on tab selection
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (user.role === 'student') {
          return <StudentPanel user={user} students={students} />;
        }
        return <AdminPanel students={students} onRefreshData={refreshData} />;
      case 'mark':
        if (user.role === 'student') {
          return <StudentPanel user={user} students={students} />;
        }
        return (
          <TeacherPanel 
            students={students} 
            onRefreshData={refreshData} 
            username={user.username} 
          />
        );
      case 'students':
        if (user.role === 'student') {
          return <StudentPanel user={user} students={students} />;
        }
        return <AdminPanel students={students} onRefreshData={refreshData} />;
      case 'ai-advisor':
        return <AiAdvisor />;
      case 'logs':
        return (
          <div className="space-y-6 animate-fadeIn" id="logs-tab-wrap">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-200">Event Log & Synced Broadcasts</h2>
                <p className="text-xs text-slate-400 mt-1">
                  View diagnostic telemetry logs tracking logins, registration creation, and bulk attendance submissions.
                </p>
              </div>
              <button
                onClick={refreshData}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Poll Logs Now
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 font-mono">Live Broadcast Events</span>
                <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-brand-500 animate-pulse" /> Synchronized Tunnel
                </span>
              </div>

              <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono text-center py-6">No recent system signals captured yet.</p>
                ) : (
                  recentLogs.map((log, index) => (
                    <div key={index} className="flex gap-4 items-start bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-800 transition-all">
                      <div className="p-2 bg-brand-50 border border-brand-500/30 text-brand-500 rounded-lg shrink-0 mt-0.5">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 leading-relaxed">{log.details}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1.5">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <AdminPanel students={students} onRefreshData={refreshData} />;
    }
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-slate-950 text-slate-350 flex overflow-hidden relative w-full">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        {/* Global Hub Top Header */}
        <header className="p-4 px-4 sm:px-8 border-b border-slate-850 bg-slate-900/80 backdrop-blur justify-between items-center flex shrink-0 sticky top-0 z-10 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hamburger helper toggler */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer transition-all active:scale-95 inline-flex items-center justify-center border border-slate-800"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse shrink-0"></span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono truncate max-w-[150px] sm:max-w-none">
              Workspace Core Operational
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-850">
              <Paintbrush className="w-3.5 h-3.5 text-brand-500" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent border-none text-[10px] sm:text-xs font-bold text-slate-300 focus:outline-none focus:ring-0 pr-1 py-0 cursor-pointer capitalize font-sans leading-none outline-none"
              >
                <option value="violet" className="bg-slate-950 text-slate-200">Sunset Purple</option>
                <option value="emerald" className="bg-slate-950 text-slate-200">Emerald Mint</option>
                <option value="ocean" className="bg-slate-950 text-slate-200">Nordic Blue</option>
                <option value="amber" className="bg-slate-950 text-slate-200">Golden Amber</option>
                <option value="crimson" className="bg-slate-950 text-slate-200">Imperial Crimson</option>
              </select>
            </div>

            {/* Quick stats indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Synced Roster:</span>
              <span className="text-xs font-bold font-mono text-brand-500">{students.length} Total</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-250 block capitalize">
                  {user.username}
                </span>
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">
                  {user.role} console
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-brand-500">
                {user.username.substring(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering with Framer Motion wrapper */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
