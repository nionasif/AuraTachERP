import React, { useState } from 'react';
import { Mail, Phone, Building2, CalendarDays, MapPin, Pencil, ChevronRight } from 'lucide-react';
import { AttendanceDay, EmployeeRecord } from '../../types/erp';
import { Avatar, Badge, Button, Modal } from '../ui/kit';
import { MonthAttendance } from './MonthAttendance';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { buildChildren, chainOfCommand, isActive } from './orgUtils';

interface Props {
  employee: EmployeeRecord;
  allEmployees: EmployeeRecord[];
  canManage: boolean;
  /** badge id of the logged-in user, so people can see their own attendance */
  myBadge?: string;
  onClose: () => void;
  onEdit: (e: EmployeeRecord) => void;
  onOpenOther: (e: EmployeeRecord) => void;
}

export const EmployeeProfileModal: React.FC<Props> = ({ employee, allEmployees, canManage, myBadge, onClose, onEdit, onOpenOther }) => {
  const [markDay, setMarkDay] = useState<AttendanceDay | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const chain = chainOfCommand(employee.employee_id, allEmployees);
  const team = (buildChildren(allEmployees.filter(isActive)).get(employee.employee_id) || []).slice();
  const canSeeAttendance = canManage || myBadge === employee.employee_id;

  return (
    <Modal
      title={employee.full_name}
      subtitle={`${employee.employee_id} · ${employee.designation}`}
      onClose={onClose}
      wide
      footer={
        canManage ? (
          <Button variant="secondary" onClick={() => onEdit(employee)}>
            <Pencil className="w-4 h-4" /> Edit employee
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={employee.full_name} size="lg" />
            <div>
              <Badge tone={isActive(employee) ? 'green' : 'gray'}>{employee.employment_status}</Badge>
              <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{employee.email}</span></li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {employee.phone}</li>
            <li className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> {employee.department}</li>
            <li className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-400" /> Joined {employee.joining_date}</li>
            {employee.address && <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {employee.address}</li>}
          </ul>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Reports to</p>
            {chain.length === 0 ? (
              <p className="text-sm text-gray-400">No manager set</p>
            ) : (
              <div className="flex flex-wrap items-center gap-1 text-sm">
                {chain.map((m, i) => (
                  <React.Fragment key={m.employee_id}>
                    {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                    <button onClick={() => onOpenOther(m)} className="font-medium text-indigo-600 hover:underline">
                      {m.full_name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Direct reports ({team.length})</p>
            {team.length === 0 ? (
              <p className="text-sm text-gray-400">Nobody reports to this person</p>
            ) : (
              <ul className="space-y-1.5">
                {team.map(t => (
                  <li key={t.employee_id}>
                    <button onClick={() => onOpenOther(t)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600">
                      <Avatar name={t.full_name} size="sm" /> {t.full_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: attendance */}
        <div className="md:col-span-3">
          {canSeeAttendance ? (
            <MonthAttendance
              employeeId={employee.employee_id}
              canMark={canManage}
              onMarkDay={setMarkDay}
              refreshKey={refreshKey}
            />
          ) : (
            <p className="text-sm text-gray-400">Attendance is only visible to the employee and HR.</p>
          )}
        </div>
      </div>

      {markDay && (
        <MarkAttendanceModal
          employeeId={employee.employee_id}
          employeeName={employee.full_name}
          date={markDay.date}
          initial={{ status: markDay.status, check_in: markDay.check_in, check_out: markDay.check_out, note: markDay.note }}
          onClose={() => setMarkDay(null)}
          onSaved={() => setRefreshKey(k => k + 1)}
        />
      )}
    </Modal>
  );
};
