import React from 'react';

/**
 * EPI UPS BANGLADESH LIMITED — UNIFIED COMPANY PRINT HEADER
 * Standardized professional corporate header for ALL printed documents across the ERP:
 * Admin, Sales, Service, ERP / Accounts, Digital Marketing, and IT Support.
 *
 * Layout Structure:
 * - Clean 2-column layout.
 * - LEFT SIDE: Official EPI logo + company details horizontally aligned.
 * - RIGHT SIDE: Department name, generated timestamp, report period, official commercial record (right-aligned, strictly never underneath logo).
 * - Professional horizontal divider below the complete header.
 */

export const COMPANY_DETAILS = {
  name: 'EPI UPS BANGLADESH LIMITED',
  address: 'GA Foundation Building 2, House-5, Road-1, Main Road, 2 Pallabi Rd, Dhaka 1216',
  phone: 'Phone: +880 1897-660840, +880 1897-660844',
  email: 'info.bd@epi-ups.com',
  website: 'www.epi-ups.com',
  logoUrl: '/logo.png',
};

/**
 * Reusable React Component for in-app Print Views & Previews
 */
export function CompanyPrintHeader({
  title,
  department = 'CENTRAL MANAGEMENT',
  dateRange = '',
  subtitle = '',
  metaItems = [],
  badge = '',
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayBadge = badge || department;

  return (
    <div
      className="epi-company-print-header"
      style={{
        borderBottom: '2px solid #1F2937',
        paddingBottom: '12px',
        marginBottom: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", Arial, sans-serif',
        background: '#ffffff',
        color: '#111111',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Corporate Brand & Contact Bar: STRICT TWO-COLUMN LAYOUT */}
      <div
        className="epi-header-two-col"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          width: '100%',
          flexWrap: 'nowrap',
        }}
      >
        {/* LEFT SIDE: Official EPI Logo + Corporate Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 auto' }}>
          <img
            src={COMPANY_DETAILS.logoUrl}
            alt="EPI UPS Logo"
            style={{
              width: '54px',
              height: '54px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {COMPANY_DETAILS.name}
            </h1>
            <div
              style={{
                fontSize: '9.5px',
                color: '#111111',
                marginTop: '2px',
                lineHeight: 1.35,
                fontWeight: 600,
              }}
            >
              {COMPANY_DETAILS.address}
            </div>
            <div
              style={{
                fontSize: '9.5px',
                color: '#111111',
                lineHeight: 1.35,
                fontWeight: 600,
              }}
            >
              {COMPANY_DETAILS.phone} &nbsp;|&nbsp; Email: {COMPANY_DETAILS.email} &nbsp;|&nbsp; Web: {COMPANY_DETAILS.website}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Report Information (Strictly Right-Aligned, Never Underneath Left Side) */}
        <div
          style={{
            textAlign: 'right',
            fontSize: '10px',
            color: '#111111',
            lineHeight: 1.45,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            alignSelf: 'center',
          }}
        >
          {displayBadge && (
            <div
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                background: '#1F2937',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                borderRadius: '3px',
                marginBottom: '4px',
                letterSpacing: '0.04em',
              }}
            >
              {displayBadge}
            </div>
          )}
          <div>
            <b style={{ color: '#000000' }}>Generated:</b> {dateStr} at {timeStr}
          </div>
          {dateRange ? (
            <div>
              <b style={{ color: '#000000' }}>Period:</b> {dateRange}
            </div>
          ) : null}
          <div style={{ color: '#1F2937', fontWeight: 700, fontSize: '10px', marginTop: '1px' }}>
            Official Commercial Record
          </div>
        </div>
      </div>

      {/* Optional Metadata Filter Chips / Summary Badges */}
      {metaItems && metaItems.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            marginTop: '10px',
            padding: '6px 12px',
            background: '#f8fafc',
            border: '1px solid #999999',
            borderRadius: '4px',
            fontSize: '10.5px',
            color: '#111111',
          }}
        >
          {metaItems.map((meta, i) => (
            <div key={i}>
              <span style={{ color: '#333333', fontWeight: 700 }}>{meta.label}: </span>
              <span style={{ fontWeight: 800, color: '#000000' }}>{meta.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Report Title & Subtitle Banner */}
      {title && (
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid #999999',
            paddingTop: '8px',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 800,
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div style={{ fontSize: '11px', color: '#333333', fontWeight: 500, marginTop: '2px' }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ fontSize: '9.5px', color: '#333333', fontWeight: 600 }}>
            Confidential · Internal Company Document
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Signatures Component for Printed Reports
 */
export function PrintSignatures({ roles, signatories }) {
  const items = signatories || roles || [
    { title: 'Marketing Executive', note: 'Prepared By' },
    { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
    { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
  ];

  return (
    <div
      className="print-signatures"
      style={{
        marginTop: '36px',
        paddingTop: '16px',
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: '24px',
        pageBreakInside: 'avoid',
      }}
    >
      {items.map((item, idx) => {
        const roleTitle = typeof item === 'object' && item !== null ? item.title || item.role : item;
        const note =
          typeof item === 'object' && item !== null
            ? item.note || 'Signature & Date'
            : 'Signature & Date';

        return (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div
              style={{
                borderTop: '1.5px solid #111111',
                width: '80%',
                margin: '0 auto 6px',
              }}
            />
            <b style={{ fontSize: '11.5px', color: '#000000', fontWeight: 800 }}>{roleTitle}</b>
            <div style={{ fontSize: '10px', color: '#333333', marginTop: '2px', fontWeight: 600 }}>
              {note}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Generates identical HTML string for standalone iframe & print documents
 */
export function getCompanyPrintHeaderHtml({
  title = '',
  department = 'CENTRAL MANAGEMENT',
  dateRange = '',
  subtitle = '',
  metaItems = [],
  badge = '',
}) {
  const esc = (s) =>
    s === null || s === undefined
      ? ''
      : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayBadge = badge || department;

  return `
    <div class="epi-company-print-header" style="border-bottom: 2px solid #1F2937; padding-bottom: 12px; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kalpurush', Arial, sans-serif; background: #ffffff; color: #111111; width: 100%; box-sizing: border-box;">
      <table style="width: 100%; border-collapse: collapse; border: none; margin: 0 0 4px 0;">
        <tbody>
          <tr>
            <td style="border: none; padding: 0; vertical-align: middle; text-align: left; width: 68%;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img
                  src="${COMPANY_DETAILS.logoUrl}"
                  alt="EPI UPS Logo"
                  style="width: 54px; height: 54px; object-fit: contain; flex-shrink: 0;"
                  onerror="this.style.display='none'"
                />
                <div>
                  <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #000000; letter-spacing: -0.01em; line-height: 1.2; text-transform: uppercase; white-space: nowrap;">
                    ${COMPANY_DETAILS.name}
                  </h1>
                  <div style="font-size: 9.5px; color: #333333; margin-top: 2px; line-height: 1.35; font-weight: 500;">
                    ${COMPANY_DETAILS.address}
                  </div>
                  <div style="font-size: 9.5px; color: #333333; line-height: 1.35; font-weight: 500;">
                    ${COMPANY_DETAILS.phone} &nbsp;|&nbsp; Email: ${COMPANY_DETAILS.email} &nbsp;|&nbsp; Web: ${COMPANY_DETAILS.website}
                  </div>
                </div>
              </div>
            </td>
            <td style="border: none; padding: 0; vertical-align: middle; text-align: right; width: 32%; white-space: nowrap;">
              ${
                displayBadge
                  ? `<div style="display: inline-block; padding: 2px 8px; background: #1F2937; color: #ffffff; font-size: 9.5px; font-weight: 800; text-transform: uppercase; border-radius: 3px; margin-bottom: 4px; letter-spacing: 0.04em;">${esc(displayBadge)}</div>`
                  : ''
              }
              <div style="font-size: 10px; color: #333333; line-height: 1.45;">
                <div><b style="color: #000000;">Generated:</b> ${esc(dateStr)} at ${esc(timeStr)}</div>
                ${dateRange ? `<div><b style="color: #000000;">Period:</b> ${esc(dateRange)}</div>` : ''}
                <div style="color: #1F2937; font-weight: 700; font-size: 10px; margin-top: 1px;">Official Commercial Record</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      ${
        metaItems && metaItems.length > 0
          ? `<div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px; padding: 6px 12px; background: #f8fafc; border: 1px solid #999999; border-radius: 4px; font-size: 10.5px; color: #111111;">
              ${metaItems
                .map(
                  (m) =>
                    `<div><span style="color: #333333; font-weight: 700;">${esc(m.label)}: </span><span style="font-weight: 800; color: #000000;">${esc(m.value)}</span></div>`
                )
                .join('')}
            </div>`
          : ''
      }

      ${
        title
          ? `<div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #999999; padding-top: 8px;">
              <div>
                <h2 style="margin: 0; font-size: 15px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.02em;">${esc(title)}</h2>
                ${subtitle ? `<div style="font-size: 11px; color: #333333; font-weight: 500; margin-top: 2px;">${esc(subtitle)}</div>` : ''}
              </div>
              <div style="font-size: 9.5px; color: #333333; font-weight: 600;">Confidential · Internal Company Document</div>
            </div>`
          : ''
      }
    </div>
  `;
}

/**
 * Generates identical HTML string for signatures in standalone iframe documents
 */
export function getCompanyPrintSignaturesHtml(items = [
  { title: 'Marketing Executive', note: 'Prepared By' },
  { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
  { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
]) {
  const esc = (s) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  return `
    <div style="margin-top: 36px; padding-top: 16px; display: table; width: 100%; border-collapse: collapse; page-break-inside: avoid;">
      <div style="display: table-row;">
        ${items.map(item => {
          const roleTitle = typeof item === 'object' && item !== null ? item.title || item.role : item;
          const note = typeof item === 'object' && item !== null ? item.note || 'Signature & Date' : 'Signature & Date';
          return `
            <div style="display: table-cell; width: ${Math.floor(100 / items.length)}%; text-align: center; vertical-align: top; padding: 0 10px;">
              <div style="border-top: 1.5px solid #111111; width: 80%; margin: 0 auto 6px;"></div>
              <div style="font-size: 11.5px; color: #000000; font-weight: 800;">${esc(roleTitle)}</div>
              <div style="font-size: 10px; color: #333333; margin-top: 2px; font-weight: 600;">${esc(note)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
