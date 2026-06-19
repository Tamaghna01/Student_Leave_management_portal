'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const EyeIcon = ({ show }) =>
  show ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [mode, setMode]             = useState('login');    // 'login' | 'register'
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
  });

  // Already authenticated → redirect
  useEffect(() => {
    if (isAuthenticated) {
      const to = user?.role === 'faculty' ? '/faculty/dashboard' : '/dashboard';
      router.replace(to);
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && !form.name.trim()) {
      return setError('Full name is required.');
    }
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.password)     return setError('Password is required.');
    if ((mode === 'register' || mode === 'forgot') && form.password.length < 6)
      return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await authAPI.login({ email: form.email, password: form.password, role: form.role });
        const { token, user: userData } = res.data;
        console.log('✅ Login success:', userData.email, '| Role:', userData.role);
        login(token, userData);

        // Navigate immediately
        const dest = userData.role === 'faculty' ? '/faculty/dashboard' : '/dashboard';
        router.replace(dest);
      } else if (mode === 'register') {
        res = await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
        const { token, user: userData } = res.data;
        console.log('✅ Login success:', userData.email, '| Role:', userData.role);
        login(token, userData);

        // Navigate immediately
        const dest = userData.role === 'faculty' ? '/faculty/dashboard' : '/dashboard';
        router.replace(dest);
      } else {
        // mode === 'forgot'
        res = await authAPI.resetPassword({ email: form.email, password: form.password });
        setSuccess(res.data.message || 'Password reset successful! You can now log in.');
        setTimeout(() => {
          switchMode('login');
        }, 3000);
      }
    } catch (err) {
      console.error('Auth failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '', role: form.role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">LeavePortal</h1>
          <p className="text-slate-400 text-sm mt-1">University Leave Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Switcher / Reset Header */}
          {mode !== 'forgot' ? (
            <div className="flex border-b border-slate-100">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  id={`tab-${m}`}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors duration-200 cursor-pointer
                    ${mode === m
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>
          ) : (
            <div className="border-b border-slate-100 p-5 text-center bg-primary-50/10">
              <h2 className="text-sm font-bold text-slate-800">Reset Your Password</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your details to modify your password</p>
            </div>
          )}

          <div className="p-7">
            {/* Info banner for seed accounts */}
            {mode === 'login' && (
              <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 mb-1.5">Demo Account</p>
                <div className="space-y-1 text-xs text-blue-600">
                  <p>🎓 <strong>Student:</strong> alice@student.edu / Student@123</p>
                </div>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 animate-slide-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg animate-slide-in">
                <p className="text-xs text-emerald-700 font-medium">✓ {success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode !== 'forgot' && (
                <div>
                  <label className="form-label">I am a</label>
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      id="role-btn-student"
                      onClick={() => setForm(prev => ({ ...prev, role: 'student' }))}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer text-center ${
                        form.role === 'student'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      id="role-btn-faculty"
                      onClick={() => setForm(prev => ({ ...prev, role: 'faculty' }))}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer text-center ${
                        form.role === 'faculty'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      👨‍🏫 Faculty
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label htmlFor="reg-name" className="form-label">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    placeholder="Alice Johnson"
                    value={form.name}
                    onChange={handleChange}
                    className="form-input"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="form-label mb-0">
                    {mode === 'forgot' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-primary-600 hover:text-primary-800 font-semibold cursor-pointer"
                      tabIndex={-1}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={
                      mode === 'forgot'
                        ? 'Enter new password (Min. 6 chars)'
                        : mode === 'register'
                        ? 'Min. 6 characters'
                        : 'Enter your password'
                    }
                    value={form.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    id="toggle-password-btn"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              <button
                id="submit-auth-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mode === 'login'
                      ? 'Signing in...'
                      : mode === 'register'
                      ? 'Creating account...'
                      : 'Resetting password...'}
                  </>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : mode === 'register' ? (
                  'Create Account'
                ) : (
                  'Reset Password'
                )}
              </button>

              {mode === 'forgot' && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} LeavePortal — University Management System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
