import { useMemo } from 'react';
import { useApi } from '../components/ui.jsx';

export function useAccountOptions(params = {}) {
  const { data } = useApi('/accounts', { active: true, ...params });
  return useMemo(() => (data || []).map((a) => ({ value: a._id, label: `${a.code} - ${a.name}`, type: a.type, subType: a.subType })), [data]);
}
export function usePartyOptions(type) {
  const { data } = useApi('/parties', { type });
  return useMemo(() => (data || []).filter((p) => p.active).map((p) => ({ value: p._id, label: p.name, creditDays: p.creditDays })), [data]);
}
export function useItems() {
  const { data, reload } = useApi('/items');
  return { items: useMemo(() => (data || []).filter((i) => i.active), [data]), reload };
}
