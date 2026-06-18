import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Sign up user with Supabase Auth
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;

      if (!data?.user) {
        throw new Error('Signup failed. Please try again.');
      }

      // 2. Get a valid access token
      let accessToken = data?.session?.access_token;

      // If no session returned (e.g. email confirmation required),
      // sign in immediately to obtain a valid token
      if (!accessToken) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        accessToken = signInData?.session?.access_token;

        if (!accessToken) {
          throw new Error('Could not obtain a session. Please try logging in manually.');
        }
      }

      // 3. Create the profile row via our backend API (always physio)
      await api.post('/auth/profile', {
        name,
        role: 'physio',
        phone
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // 4. Redirect to physio dashboard
      navigate('/physio/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[450px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl font-extrabold text-brand-500">RehabTrack</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            Physiotherapist Sign Up
          </div>
          <h2 className="text-xl font-bold text-slate-800">Create Your Physio Account</h2>
          <p className="text-xs text-slate-400 mt-1">You'll be able to add patients after signing up</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg mb-5 text-xs bg-rose-50 border border-rose-200 text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Sarah Connor"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@clinic.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Password */}
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

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone Number <span className="text-slate-400 normal-case font-normal">(Optional)</span></label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="signup-submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Physiotherapist Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold transition-colors duration-150">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
