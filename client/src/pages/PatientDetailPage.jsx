import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CreatePlanModal from './CreatePlanModal';

const INJURY_LABELS = {
  ACL: 'ACL Tear / Reconstruction',
  disc_bulge: 'Disc Bulge / Herniation',
  shoulder: 'Shoulder Injury',
  ankle_sprain: 'Ankle Sprain',
  other: 'Other',
};

function ExerciseCard({ planExercise }) {
  const ex = planExercise.exercises;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-bold text-slate-800">{ex?.name}</h4>
        <span className="flex-shrink-0 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
          {planExercise.frequency}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{ex?.description}</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{planExercise.sets}</p>
          <p className="text-xs text-slate-400">Sets</p>
        </div>
        <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{planExercise.reps}</p>
          <p className="text-xs text-slate-400">Reps</p>
        </div>
        <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-800">{planExercise.duration_seconds}s</p>
          <p className="text-xs text-slate-400">Hold</p>
        </div>
      </div>
      {planExercise.notes && (
        <p className="mt-2 text-xs text-slate-500 italic border-t border-slate-100 pt-2">
          📋 {planExercise.notes}
        </p>
      )}
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching patient detail:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/physio/dashboard');
        return;
      }
      setErrorMsg(err.response?.data?.error || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-slate-400">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-rose-500 text-sm mb-4">{errorMsg}</p>
          <Link to="/physio/dashboard" className="text-brand-500 text-sm font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { patient, plan } = data;
  const patientName = patient?.profiles?.name;
  const injuryLabel = INJURY_LABELS[patient?.injury_type] || patient?.injury_type;
  const startDate = patient?.start_date
    ? new Date(patient.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <>
      <div className="min-h-screen bg-[#f9fafb] flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/physio/dashboard"
                id="back-to-dashboard"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-slate-800">{patientName}</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-500">RehabTrack</span>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-6 py-8 max-w-3xl">
          {/* Patient info card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                  {patientName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{patientName}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-1">
                    {injuryLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Start Date</span>
                <span className="text-sm font-medium text-slate-700 mt-0.5 block">{startDate}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Patient ID</span>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block break-all">{patient?.id}</span>
              </div>
              {patient?.notes && (
                <div className="col-span-2 border-t border-slate-200 pt-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clinical Notes</span>
                  <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Rehab Plan section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Rehabilitation Plan</h2>
              {!plan && (
                <button
                  id="create-plan-btn"
                  onClick={() => setShowCreatePlan(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Plan
                </button>
              )}
            </div>

            {!plan ? (
              /* Empty state */
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">No rehab plan assigned yet</p>
                <p className="text-xs text-slate-400 mb-4">Create a plan to assign exercises and dietary guidance</p>
                <button
                  id="create-plan-empty-btn"
                  onClick={() => setShowCreatePlan(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Rehab Plan
                </button>
              </div>
            ) : (
              /* Plan exists */
              <div>
                {/* Plan header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Plan</span>
                    <span className="ml-auto text-xs text-slate-400">
                      Created {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {plan.dietary_notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">🥗 Dietary & Lifestyle Notes</p>
                      <p className="text-sm text-amber-800 leading-relaxed">{plan.dietary_notes}</p>
                    </div>
                  )}
                </div>

                {/* Exercise list */}
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Exercises ({plan.rehab_plan_exercises?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plan.rehab_plan_exercises?.map((pe) => (
                    <ExerciseCard key={pe.id} planExercise={pe} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400 bg-white">
          © {new Date().getFullYear()} RehabTrack Physiotherapist Portal.
        </footer>
      </div>

      {showCreatePlan && (
        <CreatePlanModal
          patient={patient}
          onClose={() => setShowCreatePlan(false)}
          onPlanCreated={() => {
            setShowCreatePlan(false);
            fetchPatient();
          }}
        />
      )}
    </>
  );
}
