import { EmployeeRecord } from '../../types/erp';

export const isActive = (e: EmployeeRecord) => String(e.employment_status).toLowerCase() === 'active';

const getDesignationRank = (designation?: string): number => {
  if (!designation) return 999;
  const d = designation.toLowerCase().trim();
  if (d.includes('hr manager')) return 1;
  if (d.includes('finance') || d.includes('accountant')) return 2;
  if (d.includes('inventory manager')) return 3;
  if (d.includes('sales manager')) return 4;
  if (d.includes('sr. pro') || d.includes('senior project manager') || d.includes('project manager & delivery')) return 5;

  if (d.includes('it asset')) return 10;

  if (d.includes('jr sales') || d.includes('junior sales')) return 20;
  if (d.includes('crm')) return 21;

  if (d.includes('jr project') || d.includes('junior project')) return 30;
  if (d.includes('software') || d.includes('developer')) return 31;
  if (d.includes('qa')) return 32;

  return 999;
};

/** badge id -> list of direct reports */
export const buildChildren = (employees: EmployeeRecord[]) => {
  const ids = new Set(employees.map(e => e.employee_id));
  const map = new Map<string, EmployeeRecord[]>();
  for (const e of employees) {
    if (e.reports_to && ids.has(e.reports_to)) {
      const list = map.get(e.reports_to) || [];
      list.push(e);
      map.set(e.reports_to, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const rankA = getDesignationRank(a.designation);
      const rankB = getDesignationRank(b.designation);
      if (rankA !== rankB) return rankA - rankB;
      return a.full_name.localeCompare(b.full_name);
    });
  }
  return map;
};

/** Everyone below `badge` (direct and indirect) */
export const descendantsOf = (badge: string, employees: EmployeeRecord[]): Set<string> => {
  const children = buildChildren(employees);
  const out = new Set<string>();
  const stack = [badge];
  while (stack.length) {
    const cur = stack.pop() as string;
    for (const c of children.get(cur) || []) {
      if (!out.has(c.employee_id)) {
        out.add(c.employee_id);
        stack.push(c.employee_id);
      }
    }
  }
  return out;
};

/** [direct manager, their manager, ..., top] */
export const chainOfCommand = (badge: string, employees: EmployeeRecord[]): EmployeeRecord[] => {
  const byId = new Map(employees.map(e => [e.employee_id, e] as const));
  const chain: EmployeeRecord[] = [];
  const seen = new Set<string>([badge]);
  let cur = byId.get(badge);
  while (cur?.reports_to && byId.has(cur.reports_to) && !seen.has(cur.reports_to)) {
    cur = byId.get(cur.reports_to) as EmployeeRecord;
    seen.add(cur.employee_id);
    chain.push(cur);
  }
  return chain;
};
