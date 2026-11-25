/**
 * EPI UPS BANGLADESH LIMITED — DIGITAL MARKETING ISOLATED PRINT SERVICE
 * Dispatches print jobs through a dedicated, isolated hidden iframe.
 * Ensures that the app's dark theme, modals, topbar, sidebar, and wrappers
 * NEVER enter the printable document. The paper is pure white from edge to edge.
 */

export function printIsolatedElement(elementOrId, options = {}) {
  const {
    title = 'EPI Document',
    orientation = 'portrait',
  } = options;

  try {
    // 1. Resolve source element
    let targetEl = null;
    if (typeof elementOrId === 'string') {
      targetEl = document.getElementById(elementOrId);
    } else if (elementOrId && elementOrId.nodeType === 1) {
      targetEl = elementOrId;
    }

    if (!targetEl) {
      console.warn('[printIsolatedElement] Target element not found:', elementOrId);
      return false;
    }

    // 2. Remove any lingering print frames
    const existingFrame = document.getElementById('dm-isolated-print-frame');
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    // 3. Create isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'dm-isolated-print-frame';
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

    // 4. Build isolated HTML document
    const contentHtml = targetEl.innerHTML;
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
    .mkt-print-sheet,
    .print-container,
    #dm-modal-print-sheet {
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
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      color: #000000 !important;
      page-break-inside: auto !important;
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
      color: #000000 !important;
      font-weight: 800 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    td {
      color: #111111 !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
    }
    .no-print {
      display: none !important;
    }
    h1, h2, h3, h4, strong, b {
      color: #000000 !important;
    }
  </style>
</head>
<body>
  <div class="mkt-print-sheet print-container">
    ${contentHtml}
  </div>
</body>
</html>`;

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // 5. Execution helper after assets load
    const doPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (printErr) {
        console.error('[printIsolatedElement] Print execution error:', printErr);
      } finally {
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 2000);
      }
    };

    // 6. Wait for fonts & images (e.g. /logo.png) to complete
    const checkAssetsAndPrint = () => {
      try {
        const imgs = Array.from(doc.images || []);
        const pendingImgs = imgs.filter((img) => !img.complete);

        if (pendingImgs.length > 0) {
          let loadedCount = 0;
          const onImgDone = () => {
            loadedCount++;
            if (loadedCount >= pendingImgs.length) {
              setTimeout(doPrint, 150);
            }
          };
          pendingImgs.forEach((img) => {
            img.onload = onImgDone;
            img.onerror = onImgDone;
          });
          // Safety timeout if an image stalls
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

    return true;
  } catch (err) {
    console.error('[printIsolatedElement] Failed to create isolated print frame:', err);
    return false;
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
