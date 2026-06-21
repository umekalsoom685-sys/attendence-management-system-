import React, { useState, useRef, useEffect } from 'react';
import { User, Student } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  PhoneCall, 
  Calendar,
  Sparkles,
  School,
  IdCard,
  Notebook,
  Send,
  HelpCircle,
  Bot,
  User as UserIcon,
  Trash2,
  BookOpen,
  Radio,
  Cpu,
  Zap,
  Activity,
  Layers,
  Compass
} from 'lucide-react';

interface StudentPanelProps {
  user: User;
  students: Student[];
}

export default function StudentPanel({ user, students }: StudentPanelProps) {
  // Find the student linked to this user account
  const sRecord = students.find((s) => s.id === user.studentId || s.email.toLowerCase() === user.email.toLowerCase());

  if (!sRecord) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center" id="student-not-found">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold font-display text-slate-200">Student Profile Linkage Pending</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Your profile (Username: <strong className="font-mono text-brand-500">{user.username}</strong>) has not yet been linked to an active academic profile by the administrator. Please contact your school admin or ask the teacher to register you in the roster.
        </p>
      </div>
    );
  }

  const rate = sRecord.attendanceRate;
  const history = sRecord.attendanceHistory || [];

  // Chatbot states
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>>([
    {
      role: 'assistant',
      text: `Hi ${sRecord.name}! If there is anything you do not understand about your lessons, class assignments, homework, or attendance standing, write to me! I can explain complex subject topics in simple steps or help you design a great study routine.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 3D Perspective Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive 3D tilt calculation based on cursor hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to center of container
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Max 3.5 degrees rotation to keep it highly usable and elegant
    const tiltX = (mouseX / (width / 2)) * 3.5;
    const tiltY = -(mouseY / (height / 2)) * 3.5;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSend = async (customQuery?: string) => {
    const finalQuery = customQuery || query;
    if (!finalQuery.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user' as const, text: finalQuery, timestamp };
    
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/student-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: sRecord,
          query: finalQuery,
          chatHistory: chatHistory.map(c => ({ role: c.role === 'user' ? 'user' : 'model', text: c.text }))
        })
      });

      if (!res.ok) {
        throw new Error('Server responded with an issue');
      }

      const data = await res.json();
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: data.answer || 'I am sorry, I was unable to translate that response. Please double-check my connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: `Hello! I noticed we are having a tiny network delay sync. To assist with your question: "${finalQuery}".\n\nIf it is about your attendance rate of **${sRecord.attendanceRate}%**, note that standard school rule mandates maintaining at least **75%** to be registered for terminal exams. If you have any question about specific math equations or writing formats, keep a notebook log to share with your class instructor tomorrow!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper parser for markdown to prevent extra packages
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const content = line.trim();
      if (!content) return <div key={i} className="h-2"></div>;

      // Bullet check
      if (content.startsWith('- ') || content.startsWith('* ')) {
        const bulletText = content.substring(2);
        return (
          <li key={i} className="ml-5 list-disc text-slate-305 text-xs leading-relaxed my-1">
            {formatBold(bulletText)}
          </li>
        );
      }

      // Numbered check
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={i} className="ml-5 list-decimal text-slate-305 text-xs leading-relaxed my-1">
            {formatBold(numMatch[2])}
          </li>
        );
      }

      return (
        <p key={i} className="text-slate-205 text-xs leading-relaxed mb-1">
          {formatBold(content)}
        </p>
      );
    });
  };

  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-brand-blue font-bold bg-brand-50 px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Computed badge colors
  const getRateColor = (v: number) => {
    if (v < 50) return 'text-red-400';
    if (v < 75) return 'text-yellow-400';
    return 'text-brand-500';
  };

  const getCircleColor = (v: number) => {
    if (v < 50) return '#ef4444'; // Red
    if (v < 75) return '#eab308'; // Yellow
    return '#f97316'; // Orange brand-500
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="student-main">
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-brand-500/10 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-50 border border-brand-500/20 text-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-200 tracking-tight">Welcome back, {sRecord.name}!</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <IdCard className="w-3.5 h-3.5" /> Roll ID: <span className="font-mono text-brand-500 font-bold">{sRecord.rollNumber}</span>
              <span className="text-slate-700 font-bold">•</span>
              <School className="w-3.5 h-3.5" /> Class: <span className="text-brand-blue font-bold">{sRecord.grade}</span>
            </p>
          </div>
        </div>

        {/* Sync Indicator */}
        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-brand-50 text-brand-blue border border-brand-blue/20 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse"></span>
          Profile Sync: Active
        </span>
      </div>

      {/* INTELLIGENCE ALERTS & RING METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Ring Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Core Class Rate</h4>
          
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke={getCircleColor(rate)}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * Math.min(rate, 100)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className={`text-3xl font-extrabold tracking-tighter ${getRateColor(rate)} font-mono`}>
                {rate}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Consistency</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed font-semibold">
            Attendance requirements stipulate maintaining rate levels above <span className="text-yellow-500">75%</span> to sit examinations.
          </p>
        </div>

        {/* Warning Indicator Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Notebook className="w-4 h-4 text-brand-blue" /> Academic Standing & Risk Diagnosis
            </h4>

            {rate < 50 ? (
              <div className="bg-red-950/25 border border-red-500/30 text-red-700 p-4 rounded-xl space-y-3 mt-3 animate-pulse" id="alert-critical">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-red-800">CRITICAL ATTENDANCE BLOCK ALERT</h5>
                    <p className="text-xs text-red-605/95 leading-relaxed mt-1">
                      Your current rate is <strong className="font-mono text-red-700 text-sm">{rate}%</strong>. This is below the minimum mandated absolute standing benchmark (50%). You are at high risk of registration suspension or course failure.
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-red-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-[10.5px] font-mono text-slate-450 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-red-505" /> Standard Parent intervention has been scheduled.
                  </p>
                  <button className="px-3 py-1 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-400 cursor-pointer">
                    Contact Admin Office
                  </button>
                </div>
              </div>
            ) : rate < 75 ? (
              <div className="bg-yellow-500/10 border border-yellow-550/20 text-yellow-800 p-4 rounded-xl space-y-3 mt-3 shadow-md" id="alert-warning">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-550 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-yellow-800">LOW ATTENDANCE NOTICE WARNING</h5>
                    <p className="text-xs text-yellow-700/90 leading-relaxed mt-1">
                      Your attendance rate of <strong className="font-mono text-yellow-800 text-sm">{rate}%</strong> has dropped into the warning sector. Try to coordinate next classes with the teacher to prevent additional absences.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-yellow-500/10 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  💡 Tip: Attendance of at least 3 consecutive days will bring you back into the positive corridor.
                </div>
              </div>
            ) : (
              <div className="bg-brand-50 border border-brand-500/20 text-brand-550 p-4 rounded-xl space-y-3 mt-3 shadow-md" id="alert-normal">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-slate-200">POSITIVE ACADEMIC STANDING</h5>
                    <p className="text-xs text-slate-500/90 leading-relaxed mt-1">
                      Excellent! Your core class rate is <strong className="font-mono text-brand-500 text-sm">{rate}%</strong>, comfortably exceeding the 75% school mandate. Keep up the consistent punctuality!
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-brand-500/10 text-[10px] font-mono text-slate-550 flex items-center gap-1">
                  🌟 Incentive Claim: Eligible for semester honors awards.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-brand-blue/70" /> Academic Advisor Code: AA-SEC-A
            </span>
            <span className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-blue" /> Active Term: Summer 2026
            </span>
          </div>
        </div>
      </div>

      {/* 3D INTERACTIVE HOLOGRAPHIC AI STUDENT CO-PILOT CHATBOT */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(0px)`,
          transition: loading ? 'all 0.1s ease-out' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-shadow relative"
        id="student-ai-assistant"
      >
        {/* Holographic grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-32 bg-brand-500/[0.04] blur-3xl pointer-events-none rounded-full"></div>

        {/* 3D HEADER & DIAGNOSTICS CONTROL PANEL */}
        <div className="p-5 border-b-2 border-slate-800 relative z-10 bg-slate-900/80 backdrop-blur-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Holographic 3D pulsing orb spinner icon */}
            <div className="relative w-11 h-11 bg-brand-50 border border-brand-500/40 text-brand-500 rounded-xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(249,115,22,0.1)] shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-brand-500/10 animate-pulse"></div>
              {/* Spinning 3D ring visualizers */}
              <div className="absolute w-8 h-8 rounded-full border border-dashed border-brand-500/30 animate-spin" style={{ animationDuration: '6s' }}></div>
              <div className="absolute w-6 h-6 rounded-full border-2 border-brand-blue/40 animate-ping" style={{ animationDuration: '2s' }}></div>
              <Bot className="w-5.5 h-5.5 text-brand-500 relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-200 font-display uppercase tracking-wide">
                  Gemini Cyber-Tutor 3D
                </h4>
                <span className="px-2 py-0.5 rounded text-[8px] font-extrabold font-mono bg-brand-50 text-brand-blue border border-brand-blue/30 uppercase tracking-widest animate-pulse">
                  System Live Node
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                An interactive AI helper generated in real-time space. Ask me to guide you on any lessons or attendance blocks.
              </p>
            </div>
          </div>

          {/* AI Cognitive Status Deck */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-400 font-semibold shadow-inner shrink-0">
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-brand-500" />
                <span>Node 2.5: <span className="text-brand-500 font-bold">Stable</span></span>
              </div>
              <span className="text-slate-800">|</span>
              <div className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-brand-blue" />
                <span>Sync Latency: <span className="text-brand-blue font-bold">~48ms</span></span>
              </div>
              <span className="text-slate-800">|</span>
              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Confidence: <span className="text-amber-500 font-bold">99.4%</span></span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setChatHistory([{
                role: 'assistant',
                text: `Hi ${sRecord.name}! If there is anything you do not understand about your lessons, class assignments, homework, or attendance standing, write to me! I can explain complex subject topics in simple steps or help you design a great study routine.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-950 border border-slate-800/80 hover:border-red-500/30 rounded-lg cursor-pointer transition-all active:translate-y-0.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Reset Cache
            </button>
          </div>
        </div>

        {/* 3D CHAT MESSAGE CONTAINER VIEWPORT */}
        <div className="p-5 h-96 overflow-y-auto space-y-5 bg-gradient-to-b from-slate-950/40 to-slate-950/80 scrollbar-thin scrollbar-thumb-slate-800 relative z-10">
          {/* Holographic scanner active beam effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent animate-pulse pointer-events-none"></div>

          {chatHistory.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] animate-fadeIn ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* 3D Shield Avatar block */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 uppercase font-extrabold text-xs shadow-md ${
                  isUser 
                    ? 'bg-gradient-to-tr from-brand-500/20 to-brand-blue/10 border-brand-500/40 text-brand-500 shadow-brand-500/10' 
                    : 'bg-gradient-to-tr from-brand-blue/20 to-indigo-500/10 border-brand-blue/40 text-brand-blue shadow-brand-blue/10'
                }`}>
                  {isUser ? <UserIcon className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>
                
                <div className="space-y-1.5 max-w-full">
                  {/* Distinctive 3D Brutalist Offset pop bubble */}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed transition-all duration-300 hover:scale-[1.01] ${
                    isUser 
                      ? 'bg-slate-900 border-2 border-brand-500/50 text-slate-200 rounded-tr-none shadow-[2px_3px_0px_#f97316]' 
                      : 'bg-slate-900/90 border-2 border-brand-blue/40 text-slate-250 rounded-tl-none shadow-[2px_3px_0px_#2563eb]'
                  }`}>
                    {parseMarkdown(msg.text)}
                  </div>
                  <div className={`text-[9px] font-mono text-slate-500 font-extrabold tracking-wider px-1 flex items-center gap-1 ${isUser ? 'justify-end' : ''}`}>
                    <Zap className={`w-3 h-3 ${isUser ? 'text-brand-500' : 'text-brand-blue'}`} />
                    <span>{isUser ? 'STUDENT CONTEXT' : 'AI ENGINE CLOUD'} • {msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] animate-pulse">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 border-brand-blue/40 bg-brand-blue/10 text-brand-blue shadow-md">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-slate-900 border-2 border-brand-blue/30 p-4 rounded-2xl rounded-tl-none flex items-center gap-2.5 shadow-[2px_3px_0px_#2563eb]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-brand-505 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-brand-505 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-brand-505 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest pl-1.5">Synthesizing live response...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* GLOWING SYSTEM CONTROL HUD / FLOATING CHIPS */}
        <div className="px-5 py-4 border-t-2 border-slate-800 bg-slate-900/60 relative z-10">
          <p className="text-[10px] font-extrabold text-brand-blue uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-500 animate-pulse" /> Selector Node: Touch any query blueprint to execute
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Explain quadratic equations and formulas in simple words",
              "I do not understand why 75% attendance is required",
              "Suggest a solid study routine when feeling overwhelmed",
              "What happens if my class attendance rate drops under 50%?"
            ].map((qStr, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSend(qStr)}
                className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-brand-blue/40 text-left text-xs text-slate-350 hover:text-white rounded-xl transition-all font-bold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-inner"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"></span>
                <span>{qStr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT INPUT COMMAND DECK (3D Buttons) */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t-2 border-slate-800 bg-slate-950 relative z-10 flex gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              placeholder="What subject did you lock up on? Type in questions for explanation..."
              className="w-full bg-slate-900/90 border-2 border-slate-800 rounded-xl pl-4 pr-10 py-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition font-mono uppercase tracking-wide shadow-inner"
            />
            {/* HUD cursor decorative element */}
            <div className="absolute right-3.5 top-3.5 text-slate-600 font-mono text-[9px] font-extrabold select-none">
              CTRL+ENTER
            </div>
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            style={{
              boxShadow: !query.trim() || loading ? 'none' : '0 4px 0px #ea580c'
            }}
            className="px-6 py-3.5 bg-brand-500 hover:bg-brand-605 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-display disabled:opacity-35 disabled:translate-y-0 disabled:shadow-none hover:-translate-y-[2px] active:translate-y-0.5 active:shadow-none cursor-pointer border border-brand-500/20"
          >
            <Send className="w-4.5 h-4.5 stroke-[2.5]" />
            <span className="hidden sm:inline text-[11px]">Deploy Query</span>
          </button>
        </form>
      </div>

      {/* SESSION JOURNAL LOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg" id="student-history">
        <div className="p-5 border-b border-slate-800">
          <h4 className="text-sm font-semibold text-slate-250 font-display">Personal Session Attendance Log</h4>
          <p className="text-xs text-slate-400 mt-1 font-medium">Consult detailed calendar logs logged securely by academic personnel.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Session Date</th>
                <th className="px-6 py-3.5">Marked Status</th>
                <th className="px-6 py-3.5">Auditor / Staff</th>
                <th className="px-6 py-3.5">Official Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">
                    No registered attendance sessions logged on this profile yet.
                  </td>
                </tr>
              ) : (
                history.map((h, i) => {
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-500 border border-brand-500/25 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-brand-500" /> Present
                    </span>
                  );
                  if (h.status === 'absent') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-500 border border-red-500/25 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3 text-red-550" /> Absent
                      </span>
                    );
                  } else if (h.status === 'late') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-550 border border-yellow-500/25 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-yellow-550" /> Late Arrival
                      </span>
                    );
                  }

                  return (
                    <tr key={i} className="hover:bg-slate-800/25 transition-all">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs text-slate-300 block">{h.date}</span>
                        {h.className && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/20">
                            {h.className} {h.section ? `(${h.section})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge}
                        {h.classType && (
                          <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                            h.classType === 'makeup'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          }`}>
                            {h.classType} Class
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-305 capitalize font-bold text-xs block">{h.markedBy}</span>
                        {h.classTime && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">@ {h.classTime}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-400 max-w-sm truncate">
                        {h.remarks || <span className="text-slate-600 italic font-medium">No special remarks entered.</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
