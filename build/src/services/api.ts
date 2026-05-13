const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('klip_token');

const getHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  auth: {
    signup: (data: any) => fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    
    login: (data: any) => fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  },
  
  items: {
    getAll: () => fetch(`${API_URL}/items`, {
      headers: getHeaders(),
    }).then(res => res.json()),
    
    create: (data: any) => fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json()),
    
    delete: (id: number) => fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }),
    
    togglePin: (id: number) => fetch(`${API_URL}/items/${id}/pin`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(res => res.json()),

    upload: (file: File, data?: { burn_after_read?: boolean; retention_days?: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (data?.burn_after_read !== undefined) {
        formData.append('burn_after_read', String(data.burn_after_read));
      }
      if (data?.retention_days !== undefined) {
        formData.append('retention_days', String(data.retention_days));
      }

      return fetch(`${API_URL}/items/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      }).then(res => res.json());
    },
  },

  user: {
    getSettings: () => fetch(`${API_URL}/user/settings`, {
      headers: getHeaders(),
    }).then(res => res.json()),
    
    updateSettings: (data: { retention_days: number, ask_each_time: boolean }) => fetch(`${API_URL}/user/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json()),
    
    getDevices: () => fetch(`${API_URL}/user/devices`, {
      headers: getHeaders(),
    }).then(res => res.json()),
    
    deleteDevice: (id: number) => fetch(`${API_URL}/user/devices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }),
    
    deleteAllItems: () => fetch(`${API_URL}/user/items/all`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  }
};
