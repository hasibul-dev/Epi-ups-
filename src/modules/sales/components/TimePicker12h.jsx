import React, { useEffect, useState } from 'react';
import { to12hParts } from '../utils/helpers.js';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = [
  '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'
];

export default function TimePicker12h({
  value,
  onChange,
  disabled = false,
  style = {},
  className = '',
  id,
}) {
  const parts = to12hParts(value);
  const [hour, setHour] = useState(parts.hour);
  const [minute, setMinute] = useState(parts.minute);
  const [ampm, setAmpm] = useState(parts.ampm);

  useEffect(() => {
    if (value) {
      const p = to12hParts(value);
      setHour(p.hour);
      setMinute(p.minute);
      setAmpm(p.ampm);
    }
  }, [value]);

  const updateTime = (newH, newM, newA) => {
    setHour(newH);
    setMinute(newM);
    setAmpm(newA);
    if (onChange) {
      onChange(`${newH}:${newM} ${newA}`);
    }
  };

  return (
    <div
      className={`time-picker-12h ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: disabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '10px',
        padding: '4px 8px',
        fontSize: '13px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        ...style,
      }}
      id={id}
    >
      <select
        value={hour}
        disabled={disabled}
        onChange={(e) => updateTime(e.target.value, minute, ampm)}
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: '13px',
          fontWeight: 700,
          color: '#ffffff',
          padding: '2px 0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
        title="Hour (12-hour format)"
      >
        {HOURS.map((h) => (
          <option key={h} value={h} style={{ background: '#080d1a', color: '#ffffff' }}>
            {h}
          </option>
        ))}
      </select>

      <span style={{ fontWeight: 'bold', color: '#fbbf24', userSelect: 'none' }}>:</span>

      <select
        value={minute}
        disabled={disabled}
        onChange={(e) => updateTime(hour, e.target.value, ampm)}
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: '13px',
          fontWeight: 700,
          color: '#ffffff',
          padding: '2px 0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
        title="Minutes"
      >
        {/* If existing minute is not in standard 5-min intervals, include it */}
        {!MINUTES.includes(minute) && (
          <option value={minute} style={{ background: '#080d1a', color: '#ffffff' }}>{minute}</option>
        )}
        {MINUTES.map((m) => (
          <option key={m} value={m} style={{ background: '#080d1a', color: '#ffffff' }}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={ampm}
        disabled={disabled}
        onChange={(e) => updateTime(hour, minute, e.target.value)}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          background: ampm === 'AM' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(245, 158, 11, 0.25)',
          color: ampm === 'AM' ? '#ffaa5a' : '#ffd166',
          fontSize: '11px',
          fontWeight: 800,
          padding: '3px 6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          marginLeft: '4px',
        }}
        title="AM / PM Period"
      >
        <option value="AM" style={{ background: '#080d1a', color: '#ffffff' }}>AM</option>
        <option value="PM" style={{ background: '#080d1a', color: '#ffffff' }}>PM</option>
      </select>
    </div>
  );
}
