import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, Copy, Check } from 'lucide-react';

export default function ExpandableText({
  text = '',
  title = 'Full Details',
  subtitle = '',
  maxLength = 40,
  emptyText = '—',
  onlyButton = false,
  buttonLabel = 'View More',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close modal on Escape key and prevent background body scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const rawText = String(text || '').trim();

  if (!rawText) {
    if (onlyButton) return null;
    return <span style={{ color: '#8fa0b0', fontSize: 12 }}>{emptyText}</span>;
  }

  const isLong = rawText.length > maxLength || rawText.includes('\n');
  const snippet = isLong ? rawText.slice(0, maxLength).trim() + '...' : rawText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback copy
      const textArea = document.createElement('textarea');
      textArea.value = rawText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modalElement = isOpen ? (
    <div
      className="view-more-overlay"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-more-modal-title"
    >
      <div
        className="view-more-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="view-more-header">
          <div className="view-more-title-wrap">
            <div className="view-more-icon">
              <FileText size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 id="view-more-modal-title">{title}</h3>
              {subtitle && <p className="view-more-sub">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="view-more-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close popup"
            title="Close (Esc)"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="view-more-body">
          <div className="view-more-text-container">
            <p className="view-more-fulltext">{rawText}</p>
          </div>
          <div className="view-more-meta-row">
            <span className="view-more-char-count">
              {rawText.length} characters · {rawText.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              className="view-more-copy-btn"
              onClick={handleCopy}
              title="Copy complete text to clipboard"
            >
              {copied ? (
                <><Check size={13} strokeWidth={2.4} color="#059669" /> Copied!</>
              ) : (
                <><Copy size={13} strokeWidth={2.2} /> Copy Text</>
              )}
            </button>
          </div>
        </div>

        <div className="view-more-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {onlyButton ? (
        <button
          type="button"
          className="view-more-chip"
          onClick={() => setIsOpen(true)}
          title="Click to view full text in popup"
        >
          {buttonLabel}
        </button>
      ) : (
        <span className="expandable-text-wrap">
          <span className="expandable-text-content" title={isLong ? rawText : undefined}>
            {snippet}
          </span>
          <button
            type="button"
            className="view-more-chip"
            onClick={() => setIsOpen(true)}
            title="Click to view full text in popup"
          >
            {buttonLabel}
          </button>
        </span>
      )}

      {typeof document !== 'undefined' && modalElement
        ? createPortal(modalElement, document.body)
        : modalElement}
    </>
  );
}
