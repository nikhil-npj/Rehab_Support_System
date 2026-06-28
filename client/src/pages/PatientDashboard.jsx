import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import api from '../services/api';
import ActivityCalendar from '../components/ActivityCalendar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Spinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <svg
        className="animate-spin h-8 w-8 text-teal-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function StatCard({ label, value, sub, color = 'teal' }) {
  const colorMap = {
    teal: 'bg-teal-50 border-teal-100 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
      <div className="mb-4">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltipContent({ active, payload, label, valueLabel = 'Value', unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-2 text-sm">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-teal-600">
          {valueLabel}: <span className="font-bold">{payload[0].value}{unit}</span>
        </p>
      </div>
    );
  }
  return null;
}

// ─── Tab 1: My Plan ──────────────────────────────────────────────────────────

function MyPlanTab({ planData }) {
  if (!planData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
        <p className="text-base font-medium text-slate-500">No rehab plan assigned yet</p>
        <p className="text-sm">Your physiotherapist hasn't assigned a plan yet.</p>
      </div>
    );
  }

  const { patient_profile, physio_name, plan } = planData;
  const exercises = plan?.rehab_plan_exercises || [];

  return (
    <div className="space-y-6">
      {/* Physio & Injury Info */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Your Physiotherapist</p>
            <p className="text-lg font-bold">Dr. {physio_name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs text-teal-100 font-medium">Injury Type</p>
            <p className="font-semibold capitalize">{patient_profile?.injury_type?.replace(/_/g, ' ') || '—'}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs text-teal-100 font-medium">Started</p>
            <p className="font-semibold">
              {patient_profile?.start_date
                ? new Date(patient_profile.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Dietary Notes */}
      {plan?.dietary_notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M9 8.25v-1.5M3 16.5h18" />
            </svg>
            <h4 className="font-semibold text-amber-800">Dietary Notes</h4>
          </div>
          <p className="text-sm text-amber-700">{plan.dietary_notes}</p>
        </div>
      )}

      {/* Exercise List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''} in Your Plan
        </h3>
        <div className="space-y-3">
          {exercises.map((pe, idx) => (
            <div key={pe.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{pe.exercises?.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{pe.exercises?.description}</p>
                    {pe.notes && (
                      <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-2 py-1 mt-2 inline-block">
                        Note: {pe.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pl-11">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  {pe.sets} sets × {pe.reps} reps
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  {pe.frequency}
                </span>
                {pe.duration_seconds && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {pe.duration_seconds}s hold
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slider Component ────────────────────────────────────────────────────────

function StyledSlider({ id, value, onChange, min = 1, max = 10, leftLabel, rightLabel, color = '#0e9594' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 font-medium">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Tab 2: Today's Log ──────────────────────────────────────────────────────

function TodaysLogTab({ planData, todayLog, onSubmitSuccess }) {
  const exercises = planData?.plan?.rehab_plan_exercises || [];

  const [checkedExercises, setCheckedExercises] = useState({});
  const [painLevel, setPainLevel] = useState(5);
  const [mobilityLevel, setMobilityLevel] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState('');

  // Pre-fill from today's log if it exists
  useEffect(() => {
    if (todayLog?.daily_log) {
      setPainLevel(todayLog.daily_log.pain_level || 5);
      setMobilityLevel(todayLog.daily_log.mobility_level || 5);
    }
    if (todayLog?.exercise_logs?.length > 0) {
      const initChecked = {};
      todayLog.exercise_logs.forEach((el) => {
        initChecked[el.exercise_id] = el.completed;
      });
      setCheckedExercises(initChecked);
    } else {
      // Initialize all unchecked
      const initChecked = {};
      exercises.forEach((pe) => { initChecked[pe.exercises?.id] = false; });
      setCheckedExercises(initChecked);
    }
  }, [todayLog, exercises.length]);

  const toggleExercise = (exerciseId) => {
    setCheckedExercises((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const exercise_completions = exercises.map((pe) => ({
        exercise_id: pe.exercises?.id,
        completed: !!checkedExercises[pe.exercises?.id],
      }));

      const response = await api.post('/logs', {
        pain_level: painLevel,
        mobility_level: mobilityLevel,
        exercise_completions,
      });

      setSubmitResult(response.data);
      onSubmitSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyLogged = !!todayLog?.daily_log;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Daily Check-in</h3>
          <p className="text-sm text-slate-500 mt-0.5">{todayLabel()}</p>
        </div>
        {alreadyLogged && !submitResult && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Already logged today
          </span>
        )}
      </div>

      {/* Already logged notice */}
      {alreadyLogged && !submitResult && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-700 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          You already logged today. Here is your summary — you can update it below if needed.
        </div>
      )}

      {/* Success card */}
      {submitResult && (
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h4 className="font-bold text-lg">Log submitted!</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-xs text-teal-100 font-medium">Adherence Today</p>
              <p className="text-3xl font-bold">{submitResult.adherence_score}%</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-xs text-teal-100 font-medium">Recovery Score</p>
              <p className="text-3xl font-bold">{submitResult.recovery_score}<span className="text-lg font-medium text-teal-100">/100</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Checklist */}
      {exercises.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Today's Exercises
          </h4>
          <div className="space-y-3">
            {exercises.map((pe) => {
              const exId = pe.exercises?.id;
              const isChecked = !!checkedExercises[exId];
              return (
                <label
                  key={pe.id}
                  htmlFor={`ex-${exId}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isChecked
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      id={`ex-${exId}`}
                      checked={isChecked}
                      onChange={() => toggleExercise(exId)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      isChecked ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className={`font-semibold text-sm ${isChecked ? 'text-teal-800 line-through opacity-70' : 'text-slate-800'}`}>
                      {pe.exercises?.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {pe.sets} sets × {pe.reps} reps · {pe.frequency}
                    </p>
                  </div>
                  {isChecked && (
                    <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full flex-shrink-0">Done</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Pain Level Slider */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">Pain Level</h4>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              painLevel <= 3 ? 'bg-emerald-100 text-emerald-700' :
              painLevel <= 6 ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {painLevel}
            </div>
            <span className="text-sm text-slate-500">/ 10</span>
          </div>
        </div>
        <StyledSlider
          id="pain-slider"
          value={painLevel}
          onChange={setPainLevel}
          leftLabel="No Pain (1)"
          rightLabel="Severe Pain (10)"
          color={painLevel <= 3 ? '#10b981' : painLevel <= 6 ? '#f59e0b' : '#f43f5e'}
        />
      </div>

      {/* Mobility Level Slider */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">Mobility Level</h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
              {mobilityLevel}
            </div>
            <span className="text-sm text-slate-500">/ 10</span>
          </div>
        </div>
        <StyledSlider
          id="mobility-slider"
          value={mobilityLevel}
          onChange={setMobilityLevel}
          leftLabel="Very Limited (1)"
          rightLabel="Full Mobility (10)"
          color="#0e9594"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-4 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !planData}
        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 text-base shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : alreadyLogged ? 'Update Today\'s Log' : 'Submit Today\'s Log'}
      </button>
    </div>
  );
}

// ─── Tab 3: My Progress ──────────────────────────────────────────────────────

function MyProgressTab() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().split('T')[0].substring(0, 7);
  });
  const [calendarLogs, setCalendarLogs] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get('/progress');
      setProgressData(res.data || []);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCalendarLogs = useCallback(async (monthStr) => {
    setCalendarLoading(true);
    try {
      const res = await api.get(`/logs/calendar?month=${monthStr}`);
      setCalendarLogs(res.data || []);
    } catch (err) {
      console.error('Error fetching calendar logs:', err);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchCalendarLogs(currentMonth);
  }, [currentMonth, fetchCalendarLogs]);

  if (loading) return <Spinner message="Loading your progress..." />;

  if (progressData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        <p className="text-base font-medium text-slate-500">No progress data yet</p>
        <p className="text-sm">Submit your daily log to start tracking!</p>
      </div>
    );
  }

  const chartData = progressData.map((d) => ({
    ...d,
    date: formatDate(d.score_date),
  }));

  // Last 7 days stats
  const last7 = progressData.slice(-7);
  const avgRecovery = last7.length > 0
    ? Math.round(last7.reduce((s, d) => s + d.score, 0) / last7.length)
    : 0;
  const avgAdherence = last7.length > 0
    ? Math.round(last7.reduce((s, d) => s + (d.adherence_score || 0), 0) / last7.length)
    : 0;
  const totalSessions = progressData.length;

  const chartStyle = {
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg Recovery" value={`${avgRecovery}`} sub="Last 7 days (out of 100)" color="teal" />
        <StatCard label="Avg Adherence" value={`${avgAdherence}%`} sub="Last 7 days" color="indigo" />
        <StatCard label="Total Sessions" value={totalSessions} sub="Days logged" color="amber" />
      </div>

      {/* Activity Calendar Section */}
      <div className="flex justify-center">
        {calendarLoading ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-full max-w-sm flex items-center justify-center text-slate-400 min-h-[250px] shadow-sm">
            <svg className="animate-spin h-5 w-5 text-teal-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading calendar...</span>
          </div>
        ) : (
          <ActivityCalendar
            logs={calendarLogs}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
      </div>

      {/* Recovery Score Chart */}
      <ChartCard title="Recovery Score" subtitle="Overall recovery score (0–100) over last 14 days">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={chartStyle} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={chartStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipContent valueLabel="Recovery" unit="/100" />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0e9594"
              strokeWidth={2.5}
              dot={{ fill: '#0e9594', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#0e9594' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Adherence Chart */}
      <ChartCard title="Exercise Adherence" subtitle="Percentage of exercises completed each day">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={chartStyle} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={chartStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipContent valueLabel="Adherence" unit="%" />} />
            <Line
              type="monotone"
              dataKey="adherence_score"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pain Trend Chart */}
      <ChartCard title="Pain Trend" subtitle="Lower is better — aim to reduce pain over time">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={chartStyle} axisLine={false} tickLine={false} />
            <YAxis domain={[1, 10]} tick={chartStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipContent valueLabel="Pain" unit="/10" />} />
            <Line
              type="monotone"
              dataKey="pain_level"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ fill: '#f43f5e', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#f43f5e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Tab 4: Insights ────────────────────────────────────────────────────────

function InsightsTab() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights/approved')
      .then((res) => setInsights(res.data))
      .catch((err) => console.error('Error fetching insights:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner message="Loading insights..." />;
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.04a2.25 2.25 0 0 1 2.134 0l7.5 4.04a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-500 text-center">No messages yet</p>
        <p className="text-sm text-center max-w-xs">
          Your physiotherapist will send you updates as you progress through your rehabilitation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.04a2.25 2.25 0 0 1 2.134 0l7.5 4.04a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Messages from Your Physiotherapist</h3>
          <p className="text-xs text-slate-400">{insights.length} message{insights.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {insights.map((insight) => {
        const date = new Date(insight.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        });
        return (
          <div
            key={insight.id}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            style={{ borderLeft: '4px solid #0d9488' }}
          >
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 font-medium">{date}</p>
                <span className="text-xs text-slate-400 italic">From your physiotherapist</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{insight.final_content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'plan', label: 'My Plan' },
  { id: 'log', label: "Today's Log" },
  { id: 'progress', label: 'My Progress' },
  { id: 'insights', label: 'Insights' },
];

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('plan');
  const navigate = useNavigate();

  const fetchTodayLog = useCallback(async () => {
    try {
      const res = await api.get('/logs/today');
      setTodayLog(res.data);
    } catch (err) {
      console.error("Error fetching today's log:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Verify auth + role
        const authRes = await api.get('/auth/me');
        const userProfile = authRes.data;
        if (userProfile.role !== 'patient') {
          navigate('/physio/dashboard');
          return;
        }
        setProfile(userProfile);

        // 2. Fetch plan
        const planRes = await api.get('/patient/plan');
        setPlanData(planRes.data);

        // 3. Fetch today's log
        await fetchTodayLog();
      } catch (err) {
        console.error('Error initialising patient dashboard:', err);
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setErrorMsg('Unauthorized access or profile not found. Please log in.');
          setTimeout(() => navigate('/login'), 3000);
        } else if (err?.response?.status === 404) {
          // No plan yet is OK — don't show error
          try {
            const authRes = await api.get('/auth/me');
            setProfile(authRes.data);
          } catch (_) {}
        } else {
          console.warn('Dashboard init non-fatal error:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, fetchTodayLog]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Spinner message="Loading your dashboard..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal-500 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-teal-600">RehabTrack</span>
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

      {/* Welcome Banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 py-5 max-w-4xl">
          <h2 className="text-xl font-bold text-slate-800">
            Welcome back, <span className="text-teal-600">{profile?.name}</span> 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Track your recovery, log daily progress, and stay on top of your rehab plan.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-100 sticky top-[73px] z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                }`}
              >
                {tab.label}
                {tab.id === 'log' && todayLog?.daily_log && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-teal-400 inline-block" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-4xl">
        {activeTab === 'plan' && <MyPlanTab planData={planData} />}
        {activeTab === 'log' && (
          <TodaysLogTab
            planData={planData}
            todayLog={todayLog}
            onSubmitSuccess={fetchTodayLog}
          />
        )}
        {activeTab === 'progress' && <MyProgressTab />}
        {activeTab === 'insights' && <InsightsTab />}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        © {new Date().getFullYear()} RehabTrack Patient Portal.
      </footer>

      {/* Slider thumb styles */}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0e9594;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 8px rgba(14, 149, 148, 0.3);
        }
        input[type='range']::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          border: 3px solid #0e9594;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
      `}</style>
    </div>
  );
}
