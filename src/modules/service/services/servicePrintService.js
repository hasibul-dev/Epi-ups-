/**
 * EPI UPS BANGLADESH LIMITED — SERVICE DEPARTMENT ISOLATED PRINT SERVICE
 * Dispatches print jobs through a dedicated, isolated hidden iframe.
 * Ensures that the application's dark obsidian canvas, sidebars, headers,
 * modal wrappers, and screen controls NEVER enter the printable document.
 * Guarantees a pure white sheet from edge to edge with sharp black typography.
 */

export function printIsolatedElement(elementOrElements, options = {}) {
  const {
    title = 'EPI Service Report',
    orientation = 'portrait',
  } = options;

  try {
    // 1. Resolve source elements
    const elementsToPrint = [];
    if (typeof elementOrElements === 'string') {
      const el = document.getElementById(elementOrElements);
      if (el) elementsToPrint.push(el);
    } else if (Array.isArray(elementOrElements) || elementOrElements instanceof NodeList) {
      Array.from(elementOrElements).forEach((el) => {
        if (typeof el === 'string') {
          const found = document.getElementById(el);
          if (found) elementsToPrint.push(found);
        } else if (el && el.nodeType === 1) {
          elementsToPrint.push(el);
        }
      });
    } else if (elementOrElements && elementOrElements.nodeType === 1) {
      elementsToPrint.push(elementOrElements);
    }

    if (elementsToPrint.length === 0) {
      console.warn('[servicePrintService] No elements found to print:', elementOrElements);
      return false;
    }

    // 2. Remove any lingering print frames
    const existingFrame = document.getElementById('service-isolated-print-frame');
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    // 3. Create isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'service-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // 4. Extract content and strip screen-only UI
    const sheetsHtml = elementsToPrint.map((el) => {
      const clone = el.cloneNode(true);
      // Remove all elements marked no-print or buttons
      clone.querySelectorAll('.no-print, button, .btn, .print-hide').forEach((btn) => btn.remove());
      // Ensure the root sheet has clean classes
      clone.classList.remove('print-hide');
      clone.classList.add('sheet');
      return clone.outerHTML;
    }).join('\n');

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} — EPI UPS Bangladesh Limited</title>
  <style>
    @page {
      size: A4 ${orientation === 'landscape' ? 'landscape' : 'portrait'};
      margin: 12mm 10mm 15mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      background-color: #ffffff !important;
      background-image: none !important;
      color: #000000 !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", "SolaimanLipi", Arial, sans-serif !important;
      font-size: 10pt;
      line-height: 1.45;
      width: 100% !important;
      min-height: 100% !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
    .sheet {
      display: block !important;
      position: static !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
      background-image: none !important;
      color: #000000 !important;
      margin: 0 auto !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
    .sheet + .sheet {
      break-before: page !important;
      page-break-before: always !important;
      margin-top: 15mm !important;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      color: #000000 !important;
      page-break-inside: auto !important;
      margin-bottom: 14px !important;
      font-size: 9pt !important;
    }
    thead {
      display: table-header-group !important;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    th {
      background: #f1f5f9 !important;
      background-color: #f1f5f9 !important;
      color: #111827 !important;
      font-weight: 800 !important;
      border: 1px solid #999999 !important;
      border-bottom: 2px solid #111827 !important;
      padding: 6px 8px !important;
      text-align: left !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    td {
      color: #111111 !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
      border: 1px solid #999999 !important;
      padding: 6px 8px !important;
      vertical-align: top !important;
    }
    tbody tr:nth-child(even) td {
      background: #f9fafb !important;
      background-color: #f9fafb !important;
    }
    .no-print, .btn, button {
      display: none !important;
    }
    h1, h2, h3, h4, h5, strong, b {
      color: #000000 !important;
    }
    .sig, .signatures {
      display: flex !important;
      justify-content: space-between !important;
      margin-top: 36px !important;
      padding-top: 10px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .sig div, .sig-box, .sig-col {
      border-top: 1.5px solid #111111 !important;
      color: #000000 !important;
      font-weight: 700 !important;
      padding-top: 6px !important;
      font-size: 9.5px !important;
      text-align: center !important;
    }
    .epi-company-print-header {
      border-bottom: 2px solid #1F2937 !important;
      margin-bottom: 12px !important;
      padding-bottom: 8px !important;
      background: #ffffff !important;
      color: #000000 !important;
    }
    .footer {
      margin-top: 20px !important;
      border-top: 1px solid #999999 !important;
      padding-top: 6px !important;
      font-size: 9px !important;
      color: #333333 !important;
      display: flex !important;
      justify-content: space-between !important;
    }
  </style>
</head>
<body>
  ${sheetsHtml}
</body>
</html>`;

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // 5. Trigger print once fonts and images load
    executeIframePrint(iframe, doc);
    return true;
  } catch (err) {
    console.error('[servicePrintService] Failed to create isolated print frame:', err);
    return false;
  }
}

/**
 * Direct HTML isolated printer (for WorkDetailsModal job sheets)
 */
export function printIsolatedHtml(htmlContent, options = {}) {
  const {
    title = 'Work Order Job Sheet',
  } = options;

  try {
    const existingFrame = document.getElementById('service-isolated-print-frame');
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'service-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // Inject strict white background and zero outer border styles if not present
    let finalHtml = htmlContent;
    const styleInjection = `
      <style>
        html, body {
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: none !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .no-print, button, .btn {
          display: none !important;
        }
      </style>
    `;

    if (finalHtml.includes('</head>')) {
      finalHtml = finalHtml.replace('</head>', `${styleInjection}</head>`);
    } else {
      finalHtml = `${styleInjection}${finalHtml}`;
    }

    doc.open();
    doc.write(finalHtml);
    doc.close();

    executeIframePrint(iframe, doc);
    return true;
  } catch (err) {
    console.error('[servicePrintService] Failed to print HTML document:', err);
    return false;
  }
}

function executeIframePrint(iframe, doc) {
  const doPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('[servicePrintService] iframe print execution failed:', err);
    } finally {
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  };

  const checkAssetsAndPrint = () => {
    try {
      const imgs = Array.from(doc.images || []);
      const pending = imgs.filter((img) => !img.complete);

      if (pending.length > 0) {
        let loaded = 0;
        const onDone = () => {
          loaded++;
          if (loaded >= pending.length) {
            setTimeout(doPrint, 150);
          }
        };
        pending.forEach((img) => {
          img.onload = onDone;
          img.onerror = onDone;
        });
        setTimeout(doPrint, 1200);
      } else {
        setTimeout(doPrint, 200);
      }
    } catch (e) {
      setTimeout(doPrint, 250);
    }
  };

  if (doc.readyState === 'complete') {
    checkAssetsAndPrint();
  } else {
    iframe.contentWindow.onload = checkAssetsAndPrint;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
