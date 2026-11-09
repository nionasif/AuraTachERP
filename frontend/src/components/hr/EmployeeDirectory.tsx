import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import { EmployeeRecord } from '../../types/erp';
import { Avatar, Badge, Button, Card, EmptyState, Input, Select } from '../ui/kit';

interface Props {
  employees: EmployeeRecord[];
  loading: boolean;
  canManage: boolean;
  onOpen: (e: EmployeeRecord) => void;
  onEdit: (e: EmployeeRecord) => void;
  onAdd: () => void;
}

export const EmployeeDirectory: React.FC<Props> = ({ employees, loading, canManage, onOpen, onEdit, onAdd }) => {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('ALL');
  const [status, setStatus] = useState('Active');

  const nameOf = useMemo(() => new Map(employees.map(e => [e.employee_id, e.full_name] as const)), [employees]);
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))).sort(), [employees]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter(e => status === 'ALL' || String(e.employment_status).toLowerCase() === status.toLowerCase())
      .filter(e => dept === 'ALL' || e.department === dept)
      .filter(
        e =>
          !q ||
          e.full_name.toLowerCase().includes(q) ||
          e.employee_id.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      )
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [employees, search, dept, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, title…" className="pl-9" />
        </div>
        <Select value={dept} onChange={e => setDept(e.target.value)} className="w-auto max-w-[220px]">
          <option value="ALL">All departments</option>
          {departments.map(d => (
            <option key={d}>{d}</option>
          ))}
        </Select>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-auto">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Terminated">Terminated</option>
          <option value="ALL">All</option>
        </Select>
        <span className="text-xs text-gray-500 ml-1">{rows.length} people</span>
        {canManage && (
          <Button className="ml-auto" onClick={onAdd}>
            <Plus className="w-4 h-4" /> Add employee
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Reports to</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(e => (
                <tr key={e.employee_id} className="hover:bg-gray-50/70 cursor-pointer" onClick={() => onOpen(e)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.full_name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{e.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {e.designation} · {e.employee_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.department}</td>
                  <td className="px-4 py-3 text-gray-600">{e.reports_to ? nameOf.get(e.reports_to) || e.reports_to : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.joining_date}</td>
                  <td className="px-4 py-3">
                    <Badge tone={String(e.employment_status).toLowerCase() === 'active' ? 'green' : 'gray'}>{e.employment_status}</Badge>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          onEdit(e);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                        aria-label={`Edit ${e.full_name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <EmptyState title={loading ? 'Loading…' : 'No employees found'} text={loading ? undefined : 'Try a different search or filter.'} />}
      </Card>
    </div>
  );
};
