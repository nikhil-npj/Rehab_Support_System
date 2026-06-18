import React, { useState } from 'react';
import api from '../services/api';

const INJURY_TYPES = [
  { value: 'ACL', label: 'ACL Tear / Reconstruction' },
  { value: 'disc_bulge', label: 'Disc Bulge / Herniation' },
  { value: 'shoulder', label: 'Shoulder Injury' },
  { value: 'ankle_sprain', label: 'Ankle Sprain' },
  { value: 'other', label: 'Other' },
];

export default function AddPatientModal({ onClose, onPatientAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [injuryType, setInjuryType] = useState('ACL');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [credentials, setCredentials] = useState(null); // success state
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/patients', {
        name,
        email,
        injury_type: injuryType,
        notes,
      });
      setCredentials(res.data.credentials);
      onPatientAdded(); // refresh the patient list in the background
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `Email: ${credentials.email}\nTemporary Password: ${credentials.temp_password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-brand-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {credentials ? 'Patient Created!' : 'Add New Patient'}
            </h2>
          </div>
          <button
            id="close-add-patient-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── SUCCESS SCREEN ── */}
          {credentials ? (
            <div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-sm text-slate-600 mb-5">
                Patient account created successfully! Share these login credentials with <strong>{name}</strong>:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                  <p className="text-sm font-mono font-medium text-slate-800 mt-0.5 select-all">{credentials.email}</p>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temporary Password</span>
                  <p className="text-xl font-mono font-bold text-brand-600 mt-0.5 tracking-widest select-all">{credentials.temp_password}</p>
                </div>
              </div>

              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                ⚠️ Share this password securely. The patient should change it after their first login.
              </p>

              <div className="flex gap-3">
                <button
                  id="copy-credentials-btn"
                  onClick={handleCopy}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  id="done-add-patient-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ── CREATE FORM ── */
            <>
              {errorMsg && (
                <div className="p-3 rounded-lg mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-600">
                  {errorMsg}
                </div>
              )}

              <form id="add-patient-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Name */}
                <div>
                  <label htmlFor="patient-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Patient Name</label>
                  <input
                    id="patient-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Patient Email */}
                <div>
                  <label htmlFor="patient-email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Patient Email</label>
                  <input
                    id="patient-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@email.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Injury Type */}
                <div>
                  <label htmlFor="injury-type" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Injury Type</label>
                  <select
                    id="injury-type"
                    value={injuryType}
                    onChange={(e) => setInjuryType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200"
                  >
                    {INJURY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="patient-notes" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Clinical Notes <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="patient-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Initial assessment notes, relevant history..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-add-patient"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Create Patient Account'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
