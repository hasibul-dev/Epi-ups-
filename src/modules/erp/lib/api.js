import { erpStorageRouter } from '../services/erpStorage.js';

const BASE = import.meta.env.VITE_API_URL || '/api';
let token = localStorage.getItem('epi_token') || '';
let refreshToken = localStorage.getItem('epi_refresh_token') || '';
let onUnauthorized = () => {};
let refreshPromise = null;

export const setToken = (t) => {
  token = t || '';
  if (t) localStorage.setItem('epi_token', t);
  else localStorage.removeItem('epi_token');
};

export const getToken = () => token || localStorage.getItem('epi_token') || '';

export const setRefreshToken = (rt) => {
  refreshToken = rt || '';
  if (rt) localStorage.setItem('epi_refresh_token', rt);
  else localStorage.removeItem('epi_refresh_token');
};

export const getRefreshToken = () => refreshToken || localStorage.getItem('epi_refresh_token') || '';

export const clearTokens = () => {
  token = '';
  refreshToken = '';
  localStorage.removeItem('epi_token');
  localStorage.removeItem('epi_refresh_token');
  localStorage.removeItem('epi_user');
};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function performRefresh() {
  const rt = getRefreshToken() || getToken();
  if (!rt) throw new Error('No refresh token available');

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${rt}`,
    },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) {
    throw new Error('Refresh failed');
  }

  const data = await res.json();
  if (data.token) {
    setToken(data.token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    if (data.user) localStorage.setItem('epi_user', JSON.stringify(data.user));
    return data.token;
  }
  throw new Error('Invalid token refresh payload');
}

async function request(method, path, body, params, isRetry = false) {
  // Try browser-local double-entry storage engine first
  try {
    const localResult = await erpStorageRouter(method, path, body, params);
    if (localResult !== undefined) {
      return localResult;
    }
  } catch (err) {
    throw err;
  }

  const currentToken = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs(params)}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and that the API is running.');
  }

  // Handle 401 Unauthorized
  if (res.status === 401) {
    // If it's a login or setup attempt, do not log out; just let caller handle bad credentials
    if (path.startsWith('/auth/login') || path.startsWith('/auth/setup') || path.startsWith('/auth/status')) {
      const authErrData = await res.json().catch(() => ({}));
      throw new Error(authErrData.error || 'Invalid credentials');
    }

    // If refresh endpoint itself failed, session is dead
    if (path.startsWith('/auth/refresh')) {
      clearTokens();
      onUnauthorized();
      throw new Error('Session expired. Please sign in again.');
    }

    // Try to refresh token once if not a retry
    if (!isRetry && (getRefreshToken() || currentToken)) {
      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        // Retry the original request with the fresh token
        return request(method, path, body, params, true);
      } catch {
        clearTokens();
        onUnauthorized();
        throw new Error('Session expired. Please sign in again.');
      }
    }

    // If already a retry or no refresh token
    clearTokens();
    onUnauthorized();
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 403) {
    throw new Error(data.error || 'Access denied: You do not have permission for this action');
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  get: (p, params) => request('GET', p, undefined, params),
  post: (p, b) => request('POST', p, b ?? {}),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
};
