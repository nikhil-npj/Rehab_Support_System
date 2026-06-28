import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';

const INJURY_LABELS = {
  ACL: 'ACL Tear / Reconstruction',
  disc_bulge: 'Disc Bulge / Herniation',
  shoulder: 'Shoulder Injury',
  ankle_sprain: 'Ankle Sprain',
  other: 'Other',
};

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-sm text-slate-400">Loading review queue...</p>
    </div>
  );
}

function InsightCard({ insight, onAction }) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(insight.ai_content);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmReject, setConfirmReject] = useState(false);

  const patientName = insight.patient_profiles?.profiles?.name || 'Unknown Patient';
  const injuryType = insight.patient_profiles?.injury_type;
  const injuryLabel = INJURY_LABELS[injuryType] || injuryType || '—';
  const createdAt = new Date(insight.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleAction = async (action, finalContent) => {
    setActionLoading(action);
    try {
      await api.put(`/insights/${insight.id}/review`, {
        action,
        final_content: finalContent,
      });
      onAction(insight.id);
    } catch (err) {
      console.error('Review action failed:', err);
      alert(err?.response?.data?.error || 'Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{patientName}</p>
            <p className="text-xs text-slate-400">{injuryLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Trend Summary
          </span>
          <span className="text-xs text-slate-400">{createdAt}</span>
        </div>
      </div>

      {/* AI Content */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          AI-Generated Content
        </p>

        {editMode ? (
          <textarea
            id={`edit-insight-${insight.id}`}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
            className="w-full text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {insight.ai_content}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-5 flex flex-wrap gap-2">
        {!editMode && !confirmReject && (
          <>
            {/* Approve */}
            <button
              id={`approve-insight-${insight.id}`}
              onClick={() => handleAction('approve')}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              {actionLoading === 'approve' ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
              Approve
            </button>

            {/* Edit & Approve */}
            <button
              id={`edit-insight-btn-${insight.id}`}
              onClick={() => setEditMode(true)}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
              Edit & Approve
            </button>

            {/* Reject */}
            <button
              id={`reject-insight-btn-${insight.id}`}
              onClick={() => setConfirmReject(true)}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-50 text-rose-700 text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </>
        )}

        {/* Confirm Reject */}
        {confirmReject && (
          <div className="flex items-center gap-2 w-full">
            <p className="text-sm text-rose-600 font-medium">Reject this insight?</p>
            <button
              id={`confirm-reject-${insight.id}`}
              onClick={() => { setConfirmReject(false); handleAction('reject'); }}
              disabled={!!actionLoading}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {actionLoading === 'reject' ? 'Rejecting...' : 'Yes, Reject'}
            </button>
            <button
              onClick={() => setConfirmReject(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Save & Approve (edit mode) */}
        {editMode && (
          <div className="flex items-center gap-2 w-full">
            <button
              id={`save-approve-${insight.id}`}
              onClick={() => handleAction('edit', editContent)}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
            >
              {actionLoading === 'edit' ? 'Saving...' : '✓ Save & Approve'}
            </button>
            <button
              onClick={() => { setEditMode(false); setEditContent(insight.ai_content); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsReviewPage() {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/insights/pending');
      setInsights(res.data);
    } catch (err) {
      console.error('Error fetching pending insights:', err);
      setErrorMsg('Failed to load insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.role !== 'physio') {
          navigate('/patient/dashboard');
          return;
        }
        setProfile(res.data);
        await fetchPending();
      } catch (err) {
        navigate('/login');
      }
    };
    init();
  }, [navigate, fetchPending]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleActionComplete = (insightId) => {
    setInsights((prev) => prev.filter((i) => i.id !== insightId));
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/physio/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">AI Review Queue</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">{profile?.name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">AI Insights Review Queue</h1>
              <p className="text-sm text-slate-500">Review AI-generated insights before they reach patients</p>
            </div>
          </div>

          {!loading && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {insights.length} insight{insights.length !== 1 ? 's' : ''} awaiting review
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-sm">
            {errorMsg}
          </div>
        ) : insights.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-600 mb-1">All clear!</p>
            <p className="text-sm text-slate-400">No pending insights to review. Generate insights from a patient's detail page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onAction={handleActionComplete}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400 bg-white">
        © {new Date().getFullYear()} RehabTrack Physiotherapist Portal.
      </footer>
    </div>
  );
}
