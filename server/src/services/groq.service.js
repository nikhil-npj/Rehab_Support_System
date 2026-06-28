import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.GROQ_API_KEY || '';
console.log(`[Groq Service] Initializing with key length: ${key.length}, startsWith: ${key.substring(0, 8)}...`);
const groq = new Groq({ apiKey: key });

/**
 * Generates a clinical insight summary for a patient using Groq (Llama3).
 * @param {Object} patientData
 * @param {string} patientData.patientName
 * @param {string} patientData.injuryType
 * @param {Array}  patientData.last14DaysLogs  - [{ log_date, pain_level, mobility_level, adherence_score }]
 * @param {Array}  patientData.last14DaysRecovery - [{ score_date, score }]
 * @param {number} patientData.averageAdherence
 * @param {number} patientData.averageRecovery
 * @param {number} patientData.totalSessionsLogged
 * @returns {Promise<string>} The generated insight text
 */
export async function generatePatientInsight(patientData) {
  const {
    patientName,
    injuryType,
    last14DaysLogs,
    last14DaysRecovery,
    averageAdherence,
    averageRecovery,
    totalSessionsLogged,
  } = patientData;

  // Build a recovery score lookup by date
  const recoveryByDate = {};
  (last14DaysRecovery || []).forEach((r) => {
    recoveryByDate[r.score_date] = r.score;
  });

  // Format day-by-day progress table
  const progressTable = (last14DaysLogs || [])
    .map((log) => {
      const recScore = recoveryByDate[log.log_date] ?? '—';
      return `${log.log_date} | Pain: ${log.pain_level}/10 | Mobility: ${log.mobility_level}/10 | Adherence: ${log.adherence_score}% | Recovery Score: ${recScore}`;
    })
    .join('\n');

  const prompt = `You are an AI assistant helping a physiotherapist monitor patient rehabilitation progress.
Analyze the following patient data and generate a clinical insight summary.

Patient: ${patientName}
Injury: ${injuryType}
Total sessions logged: ${totalSessionsLogged}
Average adherence: ${averageAdherence}%
Average recovery score: ${averageRecovery}/100

Last 14 days progress data:
${progressTable || 'No detailed day-by-day data available.'}

Based on this data, provide:
1. A trend summary (2-3 sentences): Is the patient improving, plateauing, or declining?
2. Adherence assessment: Are they consistent with exercises?
3. One specific recommendation for the physiotherapist to consider
(DO NOT diagnose or prescribe — only suggest for professional review)

Keep the response concise, clinical, and professional. Under 150 words total.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });

  return completion.choices[0]?.message?.content;
}
