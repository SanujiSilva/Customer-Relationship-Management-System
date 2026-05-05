const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('crm_token');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authApi = {
  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => apiRequest('/auth/me')
};

export const leadApi = {
  options: () => apiRequest('/leads/meta/options'),
  dashboard: () => apiRequest('/leads/dashboard/summary'),
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => Boolean(value))
    ).toString();
    return apiRequest(`/leads${query ? `?${query}` : ''}`);
  },
  get: (id) => apiRequest(`/leads/${id}`),
  create: (payload) =>
    apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (id, payload) =>
    apiRequest(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  updateStatus: (id, status) =>
    apiRequest(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  addNote: (id, content) =>
    apiRequest(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
  remove: (id) =>
    apiRequest(`/leads/${id}`, {
      method: 'DELETE'
    })
};
