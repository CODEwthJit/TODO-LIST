const API_BASE_URL = 'http://localhost:3000/api/todos';

async function request(path = '', options = {}) {
  const requestOptions = options.body
    ? {
        ...options,
        headers: { 'Content-Type': 'application/json' },
      }
    : options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody.error) message = errorBody.error;
    } catch {
      // Keep the status-based message if the server did not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

export function getTodos(filters) {
  const query = new URLSearchParams(filters).toString();
  return request(`?${query}`);
}

export function createTodo(title) {
  return request('', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function updateTodo(todoId, completed) {
  return request(`/${encodeURIComponent(todoId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function deleteTodo(todoId) {
  return request(`/${encodeURIComponent(todoId)}`, {
    method: 'DELETE',
  });
}
