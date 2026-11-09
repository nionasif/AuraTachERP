import React, { useCallback, useEffect, useState } from 'react';
import { Users, UserCheck, LifeBuoy, FolderKanban, ArrowRight, Network } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { api } from '../../services/api';
import { AttendanceBoard } from '../../types/erp';
import { Card, Avatar, Badge, cx } from '../ui/kit';
import { MyAttendanceCard } from '../hr/MyAttendanceCard';

interface Props {
  store: ReturnType<typeof useERPStore>;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const StatCard: React.FC<{ label: string; value: string | number; hint?: string; icon: React.ElementType; tone: string; onClick?: () => void }> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
}) => (
  <Card className={cx('p-5', onClick && 'cursor-pointer hover:border-indigo-300 transition')} onClick={onClick}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1.5 text-3xl font-bold text-gray-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
      <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center', tone)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </Card>
);

export const ManagementDashboard: React.FC<Props> = ({ store }) => {
  const { state, setView } = store;
  const [board, setBoard] = useState<AttendanceBoard | null>(null);

  const loadBoard = useCallback(async () => {
    const res = await api.getAttendanceBoard();
    if (res.data) setBoard(res.data);
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const openTickets = state.helpDeskTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const activeProjects = state.projects.filter(p => p.status === 'IN_PROGRESS').length;
  const present = board ? board.counts.PRESENT + board.counts.LATE : 0;

  const firstName = (state.currentUser?.name || '').split(' ')[0];
  const checkedIn = board ? board.rows.filter(r => r.status === 'PRESENT' || r.status === 'LATE').slice(0, 6) : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {greeting()}, {firstName} 👋
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Here is what is happening today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Employees" value={board ? board.total : '–'} hint="Active team members" icon={Users} tone="bg-indigo-50 text-indigo-600" onClick={() => setView('STAFF')} />
          <StatCard
            label="Present today"
            value={board ? present : '–'}
            hint={board ? `${board.counts.NOT_MARKED} not checked in yet` : undefined}
            icon={UserCheck}
            tone="bg-emerald-50 text-emerald-600"
            onClick={() => setView('STAFF')}
          />
          <StatCard label="Open support tickets" value={openTickets} icon={LifeBuoy} tone="bg-orange-50 text-orange-600" onClick={() => setView('REPAIR')} />
          <StatCard label="Active projects" value={activeProjects} icon={FolderKanban} tone="bg-sky-50 text-sky-600" onClick={() => setView('ECOMMERCE')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MyAttendanceCard onChanged={loadBoard} />

          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Who is in today</h3>
              <button onClick={() => setView('STAFF')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                See all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!board ? (
              <p className="text-sm text-gray-500 py-8 text-center">Attendance will appear here once the backend is connected.</p>
            ) : checkedIn.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">Nobody has checked in yet today.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {checkedIn.map(r => (
                  <li key={r.employee_id} className="py-2.5 flex items-center gap-3">
                    <Avatar name={r.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{r.designation}</p>
                    </div>
                    <span className="text-xs text-gray-500">{r.check_in}</span>
                    <Badge tone={r.status === 'LATE' ? 'amber' : 'green'}>{r.status === 'LATE' ? 'Late' : 'On time'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Company org chart</p>
              <p className="text-xs text-gray-500">See who reports to whom, from the top down.</p>
            </div>
          </div>
          <button onClick={() => setView('STAFF')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 self-end sm:self-auto">
            Open <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      </div>
    </div>
  );
};
