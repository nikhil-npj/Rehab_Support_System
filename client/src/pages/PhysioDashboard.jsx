import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';

export default function PhysioDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const userProfile = response.data;
        
        if (userProfile.role !== 'physio') {
          navigate('/patient/dashboard');
          return;
        }
        setProfile(userProfile);
      } catch (err) {
        console.error('Error fetching dashboard profile:', err);
        setErrorMsg('Unauthorized access or profile not found. Please log in.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-800 p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Access Denied</h3>
          <p className="text-sm text-slate-505 mb-4">{errorMsg}</p>
          <p className="text-xs text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875V16.5m-1.05-11.25a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0Zm0 9.75a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM6 6.75a3.375 3.375 0 1 1 6.75 0A3.375 3.375 0 0 1 6 6.75Zm0 9.75a3.375 3.375 0 1 1 6.75 0A3.375 3.375 0 0 1 6 6.75Z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-500">RehabTrack</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              {profile?.name}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-6 py-10 max-w-4xl">
        {/* Welcome Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-md relative overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome back, {profile?.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Configure rehabilitation templates and review client performance logs</p>
            </div>
            <div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
                Physiotherapist Account
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Profile Data Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Profile UUID</span>
                <span className="text-xs text-slate-600 font-mono select-all break-all">{profile?.id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Contact Phone</span>
                <span className="text-sm text-slate-700 font-medium">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-400 block font-medium">Registered Date</span>
                <span className="text-sm text-slate-700 font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl flex items-center gap-3 text-sm mt-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-teal-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              <span>Management connection verified. You can now configure treatment templates and review client performance logs.</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        &copy; {new Date().getFullYear()} RehabTrack Physiotherapist Portal.
      </footer>
    </div>
  );
}
