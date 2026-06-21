import React from 'react';
import { User, UserRole } from '../types';
import { 
  BarChart3, 
  Users, 
  CalendarCheck2, 
  BrainCircuit, 
  History, 
  LogOut, 
  School, 
  UserCircle,
  X 
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, isOpen, onClose }: SidebarProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-950/40 text-purple-400 border border-purple-900/40';
      case 'teacher':
        return 'bg-amber-950/40 text-amber-400 border border-amber-900/40';
      case 'student':
        return 'bg-blue-950/40 text-blue-400 border border-blue-900/40';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      icon: BarChart3,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'mark',
      label: 'Mark Attendance',
      icon: CalendarCheck2,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'logs',
      label: 'Audit & Sync Logs',
      icon: History,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'ai-advisor',
      label: 'Gemini AI Insights',
      icon: BrainCircuit,
      roles: ['admin', 'teacher', 'student'],
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-850 flex flex-col h-screen shrink-0 select-none transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand logo section */}
      <div className="p-6 border-b border-slate-850 flex items-center justify-between gap-3 bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-brand-blue rounded-xl flex items-center justify-center shadow-sm">
            <School className="w-5.5 h-5.5 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="font-display font-bold text-slate-100 text-base tracking-tight block">
              Smart Attendance
            </span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">
              Enterprise SaaS
            </span>
          </div>
        </div>

        {/* Close Button on Mobile viewports */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg cursor-pointer transition-all active:scale-95 border border-slate-800"
            aria-label="Close sidebar menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Management Console
        </p>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-50 text-brand-500 border-l-4 border-brand-500 pl-3 font-semibold'
                  : 'text-slate-450 hover:text-slate-100 hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-500' : 'text-slate-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User profile bottom item */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4 p-2 bg-slate-950 border border-slate-850 rounded-xl">
          <UserCircle className="w-10 h-10 text-slate-500 stroke-[1.5]" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-slate-205 block truncate capitalize">
              {user.username}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mt-1 ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onLogout();
            if (onClose) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded-lg text-xs font-semibold border border-slate-800 hover:border-red-900/60 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Profile
        </button>
      </div>
    </aside>
  );
}
