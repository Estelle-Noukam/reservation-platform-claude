const api = {
  async request(method, url, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, data };
    return data;
  },
  get: (url) => api.request('GET', url),
  post: (url, body) => api.request('POST', url, body),
  put: (url, body) => api.request('PUT', url, body),
  patch: (url, body) => api.request('PATCH', url, body),
  delete: (url) => api.request('DELETE', url),
};

const Auth = {
  current: null,
  async load() {
    try { Auth.current = await api.get('/api/auth/me'); }
    catch { Auth.current = null; }
    return Auth.current;
  },
  async login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    Auth.current = data.user;
    return data.user;
  },
  async register(payload) {
    const data = await api.post('/api/auth/register', payload);
    Auth.current = data.user;
    return data.user;
  },
  async logout() {
    await api.post('/api/auth/logout');
    Auth.current = null;
  },
  isAdmin() { return Auth.current && Auth.current.role === 'admin'; },
};
