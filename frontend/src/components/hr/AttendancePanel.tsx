import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { AttendanceBoard, AttendanceBoardRow, EmployeeRecord } from '../../types/erp';
import { Avatar, Badge, Card, EmptyState, Input, Notice, cx } from '../ui/kit';
import { MyAttendanceCard } from './MyAttendanceCard';
import { MonthAttendance } from './MonthAttendance';
import { MarkAttendanceModal } from './MarkAttendanceModal';

interface Props {
  canManage: boolean;
  myBadge?: string;
  employees: EmployeeRecord[];
}

const today = () => {
  const d = new Date(); // local date (not UTC) so it matches the office day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const TONE: Record<string, 'green' | 'amber' | 'blue' | 'red' | 'gray'> = { PRESENT: 'green', LATE: 'amber', ON_LEAVE: 'blue', ABSENT: 'red', NOT_MARKED: 'gray' };
const LABEL: Record<string, string> = { PRESENT: 'Present', LATE: 'Late', ON_LEAVE: 'On leave', ABSENT: 'Absent', NOT_MARKED: 'Not marked' };

export const AttendancePanel: React.FC<Props> = ({ canManage, myBadge, employees }) => {
  const [day, setDay] = useState(today());
  const [board, setBoard] = useState<AttendanceBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<AttendanceBoardRow | null>(null);
  const [reload, setReload] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getAttendanceBoard(day);
    if (res.data) {
      setBoard(res.data);
      setError(null);
    } else {
      setError(res.error || 'Could not load attendance.');
    }
    setLoading(false);
  }, [day]);

  useEffect(() => {
    load();
  }, [load, reload]);

  const myName = employees.find(e => e.employee_id === myBadge)?.full_name;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="space-y-4">
        <MyAttendanceCard onChanged={() => setReload(n => n + 1)} />
        {myBadge && (
          <Card className="p-5">
            <MonthAttendance employeeId={myBadge} refreshKey={reload} />
          </Card>
        )}
      </div>

      <div className="xl:col-span-2 space-y-4">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Team attendance</h3>
              <p className="text-xs text-gray-500">Only people who have really checked in (or were recorded by HR) are counted.</p>
            </div>
            <Input type="date" value={day} max={today()} onChange={e => e.target.value && setDay(e.target.value)} className="w-auto" />
          </div>

          {board && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['PRESENT', 'LATE', 'ON_LEAVE', 'ABSENT', 'NOT_MARKED'] as const).map(k => (
                <div key={k} className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-[11px] text-gray-500">{LABEL[k]}</p>
                  <p className="text-xl font-bold text-gray-900">{board.counts[k]}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          {loading && !board && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}
          {error && (
            <div className="p-4">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          {board && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">In</th>
                    <th className="px-4 py-3">Out</th>
                    {canManage && <th className="px-4 py-3 w-24" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {board.rows.map(r => (
                    <tr key={r.employee_id} className={cx(r.employee_id === myBadge && 'bg-indigo-50/40')}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.full_name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {r.full_name} {r.employee_id === myBadge && <span className="text-xs text-indigo-600">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{r.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{r.check_in || '–'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.check_out || '–'}</td>
                      {canManage && (
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => setMarking(r)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                            {r.status === 'NOT_MARKED' ? 'Record' : 'Edit'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {board.rows.length === 0 && <EmptyState title="No one to show for this day" />}
            </div>
          )}
        </Card>
        {!canManage && myName && <p className="text-xs text-gray-400">Signed in as {myName}. Only HR can record attendance for other people.</p>}
      </div>

      {marking && (
        <MarkAttendanceModal
          employeeId={marking.employee_id}
          employeeName={marking.full_name}
          date={day}
          initial={{ status: marking.status === 'NOT_MARKED' ? undefined : marking.status, check_in: marking.check_in, check_out: marking.check_out, note: marking.note }}
          onClose={() => setMarking(null)}
          onSaved={() => setReload(n => n + 1)}
        />
      )}
    </div>
  );
};
