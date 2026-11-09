import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button, Field, Input, Modal, Notice, Select } from '../ui/kit';

interface Props {
  employeeId: string;
  employeeName: string;
  date: string;
  initial?: { status?: string; check_in?: string | null; check_out?: string | null; note?: string };
  onClose: () => void;
  onSaved: () => void;
}

export const MarkAttendanceModal: React.FC<Props> = ({ employeeId, employeeName, date, initial, onClose, onSaved }) => {
  const [status, setStatus] = useState(initial?.status && ['PRESENT', 'LATE', 'ON_LEAVE', 'ABSENT'].includes(initial.status) ? initial.status : 'PRESENT');
  const [checkIn, setCheckIn] = useState(initial?.check_in || '09:00');
  const [checkOut, setCheckOut] = useState(initial?.check_out || '');
  const [note, setNote] = useState(initial?.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTimes = status === 'PRESENT' || status === 'LATE';

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await api.markAttendance({
      employee_id: employeeId,
      date,
      status,
      check_in: needsTimes ? checkIn || null : null,
      check_out: needsTimes ? checkOut || null : null,
      note,
    });
    setSaving(false);
    if (res.data) {
      onSaved();
      onClose();
    } else {
      setError(res.error || 'Could not save.');
    }
  };

  return (
    <Modal
      title="Record attendance"
      subtitle={`${employeeName} · ${new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Status">
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="ABSENT">Absent</option>
          </Select>
        </Field>
        {needsTimes && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Check-in">
              <Input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </Field>
            <Field label="Check-out" hint="Optional">
              <Input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="Note" hint="Optional, e.g. reason for leave">
          <Input value={note} onChange={e => setNote(e.target.value)} maxLength={200} />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </Modal>
  );
};
