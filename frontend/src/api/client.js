// Efoy Hotel & Suites — Centralized API Client

const BASE_URL = '/api';

export const getToken = () => {
  try {
    return localStorage.getItem('efoy_auth_token');
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('efoy_auth_token', token);
    } else {
      localStorage.removeItem('efoy_auth_token');
    }
  } catch (err) {
    console.warn('Could not persist token:', err);
  }
};

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication API
export const authApi = {
  login: (credentials) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => apiFetch('/auth/me'),
};

// Rooms API
export const roomsApi = {
  getAll: () => apiFetch('/rooms'),
  getByNumber: (roomNumber) => apiFetch(`/rooms/${roomNumber}`),
  create: (room) =>
    apiFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    }),
  update: (roomNumber, data) =>
    apiFetch(`/rooms/${roomNumber}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateCleanliness: (roomNumber, cleanliness, dirtyReason) =>
    apiFetch(`/rooms/${roomNumber}/cleanliness`, {
      method: 'PATCH',
      body: JSON.stringify({ cleanliness, dirtyReason }),
    }),
  delete: (roomNumber) =>
    apiFetch(`/rooms/${roomNumber}`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiFetch(`/bookings/${id}`),
  create: (booking) =>
    apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
  assign: (id, roomNumber, forceOverride = false) =>
    apiFetch(`/bookings/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ roomNumber, forceOverride }),
    }),
  getFolio: (roomNumber) => apiFetch(`/bookings/folio/${roomNumber}`),
  checkout: (roomNumber, paymentMethod) =>
    apiFetch(`/bookings/checkout/${roomNumber}`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    }),
  undoCheckout: (id) =>
    apiFetch(`/bookings/${id}/undo-checkout`, {
      method: 'POST',
    }),
};

// Menu API
export const menuApi = {
  getAll: (category) =>
    apiFetch(`/menu${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  create: (item) =>
    apiFetch('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  update: (id, item) =>
    apiFetch(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  toggleStock: (id) =>
    apiFetch(`/menu/${id}/toggle-stock`, {
      method: 'PATCH',
    }),
  delete: (id) =>
    apiFetch(`/menu/${id}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/orders${query ? `?${query}` : ''}`);
  },
  create: (order) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateStatus: (id, status, serverName) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, serverName }),
    }),
};

// Staff API
export const staffApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/staff${query ? `?${query}` : ''}`);
  },
  create: (staff) =>
    apiFetch('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    }),
  update: (id, staff) =>
    apiFetch(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    }),
  delete: (id) =>
    apiFetch(`/staff/${id}`, {
      method: 'DELETE',
    }),
};

// Housekeeping API
export const hkApi = {
  getHistory: () => apiFetch('/housekeeping/history'),
  certifyClean: (payload) =>
    apiFetch('/housekeeping/clean', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Analytics API
export const analyticsApi = {
  getOverview: () => apiFetch('/analytics/overview'),
};

// Logs API
export const logsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/logs${query ? `?${query}` : ''}`);
  },
  create: (log) =>
    apiFetch('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }),
};

// Settings API
export const settingsApi = {
  get: () => apiFetch('/settings'),
  update: (settings) =>
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  resetDemo: () =>
    apiFetch('/settings/reset-demo', {
      method: 'POST',
    }),
};

export default {
  auth: authApi,
  rooms: roomsApi,
  bookings: bookingsApi,
  menu: menuApi,
  orders: ordersApi,
  staff: staffApi,
  hk: hkApi,
  analytics: analyticsApi,
  logs: logsApi,
  settings: settingsApi,
};
