export const KEY = 'epi_ups_business_assistant_v2';
export const RULES = {
  Potential: 3,
  'No Potential': 10,
  'Non-Potential': 10, // backward compatibility with older saved records
  Quotation: 7,
  Sale: 30,
};
export const CATEGORIES = ['Potential', 'No Potential', 'Quotation', 'Sale'];
export const METHODS = ['Meet', 'Call', 'Mail', 'Visit'];
export const CLIENTS_PER_PAGE = 18; // A4-friendly; print uses the same split

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Local-date based (the original used UTC, which shows "yesterday" before 6 AM in Dhaka)
export const today = () => toISO(new Date());

export const addDays = (d, n) => {
  if (!d) return today();
  const dateStr = String(d).split('T')[0];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const x = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    x.setDate(x.getDate() + (Number(n) || 0));
    return toISO(x);
  }
  const x = new Date(d);
  x.setDate(x.getDate() + (Number(n) || 0));
  return toISO(x);
};

export const fmt = (d) => {
  if (!d) return '—';
  const dateStr = String(d).split('T')[0];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const x = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return x.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return d;
};

export const inRange = (d, from, to) => !!d && d >= from && d <= to;

/**
 * Convert any time string (24h, 12h, or ISO) to minutes from midnight (0..1439).
 * Blank or invalid times return -1.
 */
export const timeToMinutes = (t) => {
  if (!t || typeof t !== 'string') {
    if (t instanceof Date) return t.getHours() * 60 + t.getMinutes();
    return -1;
  }
  const str = t.trim();
  if (!str || str === '—') return -1;

  // Handle ISO timestamp: e.g. 2026-10-13T09:15:00.000Z
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  // Handle 12-hour time with AM/PM: e.g. "02:30 PM", "9:15 am", "12:00 PM"
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP][mM])?$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridiem = ampmMatch[3] ? ampmMatch[3].toUpperCase() : null;

    if (meridiem) {
      if (meridiem === 'AM') {
        if (hours === 12) hours = 0;
      } else if (meridiem === 'PM') {
        if (hours < 12) hours += 12;
      }
    }
    return hours * 60 + minutes;
  }

  return -1;
};

/**
 * Format any time string (24h, 12h, or ISO) into standard 12-hour AM/PM format (e.g. "09:30 AM", "02:15 PM").
 */
export const formatTime12h = (t) => {
  if (!t) return '';
  if (typeof t !== 'string' && !(t instanceof Date)) return String(t);

  const mins = timeToMinutes(t);
  if (mins === -1) return typeof t === 'string' ? t.trim() : '';

  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;

  return `${pad(displayH)}:${pad(m)} ${period}`;
};

/**
 * Break any time string into 12-hour picker parts { hour: '09', minute: '30', ampm: 'AM' }
 */
export const to12hParts = (t) => {
  const mins = timeToMinutes(t);
  if (mins === -1) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return {
      hour: pad(h % 12 === 0 ? 12 : h % 12),
      minute: pad(m),
      ampm: h >= 12 ? 'PM' : 'AM',
    };
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return {
    hour: pad(h % 12 === 0 ? 12 : h % 12),
    minute: pad(m),
    ampm: h >= 12 ? 'PM' : 'AM',
  };
};

/**
 * Convert any time string (12h or ISO) into 24-hour "HH:MM" format.
 */
export const to24hTime = (t) => {
  const mins = timeToMinutes(t);
  if (mins === -1) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
};

/**
 * Chronological comparison of two times with accurate AM/PM interpretation.
 */
export const compareTimes = (timeA, timeB) => {
  const mA = timeToMinutes(timeA);
  const mB = timeToMinutes(timeB);
  if (mA === -1 && mB === -1) return 0;
  if (mA === -1) return 1;
  if (mB === -1) return -1;
  return mA - mB;
};

/**
 * Format ISO timestamp into 12-hour AM/PM string.
 */
export const clockTime = (iso) => {
  if (!iso) return '';
  return formatTime12h(iso);
};

export const now12h = () => formatTime12h(new Date());

export const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);

export const getTaskCategory = (date, time, status) => {
  if (status === 'Completed') return 'Completed';
  const todayStr = today();
  const d = date || todayStr;

  if (d < todayStr) {
    return 'Overdue';
  }

  if (d === todayStr) {
    if (time) {
      const taskMins = timeToMinutes(time);
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      if (taskMins !== -1 && taskMins < currentMins) {
        return 'Overdue';
      }
    }
    return 'Active';
  }

  return 'Upcoming';
};
