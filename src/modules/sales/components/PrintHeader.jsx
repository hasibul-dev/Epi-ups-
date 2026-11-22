import React from 'react';

// Shared pieces of the A4 print layouts matching EPI Corporate Standards
export function PrintHeader({
  title,
  department = 'SALES DEPARTMENT',
  dateRange = '',
  subtitle = '',
  metaItems = [],
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="print-header-banner" style={{ borderBottom: '2px solid #0052cc', paddingBottom: '12px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="EPI UPS Logo"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              EPI UPS BANGLADESH LIMITED
            </h1>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0052cc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {department} · CENTRAL MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#475569', lineHeight: 1.4 }}>
          <div><b>Generated:</b> {dateStr} at {timeStr}</div>
          {dateRange && <div><b>Period:</b> {dateRange}</div>}
          <div style={{ color: '#059669', fontWeight: 600 }}>Official Commercial Record</div>
        </div>
      </div>

      {metaItems && metaItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '10.5px', color: '#334155' }}>
          {metaItems.map((meta, i) => (
            <div key={i}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>{meta.label}: </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{meta.value}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{title}</h2>
          {subtitle && <div style={{ fontSize: '11px', color: '#64748b' }}>{subtitle}</div>}
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
          Confidential · Internal Company Document
        </div>
      </div>
    </div>
  );
}

export function PrintSignatures({ roles, signatories }) {
  const items = signatories || roles || [
    'Prepared By',
    'Verified By (Manager)',
    'Authorized Signatory',
  ];

  return (
    <div
      className="print-signatures"
      style={{
        marginTop: '36px',
        paddingTop: '16px',
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: '20px',
        pageBreakInside: 'avoid',
      }}
    >
      {items.map((item, idx) => {
        const title = typeof item === 'object' && item !== null ? item.title || item.role : item;
        const note =
          typeof item === 'object' && item !== null
            ? item.note || 'Signature & Date'
            : 'Signature & Date';

        return (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #94a3b8', width: '80%', margin: '0 auto 6px' }}></div>
            <b style={{ fontSize: '11.5px', color: '#0f172a' }}>{title}</b>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{note}</div>
          </div>
        );
      })}
    </div>
  );
}
