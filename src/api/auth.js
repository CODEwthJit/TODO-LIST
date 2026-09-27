const API_BASE_URL = 'http://localhost:3000/api/auth';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: options.body
      ? { ...options.headers, 'Content-Type': 'application/json' }
      : options.headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody.error) message = errorBody.error;
    } catch {
      // Keep the status-based message if the server did not return JSON.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function getCurrentUser() {
  try {
    const result = await request('/me');
    return result.user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export async function register(credentials) {
  const result = await request('/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return result.user;
}

export async function login(credentials) {
  const result = await request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return result.user;
}

export function logout() {
  return request('/logout', { method: 'POST' });
}
