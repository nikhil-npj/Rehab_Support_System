import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'physio'
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

      // If no session returned (e.g. email confirmation was previously required),
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

      // 3. Create the profile row via our backend API
      await api.post('/auth/profile', {
        name,
        role,
        phone
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // 4. Redirect based on role
      if (role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/physio/dashboard');
      }
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
          <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Start your recovery tracking today</p>
        </div>

        {errorMsg && (
          <div className={`p-3 rounded-lg mb-5 text-xs ${errorMsg.includes('successful') ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-rose-50 border border-rose-200 text-rose-600'}`}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role Selection Side-by-Side Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">I am registering as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-center outline-none ${
                  role === 'patient'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-300 bg-white hover:border-slate-400 text-slate-500'
                }`}
              >
                <span className="font-bold text-sm">I am a Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('physio')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-center outline-none ${
                  role === 'physio'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-300 bg-white hover:border-slate-400 text-slate-500'
                }`}
              >
                <span className="font-bold text-sm">I am a Physiotherapist</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Sarah Connor or Jane Doe"
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
              placeholder="name@example.com"
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
            <label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone Number (Optional)</label>
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
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Account'
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
