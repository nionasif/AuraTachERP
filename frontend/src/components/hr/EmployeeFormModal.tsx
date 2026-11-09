import React, { useMemo, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeRecord } from '../../types/erp';
import { Button, Field, Input, Modal, Notice, Select } from '../ui/kit';
import { descendantsOf, isActive } from './orgUtils';

interface Props {
  /** null = adding a new employee */
  employee: EmployeeRecord | null;
  allEmployees: EmployeeRecord[];
  onClose: () => void;
  onSaved: () => void;
}

const ROLES = ['Employee', 'Project Manager', 'Sales Manager', 'Finance Manager', 'HR Manager', 'Super Admin'];

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const nextBadge = (list: EmployeeRecord[]) => {
  let max = 0;
  for (const e of list) {
    const n = parseInt(String(e.employee_id).replace(/\D/g, ''), 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `EMP-${String(max + 1).padStart(3, '0')}`;
};

export const EmployeeFormModal: React.FC<Props> = ({ employee, allEmployees, onClose, onSaved }) => {
  const editing = !!employee;
  const [form, setForm] = useState({
    full_name: employee?.full_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    joining_date: employee?.joining_date || localToday(),
    employment_status: employee?.employment_status || 'Active',
    salary: employee?.salary ?? 0,
    reports_to: employee?.reports_to || '',
    create_login: false,
    username: '',
    password: '',
    role: 'Employee',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Who can be chosen as manager: active people, not myself and not anyone who (indirectly) reports to me
  const managerOptions = useMemo(() => {
    const blocked = employee ? descendantsOf(employee.employee_id, allEmployees) : new Set<string>();
    return allEmployees
      .filter(e => isActive(e) && e.employee_id !== employee?.employee_id && !blocked.has(e.employee_id))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [allEmployees, employee]);

  const departments = useMemo(() => Array.from(new Set(allEmployees.map(e => e.department).filter(Boolean))).sort(), [allEmployees]);

  const save = async () => {
    if (form.full_name.trim().length < 2) return setError('Please enter the full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email.');
    if (form.phone.trim().length < 5) return setError('Please enter a phone number.');
    if (form.department.trim().length < 2) return setError('Please enter a department.');
    if (form.designation.trim().length < 2) return setError('Please enter a designation / job title.');
    if (!editing && form.create_login && (form.username.trim().length < 3 || form.password.length < 6)) {
      return setError('For a login: username needs 3+ characters and password 6+ characters.');
    }

    setSaving(true);
    setError(null);

    const base = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      joining_date: form.joining_date,
      employment_status: form.employment_status,
      salary: Number(form.salary) || 0,
      reports_to: form.reports_to, // "" clears the manager on update
    };

    const res = editing
      ? await api.updateEmployeeFastAPI(employee!.employee_id, base)
      : await api.createEmployeeFastAPI({
          ...base,
          employee_id: nextBadge(allEmployees),
          address: '',
          reports_to: form.reports_to || null,
          create_login_account: form.create_login,
          login_username: form.create_login ? form.username.trim() : undefined,
          login_password: form.create_login ? form.password : undefined,
          login_role: form.role,
        });

    setSaving(false);
    if (res.data) {
      onSaved();
      onClose();
    } else {
      setError(res.error || 'Could not save.');
    }
  };

  const remove = async () => {
    setSaving(true);
    const res = await api.deleteEmployeeFastAPI(employee!.employee_id);
    setSaving(false);
    if (res.error) return setError(res.error);
    onSaved();
    onClose();
  };

  return (
    <Modal
      title={editing ? `Edit ${employee!.full_name}` : 'Add employee'}
      subtitle={editing ? employee!.employee_id : 'A badge ID is created automatically.'}
      onClose={onClose}
      wide
      footer={
        <>
          {editing && !confirmDelete && (
            <Button variant="ghost" className="mr-auto text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
          {editing && confirmDelete && (
            <div className="mr-auto flex items-center gap-2 text-xs text-rose-700">
              Delete permanently?
              <Button variant="danger" size="sm" onClick={remove} disabled={saving}>
                Yes, delete
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <Input value={form.full_name} onChange={set('full_name')} autoFocus />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Joining date">
          <Input type="date" value={form.joining_date} onChange={set('joining_date')} />
        </Field>
        <Field label="Department">
          <Input value={form.department} onChange={set('department')} list="dept-list" placeholder="e.g. Engineering" />
          <datalist id="dept-list">
            {departments.map(d => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Field>
        <Field label="Designation / job title">
          <Input value={form.designation} onChange={set('designation')} placeholder="e.g. Software Engineer" />
        </Field>

        <Field label="Reports to" hint="Who is this person’s direct manager? This builds the org chart." className="sm:col-span-2">
          <Select value={form.reports_to} onChange={set('reports_to')}>
            <option value="">— Nobody (top of the chart / not placed yet) —</option>
            {managerOptions.map(m => (
              <option key={m.employee_id} value={m.employee_id}>
                {m.full_name} — {m.designation}
              </option>
            ))}
          </Select>
        </Field>

        {editing && (
          <Field label="Status">
            <Select value={form.employment_status} onChange={set('employment_status')}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Terminated</option>
            </Select>
          </Field>
        )}
        <Field label="Monthly salary (BDT)">
          <Input type="number" min={0} value={form.salary} onChange={set('salary')} />
        </Field>

        {!editing && (
          <div className="sm:col-span-2 rounded-lg border border-gray-200 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
              <input type="checkbox" checked={form.create_login} onChange={e => setForm(f => ({ ...f, create_login: e.target.checked }))} className="rounded border-gray-300 text-indigo-600" />
              Also create a login for this person
            </label>
            {form.create_login && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Field label="Username">
                  <Input value={form.username} onChange={set('username')} />
                </Field>
                <Field label="Temporary password">
                  <Input type="text" value={form.password} onChange={set('password')} />
                </Field>
                <Field label="Role">
                  <Select value={form.role} onChange={set('role')}>
                    {ROLES.map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="sm:col-span-2">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
      </div>
    </Modal>
  );
};
