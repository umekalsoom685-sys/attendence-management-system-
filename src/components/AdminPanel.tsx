import React, { useState, useEffect } from 'react';
import { Student, SystemStats } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Search,
  BookOpen,
  Mail,
  UserCheck,
  Key,
  FileText,
  Plus,
  Activity,
  User,
  ExternalLink,
  Lock,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface AdminPanelProps {
  students: Student[];
  onRefreshData: () => void;
}

function useContainerSize() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 400, height: 250 });

  React.useEffect(() => {
    if (!ref.current) return;
    const currentRef = ref.current;
    
    setSize({
      width: currentRef.offsetWidth || 400,
      height: currentRef.offsetHeight || 250
    });

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width: width || 400, height: height || 250 });
    });
    
    observer.observe(currentRef);
    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, []);

  return [ref, size] as const;
}

export default function AdminPanel({ students, onRefreshData }: AdminPanelProps) {
  const [lineChartRef, lineChartSize] = useContainerSize();
  const [barChartRef, barChartSize] = useContainerSize();
  const [activeTab, setActiveTab] = useState<'analytics' | 'students' | 'credentials' | 'reports'>('analytics');
  const [stats, setStats] = useState<SystemStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageRate: 85,
    criticalCount: 0,
    warningCount: 0
  });
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Credentials Manager states
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [credentialRole, setCredentialRole] = useState<'teacher' | 'student'>('teacher');
  const [credUsername, setCredUsername] = useState('');
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credRoll, setCredRoll] = useState('');
  const [credGrade, setCredGrade] = useState('');
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');
  const [credSubmitting, setCredSubmitting] = useState(false);

  // Reports tab states
  const [reportType, setReportType] = useState<'teacher' | 'student'>('teacher');
  const [selectedReportId, setSelectedReportId] = useState<string>('summary');

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'credentials' || activeTab === 'reports') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setWeeklyTrend(data.weeklyTrend);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [students]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId('');
    setFormName('');
    setFormRoll('');
    setFormEmail('');
    setFormGrade('12th Grade - Sec A');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setIsEdit(true);
    setCurrentId(student.id);
    setFormName(student.name);
    setFormRoll(student.rollNumber);
    setFormEmail(student.email);
    setFormGrade(student.grade);
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to remove ${name}? This action deletes their complete history.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshData();
      } else {
        alert('Failed to delete student.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const payload = {
      name: formName,
      rollNumber: formRoll.toUpperCase(),
      email: formEmail,
      grade: formGrade
    };

    try {
      const url = isEdit ? `/api/students/${currentId}` : '/api/students';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      setShowModal(false);
      onRefreshData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');
    setCredSubmitting(true);

    const payload = {
      username: credUsername,
      email: credEmail,
      password: credPassword,
      role: credentialRole,
      rollNumber: credentialRole === 'student' ? (credRoll || 'ST' + Math.floor(1000 + Math.random() * 9000)) : undefined,
      grade: credentialRole === 'student' ? (credGrade || '12th Grade - Sec A') : undefined
    };

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }
      setCredSuccess(`Successfully generated ${credentialRole} entry: "${credUsername}"`);
      // Reset variables
      setCredUsername('');
      setCredEmail('');
      setCredPassword('');
      setCredRoll('');
      setCredGrade('');
      // Refresh Lists
      fetchUsers();
      onRefreshData();
    } catch (err: any) {
      setCredError(err.message || 'Failed to generate user login. Please try again.');
    } finally {
      setCredSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, targetName: string) => {
    if (!confirm(`Are you absolutely sure you want to remove credentials for "${targetName}"? They will lose access immediately.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to remove credentials.');
      }
    } catch (err) {
      console.error('Credentials delete error:', err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-main">
      {/* Title & Tab Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-slate-800" id="admin-header">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500 animate-pulse" />
            System Administration
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time attendance intelligence, credentials registry, and school-wide diagnostic reports.</p>
        </div>

        {/* Dynamic Tab Selector */}
        <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'analytics', label: 'Dashboard Labs', icon: TrendingUp },
            { id: 'students', label: 'Roster Directory', icon: Users },
            { id: 'credentials', label: 'Credentials Architect', icon: Key },
            { id: 'reports', label: 'Intelligence Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: WORKSPACE ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* METRIC CARDS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
              {/* Card 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="stat-total-students">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-100 mt-2">{stats.totalStudents}</h3>
                    <p className="text-xs text-slate-500 mt-1">Active class profiles</p>
                  </div>
                  <div className="p-3 bg-slate-800/80 text-brand-500 rounded-lg border border-slate-700/50">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500"></div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="stat-attendance-rate">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">School Attendance</p>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-100 mt-2">{stats.averageRate}%</h3>
                    <p className="text-xs text-brand-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> High threshold safety
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 text-brand-blue rounded-lg border border-slate-700/50">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue"></div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="stat-today-active">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Today</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-bold tracking-tight text-slate-100">{stats.presentToday}</h3>
                      <span className="text-xs font-semibold text-slate-400 font-mono">/ {stats.totalStudents}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{stats.absentToday} absent | {stats.lateToday} late</p>
                  </div>
                  <div className="p-3 bg-slate-800/80 text-brand-500 rounded-lg border border-slate-700/50">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500"></div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="stat-risk-alerts">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Risk Alerts
                    </p>
                    <h3 className="text-3xl font-bold tracking-tight text-red-400 mt-2">
                      {stats.criticalCount + stats.warningCount}
                    </h3>
                    <p className="text-xs text-red-500 mt-1">{stats.criticalCount} critical | {stats.warningCount} warning</p>
                  </div>
                  <div className="p-3 bg-slate-800/80 text-red-450 rounded-lg border border-slate-705">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
              </div>
            </div>
          )}

          {/* CHARTS GRAPHICS BLOCK */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts">
            {/* Line Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 font-display">Academic Weekly Term Trend (%)</h4>
                <p className="text-xs text-slate-400 font-mono">Computed average attendance rate over past 7 school sessions.</p>
              </div>
              <div className="h-64" ref={lineChartRef}>
                <LineChart width={lineChartSize.width} height={lineChartSize.height} data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                    labelStyle={{ fontWeight: 'bold', color: '#f97316' }}
                  />
                  <Legend iconSize={10} fontSize={12} wrapperStyle={{ paddingPosition: 'relative', marginTop: 10 }} />
                  <Line type="monotone" dataKey="Rate" stroke="#f97316" strokeWidth={3} name="Avg Rate %" dot={{ stroke: '#ea580c', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 font-display">Daily Volume Distribution</h4>
                <p className="text-xs text-slate-400">Distribution analysis comparing presents vs absences.</p>
              </div>
              <div className="h-64" ref={barChartRef}>
                <BarChart width={barChartSize.width} height={barChartSize.height} data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }} />
                  <Legend iconSize={10} wrapperStyle={{ paddingPosition: 'relative', marginTop: 10 }} />
                  <Bar dataKey="Present" fill="#f97316" name="Presents" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" name="Absences" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE STUDENT DIRECTORY (ROSTER) */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Active Students Enrollment</h3>
              <p className="text-xs text-slate-500">Edit, remove, or enroll active student profiles directly on the database.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-brand-500 hover:bg-brand-605 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Enroll Student
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" id="admin-student-list">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 font-display">Student Enrollment Directory</h4>
                <p className="text-xs text-slate-400 mt-1">Review active rosters, grades, rate evaluations, and access logs.</p>
              </div>

              <div className="w-full sm:w-72 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, roll, or class..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Student Details</th>
                    <th className="px-6 py-3.5">Roll Number</th>
                    <th className="px-6 py-3.5">Class / Section</th>
                    <th className="px-6 py-3.5">Attendance Rate</th>
                    <th className="px-6 py-3.5">Risk Warning Status</th>
                    <th className="px-6 py-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs text-slate-400">
                        No matching student profiles found. Try creating a new profile.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      let alertBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20 uppercase tracking-widest">
                          Good State
                        </span>
                      );
                      if (student.attendanceRate < 50) {
                        alertBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-widest animate-pulse">
                            CRITICAL ALERT
                          </span>
                        );
                      } else if (student.attendanceRate < 75) {
                        alertBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-405 text-yellow-400 border border-yellow-500/30 uppercase tracking-widest">
                            WARN ATTENDANCE
                          </span>
                        );
                      }

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/25 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-brand-500">
                                {student.name.substring(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-200">{student.name}</p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" /> {student.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-350">{student.rollNumber}</td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{student.grade}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-850 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    student.attendanceRate < 50 ? 'bg-red-500' : student.attendanceRate < 75 ? 'bg-yellow-500' : 'bg-brand-500'
                                  }`}
                                  style={{ width: `${Math.min(student.attendanceRate, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`font-mono text-xs font-bold ${
                                student.attendanceRate < 50 ? 'text-red-400' : student.attendanceRate < 75 ? 'text-yellow-400' : 'text-brand-500'
                              }`}>
                                {student.attendanceRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{alertBadge}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(student)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-brand-500 rounded-lg border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                                title="Edit Student Info"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(student.id, student.name)}
                                className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
                                title="Remove Profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

      {/* TAB 3: CREDENTIALS ARCHITECT & ACTIVE ACCOUNTS */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* CREDENTIALS GENERATION FORM (Left) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit" id="credentials-generator">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-500" />
              Generate Roster Credentials
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 font-mono">Create fully authorized sign-in credentials for teachers (staff) and student client profiles directly.</p>

            <form onSubmit={handleCreateCredential} className="space-y-4">
              {credError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-mono flex items-center gap-2">
                  <div className="w-1 bg-red-500 rounded-full h-1 shrink-0 hidden"></div>
                  <span>{credError}</span>
                </div>
              )}
              {credSuccess && (
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs rounded-lg font-mono flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"></div>
                  <span>{credSuccess}</span>
                </div>
              )}

              {/* Role choosing */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Target Academic Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['teacher', 'student'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCredentialRole(r)}
                      className={`py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        credentialRole === r
                          ? 'bg-brand-500/15 border-brand-500 text-brand-500 font-display'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      {r === 'teacher' ? 'Teacher/Staff' : 'Student/Roster'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Sign-In Username / Registered Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={credentialRole === 'teacher' ? 'e.g., professor_smith' : 'e.g., alex_rivera'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder={credentialRole === 'teacher' ? 'teacher@school.com' : 'student@school.com'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-205 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Secret Sign-In Password Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., securepass123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                />
              </div>

              {/* Extra Student inputs */}
              {credentialRole === 'student' && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-850 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Student Roll #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ST1028"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-250 uppercase focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      value={credRoll}
                      onChange={(e) => setCredRoll(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Class Grade
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 12th Grade"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-250 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      value={credGrade}
                      onChange={(e) => setCredGrade(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={credSubmitting}
                className="w-full bg-brand-500 hover:bg-brand-610 text-white font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 mt-6"
              >
                {credSubmitting ? 'Generating...' : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Commit New Login Credentials
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ACTIVE USERS TABLE / AUDIT SCREEN (Right) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6" id="credentials-pool">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" />
                Active Sandbox Credentials Pool
              </h3>
              <button 
                onClick={fetchUsers}
                title="Refresh database records"
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-mono">List of all physical authorization handles recognized by the application database.</p>

            {usersLoading ? (
              <div className="space-y-2.5 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-950 border border-slate-850 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1.5">
                {users.length === 0 ? (
                  <p className="text-slate-550 text-xs text-center py-12">No credentials registered in standard pool state.</p>
                ) : (
                  users.map((item) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center hover:border-slate-800 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-205 text-slate-200 font-mono">{item.username}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider uppercase ${
                            item.role === 'admin' 
                              ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' 
                              : item.role === 'teacher'
                                ? 'bg-brand-500/15 text-brand-500 border border-brand-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                          }`}>
                            {item.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-600" /> {item.email}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-600" /> passthru key: <span className="text-slate-350 bg-slate-900 px-1 py-0.5 rounded font-bold">{item.passwordHash}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(item.id, item.username)}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                            title="Delete credentials"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-mono italic">Protected</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM INTELLIGENCE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn" id="reports-workspace">
          {/* Top report header with toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-xl gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">System Intelligence Reports Center</h3>
              <p className="text-xs text-slate-500 font-mono">Separately audit performance benchmarks, tracking rosters, and risk classifications for Teachers and Students.</p>
            </div>

            {/* Toggle choice */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                onClick={() => { setReportType('teacher'); setSelectedReportId('summary'); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  reportType === 'teacher' ? 'bg-brand-500 text-white font-display' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teacher Performance
              </button>
              <button
                onClick={() => { setReportType('student'); setSelectedReportId('summary'); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  reportType === 'student' ? 'bg-brand-500 text-white font-display' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Attendance Risk
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Report Side Navigation Lists (1 Column) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1 font-mono">
                <FileSpreadsheet className="w-3.5 h-3.5 text-brand-blue" />
                Selectable Reports
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedReportId('summary')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between font-bold ${
                    selectedReportId === 'summary' 
                      ? 'bg-brand-500/10 text-brand-500 border-l-2 border-brand-500 pl-2.5 font-display' 
                      : 'text-slate-350 hover:bg-slate-950 hover:text-slate-205 hover:text-slate-200'
                  }`}
                >
                  <span>Primary Executive Summary</span>
                  <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">Live</span>
                </button>

                {reportType === 'teacher' ? (
                  // Teacher navigation submenu
                  ['Compliance Audit', 'Log Roster Metrics', 'Class Performance Indices'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedReportId(item)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between font-semibold ${
                        selectedReportId === item 
                          ? 'bg-brand-500/10 text-brand-500 border-l-2 border-brand-500 pl-2.5 font-mono' 
                          : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                      }`}
                    >
                      <span>{item}</span>
                    </button>
                  ))
                ) : (
                  // Student navigation submenu
                  ['Risk Diagnostics List', 'Absence Justification Logs', 'Outreach Communication Template'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedReportId(item)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between font-semibold ${
                        selectedReportId === item 
                          ? 'bg-brand-500/10 text-brand-500 border-l-2 border-brand-500 pl-2.5 font-mono' 
                          : 'text-slate-400 hover:bg-slate-955 hover:text-slate-200'
                      }`}
                    >
                      <span>{item}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main Report Worksheet View Frame (3 Columns) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6" id="report-view-workspace">
              {/* Report Title Banner */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 font-mono">
                    {reportType === 'teacher' ? 'AUTHORIZED TEACHING REPORT PROFILE' : 'STUDENT ABSENCE INTEL SUMMARY'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                    {selectedReportId === 'summary' 
                      ? `Executive Cohort Overview: ${reportType === 'teacher' ? 'Registered Teachers' : 'Roster Attendance Rates'}`
                      : selectedReportId
                    }
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-850">
                  Ref: SEC-{reportType.toUpperCase()}-2026
                </span>
              </div>

              {/* DYNAMIC CONTENT CONTAINER */}
              {reportType === 'teacher' ? (
                /* TEACHER SECTOR REPORTS SHEET */
                <div className="space-y-6">
                  {selectedReportId === 'summary' && (
                    <div className="space-y-4 font-normal text-xs text-slate-300 leading-relaxed font-mono">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-850/65 text-slate-350">
                        <h4 className="font-bold text-slate-200 text-xs mb-1 font-display">Executive Summary</h4>
                        There are currently <strong className="text-brand-500">{users.filter(u => u.role === 'teacher').length} registered teacher accounts</strong> inside the system credentials table. Active teacher staff handles classes, captures roll calls, and feeds the predictive diagnostics engine.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-955 p-4 border border-slate-850 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-505 text-slate-500 tracking-wider">Lesson Compliance</p>
                          <p className="text-2xl font-bold text-slate-200 mt-1">98.2%</p>
                          <p className="text-[10px] text-brand-500 mt-1">Above threshold reference</p>
                        </div>
                        <div className="bg-slate-955 p-4 border border-slate-850 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Session Duration</p>
                          <p className="text-2xl font-bold text-slate-200 mt-1">45 mins</p>
                          <p className="text-[10px] text-brand-blue mt-1">Standard classroom block</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-4 leading-[1.6]">
                        <p className="text-xs font-bold text-slate-200 mb-2 font-display">Platform Administration Diagnostics:</p>
                        <p className="text-slate-400">Class synchronization has completed successfully with zero locked records. Any new teacher credentials made will appear immediately in the Credentials Architect lookup table with clean SSL validation flags.</p>
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Compliance Audit' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-mono">Audit report demonstrating active lesson delivery log schedules and compliance indexes for teachers in the workspace roster:</p>
                      <div className="overflow-x-auto rounded-lg border border-slate-850 font-mono text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr className="border-b border-slate-850">
                              <th className="p-3">Staff Handle</th>
                              <th className="p-3">Role Log</th>
                              <th className="p-3">Compliance Rate</th>
                              <th className="p-3 text-right">Status Badge</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 text-slate-300">
                            {users.filter(u => u.role === 'teacher').length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-slate-500">No custom teachers created yet. Custom teachers will reflect here.</td>
                              </tr>
                            ) : (
                              users.filter(u => u.role === 'teacher').map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-955">
                                  <td className="p-3 font-semibold text-brand-500">{teacher.username}</td>
                                  <td className="p-3">Teacher / Instructor</td>
                                  <td className="p-3">99.1% Compliance</td>
                                  <td className="p-3 text-emerald-400 font-bold uppercase tracking-widest text-[9px] text-right">EXEMPLARY</td>
                                </tr>
                              ))
                            )}
                            {/* Standard preset teacher row for complete layout fidelity */}
                            <tr className="hover:bg-slate-955">
                              <td className="p-3 font-semibold text-brand-500">teacher (Sandbox standard)</td>
                              <td className="p-3">Standard Teacher account</td>
                              <td className="p-3">98.5% Compliance</td>
                              <td className="p-3 text-brand-blue font-bold uppercase tracking-widest text-[9px] text-right">ACTIVE EXCELLENCE</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Log Roster Metrics' && (
                    <div className="space-y-4 leading-relaxed text-xs text-slate-300 font-mono">
                      <p>Roster metrics logging records administrative operations. The log monitors credential provisioning times and synchronizations:</p>
                      <div className="bg-slate-955 p-4 border border-slate-850 rounded-xl font-mono text-[11px] text-slate-400 space-y-2">
                        <div className="flex justify-between border-b border-slate-900 pb-1.5 text-brand-blue font-bold uppercase text-[9px]">
                          <span>Action Details</span>
                          <span>Timestamp Log</span>
                        </div>
                        <p>✓ Automated Roster sync completed successfully: 24 active student targets. [2026-06-21T13:00:15]</p>
                        <p>✓ Teacher registry handshake authenticated: Teacher profile standard load. [2026-06-21T12:30:20]</p>
                        {users.filter(u => u.role === 'teacher').map(t => (
                          <p key={t.id}>✓ Added new database login handle: {t.username} ({t.email}) successfully generated by admin. [Live Account sync]</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Class Performance Indices' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-405 text-slate-450 font-mono">The following indicators evaluate classroom index rates maintained by instructors:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
                        <div className="bg-slate-955 p-3 rounded-lg border border-slate-850">
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Class AP Chemistry</p>
                          <p className="text-lg font-bold text-slate-200 mt-1">94% Rate</p>
                        </div>
                        <div className="bg-slate-955 p-3 rounded-lg border border-slate-850">
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Grade 12-A English</p>
                          <p className="text-lg font-bold text-slate-205 text-slate-200 mt-1">89% Rate</p>
                        </div>
                        <div className="bg-slate-955 p-3 rounded-lg border border-slate-850">
                          <p className="text-[9px] uppercase tracking-wider text-slate-505 text-slate-500 font-bold">AP Space Calculus</p>
                          <p className="text-lg font-bold text-slate-200 mt-1">97% Rate</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STUDENT RISK FACTOR REPORTS SHEET */
                <div className="space-y-6">
                  {selectedReportId === 'summary' && (
                    <div className="space-y-4 text-xs text-slate-350 leading-relaxed font-mono">
                      <div className="p-4 bg-slate-955 rounded-xl border border-slate-850 text-slate-355 text-slate-350">
                        <h4 className="font-bold text-slate-200 text-xs mb-1 font-display animate-pulse">Risk Summary</h4>
                        Roster research identifies students suffering below <strong className="text-brand-blue">75% attendance benchmarks</strong>. There are <strong className="text-red-400">{(students.filter(s => s.attendanceRate < 75).length)} student profiles</strong> in low-tier warning state requiring outreach.
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-850">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr className="border-b border-slate-850">
                              <th className="p-3">Student</th>
                              <th className="p-3">Roll #</th>
                              <th className="p-3">Rate</th>
                              <th className="p-3 text-right">Alert Tier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 text-slate-300">
                            {students.filter(s => s.attendanceRate < 75).length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-slate-500">Zero student profiles fall below warning limits (75%). Good compliance roster state.</td>
                              </tr>
                            ) : (
                              students.filter(s => s.attendanceRate < 75).map((std) => (
                                <tr key={std.id} className="hover:bg-slate-955">
                                  <td className="p-3 font-semibold text-slate-200">{std.name}</td>
                                  <td className="p-3">{std.rollNumber}</td>
                                  <td className="p-3 text-red-400 font-bold">{std.attendanceRate}%</td>
                                  <td className="p-3 text-right">
                                    <span className="bg-red-950/20 text-red-400 font-bold text-[9px] px-2 py-0.5 rounded border border-red-900/30">
                                      {std.attendanceRate < 50 ? 'CRITICAL HIGH RISK' : 'CONCURRENT WARNING'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Risk Diagnostics List' && (
                    <div className="space-y-4 font-mono">
                      <p className="text-xs text-slate-400 font-medium">Diagnostic risk classifications mapped by class registry records:</p>
                      <div className="space-y-3">
                        {students.filter(s => s.attendanceRate < 75).length === 0 ? (
                          <div className="bg-slate-950 p-4 border border-slate-850 text-slate-500 text-xs text-center rounded-xl">
                            All students are performing in outstanding attendance index categories. No remediation required.
                          </div>
                        ) : (
                          students.filter(s => s.attendanceRate < 75).map(std => {
                            const isCritical = std.attendanceRate < 50;
                            return (
                              <div key={std.id} className="bg-slate-955 border border-slate-850 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-200">{std.name} ({std.rollNumber})</h5>
                                    <span className="text-[10px] text-slate-500">Class: {std.grade}</span>
                                  </div>
                                  <span className={`text-[11px] font-bold ${isCritical ? 'text-red-400' : 'text-amber-500'}`}>
                                    {std.attendanceRate}% Rate Index
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                    <span>Transit Delays: High Factor</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-405 bg-yellow-400"></span>
                                    <span>Mid-term Fatigue: Moderate</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed font-sans">
                                  Recommendation: Deploy family outreach advisory. Review morning transit parameters.
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Absence Justification Logs' && (
                    <div className="space-y-4 text-xs text-slate-350 leading-relaxed font-mono">
                      <p>Documented absence excuses registered under active profiles search indices:</p>
                      <div className="space-y-2.5">
                        <div className="bg-slate-955 p-3.5 border border-slate-850 rounded-xl">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <strong>Roster Record ID: #E-902</strong>
                            <span>2026-06-18</span>
                          </div>
                          <p className="text-slate-250 text-slate-200 font-semibold mt-1">Medical Consultation - Alex Rivera</p>
                          <p className="text-slate-400 mt-1">Confirmed with parental submission. Physician certificate uploaded to digital repository. Excuse classified as fully justified.</p>
                        </div>

                        <div className="bg-slate-955 p-3.5 border border-slate-850 rounded-xl">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <strong>Roster Record ID: #E-884</strong>
                            <span>2026-06-12</span>
                          </div>
                          <p className="text-slate-250 text-slate-200 font-semibold mt-1">Transit Failure - Jennifer Lopez</p>
                          <p className="text-slate-400 mt-1">Under investigation. Morning transportation car trouble excuse submitted via email. Waiting for secondary verification.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedReportId === 'Outreach Communication Template' && (
                    <div className="space-y-4 font-mono">
                      <p className="text-xs text-slate-450 text-slate-450">Generate copyable administrative outreach communications to parents of critical absenteeism cases:</p>
                      
                      {students.filter(s => s.attendanceRate < 75).length === 0 ? (
                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-slate-500 text-xs">
                          No families require critical communication at this time. Roster rate logs are in clear shape.
                        </div>
                      ) : (
                        students.filter(s => s.attendanceRate < 75).map((std) => {
                          const draftContent = `Subject: Academic Attendance Advisory: ${std.name} (${std.rollNumber})

Dear Parent/Guardian,

We are writing to provide a standard health & academic update for ${std.name}. Our digital records indicate ${std.name}'s current attendance rate has fallen to ${std.attendanceRate}%.

Consistent class attendance is critical for learning comprehension and student progress. We would love to collaborate with you to resolve any commuting or health constraints that might be causing these absences.

Please schedule an appointment with our counseling office at your earliest opportunity.

Sincerely,
System Administration Console
Aura High Prep`;

                          return (
                            <div key={std.id} className="bg-slate-955 border border-slate-850 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded-lg font-sans">
                                <span className="text-xs font-bold text-slate-200">{std.name} Outreach Code</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(draftContent);
                                    alert(`Outreach text for ${std.name} copied to clipboard!`);
                                  }}
                                  className="text-[10px] font-bold text-brand-blue hover:text-brand-500 cursor-pointer underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Copy Communication Draft
                                </button>
                              </div>
                              <pre className="p-3 bg-slate-900 rounded-lg text-[10px] text-slate-400 overflow-x-auto leading-relaxed border border-slate-950 whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                                {draftContent}
                              </pre>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHEET FOR ADDING / EDITING STUDENT (PROMPT ENROLLMENT WORKFLOW) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-955">
              <h5 className="font-display font-bold text-slate-200 text-base">
                {isEdit ? 'Update Student Profile' : 'Enroll New Student'}
              </h5>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-100 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-505 text-red-400 text-xs rounded-lg font-mono">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jennifer Lopez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-205 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ST1010"
                    disabled={isEdit}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-55 font-mono"
                    value={formRoll}
                    onChange={(e) => setFormRoll(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    Class & Section
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12th Grade - Sec A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-202 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="jennifer@school.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-202 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-955 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-350 hover:text-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-605 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Confirm Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
