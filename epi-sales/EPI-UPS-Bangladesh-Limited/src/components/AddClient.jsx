import { useState } from 'react';
import { CATEGORIES, RULES, today, addDays } from '../utils/helpers.js';
import { UserPlus } from 'lucide-react';

const INITIAL = () => ({
  name: '',
  desig: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  category: 'Potential',
  nextDate: addDays(today(), 3),
});

export default function AddClient({ onSave, setPage }) {
  const [f, setF] = useState(INITIAL);
  const set = (k) => (e) => {
    const val = e.target.value;
    setF((p) => {
      const next = { ...p, [k]: val };
      // If category changes and nextDate was unset or matched previous rule, update nextDate suggestion
      if (k === 'category') {
        const days = RULES[val] ?? 3;
        next.nextDate = addDays(today(), days);
      }
      return next;
    });
  };

  const save = async () => {
    const name = f.name.trim();
    const company = f.company.trim();
    if (!name || !company || !f.nextDate) return alert('Name, Company and First Follow-up Date are required.');
    const ok = await onSave({ ...f, name, company, notes: (f.notes || '').trim() });
    if (ok) {
      setF(INITIAL());
      setPage('today');
    }
  };

  return (
    <section className="page active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Add Client</h2>
            <div className="muted">Enter client details. The first follow-up task will be scheduled automatically.</div>
          </div>
        </div>
        <div className="grid">
          <div><label>Name *</label><input value={f.name} onChange={set('name')} placeholder="Client contact person" /></div>
          <div><label>Designation</label><input value={f.desig} onChange={set('desig')} placeholder="e.g. DGM / Manager" /></div>
          <div><label>Company *</label><input value={f.company} onChange={set('company')} placeholder="Company / Organization name" /></div>
          <div><label>Contact Number</label><input value={f.phone} onChange={set('phone')} placeholder="Phone / Mobile" /></div>
          <div><label>Email</label><input value={f.email} onChange={set('email')} placeholder="email@company.com" /></div>
          <div><label>Address</label><input value={f.address} onChange={set('address')} placeholder="Office address / location" /></div>
          <div>
            <label>Initial Category</label>
            <select value={f.category} onChange={set('category')}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({RULES[cat]} days)
                </option>
              ))}
            </select>
          </div>
          <div><label>First Follow-up Date *</label><input type="date" value={f.nextDate} onChange={set('nextDate')} /></div>
          <div className="full">
            <label>Remarks / Notes</label>
            <textarea
              value={f.notes}
              onChange={set('notes')}
              placeholder="Special client requirements, preferred UPS models, remarks..."
            />
          </div>
        </div>
        <br />
        <button className="primary" onClick={save}>
          <UserPlus size={15} strokeWidth={2.2} /> Save Client &amp; Schedule Follow-up
        </button>
      </div>
    </section>
  );
}
