import { useState } from 'react';
import { today, now12h, formatTime12h } from '../utils/helpers.js';
import TimePicker12h from './TimePicker12h.jsx';
import { CalendarPlus } from 'lucide-react';

export default function AddWork({ onSave }) {
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(now12h());
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');

  const save = async () => {
    if (!date || !time || !text.trim()) return alert('Date, time and work are required.');
    const ok = await onSave(date, formatTime12h(time) || now12h(), text.trim(), '', notes.trim());
    if (ok) {
      setText('');
      setNotes('');
    }
  };

  return (
    <section className="page active">
      <div className="panel">
        <div className="head"><div><h2>Add Work</h2><div className="muted">Plan a task. It will appear in Today Work → Activity on that date.</div></div></div>
        <div className="grid">
          <div><label>Date *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label>Time (12-hour AM/PM) *</label><TimePicker12h value={time} onChange={setTime} /></div>
          <div className="full">
            <label>Work *</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Example: Prepare quotation for ABC Textile" />
          </div>
          <div className="full">
            <label>Remarks / Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes, contact info, or remarks..." style={{ minHeight: 60 }} />
          </div>
        </div>
        <br />
        <button className="primary" onClick={save}>
          <CalendarPlus size={15} strokeWidth={2.2} /> Save Planned Work
        </button>
      </div>
    </section>
  );
}

