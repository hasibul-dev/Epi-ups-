import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function useApi(path, params, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(params || {});
  useEffect(() => {
    let live = true;
    if (!path) { setState({ data: null, loading: false, error: '' }); return undefined; }
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(path, params)
      .then((data) => live && setState({ data, loading: false, error: '' }))
      .catch((e) => live && setState({ data: null, loading: false, error: e.message }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, tick, ...deps]);
  return { ...state, reload: useCallback(() => setTick((t) => t + 1), []) };
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, kind = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status">{items.map((i) => <div key={i.id} className={`toast ${i.kind === 'err' ? 'err' : ''}`}>{i.msg}</div>)}</div>
    </ToastCtx.Provider>
  );
}

export const Loading = () => <div className="spinner" aria-label="Loading" />;
export const ErrorBox = ({ error }) => (error ? <div className="alert">{error}</div> : null);
export const Empty = ({ children = 'Nothing to show yet.' }) => <div className="empty">{children}</div>;

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div className="grow"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <div className="row">{children}</div>
    </div>
  );
}

export const Card = ({ title, children, className = '', right }) => (
  <div className={`card ${className}`}>
    {(title || right) && <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>{title && <h3 style={{ margin: 0 }}>{title}</h3>}{right}</div>}
    {children}
  </div>
);

export const Stat = ({ label, value, sub, accent, tone }) => (
  <div className="card stat" style={{ '--accent': accent }}>
    <div className="label">{label}</div>
    <div className={`value ${tone || ''}`}>{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>
);

export const Badge = ({ children, tone = '' }) => <span className={`badge ${tone}`}>{children}</span>;
export const statusTone = (s) => ({ paid: 'green', posted: 'green', active: 'green', processed: 'blue', partial: 'amber', unpaid: 'red', void: 'red', disposed: '' }[s] || '');

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3 style={{ margin: 0 }}>{title}</h3><button className="x" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, full, hint }) {
  return <div className={`field ${full ? 'full' : ''}`}><label>{label}</label>{children}{hint && <small className="muted">{hint}</small>}</div>;
}

/** Declarative form. fields: [{ name,label,type,options,required,full,step,hint,placeholder }] */
export function Form({ fields, initial = {}, onSubmit, submitLabel = 'Save', onCancel, busy }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? f.default ?? ''])));
  const set = (n, val) => setV((x) => ({ ...x, [n]: val }));
  const submit = (e) => {
    e.preventDefault();
    const out = {};
    for (const f of fields) {
      let val = v[f.name];
      if (f.type === 'number') val = val === '' ? undefined : Number(val);
      if (f.type === 'checkbox') val = !!val;
      out[f.name] = val;
    }
    onSubmit(out);
  };
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        {fields.filter((f) => !f.hidden?.(v)).map((f) => (
          <Field key={f.name} label={`${f.label}${f.required ? ' *' : ''}`} full={f.full} hint={f.hint}>
            {f.type === 'select' ? (
              <select className="input" required={f.required} value={v[f.name]} onChange={(e) => set(f.name, e.target.value)} disabled={f.disabled}>
                <option value="">{f.placeholder || 'Select...'}</option>
                {(typeof f.options === 'function' ? f.options(v) : f.options).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea className="input" value={v[f.name]} onChange={(e) => set(f.name, e.target.value)} required={f.required} />
            ) : f.type === 'checkbox' ? (
              <label className="row"><input type="checkbox" checked={!!v[f.name]} onChange={(e) => set(f.name, e.target.checked)} /> {f.checkLabel || 'Yes'}</label>
            ) : (
              <input className="input" type={f.type || 'text'} step={f.type === 'number' ? f.step || '0.01' : undefined} min={f.min}
                required={f.required} value={v[f.name]} placeholder={f.placeholder} disabled={f.disabled}
                onChange={(e) => set(f.name, e.target.value)} />
            )}
          </Field>
        ))}
      </div>
      <div className="modal-foot" style={{ padding: '16px 0 0', border: 0 }}>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button className="btn primary" disabled={busy}>{busy ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  );
}

/** Asks for a reason, then calls onConfirm(reason). */
export function ReasonModal({ title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true); setErr('');
    try { await onConfirm(reason); onClose(true); } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal title={title} onClose={() => onClose(false)} footer={<><button className="btn" onClick={() => onClose(false)}>Cancel</button><button className="btn danger" disabled={busy || reason.trim().length < 3} onClick={go}>{busy ? 'Working...' : confirmLabel}</button></>}>
      <ErrorBox error={err} />
      <p style={{ marginTop: 0 }}>{message}</p>
      <Field label="Reason (required)"><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus /></Field>
    </Modal>
  );
}

export function DateRange({ from, to, onChange, single }) {
  return (
    <div className="row">
      {!single && <input type="date" className="input" style={{ width: 150 }} value={from} onChange={(e) => onChange({ from: e.target.value, to })} aria-label="From date" />}
      {!single && <span className="muted">to</span>}
      <input type="date" className="input" style={{ width: 150 }} value={to} onChange={(e) => onChange({ from, to: e.target.value })} aria-label={single ? 'As of date' : 'To date'} />
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return <div className="tabs" role="tablist">{tabs.map((t) => <button key={t.value} className={value === t.value ? 'on' : ''} onClick={() => onChange(t.value)} role="tab">{t.label}</button>)}</div>;
}
