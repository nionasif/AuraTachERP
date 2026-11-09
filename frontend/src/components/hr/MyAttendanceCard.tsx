import React, { useCallback, useEffect, useState } from 'react';
import { LogIn, LogOut, Loader2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { AttendanceRecord } from '../../types/erp';
import { Badge, Button, Card, Notice } from '../ui/kit';

interface Props {
  onChanged?: () => void;
}

const statusTone = (s?: string) => (s === 'PRESENT' ? 'green' : s === 'LATE' ? 'amber' : s === 'ON_LEAVE' ? 'blue' : 'red');

export const MyAttendanceCard: React.FC<Props> = ({ onChanged }) => {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const load = useCallback(async () => {
    const res = await api.getMyAttendanceToday();
    if (res.data) {
      setRecord(res.data.record);
      setError(null);
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, [load]);

  const act = async (kind: 'in' | 'out') => {
    setBusy(true);
    setError(null);
    const res = kind === 'in' ? await api.checkIn() : await api.checkOut();
    setBusy(false);
    if (res.data) {
      setRecord(res.data);
      onChanged?.();
    } else {
      setError(res.error || 'Something went wrong.');
    }
  };

  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const done = !!record?.check_out;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">My attendance today</h3>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" /> {clock}
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-gray-50 py-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Check-in</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{record?.check_in || '--:--'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 py-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Check-out</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{record?.check_out || '--:--'}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              {record ? <Badge tone={statusTone(record.status)}>{record.status.replace('_', ' ')}</Badge> : <Badge>Not checked in yet</Badge>}
            </div>
            {!record?.check_in && record?.status !== 'ON_LEAVE' && record?.status !== 'ABSENT' && (
              <Button onClick={() => act('in')} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Check in
              </Button>
            )}
            {record?.check_in && !done && (
              <Button variant="secondary" onClick={() => act('out')} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Check out
              </Button>
            )}
            {done && <span className="text-xs text-gray-500">Done for today</span>}
          </div>
        </>
      )}

      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Card>
  );
};
