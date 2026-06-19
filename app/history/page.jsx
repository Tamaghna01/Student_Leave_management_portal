'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout   from '@/layouts/DashboardLayout';
import { leaveAPI }      from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { cls: 'badge-pending',  dot: 'bg-amber-500',   label: 'Pending'  },
    approved: { cls: 'badge-approved', dot: 'bg-emerald-500', label: 'Approved' },
    rejected: { cls: 'badge-rejected', dot: 'bg-red-500',     label: 'Rejected' },
  }[status] || { cls: 'badge', dot: 'bg-slate-400', label: status };

  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const LeaveHistoryPage = () => {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('All');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await leaveAPI.getMyLeaves();
        setLeaves(res.data.leaves);
      } catch {
        setError('Failed to load leave history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return leaves;
    return leaves.filter((l) => l.status === filter.toLowerCase());
  }, [leaves, filter]);

  return (
    <DashboardLayout pageTitle="Leave History">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Leave History</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {leaves.length} total request{leaves.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/apply-leave" id="apply-leave-history-btn" className="btn-primary flex-shrink-0 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Apply Leave
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}-btn`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150
              ${filter === f
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {f}
            {f !== 'All' && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${f === 'Pending'  ? 'bg-amber-100 text-amber-600'   : ''}
                ${f === 'Approved' ? 'bg-emerald-100 text-emerald-600' : ''}
                ${f === 'Rejected' ? 'bg-red-100 text-red-600'       : ''}
              `}>
                {leaves.filter((l) => l.status === f.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="card space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {filter === 'All' ? 'No leave requests found' : `No ${filter.toLowerCase()} leaves`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'All' ? 'Submit your first leave application' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Faculty Remark</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave, idx) => {
                const days = Math.ceil(
                  (new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)
                ) + 1;
                return (
                  <tr key={leave.id} className="animate-fade-in">
                    <td className="text-slate-400 text-xs font-mono">{idx + 1}</td>
                    <td className="font-medium text-slate-800">{leave.leave_type}</td>
                    <td className="text-slate-500 text-xs">{formatDate(leave.start_date)}</td>
                    <td className="text-slate-500 text-xs">{formatDate(leave.end_date)}</td>
                    <td>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {days}d
                      </span>
                    </td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td className="max-w-[200px]">
                      {leave.faculty_remark ? (
                        <span className="text-xs text-slate-500 italic">"{leave.faculty_remark}"</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(leave.applied_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default function LeaveHistoryRoute() {
  return (
    <ProtectedRoute role="student">
      <LeaveHistoryPage />
    </ProtectedRoute>
  );
}
