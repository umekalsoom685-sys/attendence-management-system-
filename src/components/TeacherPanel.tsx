import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Calendar, CheckCircle2, UserCheck, AlertCircle, RefreshCw, Bookmark, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherPanelProps {
  students: Student[];
  onRefreshData: () => void;
  username: string;
}

export default function TeacherPanel({ students, onRefreshData, username }: TeacherPanelProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    // default to seed date June 21, 2026
    return '2026-06-21';
  });
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: { status: 'present' | 'absent' | 'late'; remarks: string } }>({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Class setup states
  const [className, setClassName] = useState('');
  const [classTime, setClassTime] = useState('');
  const [section, setSection] = useState('');
  const [classType, setClassType] = useState<'regular' | 'makeup'>('regular');

  // Synchronize internal records if student list or date changes
  useEffect(() => {
    const initialRecords: typeof attendanceRecords = {};
    let foundClassName = '';
    let foundClassTime = '';
    let foundSection = '';
    let foundClassType: 'regular' | 'makeup' = 'regular';
    let hasExisting = false;

    students.forEach((student) => {
      // Check if student already has a record for selectedDate
      const existing = student.attendanceHistory?.find((h: any) => h.date === selectedDate);
      if (existing) {
        initialRecords[student.id] = {
          status: existing.status,
          remarks: existing.remarks || ''
        };
        if (!hasExisting) {
          foundClassName = existing.className || '';
          foundClassTime = existing.classTime || '';
          foundSection = existing.section || '';
          foundClassType = existing.classType || 'regular';
          hasExisting = true;
        }
      } else {
        initialRecords[student.id] = {
          status: 'present', // default choice for quick registration and speed
          remarks: ''
        };
      }
    });
    setAttendanceRecords(initialRecords);

    if (hasExisting) {
      setClassName(foundClassName);
      setClassTime(foundClassTime);
      setSection(foundSection);
      setClassType(foundClassType);
    } else {
      setClassName('');
      setClassTime('');
      setSection('');
      setClassType('regular');
    }
  }, [students, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSelectAllPresent = () => {
    setAttendanceRecords((prev) => {
      const updated = { ...prev };
      students.forEach((student) => {
        if (updated[student.id]) {
          updated[student.id].status = 'present';
        }
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage('');

    const recordsPayload = Object.keys(attendanceRecords).map((studentId) => ({
      studentId,
      status: attendanceRecords[studentId].status,
      remarks: attendanceRecords[studentId].remarks
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          records: recordsPayload,
          markedBy: username,
          className,
          classTime,
          section,
          classType
        })
      });

      if (res.ok) {
        setToastMessage('Attendance logs updated and synchronized across all roles!');
        onRefreshData();
        setTimeout(() => setToastMessage(''), 4000);
      } else {
        alert('Could not submit attendance records.');
      }
    } catch (err) {
      console.error('Error submitting core attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="teacher-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-200">Mark Attendance</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Select a date, fill in class details, and mark present/absent for each student below.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
              <Calendar className="w-4 h-4 text-brand-500" />
            </span>
            <input
              type="date"
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleSelectAllPresent}
            className="px-3.5 py-2 bg-slate-950 border border-brand-500/30 hover:border-brand-505 text-brand-500 hover:text-brand-605 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark All Present
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-brand-50 border border-brand-500/30 text-brand-500 text-xs font-mono rounded-lg flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-brand-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ATTENDANCE CHECKLIST TABLE */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="teacher-attendance-form">
        <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400 font-mono">
            Date Selected: <span className="text-slate-200 font-bold">{selectedDate}</span> ({students.length} students)
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-slate-600" /> Verified Registry
          </span>
        </div>

        {/* CLASS SESSION SETUP FOR REAL-LIFE USE */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-405 text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Class / Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Programming, Physics"
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium font-sans"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-405 text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Class Schedule Time
            </label>
            <input
              type="time"
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              value={classTime}
              onChange={(e) => setClassTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-405 text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Class Section / Group
            </label>
            <input
              type="text"
              placeholder="e.g. Section A, Section B, Grade-11"
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium font-sans"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-404 text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Class Type Options
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClassType('regular')}
                className={`py-2 text-[10px] uppercase font-extrabold tracking-wider rounded-lg border transition-all cursor-pointer ${
                  classType === 'regular'
                    ? 'bg-brand-50/15 border-brand-500 text-brand-500 shadow-sm shadow-brand-500/5'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-20s hover:text-slate-200'
                }`}
              >
                Regular Class
              </button>
              <button
                type="button"
                onClick={() => setClassType('makeup')}
                className={`py-2 text-[10px] uppercase font-extrabold tracking-wider rounded-lg border transition-all cursor-pointer ${
                  classType === 'makeup'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-20s hover:text-slate-200'
                }`}
              >
                Makeup Class
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5 text-center">Attendance Checklist Status</th>
                <th className="px-6 py-3.5">Remarks / Annotations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">
                    No enrolled students in your workspace directories.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const record = attendanceRecords[student.id] || { status: 'present', remarks: '' };
                  const rate = student.attendanceRate;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/25 transition-all">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-200">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500">{student.grade}</span>
                            <span className="text-slate-700 text-xs">•</span>
                            <span className={`text-[10px] font-bold ${rate < 50 ? 'text-red-400' : rate < 75 ? 'text-yellow-405 text-yellow-550' : 'text-brand-500'}`}>
                              Rate: {rate}%
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{student.rollNumber}</td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-3">
                          {/* Present tag selector */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              record.status === 'present'
                                ? 'bg-brand-50 border-brand-500 text-brand-500 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent tag selector */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              record.status === 'absent'
                                ? 'bg-red-50/20 border-red-500 text-red-500 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Absent
                          </button>

                          {/* Late tag selector */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              record.status === 'late'
                                ? 'bg-yellow-50/20 border-yellow-500 text-yellow-550 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="e.g. medical note, family leave..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={record.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Form submit action */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end items-center">
          <p className="text-xs text-slate-500 mr-4 italic font-sans font-medium">
            Attendance records are saved instantly.
          </p>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="bg-brand-500 hover:bg-brand-605 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-brand-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 stroke-[2]" />
            )}
            Save Attendance
          </button>
        </div>
      </form>
    </div>
  );
}
