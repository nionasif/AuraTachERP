import React, { useCallback, useEffect, useState } from 'react';
import { Users, Network, CalendarCheck } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { api } from '../../services/api';
import { EmployeeRecord } from '../../types/erp';
import { Notice, cx } from '../ui/kit';
import { EmployeeDirectory } from '../hr/EmployeeDirectory';
import { OrgChart } from '../hr/OrgChart';
import { AttendancePanel } from '../hr/AttendancePanel';
import { EmployeeProfileModal } from '../hr/EmployeeProfileModal';
import { EmployeeFormModal } from '../hr/EmployeeFormModal';

interface Props {
  store: ReturnType<typeof useERPStore>;
}

type Tab = 'DIRECTORY' | 'CHART' | 'ATTENDANCE';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'DIRECTORY', label: 'Employees', icon: Users },
  { id: 'CHART', label: 'Org chart', icon: Network },
  { id: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck },
];

export const StaffWorkspaceView: React.FC<Props> = ({ store }) => {
  const user = store.state.currentUser;
  const canManage = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  const [tab, setTab] = useState<Tab>('DIRECTORY');
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewing, setViewing] = useState<EmployeeRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeRecord | null>(null);

  const load = useCallback(async () => {
    const res = await api.getEmployeesFastAPI();
    if (res.data) {
      setEmployees(res.data as EmployeeRecord[]);
      setError(null);
    } else {
      setError(res.status === 0 ? 'Cannot reach the server. Start the backend with “python run.py”.' : res.error || 'Could not load employees.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // keep the open profile fresh after edits
  const openProfile = (e: EmployeeRecord) => setViewing(employees.find(x => x.employee_id === e.employee_id) || e);
  const startEdit = (e: EmployeeRecord | null) => {
    setViewing(null);
    setEditing(e);
    setFormOpen(true);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                  tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        {tab === 'DIRECTORY' && (
          <EmployeeDirectory employees={employees} loading={loading} canManage={canManage} onOpen={openProfile} onEdit={startEdit} onAdd={() => startEdit(null)} />
        )}
        {tab === 'CHART' && <OrgChart employees={employees} onSelect={openProfile} />}
        {tab === 'ATTENDANCE' && <AttendancePanel canManage={canManage} myBadge={user?.employee_id} employees={employees} />}
      </div>

      {viewing && (
        <EmployeeProfileModal
          employee={viewing}
          allEmployees={employees}
          canManage={canManage}
          myBadge={user?.employee_id}
          onClose={() => setViewing(null)}
          onEdit={startEdit}
          onOpenOther={openProfile}
        />
      )}
      {formOpen && (
        <EmployeeFormModal
          employee={editing}
          allEmployees={employees}
          onClose={() => setFormOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
};
