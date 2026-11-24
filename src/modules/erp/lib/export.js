// Export helpers: CSV, Excel (exceljs), PDF (jsPDF) and print. Columns: [{ key, label, fmt?, align? }]
import { printHtmlDocument } from '../../../services/reportExport.js';
import { getCompanyPrintHeaderHtml } from '../../../components/CompanyPrintHeader.jsx';
const cell = (c, row) => {
  const v = typeof c.key === 'function' ? c.key(row) : row[c.key];
  return v === undefined || v === null ? '' : v;
};
const text = (c, row) => {
  const v = cell(c, row);
  return c.fmt ? c.fmt(v, row) : String(v);
};
const stamp = () => new Date().toISOString().slice(0, 10);
const safe = (s) => s.replace(/[^a-z0-9_-]+/gi, '_');

function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function exportCSV({ title, columns, rows }) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => esc(c.label)).join(',')];
  rows.forEach((r) => lines.push(columns.map((c) => esc(text(c, r))).join(',')));
  download(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }), `${safe(title)}_${stamp()}.csv`);
}

export async function exportExcel({ title, subtitle, columns, rows, company }) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(title.slice(0, 31));
  ws.addRow([company || 'EPI UPS Bangladesh Limited']).font = { bold: true, size: 14 };
  ws.addRow([title]).font = { bold: true, size: 12 };
  if (subtitle) ws.addRow([subtitle]);
  ws.addRow([]);
  const head = ws.addRow(columns.map((c) => c.label));
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; });
  rows.forEach((r) => {
    const row = ws.addRow(columns.map((c) => {
      const v = cell(c, r);
      return c.numeric && v !== '' ? Number(v) : c.fmt ? c.fmt(v, r) : v;
    }));
    columns.forEach((c, i) => { if (c.numeric) row.getCell(i + 1).numFmt = '#,##0.00'; });
    if (r._bold) row.font = { bold: true };
  });
  columns.forEach((c, i) => {
    const max = Math.max(c.label.length, ...rows.slice(0, 200).map((r) => text(c, r).length));
    ws.getColumn(i + 1).width = Math.min(Math.max(max + 2, 10), 48);
  });
  const buf = await wb.xlsx.writeBuffer();
  download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${safe(title)}_${stamp()}.xlsx`);
}

export async function exportPDF({ title, subtitle, columns, rows, company }) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
  doc.setFontSize(14).setFont(undefined, 'bold').text(company || 'EPI UPS Bangladesh Limited', 40, 40);
  doc.setFontSize(11).text(title, 40, 58);
  doc.setFont(undefined, 'normal').setFontSize(9).text(`${subtitle ? `${subtitle}  |  ` : ''}Generated ${new Date().toLocaleString('en-GB')}`, 40, 72);
  autoTable(doc, {
    startY: 84,
    head: [columns.map((c) => c.label)],
    // jsPDF's default font has no taka glyph, so use "BDT" in PDF output
    body: rows.map((r) => columns.map((c) => text(c, r).replace(/৳/g, ''))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 138] },
    columnStyles: Object.fromEntries(columns.map((c, i) => [i, { halign: c.numeric || c.align === 'right' ? 'right' : 'left' }])),
    didParseCell: (d) => { if (d.section === 'body' && rows[d.row.index]?._bold) d.cell.styles.fontStyle = 'bold'; },
    margin: { left: 40, right: 40 },
  });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i).setFontSize(8).text(`Page ${i} of ${pages}  |  Amounts in BDT`, 40, doc.internal.pageSize.height - 24);
  }
  doc.save(`${safe(title)}_${stamp()}.pdf`);
}

export function printTable({ title, subtitle, columns, rows, company }) {
  const esc = (s) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)} — EPI UPS Bangladesh Limited</title>
  <style>
    @page {
      size: ${columns.length > 7 ? 'A4 landscape' : 'A4 portrait'};
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", "SolaimanLipi", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #111111;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #111827;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }
    .brand p {
      margin: 2px 0 0;
      font-size: 10px;
      color: #333333;
      font-weight: 500;
    }
    .dept-badge {
      display: inline-block;
      padding: 2px 7px;
      background: #111827;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      border-radius: 3px;
      margin-top: 3px;
    }
    .meta-box {
      text-align: right;
      font-size: 9.5px;
      color: #333333;
      font-weight: 500;
    }
    .report-title {
      font-size: 14px;
      font-weight: 800;
      color: #000000;
      margin: 0 0 3px;
      text-transform: uppercase;
    }
    .report-sub {
      font-size: 10.5px;
      color: #333333;
      margin: 0 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #999999;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-bottom: 16px;
      page-break-inside: auto;
      border: 1px solid #999999;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #999999;
      padding: 6px 7px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #111827;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5px;
      border: 1px solid #999999;
      border-bottom: 2px solid #111827;
    }
    td {
      color: #111111;
      background: #ffffff;
    }
    td.r, th.r {
      text-align: right;
    }
    tr.b td {
      font-weight: 800;
      color: #000000;
      background: #f3f4f6;
      border-top: 2px solid #111827;
      border-bottom: 2px solid #111827;
    }
    tbody tr:nth-child(even):not(.b) td {
      background: #f9fafb;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 38px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sig-col {
      width: 28%;
      text-align: center;
      border-top: 1.5px solid #111111;
      padding-top: 6px;
      font-size: 9.5px;
      color: #000000;
      font-weight: 700;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #999999;
      padding-top: 6px;
      font-size: 9px;
      color: #333333;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  ${getCompanyPrintHeaderHtml({
    title,
    department: 'ERP & ACCOUNTS',
    subtitle,
    metaItems: [
      { label: 'Currency', value: 'BDT (৳)' },
      { label: 'Classification', value: 'Audited Financial Record' },
    ],
    badge: 'ERP & ACCOUNTS',
  })}

  <table>
    <thead>
      <tr>
        ${columns.map((c) => `<th class="${c.numeric || c.align === 'right' ? 'r' : ''}">${esc(c.label)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${
        rows.length > 0
          ? rows
              .map(
                (r) =>
                  `<tr class="${r._bold ? 'b' : ''}">${columns
                    .map(
                      (c) => `<td class="${c.numeric || c.align === 'right' ? 'r' : ''}">${esc(text(c, r))}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('')
          : `<tr><td colspan="${columns.length}" class="print-empty-state" style="text-align: center; padding: 18px; color: #111111; font-weight: 700; background: #f9fafb; border: 1px solid #999999;">No accounting records found.</td></tr>`
      }
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-col">Prepared By (Accounts)</div>
    <div class="sig-col">Verified By (Manager / Finance)</div>
    <div class="sig-col">Authorized Signatory</div>
  </div>

  <div class="footer">
    <div>EPI UPS Bangladesh Limited · Double-Entry Financial Engine · Confidential</div>
    <div>Printed ${esc(dateStr)} ${esc(timeStr)}</div>
  </div>
</body>
</html>`;

  printHtmlDocument(html, title);
}
