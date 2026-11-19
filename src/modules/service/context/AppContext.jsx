import { createContext, useContext, useState } from 'react'
import { useStore } from '../hooks/useStore.js'
import { uid, TODAY } from '../services/dates.js'
import WorkForm from '../components/WorkForm.jsx'
import ClientForm from '../components/ClientForm.jsx'
import WorkDetailsModal from '../components/WorkDetailsModal.jsx'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [s, upd, setState] = useStore()
  const [form, setForm] = useState(null)
  const [clientForm, setClientForm] = useState(null)
  const [detailsWork, setDetailsWork] = useState(null)

  const blank = (date, category, clientId = '') => ({
    title: '',
    category: category || 'Servicing',
    priority: 'Normal',
    clientId: clientId || '',
    date: typeof date === 'string' ? date : TODAY(),
    time: '10:00',
    engineer: '',
    desc: '',
    notes: '',
    status: 'pending',
  })
  const addWork = (date, category, clientId = '') => setForm(blank(date, category, clientId))
  const editWork = (w) => setForm(w)
  const viewWork = (w) => setDetailsWork(w)

  const completeWork = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'done', doneAt: TODAY() } : x)),
    }))

  const reopenWork = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'pending', doneAt: '' } : x)),
    }))

  const deleteWork = (w) => {
    if (window.confirm(`Delete work order "${w.title}"?`)) {
      upd((p) => ({ ...p, works: p.works.filter((x) => x.id !== w.id) }))
      if (detailsWork && detailsWork.id === w.id) setDetailsWork(null)
    }
  }

  const saveWork = (f) =>
    upd((p) =>
      f.id
        ? {
            ...p,
            works: p.works.map((w) =>
              w.id === f.id
                ? { ...w, ...f, doneAt: f.status === 'done' ? w.doneAt || TODAY() : '' }
                : w
            ),
          }
        : { ...p, works: [...p.works, { ...f, id: uid() }] }
    )

  const addClient = (defaultType = 'Sales') =>
    setClientForm({ clientType: typeof defaultType === 'string' ? defaultType : 'Sales' })
  const editClient = (c) => setClientForm(c)

  const saveClient = (f) =>
    upd((p) => {
      if (f.id) {
        const old = p.clients.find((c) => c.id === f.id)
        const dateChanged = old && old.saleDate !== f.saleDate
        return {
          ...p,
          clients: p.clients.map((c) => (c.id === f.id ? { ...c, ...f } : c)),
          works: dateChanged
            ? p.works.filter((w) => !(w.auto && w.clientId === f.id && w.status === 'pending'))
            : p.works,
        }
      }
      return { ...p, clients: [...p.clients, { ...f, id: uid() }] }
    })

  return (
    <Ctx.Provider
      value={{
        s,
        upd,
        setState,
        addWork,
        editWork,
        viewWork,
        completeWork,
        reopenWork,
        deleteWork,
        addClient,
        editClient,
        saveClient,
      }}
    >
      {children}
      {form && <WorkForm init={form} onSave={saveWork} onClose={() => setForm(null)} />}
      {clientForm && (
        <ClientForm
          init={clientForm}
          onSave={saveClient}
          onClose={() => setClientForm(null)}
        />
      )}
      {detailsWork && (
        <WorkDetailsModal
          work={detailsWork}
          onClose={() => setDetailsWork(null)}
          onEdit={editWork}
          onComplete={completeWork}
          onReopen={reopenWork}
        />
      )}
    </Ctx.Provider>
  )
}
