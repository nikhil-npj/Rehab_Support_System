import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (!data?.user) {
        throw new Error('Login failed. Please check your credentials.');
      }

      // 2. Fetch profile from custom backend
      const profileResponse = await api.get('/auth/me');
      const profile = profileResponse.data;

      // 3. Redirect depending on role
      if (profile.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (profile.role === 'physio') {
        navigate('/physio/dashboard');
      } else {
        throw new Error('Unknown user role. Contact support.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 404) {
        setErrorMsg('Auth succeeded, but no user profile was found. Please sign up again.');
      } else {
        setErrorMsg(err.response?.data?.error || err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-lg">
        {/* Logo and Titles */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl font-extrabold text-brand-500">RehabTrack</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-800">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to resume tracking your progress</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-bold transition-colors duration-150">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
