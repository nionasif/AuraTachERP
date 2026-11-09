import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { EmployeeRecord } from '../../types/erp';
import { Avatar, Card, EmptyState, Input, Button, cx } from '../ui/kit';
import { buildChildren, isActive } from './orgUtils';

interface Props {
  employees: EmployeeRecord[];
  onSelect: (e: EmployeeRecord) => void;
}

interface NodeProps {
  emp: EmployeeRecord;
  childrenMap: Map<string, EmployeeRecord[]>;
  collapsed: Set<string>;
  toggle: (id: string) => void;
  onSelect: (e: EmployeeRecord) => void;
  match: (e: EmployeeRecord) => boolean;
  isRoot?: boolean;
}

const countBelow = (id: string, map: Map<string, EmployeeRecord[]>): number => {
  const kids = map.get(id) || [];
  return kids.reduce((n, k) => n + 1 + countBelow(k.employee_id, map), 0);
};

const OrgNode: React.FC<NodeProps> = ({ emp, childrenMap, collapsed, toggle, onSelect, match, isRoot }) => {
  const kids = childrenMap.get(emp.employee_id) || [];
  const isCollapsed = collapsed.has(emp.employee_id);
  const highlighted = match(emp);

  return (
    <li className={isRoot ? 'org-root' : undefined}>
      <div className="inline-flex flex-col items-center">
        <button
          onClick={() => onSelect(emp)}
          className={cx(
            'w-52 text-left rounded-xl border bg-white px-3 py-2.5 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center gap-2.5',
            highlighted ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
          )}
        >
          <Avatar name={emp.full_name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{emp.full_name}</p>
            <p className="text-[11px] text-gray-500 truncate">{emp.designation}</p>
          </div>
        </button>
        {kids.length > 0 && (
          <button
            onClick={() => toggle(emp.employee_id)}
            className="-mt-2 z-10 inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
            aria-label={isCollapsed ? 'Show team' : 'Hide team'}
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {countBelow(emp.employee_id, childrenMap)}
          </button>
        )}
      </div>
      {kids.length > 0 && !isCollapsed && (
        <ul>
          {kids.map(k => (
            <OrgNode key={k.employee_id} emp={k} childrenMap={childrenMap} collapsed={collapsed} toggle={toggle} onSelect={onSelect} match={match} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const OrgChart: React.FC<Props> = ({ employees, onSelect }) => {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const active = useMemo(() => employees.filter(isActive), [employees]);
  const childrenMap = useMemo(() => buildChildren(active), [active]);

  const { trees, unplaced } = useMemo(() => {
    const ids = new Set(active.map(e => e.employee_id));
    const roots = active.filter(e => !e.reports_to || !ids.has(e.reports_to));
    const withTeam = roots.filter(r => (childrenMap.get(r.employee_id) || []).length > 0).sort((a, b) => a.full_name.localeCompare(b.full_name));
    const alone = roots.filter(r => (childrenMap.get(r.employee_id) || []).length === 0).sort((a, b) => a.full_name.localeCompare(b.full_name));
    return { trees: withTeam, unplaced: alone };
  }, [active, childrenMap]);

  const q = query.trim().toLowerCase();
  const match = (e: EmployeeRecord) => q.length > 0 && (e.full_name.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q));

  const toggle = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const collapseAll = () => setCollapsed(new Set([...childrenMap.keys()]));
  const expandAll = () => setCollapsed(new Set());

  if (active.length === 0) {
    return (
      <Card>
        <EmptyState title="No employees yet" text="Add employees first, then choose who each person reports to." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a person…" className="pl-9" />
        </div>
        <Button variant="secondary" size="sm" onClick={expandAll}>
          Expand all
        </Button>
        <Button variant="secondary" size="sm" onClick={collapseAll}>
          Collapse all
        </Button>
      </div>

      <Card className="overflow-auto p-6">
        {trees.length === 0 ? (
          <EmptyState
            title="Nobody reports to anyone yet"
            text="Edit an employee and pick “Reports to” to start building the chart. For example: Nusrat reports to Imran, Imran reports to the Principal, the Principal reports to the CEO."
          />
        ) : (
          <div className="org min-w-max mx-auto space-y-10">
            {trees.map(root => (
              <ul key={root.employee_id}>
                <OrgNode emp={root} childrenMap={childrenMap} collapsed={collapsed} toggle={toggle} onSelect={onSelect} match={match} isRoot />
              </ul>
            ))}
          </div>
        )}
      </Card>

      {unplaced.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900">Not placed in the chart yet</h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">These people have no manager and nobody reports to them. Set “Reports to” on their profile to place them.</p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map(e => (
              <button
                key={e.employee_id}
                onClick={() => onSelect(e)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-full border bg-white pl-1 pr-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50',
                  match(e) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                )}
              >
                <Avatar name={e.full_name} size="sm" />
                {e.full_name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
