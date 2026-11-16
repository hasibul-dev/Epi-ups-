import { useState } from 'react';
import { ErrorBox, Form, Loading, PageHeader, Card, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

export default function Settings() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/settings');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (v) => {
    setBusy(true); setErr('');
    try {
      const { vatRatesText, ...rest } = v;
      const vatRates = String(vatRatesText).split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x) && x >= 0);
      await api.put('/settings', { ...rest, vatRates });
      toast('Settings saved'); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Company Settings" subtitle="Appears on printed documents and exports" />
      <ErrorBox error={error || err} />
      {loading ? <Loading /> : !can('settings', 'write') ? (
        <Card><p>Company: <b>{data.companyName}</b></p><p className="muted">Only administrators can change settings.</p></Card>
      ) : (
        <Card><Form busy={busy} onSubmit={save} initial={{ ...data, vatRatesText: (data.vatRates || []).join(', ') }} fields={[
          { name: 'companyName', label: 'Company name', required: true, full: true }, { name: 'address', label: 'Address', full: true },
          { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'bin', label: 'BIN (Business Identification No.)' }, { name: 'tin', label: 'TIN' },
          { name: 'defaultVatRate', label: 'Default VAT %', type: 'number', min: 0 }, { name: 'vatRatesText', label: 'VAT rates offered (comma separated)', hint: 'e.g. 0, 5, 7.5, 10, 15' },
        ]} /></Card>
      )}
    </>
  );
}
