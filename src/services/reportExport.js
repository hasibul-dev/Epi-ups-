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
