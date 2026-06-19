'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/layouts/DashboardLayout';
import { leaveAPI }    from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const LEAVE_TYPES = [
  'Sick Leave',
  'Casual Leave',
  'Earned Leave',
  'Medical Leave',
  'Emergency Leave',
  'Study Leave',
];

const ApplyLeavePage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    leave_type: '',
    start_date: '',
    end_date:   '',
    reason:     '',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [apiError, setApiError] = useState('');

  // Get today's date string in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.leave_type)           e.leave_type  = 'Please select a leave type.';
    if (!form.start_date)           e.start_date  = 'Start date is required.';
    if (!form.end_date)             e.end_date    = 'End date is required.';
    if (form.start_date && form.end_date && form.end_date < form.start_date)
                                    e.end_date    = 'End date must be on or after start date.';
    if (!form.reason.trim())        e.reason      = 'Please provide a reason for your leave.';
    if (form.reason.trim().length < 10)
                                    e.reason      = 'Reason must be at least 10 characters.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await leaveAPI.apply(form);
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout pageTitle="Apply for Leave">
        <div className="max-w-lg mx-auto mt-16 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Leave Applied!</h2>
          <p className="text-slate-500 mb-8">
            Your leave request has been submitted successfully. You'll be notified once it's reviewed by faculty.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              id="apply-another-btn"
              onClick={() => { setSuccess(false); setForm({ leave_type: '', start_date: '', end_date: '', reason: '' }); }}
              className="btn-secondary"
            >
              Apply Another
            </button>
            <button
              id="view-history-btn"
              onClick={() => router.push('/history')}
              className="btn-primary"
            >
              View History
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Apply for Leave">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">New Leave Application</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to submit your leave request.</p>
        </div>

        {apiError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 animate-slide-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="card space-y-5">
            {/* Leave Type */}
            <div>
              <label htmlFor="leave_type" className="form-label">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leave_type"
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
                className={`form-input ${errors.leave_type ? 'border-red-300 focus:ring-red-400' : ''}`}
              >
                <option value="">Select leave type...</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.leave_type && <p className="form-error">{errors.leave_type}</p>}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="form-label">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="start_date"
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  min={today}
                  className={`form-input ${errors.start_date ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
                {errors.start_date && <p className="form-error">{errors.start_date}</p>}
              </div>
              <div>
                <label htmlFor="end_date" className="form-label">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="end_date"
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  min={form.start_date || today}
                  className={`form-input ${errors.end_date ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
                {errors.end_date && <p className="form-error">{errors.end_date}</p>}
              </div>
            </div>

            {/* Duration Preview */}
            {form.start_date && form.end_date && form.end_date >= form.start_date && (
              <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg animate-slide-in">
                <p className="text-xs text-primary-700">
                  <strong>Duration:</strong>{' '}
                  {Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="form-label">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the reason for your leave request in detail..."
                className={`form-input resize-none ${errors.reason ? 'border-red-300 focus:ring-red-400' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {errors.reason
                  ? <p className="form-error">{errors.reason}</p>
                  : <span />
                }
                <span className={`text-xs ${form.reason.length < 10 ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {form.reason.length} chars
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                id="cancel-leave-btn"
                onClick={() => router.push('/dashboard')}
                className="btn-secondary sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-leave-btn"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Leave Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default function ApplyLeaveRoute() {
  return (
    <ProtectedRoute role="student">
      <ApplyLeavePage />
    </ProtectedRoute>
  );
}
