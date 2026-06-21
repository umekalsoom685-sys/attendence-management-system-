export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  studentId?: string; // Links to Student record if role is 'student'
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  grade: string;
  attendanceRate: number; // calculated status
  attendanceHistory: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  markedBy: string; // Teacher or Admin username
  remarks?: string;
  className?: string;
  classTime?: string;
  section?: string;
  classType?: 'regular' | 'makeup';
}

export interface SystemStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageRate: number;
  criticalCount: number; // rate < 50%
  warningCount: number; // rate < 75%
}

export interface AIRecommendation {
  summary: string;
  actionItems: string[];
  riskAnalysis: {
    criticalCount: number;
    warningCount: number;
    predictions: string;
  };
}
