import React from 'react';

/**
 * Renders a monthly calendar grid showing patient activity adherence scores.
 * 
 * @param {Object} props
 * @param {Array}  props.logs            - [{ log_date, adherence_score }]
 * @param {string} props.month           - Format 'YYYY-MM'
 * @param {Function} props.onMonthChange - Callback when month changes (prev/next)
 */
export default function ActivityCalendar({ logs = [], month, onMonthChange }) {
  const defaultMonth = new Date().toISOString().split('T')[0].substring(0, 7);
  const activeMonth = month || defaultMonth;
  const [year, monthIndexStr] = activeMonth.split('-');
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(monthIndexStr, 10) - 1;

  const monthName = new Date(yearNum, monthNum).toLocaleString('default', { month: 'long' });
  const firstDayOfWeek = new Date(yearNum, monthNum, 1).getDay();
  const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();

  const blankCells = Array(firstDayOfWeek).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    let newMonthVal = monthNum; // same as (monthNum - 1) + 1 (since 0-indexed)
    let newYear = yearNum;
    if (newMonthVal === 0) {
      newMonthVal = 12;
      newYear -= 1;
    }
    const newMonthStr = String(newMonthVal).padStart(2, '0');
    if (onMonthChange) {
      onMonthChange(`${newYear}-${newMonthStr}`);
    }
  };

  const handleNextMonth = () => {
    let newMonthVal = monthNum + 2; // (monthNum + 1) + 1 (since 0-indexed)
    let newYear = yearNum;
    if (newMonthVal === 13) {
      newMonthVal = 1;
      newYear += 1;
    }
    const newMonthStr = String(newMonthVal).padStart(2, '0');
    if (onMonthChange) {
      onMonthChange(`${newYear}-${newMonthStr}`);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
      {/* Month/Year Header & Nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-base">{monthName} {year}</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Sun-Sat week header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-semibold text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {blankCells.map((_, idx) => (
            <div key={`blank-${idx}`} className="w-10 h-10"></div>
          ))}
          {dayCells.map((day) => {
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${year}-${monthIndexStr}-${dayStr}`;

            const log = logs.find((l) => l.log_date === dateKey);

            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = dateKey === todayStr;
            const isFuture = dateKey > todayStr;

            let cellClass = "";
            if (isFuture) {
              cellClass = "bg-white text-slate-300 border border-slate-100";
            } else if (log) {
              if (log.adherence_score >= 80) {
                cellClass = "bg-green-400 text-white font-semibold";
              } else if (log.adherence_score >= 50) {
                cellClass = "bg-yellow-400 text-slate-900 font-semibold";
              } else {
                cellClass = "bg-red-400 text-white font-semibold";
              }
            } else {
              cellClass = "bg-gray-100 text-slate-400";
            }

            const todayHighlight = isToday
              ? "border-2 border-teal-500 ring-2 ring-teal-500/20"
              : "border border-slate-100/50";

            return (
              <div
                key={day}
                title={log ? `Adherence: ${log.adherence_score}%` : 'No log'}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-medium transition-colors select-none ${cellClass} ${todayHighlight}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>
          <span>Good (≥80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
          <span>Partial (≥50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <span>Missed (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-gray-100 border border-slate-200 inline-block"></span>
          <span>No log</span>
        </div>
      </div>
    </div>
  );
}
