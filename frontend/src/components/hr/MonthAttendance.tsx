import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { AttendanceDay, AttendanceDayStatus, AttendanceMonth } from '../../types/erp';
import { Notice, cx } from '../ui/kit';

interface Props {
  employeeId: string;
  /** HR / admin can click a day to record attendance */
  canMark?: boolean;
  onMarkDay?: (day: AttendanceDay) => void;
  /** change this number to force a reload (e.g. after marking) */
  refreshKey?: number;
}

const CELL: Record<AttendanceDayStatus, { box: string; label: string }> = {
  PRESENT: { box: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Present' },
  LATE: { box: 'bg-orange-50 border-orange-200 text-orange-800', label: 'Late' },
  ON_LEAVE: { box: 'bg-sky-50 border-sky-200 text-sky-800', label: 'Leave' },
  ABSENT: { box: 'bg-rose-50 border-rose-200 text-rose-800', label: 'Absent' },
  WEEKEND: { box: 'bg-gray-100 border-gray-100 text-gray-400', label: 'Weekend' },
  NOT_JOINED: { box: 'bg-white border-dashed border-gray-200 text-gray-300', label: '' },
  UPCOMING: { box: 'bg-white border-gray-100 text-gray-300', label: '' },
  NO_RECORD: { box: 'bg-white border-gray-200 text-gray-400', label: 'No record' },
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthAttendance: React.FC<Props> = ({ employeeId, canMark, onMarkDay, refreshKey = 0 }) => {
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [data, setData] = useState<AttendanceMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getEmployeeAttendance(employeeId, monthKey(cursor));
    if (res.data) {
      setData(res.data);
      setError(null);
    } else {
      setData(null);
      setError(res.error || 'Could not load attendance.');
    }
    setLoading(false);
  }, [employeeId, cursor]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const shift = (n: number) => setCursor(c => new Date(c.getFullYear(), c.getMonth() + n, 1));
  const isCurrentMonth = monthKey(cursor) === monthKey(new Date());

  // Leading blanks so day 1 lands under the right weekday (Sunday-first grid)
  const lead = data ? new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900">{data?.month_label || cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h4>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => shift(1)} disabled={isCurrentMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
      {!loading && error && <Notice tone="error">{error}</Notice>}

      {!loading && data && (
        <>
          <div className="flex flex-wrap gap-2 mb-3 text-xs">
            {[
              ['Present', data.summary.PRESENT, 'bg-emerald-50 text-emerald-700'],
              ['Late', data.summary.LATE, 'bg-orange-50 text-orange-700'],
              ['Leave', data.summary.ON_LEAVE, 'bg-sky-50 text-sky-700'],
              ['Absent', data.summary.ABSENT, 'bg-rose-50 text-rose-700'],
            ].map(([label, n, tone]) => (
              <span key={label as string} className={cx('rounded-full px-2.5 py-1 font-semibold', tone as string)}>
                {label}: {n}
              </span>
            ))}
          </div>

          {data.summary.recorded_days === 0 && (
            <p className="text-xs text-gray-500 mb-3">No attendance has been recorded for this month yet.</p>
          )}

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEK.map(w => (
              <div key={w} className="text-[11px] font-semibold text-gray-400 pb-1">
                {w}
              </div>
            ))}
            {Array.from({ length: lead }).map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {data.days.map(d => {
              const c = CELL[d.status];
              const clickable = !!canMark && (d.status === 'PRESENT' || d.status === 'LATE' || d.status === 'ON_LEAVE' || d.status === 'ABSENT' || d.status === 'NO_RECORD' || d.status === 'WEEKEND');
              const dayNo = Number(d.date.slice(8));
              const tip = [c.label, d.check_in && `in ${d.check_in}`, d.check_out && `out ${d.check_out}`, d.note].filter(Boolean).join(' · ');
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onMarkDay?.(d)}
                  title={tip}
                  className={cx('rounded-lg border px-1 py-1.5 min-h-[52px] flex flex-col items-center justify-start', c.box, clickable ? 'hover:ring-2 hover:ring-indigo-300 cursor-pointer' : 'cursor-default')}
                >
                  <span className="text-xs font-bold leading-none">{dayNo}</span>
                  {d.check_in ? (
                    <span className="text-[10px] mt-1 leading-tight">{d.check_in}</span>
                  ) : (
                    <span className="text-[9px] mt-1 leading-tight">{c.label}</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Only real check-ins and entries made by HR are shown. Days with no entry stay blank.</p>
        </>
      )}
    </div>
  );
};
