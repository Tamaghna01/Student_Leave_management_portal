'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard        from '@/components/StatCard';
import { leaveAPI }   from '@/services/api';
import { useAuth }    from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Analytics mini-bar ─────────────────────────────────────────
const ProgressBar = ({ value, color }) => (
  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
    <div
      className={`h-2 rounded-full transition-all duration-700 ease-out ${color}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

// ── Leave card for pending queue ───────────────────────────────
const LeaveCard = ({ leave, onAction }) => {
  const [remark,     setRemark]     = useState('');
  const [expanded,   setExpanded]   = useState(false);
  const [submitting, setSubmitting] = useState(null); // 'approve' | 'reject' | null

  const days =
    Math.ceil(
      (new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)
    ) + 1;

  const handleAction = async (type) => {
    setSubmitting(type);
    try {
      await onAction(leave.id, type, remark);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden animate-scale-in">
      {/* Card Header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm font-semibold text-white">
              {leave.student_name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{leave.student_name}</p>
            <p className="text-xs text-slate-400">{leave.student_email}</p>
          </div>
        </div>

        {/* Leave type + days badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
            {leave.leave_type}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-full border border-slate-100">
            {days}d
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 space-y-3">
        {/* Date range */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(leave.start_date)}</span>
          <span className="text-slate-300">→</span>
          <span>{formatDate(leave.end_date)}</span>
        </div>

        {/* Reason */}
        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
          {leave.reason}
        </p>

        {/* Applied on */}
        <p className="text-xs text-slate-400">
          Applied on {formatDate(leave.applied_at)}
        </p>

        {/* Toggle remark input */}
        <button
          id={`toggle-review-${leave.id}`}
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'Hide Review Panel' : 'Add Remark & Review'}
        </button>

        {/* Review Panel */}
        {expanded && (
          <div className="border-t border-slate-100 pt-3 space-y-3 animate-slide-in">
            <div>
              <label htmlFor={`remark-${leave.id}`} className="form-label">
                Faculty Remark <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id={`remark-${leave.id}`}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add a note for the student..."
                rows={2}
                className="form-input resize-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                id={`approve-${leave.id}`}
                onClick={() => handleAction('approve')}
                disabled={!!submitting}
                className="btn-success flex-1 text-sm py-2"
              >
                {submitting === 'approve' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {submitting === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                id={`reject-${leave.id}`}
                onClick={() => handleAction('reject')}
                disabled={!!submitting}
                className="btn-danger flex-1 text-sm py-2"
              >
                {submitting === 'reject' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {submitting === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Faculty Dashboard ─────────────────────────────────────
const FacultyDashboard = () => {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null); // { type, msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, pendingRes] = await Promise.all([
        leaveAPI.getStats(),
        leaveAPI.getPending(),
      ]);
      setStats(statsRes.data.stats);
      setPending(pendingRes.data.leaves);
    } catch {
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id, type, remark) => {
    try {
      if (type === 'approve') {
        await leaveAPI.approveLeave(id, { faculty_remark: remark });
        showToast('success', 'Leave request approved successfully.');
      } else {
        await leaveAPI.rejectLeave(id, { faculty_remark: remark });
        showToast('error', 'Leave request rejected.');
      }
      // Remove from pending list optimistically and refresh stats
      setPending((prev) => prev.filter((l) => l.id !== id));
      const statsRes = await leaveAPI.getStats();
      setStats(statsRes.data.stats);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  const s = stats;

  return (
    <DashboardLayout pageTitle="Faculty Dashboard">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in
            ${toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
            }`}
        >
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Faculty Dashboard 👨‍🏫
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome, {user?.name}. Review and manage student leave requests.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={loadData} className="text-xs text-red-600 underline">Retry</button>
        </div>
      )}

      {/* ── Analytics Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Requests"
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
          title="Pending Review"
          value={s?.pending}
          loading={loading}
          color="amber"
          subtitle="Awaiting action"
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
          subtitle={s ? `${s.approvalPercentage}% approval rate` : ''}
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
          subtitle={s ? `${s.rejectionPercentage}% rejection rate` : ''}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Analytics Progress Bars ──────────────────────────── */}
      {!loading && s && s.total > 0 && (
        <div className="card mb-8 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Leave Analytics Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium text-emerald-600">Approval Rate</span>
                <span className="font-bold text-emerald-700">{s.approvalPercentage}%</span>
              </div>
              <ProgressBar value={s.approvalPercentage} color="bg-emerald-500" />
              <p className="text-xs text-slate-400">{s.approved} approved of {s.total}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium text-red-600">Rejection Rate</span>
                <span className="font-bold text-red-700">{s.rejectionPercentage}%</span>
              </div>
              <ProgressBar value={s.rejectionPercentage} color="bg-red-500" />
              <p className="text-xs text-slate-400">{s.rejected} rejected of {s.total}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium text-amber-600">Pending Rate</span>
                <span className="font-bold text-amber-700">{s.pendingPercentage}%</span>
              </div>
              <ProgressBar value={s.pendingPercentage} color="bg-amber-500" />
              <p className="text-xs text-slate-400">{s.pending} pending of {s.total}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending Requests Queue ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-slate-800">Pending Leave Requests</h3>
            {!loading && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {pending.length}
              </span>
            )}
          </div>
          <button
            id="refresh-pending-btn"
            onClick={loadData}
            className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-52 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending leave requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((leave) => (
              <LeaveCard
                key={leave.id}
                leave={leave}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function FacultyDashboardRoute() {
  return (
    <ProtectedRoute role="faculty">
      <FacultyDashboard />
    </ProtectedRoute>
  );
}
