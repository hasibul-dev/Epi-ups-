/**
 * EPI CENTRALIZED MANAGEMENT SYSTEM — ENTERPRISE REPORT EXPORT ENGINE
 * Provides PDF export, Excel/CSV export, and formatted Print layouts
 * across Sales, Service, Digital Marketing, IT Support, and ERP Accounts.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEPT_COLORS = {
  Sales: [0, 82, 204], // Royal Blue
  Service: [5, 150, 105], // Emerald Green
  Marketing: [124, 58, 237], // Purple
  'IT Support': [79, 70, 229], // Indigo
  Accounts: [30, 41, 59], // Dark Slate
  Admin: [15, 23, 42],
};

/**
 * Generates and downloads a clean, professional PDF report
 */
export function exportToPdf({
  title = 'Enterprise Report',
  department = 'EPI UPS Bangladesh Limited',
  subtitle = '',
  dateRange = '',
  headers = [],
  rows = [],
  summary = {},
  orientation = 'landscape',
  filename = '',
}) {
  try {
    const doc = new jsPDF({
      orientation: orientation === 'portrait' ? 'p' : 'l',
      unit: 'pt',
      format: 'a4',
    });

    const primaryColor = DEPT_COLORS[department] || [0, 82, 204];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 54, 'F');

    // Company Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('EPI UPS BANGLADESH LIMITED', 40, 26);

    // Department Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(224, 242, 254);
    doc.text(
      `${department.toUpperCase()} · CENTRALLY MANAGED ENTERPRISE SYSTEM`,
      40,
      42
    );

    // Generation Timestamp on top right
    const now = new Date();
    const generatedStr = `Generated: ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString(
      [],
      { hour: '2-digit', minute: '2-digit' }
    )}`;
    doc.setFontSize(8.5);
    doc.text(generatedStr, pageWidth - 40, 26, { align: 'right' });
    if (dateRange) {
      doc.text(`Period: ${dateRange}`, pageWidth - 40, 40, { align: 'right' });
    }

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 40, 78);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, 40, 92);
    }

    let startY = subtitle ? 104 : 92;

    // Optional Summary Metrics Strip
    const summaryEntries = Object.entries(summary || {}).filter(
      ([_, val]) => val !== undefined && val !== null
    );
    if (summaryEntries.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, startY, pageWidth - 80, 28, 4, 4, 'FD');

      let currentX = 50;
      doc.setFontSize(8.5);
      summaryEntries.forEach(([key, val], idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${key}: `, currentX, startY + 18);
        const keyWidth = doc.getTextWidth(`${key}: `);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(String(val), currentX + keyWidth, startY + 18);
        const valWidth = doc.getTextWidth(String(val));

        currentX += keyWidth + valWidth + 24;
      });

      startY += 38;
    }

    // Main Table
    autoTable(doc, {
      startY: startY,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 4.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 40, right: 40, bottom: 60 },
      didDrawPage: (data) => {
        // Footer: Page Number & Confidentiality Note
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'EPI UPS Bangladesh Limited — Confidential & Official Record',
          40,
          pageHeight - 20
        );
        doc.text(str, pageWidth - 40, pageHeight - 20, { align: 'right' });
      },
    });

    // Signatures Section on last page
    const finalY = doc.lastAutoTable.finalY + 35;
    if (finalY + 45 < pageHeight - 30) {
      const sigY = finalY + 25;
      const colWidth = (pageWidth - 80) / 3;

      doc.setDrawColor(203, 213, 225);
      doc.line(50, sigY, 50 + colWidth - 20, sigY);
      doc.line(50 + colWidth, sigY, 50 + 2 * colWidth - 20, sigY);
      doc.line(50 + 2 * colWidth, sigY, pageWidth - 50, sigY);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared By', 50 + (colWidth - 20) / 2, sigY + 12, {
        align: 'center',
      });
      doc.text(
        'Verified By (Department Manager)',
        50 + colWidth + (colWidth - 20) / 2,
        sigY + 12,
        { align: 'center' }
      );
      doc.text(
        'Authorized Signatory',
        50 + 2 * colWidth + (colWidth - 20) / 2,
        sigY + 12,
        { align: 'center' }
      );
    }

    const saveName =
      filename ||
      `EPI-${department.replace(/\s+/g, '-')}-${title.replace(/\s+/g, '-')}-${now
        .toISOString()
        .slice(0, 10)}.pdf`;

    doc.save(saveName);
    return true;
  } catch (err) {
    console.error('[exportToPdf] Error exporting PDF:', err);
    window.print();
    return false;
  }
}

/**
 * Generates and downloads a clean UTF-8 CSV spreadsheet compatible with Microsoft Excel
 */
export function exportToCsv({
  title = 'Report',
  department = 'EPI UPS Bangladesh Limited',
  dateRange = '',
  headers = [],
  rows = [],
  filename = '',
}) {
  try {
    const lines = [];

    // Title & Metadata
    lines.push(`"EPI UPS BANGLADESH LIMITED - ${department.toUpperCase()}"`);
    lines.push(`"${title}"`);
    if (dateRange) lines.push(`"Date Period: ${dateRange}"`);
    lines.push(`"Generated: ${new Date().toLocaleString()}"`);
    lines.push('');

    // Table Headers
    lines.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

    // Data Rows
    rows.forEach((row) => {
      lines.push(
        row
          .map((cell) =>
            cell === null || cell === undefined
              ? '""'
              : `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(',')
      );
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      filename ||
      `EPI-${department.replace(/\s+/g, '-')}-${title.replace(/\s+/g, '-')}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('[exportToCsv] Error exporting CSV:', err);
    return false;
  }
}

/**
 * Programmatic Print Dispatcher via Isolated Hidden Iframe
 * Bypasses popup blockers and prevents parent styling leaks
 */
export function printHtmlDocument(html, title = 'EPI Document') {
  try {
    const existing = document.getElementById('epi-print-frame');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'epi-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const doPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('[printHtmlDocument] iframe print error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1500);
      }
    };

    if (doc.readyState === 'complete') {
      setTimeout(doPrint, 250);
    } else {
      iframe.contentWindow.onload = () => setTimeout(doPrint, 250);
    }
  } catch (e) {
    console.error('[printHtmlDocument] Failed to print:', e);
    window.print();
  }
}

/**
 * Enterprise Formatted A4 Printable Report Generator
 * Renders official EPI corporate letterhead, metadata, summary statistics,
 * crisp table borders, signatures and page numbering.
 */
export function printFormattedReport({
  title = 'Enterprise Report',
  department = 'EPI UPS Bangladesh Limited',
  dateRange = '',
  subtitle = '',
  summary = {},
  headers = [],
  rows = [],
  orientation = 'portrait',
}) {
  const esc = (s) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  const now = new Date();
  const generatedStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const summaryEntries = Object.entries(summary || {}).filter(([_, v]) => v !== undefined && v !== null);

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)} — EPI UPS Bangladesh Limited</title>
  <style>
    @page {
      size: A4 ${orientation};
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", "SolaimanLipi", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #000;
      text-transform: uppercase;
    }
    .brand p {
      margin: 2px 0 0;
      font-size: 10px;
      color: #475569;
    }
    .dept-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      background: #0f172a;
      color: #ffffff;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 9.5px;
      color: #334155;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .report-title-bar {
      margin: 10px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #cbd5e1;
    }
    .report-title-bar h2 {
      margin: 0 0 2px;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }
    .report-title-bar p {
      margin: 0;
      font-size: 10px;
      color: #64748b;
    }
    .summary-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 6px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .summary-item {
      font-size: 10px;
    }
    .summary-item strong {
      color: #0f172a;
    }
    .summary-item span {
      color: #0052cc;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 16px;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    td.numeric, th.numeric {
      text-align: right;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-col {
      width: 28%;
      text-align: center;
      border-top: 1px solid #334155;
      padding-top: 6px;
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
    }
    .footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 8.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>EPI UPS Bangladesh Limited</h1>
      <p>House # 03, Road # 15, Sector # 03, Uttara, Dhaka-1230 | Hotline: +88 01778-249416 | Web: www.epiups.com.bd</p>
      <div class="dept-badge">${esc(department)}</div>
    </div>
    <div class="meta-box">
      <div><strong>Date:</strong> ${esc(generatedStr)}</div>
      ${dateRange ? `<div><strong>Period:</strong> ${esc(dateRange)}</div>` : ''}
      <div><strong>Classification:</strong> Official Management Record</div>
    </div>
  </div>

  <div class="report-title-bar">
    <h2>${esc(title)}</h2>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
  </div>

  ${
    summaryEntries.length > 0
      ? `<div class="summary-strip">
          ${summaryEntries
            .map(
              ([k, v]) => `<div class="summary-item"><strong>${esc(k)}:</strong> <span>${esc(v)}</span></div>`
            )
            .join('')}
        </div>`
      : ''
  }

  <table>
    <thead>
      <tr>
        ${headers.map((h, i) => `<th class="${typeof h === 'object' && h.align === 'right' ? 'numeric' : ''}">${esc(typeof h === 'object' ? h.label : h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${
        rows.length > 0
          ? rows
              .map(
                (r) =>
                  `<tr>${r
                    .map(
                      (cell, i) =>
                        `<td class="${typeof cell === 'number' || (typeof headers[i] === 'object' && headers[i].align === 'right') ? 'numeric' : ''}">${esc(cell)}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('')
          : `<tr><td colspan="${headers.length}" style="text-align: center; padding: 18px; color: #94a3b8;">No records found for the selected criteria.</td></tr>`
      }
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-col">Prepared By</div>
    <div class="sig-col">Verified By (Department Manager)</div>
    <div class="sig-col">Authorized Signatory</div>
  </div>

  <div class="footer">
    <div>EPI UPS Bangladesh Limited · Enterprise Unified Management System · Official Document</div>
    <div>Generated ${esc(generatedStr)}</div>
  </div>
</body>
</html>`;

  printHtmlDocument(html, title);
}

/**
 * Triggers native browser Print Dialog with custom document title
 */
export function triggerPrint(printTitle) {
  const prevTitle = document.title;
  if (printTitle) {
    document.title = printTitle;
  }
  window.print();
  setTimeout(() => {
    document.title = prevTitle;
  }, 500);
}
