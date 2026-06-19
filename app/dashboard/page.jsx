'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard        from '@/components/StatCard';
import { leaveAPI }   from '@/services/api';
import { useAuth }    from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const StatusBadge = ({ status }) => {
  const cls = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }[status] || 'badge';

  const dot = {
    pending:  'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
  }[status] || 'bg-slate-400';

  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data,    setData]    = useState({ stats: null, leaves: [] });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res  = await leaveAPI.getMyLeaves();
        setData({ stats: res.data.stats, leaves: res.data.leaves.slice(0, 5) });
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const recentLeaves = data.leaves;
  const s = data.stats;

  return (
    <DashboardLayout pageTitle="Student Dashboard">
      {/* Welcome Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage your leave applications from here.
          </p>
        </div>
        <Link href="/apply-leave" id="apply-leave-btn" className="btn-primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Apply for Leave
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Leaves"
          value={s?.total}
          loading={loading}
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Pending"
          value={s?.pending}
          loading={loading}
          color="amber"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Approved"
          value={s?.approved}
          loading={loading}
          color="emerald"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Rejected"
          value={s?.rejected}
          loading={loading}
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Leaves Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-800">Recent Leave Requests</h3>
          <Link href="/history" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentLeaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">No leave requests yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Apply for Leave" to submit your first request</p>
            <Link href="/apply-leave" className="btn-primary mt-4 text-xs px-4 py-2">
              Apply Now
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Date Range</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-medium text-slate-800">{leave.leave_type}</td>
                    <td className="text-slate-500 text-xs">
                      {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                    </td>
                    <td className="max-w-[200px] truncate text-slate-500">{leave.reason}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td className="text-slate-400 text-xs">{formatDate(leave.applied_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute role="student">
      <StudentDashboard />
    </ProtectedRoute>
  );
}
