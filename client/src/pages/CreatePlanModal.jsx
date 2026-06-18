import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FREQUENCY_OPTIONS = ['Daily', '2x Daily', 'Every Other Day', '3x/Week', 'Weekly'];

export default function CreatePlanModal({ patient, onClose, onPlanCreated }) {
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState({});
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingExercises, setFetchingExercises] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const injuryType = patient?.injury_type;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const params = injuryType && injuryType !== 'other'
          ? `?injury_type=${injuryType}`
          : '';
        const res = await api.get(`/exercises${params}`);
        setExercises(res.data);
      } catch (err) {
        setErrorMsg('Failed to load exercise library');
      } finally {
        setFetchingExercises(false);
      }
    };
    fetchExercises();
  }, [injuryType]);

  const toggleExercise = (exerciseId) => {
    setSelectedExercises((prev) => {
      if (prev[exerciseId]) {
        const next = { ...prev };
        delete next[exerciseId];
        return next;
      }
      return {
        ...prev,
        [exerciseId]: {
          exercise_id: exerciseId,
          sets: 3,
          reps: 10,
          frequency: 'Daily',
          duration_seconds: 30,
          notes: '',
        },
      };
    });
  };

  const updateExerciseField = (exerciseId, field, value) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exerciseList = Object.values(selectedExercises);

    if (exerciseList.length === 0) {
      setErrorMsg('Please select at least one exercise');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.post('/plans', {
        patient_profile_id: patient.id,
        dietary_notes: dietaryNotes,
        exercises: exerciseList,
      });
      onPlanCreated();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to create rehab plan');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.keys(selectedExercises).length;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-brand-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Create Rehab Plan</h2>
              <p className="text-xs text-slate-400">for {patient?.profiles?.name}</p>
            </div>
          </div>
          <button
            id="close-plan-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {errorMsg && (
            <div className="p-3 rounded-lg mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600">
              {errorMsg}
            </div>
          )}

          {/* Exercise library section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Exercise Library
                {injuryType && injuryType !== 'other' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 normal-case tracking-normal">
                    {injuryType.replace('_', ' ')}
                  </span>
                )}
              </h3>
              {selectedCount > 0 && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  {selectedCount} selected
                </span>
              )}
            </div>

            {fetchingExercises ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex) => {
                  const isSelected = !!selectedExercises[ex.id];
                  return (
                    <div key={ex.id}>
                      {/* Exercise toggle card */}
                      <button
                        type="button"
                        id={`exercise-toggle-${ex.id}`}
                        onClick={() => toggleExercise(ex.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-brand-400 bg-brand-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                            isSelected
                              ? 'bg-brand-500 border-brand-500'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${isSelected ? 'text-brand-800' : 'text-slate-800'}`}>{ex.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ex.description}</p>
                          </div>
                        </div>
                      </button>

                      {/* Expanded config when selected */}
                      {isSelected && (
                        <div className="ml-8 mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-slate-400 block mb-1">Sets</label>
                              <input
                                type="number"
                                min="1"
                                value={selectedExercises[ex.id].sets}
                                onChange={(e) => updateExerciseField(ex.id, 'sets', parseInt(e.target.value))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-400 block mb-1">Reps</label>
                              <input
                                type="number"
                                min="1"
                                value={selectedExercises[ex.id].reps}
                                onChange={(e) => updateExerciseField(ex.id, 'reps', parseInt(e.target.value))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-400 block mb-1">Duration (s)</label>
                              <input
                                type="number"
                                min="5"
                                value={selectedExercises[ex.id].duration_seconds}
                                onChange={(e) => updateExerciseField(ex.id, 'duration_seconds', parseInt(e.target.value))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-400 block mb-1">Frequency</label>
                            <select
                              value={selectedExercises[ex.id].frequency}
                              onChange={(e) => updateExerciseField(ex.id, 'frequency', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            >
                              {FREQUENCY_OPTIONS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-400 block mb-1">Exercise Notes</label>
                            <input
                              type="text"
                              value={selectedExercises[ex.id].notes}
                              onChange={(e) => updateExerciseField(ex.id, 'notes', e.target.value)}
                              placeholder="Any specific instructions..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dietary notes */}
          <div>
            <label htmlFor="dietary-notes" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Dietary & Lifestyle Notes <span className="text-slate-400 normal-case font-normal">(Optional)</span>
            </label>
            <textarea
              id="dietary-notes"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="Nutrition recommendations, hydration, sleep advice..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            id="submit-create-plan"
            onClick={handleSubmit}
            disabled={loading || selectedCount === 0}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                Assign Plan ({selectedCount} exercise{selectedCount !== 1 ? 's' : ''})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
