import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Field from '../components/Field.jsx'
import { Save, Sliders } from 'lucide-react'

export default function Settings() {
  const { s, upd } = useApp()
  const [company, setCompany] = useState(s.settings.company)
  const [engineers, setEngineers] = useState(s.settings.engineers)

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
    </div>
  )
}
