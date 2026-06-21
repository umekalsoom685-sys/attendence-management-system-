import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogIn, UserPlus, Key, School, GraduationCap, ArrowRight, ShieldCheck, Users, Bot, Cpu, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [rollNumber, setRollNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Public Support Chatbot States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportHistory, setSupportHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Welcome to Aura! I'm Gemini, your instant assistant. Ask me anything about creating custom student rosters, logging in, or platform capabilities!" }
  ]);
  const [isSupportThinking, setIsSupportThinking] = useState(false);

  const handleSupportSuggest = (suggestion: string) => {
    submitSupportQuery(suggestion);
  };

  const submitSupportQuery = async (queryText: string) => {
    if (!queryText.trim() || isSupportThinking) return;

    const userMessage = { role: 'user' as const, text: queryText };
    setSupportHistory(prev => [...prev, userMessage]);
    setSupportQuery('');
    setIsSupportThinking(true);

    try {
      const chatHistory = supportHistory.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        text: h.text
      }));

      const res = await fetch('/api/ai/public-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, chatHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Help API is currently offline');

      setSupportHistory(prev => [...prev, { role: 'model', text: data.answer }]);
    } catch (err: any) {
      setSupportHistory(prev => [
        ...prev,
        { role: 'model', text: `I encountered an issue: ${err.message || 'connection failed'}. Please feel free to log in using the sandbox shortcut chips below or request credentials via the registration layout!` }
      ]);
    } finally {
      setIsSupportThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password,
            role,
            rollNumber: role === 'student' ? rollNumber : undefined,
            grade: role === 'student' ? grade : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setSuccess('Registration successful! Please login with your password.');
        setIsRegister(false);
        setPassword('');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: username || email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutLogin = (usernameVal: string, passwordVal: string) => {
    setUsername(usernameVal);
    setPassword(passwordVal);
    // Submit login programmatically
    setError('');
    setLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: usernameVal, password: passwordVal }),
    })
      .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.error);
        onLoginSuccess(data.user);
      }))
      .catch((err: any) => setError(err.message || 'Login failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#090b11] flex flex-col md:flex-row w-full overflow-hidden">
      
      {/* LEFT PANEL: PREMIUM SAAS PERFORMANCE INDEX & FEATURE PREVIEW */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative overflow-hidden flex-col justify-between p-12 bg-[#0c0e17] border-r border-slate-800/60 select-none">
        
        {/* Abstract futuristic grid and neon glow bubbles */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Top Branding Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-605 to-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/10 border border-brand-500/20">
            <School className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-display tracking-wider text-slate-200">AURA</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-brand-blue/10 text-brand-blue border border-brand-blue/30 uppercase tracking-widest font-extrabold">v2.5</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">Smart Attendance & AI Diagnostics Pool</p>
          </div>
        </div>

        {/* Middle Interactive Mockup Container */}
        <div className="relative z-10 max-w-lg mx-auto w-full my-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative"
          >
            {/* Holographic scanner laser line */}
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-brand-blue/45 to-transparent animate-pulse"></div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-ping"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 font-mono">Live Roster Overview</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Term: Summer 2026</span>
            </div>

            {/* Circular Rate Indicator & Quick Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl flex items-center gap-3.5">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="21" stroke="#101424" strokeWidth="3" fill="none" />
                    <circle cx="24" cy="24" r="21" stroke="var(--color-brand-blue)" strokeWidth="3.5" fill="none" strokeDasharray="131" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[11px] font-bold font-mono text-brand-blue">91%</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Average Punctuality</h4>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">High Performance</p>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Active Registrants</h4>
                  <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">148 Students</p>
                </div>
              </div>
            </div>

            {/* Mock Students List */}
            <div className="space-y-2.5">
              {[
                { name: 'Sarah Jenkins', grade: 'Grade 11-A', rate: '96%', status: 'present' },
                { name: 'Michael Chang', grade: 'Grade 12-C', rate: '72%', status: 'late' },
                { name: 'Alex Rivera', grade: 'Grade 12-A', rate: '44%', status: 'absent' }
              ].map((std) => (
                <div key={std.name} className="flex justify-between items-center bg-slate-950/30 hover:bg-slate-950/50 border border-slate-850/10 rounded-lg p-3 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-800/45 text-slate-400 font-bold text-xs flex items-center justify-center">
                      {std.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">{std.name}</p>
                      <span className="text-[9px] text-slate-500">{std.grade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{std.rate} Rate</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono border ${
                      std.status === 'present' 
                        ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                        : std.status === 'late'
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-500'
                          : 'bg-red-500/10 border-red-500/25 text-red-500'
                    }`}>
                      {std.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Predictive Assistant Callout banner */}
            <div className="bg-gradient-to-r from-brand-500/10 to-brand-blue/10 border border-brand-500/15 p-3 rounded-lg mt-4 flex items-start gap-2.5">
              <Bot className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1 font-mono">
                  Gemini Predictive Analyst <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"></span>
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Analyzing student risk factors, writing parent communications, and delivering tailored advice within seconds.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info/creds */}
        <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-550 font-mono">
          <span>&copy; Smart Attendance 2026</span>
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-brand-500" /> Secure SSL Sandbox Host</span>
        </div>
      </div>

      {/* RIGHT PANEL: POLISHED AUTHENTICATION CONTAINER */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-slate-950 overflow-y-auto">
        {/* Subtle background glow effect for form page */}
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] bg-brand-blue/5 rounded-full blur-[90px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
        >
          {/* Header branding on mobile view only */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-brand-500 to-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/15 mb-3.5 md:hidden">
              <School className="w-7 h-7 text-white stroke-[2]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-200 font-display">
              {isRegister ? 'Create Account' : 'Sign In / Enter'}
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium font-sans">
              {isRegister 
                ? 'Create an account to join the attendance system' 
                : 'Enter your User Name or ID and Password below'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-505/20 text-red-400 text-xs rounded-xl font-mono flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></div>
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 bg-brand-50 border border-brand-500/20 text-brand-500 text-xs rounded-xl font-mono flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0 animate-ping"></div>
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                User Name or ID / Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter User Name, ID or email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., student@school.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isRegister && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    System Academic Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all cursor-pointer ${
                          role === r
                            ? 'bg-brand-50 border-brand-500 text-brand-500 shadow-sm shadow-brand-500/5'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`}
                        onClick={() => setRole(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'student' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 pt-1"
                  >
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                        Student ID / Roll No.
                      </label>
                      <input
                        type="text"
                        required={role === 'student'}
                        placeholder="e.g. ST1008"
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                        Class / Grade
                      </label>
                      <input
                        type="text"
                        required={role === 'student'}
                        placeholder="e.g. Grade 11"
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-605 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-brand-500/10 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register / Sign Up
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Enter / Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-xs text-brand-blue hover:text-brand-blue-hover font-semibold transition-all cursor-pointer underline decoration-dotted underline-offset-4 font-sans"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : "New User? Sign Up"}
            </button>
          </div>

          {/* Quick Preset shortcut triggers for clean platform audit */}
          {!isRegister && (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Quick Demo Sign-In</p>
                </div>
              </div>
              <div className="grid grid-cols-1">
                <button
                  type="button"
                  onClick={() => handleShortcutLogin('teacher', 'teacher123')}
                  className="bg-slate-950 border border-slate-800/85 hover:border-brand-500/50 hover:bg-slate-955 rounded-xl py-2.5 px-3 text-center transition-all flex flex-col items-center justify-center cursor-pointer shadow-md group"
                >
                  <span className="text-brand-500 font-bold text-xs group-hover:scale-102 transition-transform">Teacher Account Demo</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">username: teacher | password: teacher123</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* FLOATING GEMINI PUBLIC ASSISTANT DRAWER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        <AnimatePresence>
          {isSupportOpen && (
            <motion.div
              key="aura-public-support-drawer"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-[330px] sm:w-[380px] h-[460px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl mb-4"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-brand-500/15 to-brand-blue/15 border-b border-slate-850 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-blue rounded-full border-2 border-slate-900"></span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-display">Aura Public Assistant</h4>
                    <span className="text-[9px] text-brand-blue font-mono uppercase tracking-widest font-extrabold block">Powered by Gemini 3.5</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSupportOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message History Queue */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {supportHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white rounded-br-none font-medium'
                        : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isSupportThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl rounded-bl-none p-3 text-xs text-slate-400 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      <span className="ml-1 text-[9px] font-mono uppercase tracking-widest text-slate-500">Gemini is writing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested helper questions */}
              {supportHistory.length === 1 && !isSupportThinking && (
                <div className="px-4 py-2 border-t border-slate-850 bg-slate-950/20 space-y-1.5 shrink-0">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Suggested Inquiries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'How do I log in or test?',
                      'What is Aura system?',
                      'Can I register myself?'
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSupportSuggest(s)}
                        className="text-[10px] bg-slate-950 border border-slate-850 hover:border-brand-blue/40 text-slate-350 hover:text-brand-blue py-1 px-2 rounded-lg transition text-left cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TextInput panel */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSupportQuery(supportQuery);
                }}
                className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask any question..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  disabled={isSupportThinking}
                />
                <button
                  type="submit"
                  disabled={!supportQuery.trim() || isSupportThinking}
                  className="bg-brand-500 hover:bg-brand-605 disabled:bg-slate-800 text-white disabled:text-slate-550 rounded-xl px-3 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Button toggle control */}
        <motion.button
          onClick={() => {
            setIsSupportOpen(!isSupportOpen);
            setShowNotificationBadge(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-brand-500 to-brand-blue hover:from-brand-605 hover:to-brand-blue-hover text-white font-bold py-3 px-4.5 rounded-full flex items-center gap-2 shadow-xl shadow-brand-500/10 cursor-pointer text-xs uppercase tracking-widest relative"
        >
          {showNotificationBadge && (
            <span className="absolute -top-1 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-bounce"></span>
          )}
          {isSupportOpen ? (
            <>
              <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
              Minimize Support
            </>
          ) : (
            <>
              <Bot className="w-4.5 h-4.5 text-white animate-pulse" />
              Ask Aura AI Support
            </>
          )}
        </motion.button>

      </div>

    </div>
  );
}
