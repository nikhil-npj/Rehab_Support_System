import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';
import AddPatientModal from './AddPatientModal';

const INJURY_LABELS = {
  ACL: 'ACL Tear',
  disc_bulge: 'Disc Bulge',
  shoulder: 'Shoulder',
  ankle_sprain: 'Ankle Sprain',
  other: 'Other',
};

const INJURY_COLORS = {
  ACL: 'bg-blue-50 text-blue-700 border-blue-200',
  disc_bulge: 'bg-purple-50 text-purple-700 border-purple-200',
  shoulder: 'bg-amber-50 text-amber-700 border-amber-200',
  ankle_sprain: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  other: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function PhysioDashboard() {
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [pendingInsightsCount, setPendingInsightsCount] = useState(0);
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

  const fetchPatients = useCallback(async () => {
    setPatientsLoading(true);
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPatients();
      // Fetch pending insights count for badge
      api.get('/insights/pending')
        .then((res) => setPendingInsightsCount(res.data.length))
        .catch(() => {});
    }
  }, [profile, fetchPatients]);

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
          <p className="text-sm text-slate-500 mb-4">{errorMsg}</p>
          <p className="text-xs text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f9fafb] text-slate-800 font-sans flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-500">RehabTrack</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/physio/insights"
                id="review-queue-link"
                className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 px-3 py-1.5 hover:bg-teal-50 rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <span className="hidden sm:inline">Review Queue</span>
                {pendingInsightsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingInsightsCount > 9 ? '9+' : pendingInsightsCount}
                  </span>
                )}
              </Link>
              <span className="text-sm font-medium text-slate-600">{profile?.name}</span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Physiotherapist
              </span>
              <button
                id="signout-btn"
                onClick={handleSignOut}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 shadow-md mb-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
            <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-6" />
            <h2 className="text-2xl font-bold mb-1 relative">Welcome back, {profile?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-brand-100 text-sm relative">Manage your patients and their rehabilitation plans.</p>
            <div className="flex items-center gap-6 mt-4 relative">
              <div>
                <p className="text-3xl font-bold">{patients.length}</p>
                <p className="text-brand-200 text-xs">Total Patients</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">{patients.length > 0 ? patients.length : '—'}</p>
                <p className="text-brand-200 text-xs">Active Cases</p>
              </div>
            </div>
          </div>

          {/* Patients section header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">My Patients</h2>
            <button
              id="add-patient-btn"
              onClick={() => setShowAddPatient(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Add New Patient
            </button>
          </div>

          {/* Patient list */}
          {patientsLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : patients.length === 0 ? (
            /* Empty state */
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No patients yet</p>
              <p className="text-xs text-slate-400 mb-5">Add your first patient to get started with their rehabilitation program.</p>
              <button
                id="add-first-patient-btn"
                onClick={() => setShowAddPatient(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add First Patient
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p) => {
                const colorClass = INJURY_COLORS[p.injury_type] || INJURY_COLORS.other;
                const injuryLabel = INJURY_LABELS[p.injury_type] || p.injury_type;
                const startDate = p.start_date
                  ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'N/A';
                const initials = p.profiles?.name
                  ? p.profiles.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  : '?';

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.profiles?.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} mt-0.5`}>
                          {injuryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      Started {startDate}
                    </div>

                    <Link
                      to={`/physio/patients/${p.id}`}
                      id={`view-patient-${p.id}`}
                      className="mt-auto w-full text-center py-2 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-600 text-sm font-semibold rounded-xl transition-all duration-200"
                    >
                      View Details →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
          © {new Date().getFullYear()} RehabTrack Physiotherapist Portal.
        </footer>
      </div>

      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onPatientAdded={fetchPatients}
        />
      )}
    </>
  );
}
