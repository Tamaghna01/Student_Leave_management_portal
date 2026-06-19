import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { leaveAPI }   from '../services/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const LeaveCard = ({ leave, onAction }) => {
  const [remark,     setRemark]     = useState('');
  const [expanded,   setExpanded]   = useState(true); // auto-open on this dedicated page
  const [submitting, setSubmitting] = useState(null);

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
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {leave.student_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{leave.student_name}</p>
            <p className="text-xs text-slate-400">{leave.student_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
            {leave.leave_type}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-full border border-slate-100">
            {days}d
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(leave.start_date)}</span>
          <span className="text-slate-300">→</span>
          <span>{formatDate(leave.end_date)}</span>
          <span className="ml-auto text-slate-300">Applied {formatDate(leave.applied_at)}</span>
        </div>

        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
          {leave.reason}
        </p>

        <div className="pt-1 space-y-3">
          <div>
            <label htmlFor={`remark-p-${leave.id}`} className="form-label text-xs">
              Faculty Remark <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id={`remark-p-${leave.id}`}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a note for the student..."
              rows={2}
              className="form-input resize-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              id={`approve-pending-${leave.id}`}
              onClick={() => handleAction('approve')}
              disabled={!!submitting}
              className="btn-success flex-1 text-sm py-2"
            >
              {submitting === 'approve' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
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
              id={`reject-pending-${leave.id}`}
              onClick={() => handleAction('reject')}
              disabled={!!submitting}
              className="btn-danger flex-1 text-sm py-2"
            >
              {submitting === 'reject' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
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
      </div>
    </div>
  );
};

const PendingLeavesPage = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await leaveAPI.getPending();
      setPending(res.data.leaves);
    } catch {
      setError('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, type, remark) => {
    try {
      if (type === 'approve') {
        await leaveAPI.approveLeave(id, { faculty_remark: remark });
        showToast('success', 'Leave approved successfully.');
      } else {
        await leaveAPI.rejectLeave(id, { faculty_remark: remark });
        showToast('error', 'Leave rejected.');
      }
      setPending((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <DashboardLayout pageTitle="Pending Requests">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in
          ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pending Leave Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? '...' : `${pending.length} request${pending.length !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
        <button
          id="refresh-pending-page-btn"
          onClick={load}
          className="btn-secondary text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-700">All caught up!</p>
          <p className="text-sm text-slate-400 mt-1">No pending leave requests at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pending.map((leave) => (
            <LeaveCard key={leave.id} leave={leave} onAction={handleAction} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PendingLeavesPage;
