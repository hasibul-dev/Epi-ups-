import { useState, useEffect, useRef, useCallback } from 'react';
import { CLIENTS_PER_PAGE, fmt, today, CATEGORIES, RULES } from '../utils/helpers.js';
import ExpandableText from './ExpandableText.jsx';
import { CompanyPrintHeader } from '../../../components/CompanyPrintHeader.jsx';
import {
  Printer,
  FileSpreadsheet,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  User,
  Maximize2,
  Search,
} from 'lucide-react';

const EXPORT_HEADERS = ['SL', 'Name', 'Designation', 'Company', 'Contact', 'Email', 'Address', 'Remarks / Notes', 'Previous Status', 'Current Status', 'Next Follow-up'];

export default function ClientsMaster({ db, store, setPage, onPrint }) {
  const [page, setPageNo] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Sticky horizontal scrollbar state and refs
  const tableContainerRef = useRef(null);
  const stickyScrollbarRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [canScrollHorizontal, setCanScrollHorizontal] = useState(false);

  // Quick edit date state
  const [editingDateId, setEditingDateId] = useState(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [isSavingDate, setIsSavingDate] = useState(false);

  // Inline row edit state
  const [editingClientId, setEditingClientId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    desig: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    category: 'Potential',
    nextDate: '',
  });
  const [isSavingRow, setIsSavingRow] = useState(false);

  // Modal edit state
  const [modalClient, setModalClient] = useState(null);
  const [modalFormData, setModalFormData] = useState(null);
  const [isSavingModal, setIsSavingModal] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    if (!modalClient) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSavingModal) {
        setModalClient(null);
        setModalFormData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalClient, isSavingModal]);

  const handleSaveNextDate = async (id) => {
    if (!editDateValue) return alert('Please select a valid date.');
    setIsSavingDate(true);
    try {
      if (store?.updateClientNextDate) {
        await store.updateClientNextDate(id, editDateValue);
      }
      setEditingDateId(null);
    } finally {
      setIsSavingDate(false);
    }
  };

  // Start inline editing
  const handleStartEdit = (c) => {
    setEditingClientId(c.id);
    setEditFormData({
      name: c.name || '',
      desig: c.desig || '',
      company: c.company || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
      category: c.category || 'Potential',
      nextDate: c.nextDate || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
  };

  const handleSaveEdit = async (id) => {
    const name = (editFormData.name || '').trim();
    const company = (editFormData.company || '').trim();
    if (!name || !company) {
      alert('Client Name and Company are required.');
      return;
    }
    setIsSavingRow(true);
    try {
      const payload = {
        name,
        desig: (editFormData.desig || '').trim(),
        company,
        phone: (editFormData.phone || '').trim(),
        email: (editFormData.email || '').trim(),
        address: (editFormData.address || '').trim(),
        notes: (editFormData.notes || '').trim(),
        category: editFormData.category || 'Potential',
        nextDate: editFormData.nextDate || '',
      };
      let ok = false;
      if (store?.updateClient) {
        ok = await store.updateClient(id, payload);
      } else if (store?.saveEditRow) {
        ok = await store.saveEditRow('client', id, payload);
      }
      if (ok) {
        setEditingClientId(null);
      }
    } finally {
      setIsSavingRow(false);
    }
  };

  // Modal Editing handlers
  const openEditModal = (c) => {
    setModalClient(c);
    setModalFormData({
      name: c.name || '',
      desig: c.desig || '',
      company: c.company || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
      category: c.category || 'Potential',
      nextDate: c.nextDate || '',
    });
  };

  const handleSaveModal = async (e) => {
    if (e) e.preventDefault();
    if (!modalClient || !modalFormData) return;
    const name = (modalFormData.name || '').trim();
    const company = (modalFormData.company || '').trim();
    if (!name || !company) {
      alert('Client Name and Company are required.');
      return;
    }
    setIsSavingModal(true);
    try {
      const payload = {
        name,
        desig: (modalFormData.desig || '').trim(),
        company,
        phone: (modalFormData.phone || '').trim(),
        email: (modalFormData.email || '').trim(),
        address: (modalFormData.address || '').trim(),
        notes: (modalFormData.notes || '').trim(),
        category: modalFormData.category || 'Potential',
        nextDate: modalFormData.nextDate || '',
      };
      let ok = false;
      if (store?.updateClient) {
        ok = await store.updateClient(modalClient.id, payload);
      } else if (store?.saveEditRow) {
        ok = await store.saveEditRow('client', modalClient.id, payload);
      }
      if (ok) {
        setModalClient(null);
        setModalFormData(null);
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  const allClients = db.clients || [];

  // Filtered clients by search query
  const filteredClients = allClients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.desig && c.desig.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  const total = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(total / CLIENTS_PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * CLIENTS_PER_PAGE;
  const list = filteredClients.slice(start, start + CLIENTS_PER_PAGE);

  // Measure and update scroll dimensions
  const updateScrollDimensions = useCallback(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const hasScroll = el.scrollWidth > el.clientWidth + 1;
    setCanScrollHorizontal(hasScroll);
    setScrollWidth(el.scrollWidth);
    if (stickyScrollbarRef.current && Math.abs(stickyScrollbarRef.current.scrollLeft - el.scrollLeft) > 1) {
      stickyScrollbarRef.current.scrollLeft = el.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    updateScrollDimensions();

    const ro = new ResizeObserver(() => {
      updateScrollDimensions();
    });

    ro.observe(el);
    const tableEl = el.querySelector('table');
    if (tableEl) ro.observe(tableEl);

    window.addEventListener('resize', updateScrollDimensions);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScrollDimensions);
    };
  }, [updateScrollDimensions, list, editingClientId]);

  // Two-way scroll synchronization
  useEffect(() => {
    const tableEl = tableContainerRef.current;
    const scrollbarEl = stickyScrollbarRef.current;
    if (!tableEl || !scrollbarEl || !canScrollHorizontal) return;

    let isSyncing = false;

    const onTableScroll = () => {
      if (isSyncing) return;
      isSyncing = true;
      scrollbarEl.scrollLeft = tableEl.scrollLeft;
      requestAnimationFrame(() => {
        isSyncing = false;
      });
    };

    const onScrollbarScroll = () => {
      if (isSyncing) return;
      isSyncing = true;
      tableEl.scrollLeft = scrollbarEl.scrollLeft;
      requestAnimationFrame(() => {
        isSyncing = false;
      });
    };

    const onScrollbarWheel = (e) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        scrollbarEl.scrollLeft += e.deltaY;
      }
    };

    tableEl.addEventListener('scroll', onTableScroll, { passive: true });
    scrollbarEl.addEventListener('scroll', onScrollbarScroll, { passive: true });
    scrollbarEl.addEventListener('wheel', onScrollbarWheel, { passive: false });

    return () => {
      tableEl.removeEventListener('scroll', onTableScroll);
      scrollbarEl.removeEventListener('scroll', onScrollbarScroll);
      scrollbarEl.removeEventListener('wheel', onScrollbarWheel);
    };
  }, [canScrollHorizontal]);

  // Selection handlers
  const isAllCurrentSelected = list.length > 0 && list.every((c) => selectedIds.has(c.id));
  const toggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const next = new Set(selectedIds);
      list.forEach((c) => next.delete(c.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      list.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Single Delete
  const handleDeleteOne = (c) => {
    if (!confirm(`Are you sure you want to delete client "${c.name}" (${c.company})?\n\nThis will permanently remove the client record.`)) {
      return;
    }
    if (store?.deleteClient) {
      store.deleteClient(c.id);
      if (selectedIds.has(c.id)) {
        const next = new Set(selectedIds);
        next.delete(c.id);
        setSelectedIds(next);
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (!count) return;
    if (!confirm(`Are you sure you want to permanently delete all ${count} selected client record(s)?\n\nThis action cannot be undone.`)) {
      return;
    }
    if (store?.deleteClients) {
      store.deleteClients(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Edit Note
  const handleEditNote = (c) => {
    const note = prompt(`Enter remarks/notes for ${c.name} (${c.company}):`, c.notes || '');
    if (note !== null && store?.updateClientNotes) {
      store.updateClientNotes(c.id, note.trim());
    }
  };

  const exportCSV = () => {
    if (!total) return alert('No clients to export.');
    const headers = store?.isAdmin ? [...EXPORT_HEADERS, 'Created By'] : EXPORT_HEADERS;
    const lines = [headers.join(',')];
    filteredClients.forEach((c, i) => {
      const row = [
        i + 1,
        c.name,
        c.desig,
        c.company,
        c.phone,
        c.email,
        c.address,
        c.notes || '',
        c.previousStatus || '—',
        c.category,
        c.nextDate,
      ];
      if (store?.isAdmin) {
        row.push(c.createdByName || c.createdBy || c.userId || 'Admin');
      }
      lines.push(row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'EPI_UPS_Client_Master_List.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const print = () => {
    if (!total) return alert('No clients to print.');
    const pages = [];
    if (total === 0) {
      pages.push([]);
    } else {
      for (let i = 0; i < total; i += CLIENTS_PER_PAGE) pages.push(filteredClients.slice(i, i + CLIENTS_PER_PAGE));
    }
    onPrint(
      <>
        {pages.map((part, p) => (
          <div className="client-print-page" key={p}>
            <CompanyPrintHeader
              title="CLIENT MASTER DIRECTORY"
              department="SALES DEPARTMENT"
              subtitle={`Page ${p + 1} of ${Math.max(1, pages.length)} · MD Habibullah, Engineer Business Development`}
              metaItems={[
                { label: 'Total Records', value: total },
                { label: 'Page', value: `${p + 1} of ${Math.max(1, pages.length)}` },
              ]}
              badge="SALES CLIENT DIRECTORY"
            />
            <table className="client-print-table">
              <thead><tr>{EXPORT_HEADERS.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {part.length > 0 ? (
                  part.map((c, j) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{p * CLIENTS_PER_PAGE + j + 1}</td>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>{c.desig}</td>
                      <td>{c.company}</td>
                      <td style={{ fontWeight: 600 }}>{c.phone}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.address || '—'}</td>
                      <td>{c.notes || '—'}</td>
                      <td>{c.previousStatus || '—'}</td>
                      <td>{c.category}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(c.nextDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={EXPORT_HEADERS.length} className="print-empty-state">
                      No client records found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="client-print-footer">Page {p + 1} of {Math.max(1, pages.length)}</div>
          </div>
        ))}
      </>
    );
  };

  return (
    <section className="page active">
      <div className="panel">
        <div className="client-toolbar">
          <div>
            <h2>Client Master List</h2>
            <div className="muted">
              Manage client directory, records, and permanent remarks/notes.

            </div>
          </div>
          <div className="client-actions">
            <div style={{ position: 'relative', minWidth: 200 }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNo(1);
                }}
                style={{
                  paddingLeft: 30,
                  paddingRight: 10,
                  paddingTop: 6,
                  paddingBottom: 6,
                  fontSize: 12,
                  height: 33,
                  borderRadius: 8,
                }}
              />
            </div>
            {selectedIds.size > 0 && (
              <button
                className="btn-danger"
                style={{ padding: '8px 14px', fontWeight: 700 }}
                onClick={handleBulkDelete}
              >
                <Trash2 size={13} strokeWidth={2.2} /> Delete Selected ({selectedIds.size})
              </button>
            )}
            <button className="secondary" onClick={print}>
              <Printer size={13} strokeWidth={2.2} /> Print
            </button>
            <button className="secondary" onClick={exportCSV}>
              <FileSpreadsheet size={13} strokeWidth={2.2} /> Excel / CSV
            </button>
            <button className="primary" onClick={() => setPage('client')}>
              <UserPlus size={14} strokeWidth={2.2} /> Add Client
            </button>
          </div>
        </div>
        <div className="client-table-scroll-wrapper">
          <div className="table-responsive client-table-scroll" ref={tableContainerRef}>
            <table>
            <thead>
              <tr>
                <th style={{ width: 36, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={toggleSelectAll}
                    title="Select all on this page"
                  />
                </th>
                <th style={{ width: 45 }}>SL</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Address</th>
                <th>Remarks / Notes</th>
                <th>Previous Status</th>
                <th>Current Status</th>
                <th>Next Follow-up</th>
                {store?.isAdmin && <th style={{ whiteSpace: 'nowrap' }}>Created By</th>}
                <th style={{ textAlign: 'center', minWidth: 155 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length ? list.map((c, i) => {
                const isEditing = editingClientId === c.id;

                if (isEditing) {
                  return (
                    <tr
                      key={c.id}
                      style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        boxShadow: 'inset 0 0 0 1px rgba(245, 158, 11, 0.35)',
                        backdropFilter: 'blur(16px)',
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" disabled />
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>{start + i + 1}</span>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Name *"
                          autoFocus
                          style={{
                            width: '100%',
                            minWidth: 120,
                            fontSize: 12,
                            padding: '4px 6px',
                            fontWeight: 700,
                            border: '1.5px solid #3b82f6',
                            borderRadius: 6,
                          }}
                          title="Press Enter to save, Escape to cancel"
                        />
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <input
                          type="text"
                          value={editFormData.desig}
                          onChange={(e) => setEditFormData({ ...editFormData, desig: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Designation"
                          style={{
                            width: '100%',
                            minWidth: 100,
                            fontSize: 12,
                            padding: '4px 6px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td style={{ minWidth: 150 }}>
                        <input
                          type="text"
                          value={editFormData.company}
                          onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Company *"
                          style={{
                            width: '100%',
                            minWidth: 130,
                            fontSize: 12,
                            padding: '4px 6px',
                            fontWeight: 700,
                            border: '1.5px solid #3b82f6',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td style={{ minWidth: 125 }}>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Contact / Phone"
                          style={{
                            width: '100%',
                            minWidth: 110,
                            fontSize: 12,
                            padding: '4px 6px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Email"
                          style={{
                            width: '100%',
                            minWidth: 120,
                            fontSize: 12,
                            padding: '4px 6px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td style={{ minWidth: 150 }}>
                        <input
                          type="text"
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Address"
                          style={{
                            width: '100%',
                            minWidth: 130,
                            fontSize: 12,
                            padding: '4px 6px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td style={{ minWidth: 150 }}>
                        <input
                          type="text"
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(c.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          placeholder="Remarks / Notes"
                          style={{
                            width: '100%',
                            minWidth: 130,
                            fontSize: 12,
                            padding: '4px 6px',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td>
                        <span className="badge badge-prev">
                          {c.previousStatus || '—'}
                        </span>
                      </td>
                      <td style={{ minWidth: 110 }}>
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          style={{ fontSize: 11, padding: '4px 6px', width: '100%', borderRadius: 6 }}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ minWidth: 135 }}>
                        <input
                          type="date"
                          value={editFormData.nextDate}
                          onChange={(e) => setEditFormData({ ...editFormData, nextDate: e.target.value })}
                          style={{ fontSize: 11, padding: '4px 6px', width: '100%', borderRadius: 6 }}
                        />
                      </td>
                      {store?.isAdmin && <td style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>—</td>}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            className="data-edit"
                            style={{
                              padding: '5px 8px',
                              fontSize: 11,
                              background: '#059669',
                              color: '#fff',
                              fontWeight: 700,
                              borderColor: '#059669',
                            }}
                            onClick={() => handleSaveEdit(c.id)}
                            disabled={isSavingRow}
                            title="Save client changes (Enter)"
                          >
                            {isSavingRow ? '...' : <><Check size={11} strokeWidth={2.4} /> Save</>}
                          </button>
                          <button
                            className="secondary"
                            style={{ padding: '5px 7px', fontSize: 11 }}
                            onClick={handleCancelEdit}
                            disabled={isSavingRow}
                            title="Cancel editing (Esc)"
                          >
                            <X size={11} strokeWidth={2.2} />
                          </button>
                          <button
                            className="secondary"
                            style={{ padding: '5px 7px', fontSize: 11 }}
                            onClick={() => openEditModal({ ...c, ...editFormData })}
                            title="Open full edit form modal"
                          >
                            <Maximize2 size={11} strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={c.id}
                    style={{ background: selectedIds.has(c.id) ? 'rgba(37, 99, 235, 0.05)' : undefined }}
                    onDoubleClick={() => handleStartEdit(c)}
                    title="Double-click to edit client data"
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                      />
                    </td>
                    <td>{start + i + 1}</td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Name">
                      <b>{c.name}</b>
                    </td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Designation">
                      {c.desig || '—'}
                    </td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Company">
                      {c.company}
                    </td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Contact">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Email">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} style={{ color: '#2563eb' }}>
                          {c.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ cursor: 'pointer' }} title="Double-click to edit Address">
                      {c.address || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 150 }}>
                        <ExpandableText
                          text={c.notes}
                          title={`Notes & Remarks — ${c.name}`}
                          subtitle={`${c.company} ${c.phone ? '· ' + c.phone : ''}`}
                          emptyText="No notes"
                        />
                        <button
                          className="edit-btn"
                          style={{ padding: '3px 6px', fontSize: 11 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(c);
                          }}
                          title="Quick edit note"
                        >
                          <Edit3 size={11} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-prev">
                        {c.previousStatus || '—'}
                      </span>
                    </td>
                    <td><span className="badge">{c.category}</span></td>
                    <td style={{ minWidth: 150 }}>
                      {editingDateId === c.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="date"
                            value={editDateValue}
                            onChange={(e) => setEditDateValue(e.target.value)}
                            style={{ fontSize: 11, padding: '3px 6px', width: 120 }}
                          />
                          <button
                            className="data-edit"
                            style={{
                              padding: '3px 6px',
                              fontSize: 11,
                              background: '#059669',
                              color: '#fff',
                              fontWeight: 700,
                            }}
                            onClick={() => handleSaveNextDate(c.id)}
                            disabled={isSavingDate}
                            title="Save date"
                          >
                            {isSavingDate ? '...' : <Check size={11} strokeWidth={2.4} />}
                          </button>
                          <button
                            className="secondary"
                            style={{ padding: '3px 5px', fontSize: 11 }}
                            onClick={() => setEditingDateId(null)}
                            title="Cancel"
                          >
                            <X size={11} strokeWidth={2.2} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{fmt(c.nextDate)}</span>
                          <button
                            className="edit-btn"
                            style={{ padding: '2px 5px', fontSize: 10, marginLeft: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDateValue(c.nextDate || today());
                              setEditingDateId(c.id);
                            }}
                            title="Quick edit next follow-up date"
                          >
                            <Edit3 size={10} strokeWidth={2.2} />
                          </button>
                        </div>
                      )}
                    </td>
                    {store?.isAdmin && (
                      <td style={{ fontSize: 11, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            fontWeight: 600,
                          }}
                        >
                          {c.createdByName || c.createdBy || c.userId || 'Admin'}
                        </span>
                      </td>
                    )}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="data-edit"
                          style={{ padding: '5px 9px', fontSize: 11 }}
                          onClick={() => handleStartEdit(c)}
                          title="Edit client details (Name, Designation, Company, Contact, Email, Address, etc.)"
                        >
                          <Edit3 size={11} strokeWidth={2.2} /> Edit
                        </button>
                        <button
                          className="secondary"
                          style={{ padding: '5px 7px', fontSize: 11 }}
                          onClick={() => openEditModal(c)}
                          title="Open full edit modal"
                        >
                          <Maximize2 size={11} strokeWidth={2.2} />
                        </button>
                        <button
                          className="data-delete"
                          style={{ padding: '5px 9px', fontSize: 11 }}
                          onClick={() => handleDeleteOne(c)}
                          title="Delete this client"
                        >
                          <Trash2 size={11} strokeWidth={2.2} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="13" className="empty">
                    {searchQuery ? `No clients matching "${searchQuery}".` : 'No clients found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {canScrollHorizontal && (
          <div
            ref={stickyScrollbarRef}
            className="client-sticky-scrollbar"
            title="Drag or scroll horizontally to view all columns"
          >
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>
        )}
      </div>

      <div className="client-pagebar">
          <div className="client-note">
            {total ? `Showing ${start + 1}–${Math.min(start + CLIENTS_PER_PAGE, total)} of ${total} clients` : '0 clients'}
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
            {searchQuery && ` (filtered from ${allClients.length})`}
          </div>
          <div className="pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === current ? 'active' : ''} onClick={() => setPageNo(n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Client Edit Modal Form */}
      {modalClient && modalFormData && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isSavingModal) {
              setModalClient(null);
              setModalFormData(null);
            }
          }}
          style={{ zIndex: 1200 }}
        >
          <div
            className="modal-dialog"
            style={{ width: 640, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon">
                  <User size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3>Edit Client Data</h3>
                  <div className="modal-sub">
                    {modalClient.name} · {modalClient.company}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setModalClient(null);
                  setModalFormData(null);
                }}
                disabled={isSavingModal}
                title="Close (Esc)"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ padding: '20px 24px' }}>
              <div className="grid" style={{ gap: '14px' }}>
                <div>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                    placeholder="Contact person name"
                    required
                  />
                </div>
                <div>
                  <label>Designation</label>
                  <input
                    type="text"
                    value={modalFormData.desig}
                    onChange={(e) => setModalFormData({ ...modalFormData, desig: e.target.value })}
                    placeholder="e.g. DGM / Manager / IT Head"
                  />
                </div>
                <div>
                  <label>Company *</label>
                  <input
                    type="text"
                    value={modalFormData.company}
                    onChange={(e) => setModalFormData({ ...modalFormData, company: e.target.value })}
                    placeholder="Company / Organization"
                    required
                  />
                </div>
                <div>
                  <label>Contact Number (Phone)</label>
                  <input
                    type="text"
                    value={modalFormData.phone}
                    onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                    placeholder="Mobile / Phone number"
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={modalFormData.email}
                    onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                    placeholder="client@company.com"
                  />
                </div>
                <div>
                  <label>Current Status</label>
                  <select
                    value={modalFormData.category}
                    onChange={(e) => setModalFormData({ ...modalFormData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({RULES[cat]} days)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Next Follow-up Date</label>
                  <input
                    type="date"
                    value={modalFormData.nextDate}
                    onChange={(e) => setModalFormData({ ...modalFormData, nextDate: e.target.value })}
                  />
                </div>
                <div className="full">
                  <label>Address</label>
                  <input
                    type="text"
                    value={modalFormData.address}
                    onChange={(e) => setModalFormData({ ...modalFormData, address: e.target.value })}
                    placeholder="Office address / location"
                  />
                </div>
                <div className="full">
                  <label>Remarks / Notes</label>
                  <textarea
                    rows={3}
                    value={modalFormData.notes}
                    onChange={(e) => setModalFormData({ ...modalFormData, notes: e.target.value })}
                    placeholder="Permanent client notes, requirements, UPS capacity..."
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid var(--line)',
                }}
              >
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setModalClient(null);
                    setModalFormData(null);
                  }}
                  disabled={isSavingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary"
                  disabled={isSavingModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSavingModal ? (
                    'Saving to Database...'
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.4} /> Save Client Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
