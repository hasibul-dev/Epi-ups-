const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };
const I = (d) => (props) => <svg {...p} {...props}>{d}</svg>;
export const Icons = {
  dashboard: I(<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>),
  book: I(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></>),
  journal: I(<><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></>),
  bank: I(<><path d="M3 10 12 4l9 6"/><path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/></>),
  users: I(<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.3 3.5 5"/></>),
  cart: I(<><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2.5l2.3 11h10.4l2-8H6.5"/></>),
  receipt: I(<><path d="M5 3h14v18l-2.5-1.7L14 21l-2-1.7L10 21l-2.5-1.7L5 21z"/><path d="M9 8h6M9 12h6"/></>),
  wallet: I(<><path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1.2"/></>),
  box: I(<><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></>),
  percent: I(<><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></>),
  payroll: I(<><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/></>),
  asset: I(<><path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></>),
  chart: I(<><path d="M4 20V4M4 20h16"/><path d="m8 15 3-4 3 2 5-6"/></>),
  shield: I(<><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></>),
  log: I(<><path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/></>),
  gear: I(<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/></>),
  logout: I(<><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/></>),
  menu: I(<><path d="M4 6h16M4 12h16M4 18h16"/></>),
  download: I(<><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></>),
  alert: I(<><path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/></>),
};
