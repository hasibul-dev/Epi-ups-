// Export helpers: CSV, Excel (exceljs), PDF (jsPDF) and print. Columns: [{ key, label, fmt?, align? }]
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
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>body{font:12px Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px;margin:0}h2{font-size:14px;margin:4px 0}
  p{margin:2px 0 12px;color:#555}table{border-collapse:collapse;width:100%}th{background:#1e3a8a;color:#fff;text-align:left}
  th,td{border:1px solid #ccc;padding:5px 7px}td.r,th.r{text-align:right}tr.b td{font-weight:700;background:#f3f4f6}</style></head><body>
  <h1>${esc(company || 'EPI UPS Bangladesh Limited')}</h1><h2>${esc(title)}</h2><p>${esc(subtitle || '')} Printed ${new Date().toLocaleString('en-GB')}</p>
  <table><thead><tr>${columns.map((c) => `<th class="${c.numeric || c.align === 'right' ? 'r' : ''}">${esc(c.label)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((r) => `<tr class="${r._bold ? 'b' : ''}">${columns.map((c) => `<td class="${c.numeric || c.align === 'right' ? 'r' : ''}">${esc(text(c, r))}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <script>window.onload=()=>{window.print();}</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) { alert('Allow pop-ups to print.'); return; }
  w.document.write(html);
  w.document.close();
}
