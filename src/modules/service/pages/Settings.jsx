import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Field from '../components/Field.jsx'
import { seed, emptyState } from '../services/seed.js'
import { sync } from '../services/domain.js'
import { Save, Download, Upload, RotateCcw, Trash2, Database, Sliders } from 'lucide-react'

export default function Settings() {
  const { s, upd, setState } = useApp()
  const [company, setCompany] = useState(s.settings.company)
  const [engineers, setEngineers] = useState(s.settings.engineers)

  const exportJson = () => {
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(s, null, 2))
    a.download = `epi-service-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 16 }}>
        <Sliders size={18} style={{ color: 'var(--epi-blue-light)' }} /> System Settings
      </h3>
      <Field label="Company Name (displayed on printable reports & exports)">
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </Field>
      <br />
      <Field label="Service Engineers & Technicians (comma separated)">
        <input value={engineers} onChange={(e) => setEngineers(e.target.value)} />
      </Field>
      <div className="row" style={{ marginTop: 16 }}>
        <button
          className="btn btn-primary-highlight"
          onClick={() => {
            upd((p) => ({ ...p, settings: { company, engineers } }))
            alert('Settings saved successfully!')
          }}
        >
          <Save size={14} /> Save Settings
        </button>
      </div>

      <hr style={{ borderColor: 'var(--border-glass)', margin: '24px 0' }} />

      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 16 }}>
        <Database size={18} style={{ color: 'var(--epi-blue-light)' }} /> Data Management &amp; Local Persistence
      </h3>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
        All Service Department records are preserved locally in your browser storage. You can create offline backups anytime.
      </p>

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn s" onClick={exportJson} title="Export full JSON backup">
          <Download size={14} /> Export JSON Backup
        </button>
        <label className="btn s" style={{ cursor: 'pointer', margin: 0 }} title="Import full JSON backup">
          <Upload size={14} /> Import JSON Backup
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (evt) => {
                try {
                  const parsed = JSON.parse(evt.target.result);
                  if (parsed && typeof parsed === 'object') {
                    const confirmed = window.confirm(
                      `⚠️ WARNING: OVERWRITE SERVICE DATA\n\n` +
                      `Importing this backup will OVERWRITE your current Service department records:\n` +
                      `- Current Clients: ${s.clients.length}\n` +
                      `- Current Work Orders: ${s.works.length}\n\n` +
                      `All existing Service records will be replaced with data from the selected backup.\n` +
                      `Are you sure you want to proceed?`
                    );
                    if (!confirmed) return;
                    setState(sync(parsed));
                    alert('✓ Service backup restored successfully!');
                  } else {
                    alert('Invalid service backup file format.');
                  }
                } catch (err) {
                  alert('Import failed: ' + err.message);
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </label>
        <button
          className="btn s"
          onClick={() => {
            const confirmed = window.confirm(
              `⚠️ WARNING: OVERWRITE WITH DEMO DATA\n\n` +
              `This will REPLACE all your current Service records:\n` +
              `- Current Clients: ${s.clients.length}\n` +
              `- Current Work Orders: ${s.works.length}\n\n` +
              `All existing custom records will be replaced with fresh initial demo data.\n` +
              `Do you want to proceed?`
            );
            if (confirmed) setState(seed());
          }}
          title="Reload initial demo datasets"
        >
          <RotateCcw size={14} /> Reload Demo Data
        </button>
        <button
          className="btn d"
          onClick={() => {
            const confirmed = window.confirm(
              `🚨 CRITICAL WARNING: CLEAR ALL SERVICE DATA\n\n` +
              `This will permanently DELETE:\n` +
              `- All ${s.clients.length} Service Clients\n` +
              `- All ${s.works.length} Work Orders\n\n` +
              `This action cannot be undone! Are you absolutely sure?`
            );
            if (confirmed) setState(sync({ ...emptyState(), settings: s.settings }));
          }}
          title="Clear all stored service records"
        >
          <Trash2 size={14} /> Clear All Records
        </button>
      </div>
    </div>
  )
}
