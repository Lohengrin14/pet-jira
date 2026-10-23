// Клиент REST API сервера pet-jira-server. Адрес берётся из VITE_API_URL (см. .env.example)
export const API_URL = (import.meta.env.VITE_API_URL ?? 'https://pet-jira-server.onrender.com').replace(/\/$/, '')

const TOKEN_KEY = 'pet-jira:token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // хранилище недоступно: вход живёт до перезагрузки страницы
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body) {
  const headers = {}
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  if (body !== undefined) headers['content-type'] = 'application/json'

  let res
  try {
    res = await fetch(API_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'Сервер недоступен. Проверьте интернет и попробуйте ещё раз')
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Ошибка сервера (${res.status})`)
  return data
}

export const api = {
  health: () => request('GET', '/health'),
  users: () => request('GET', '/users'),
  login: (userId) => request('POST', '/auth/dev-login', { userId }),
  me: () => request('GET', '/me'),
  createUser: (data) => request('POST', '/users', data),
  updateUser: (id, changes) => request('PATCH', `/users/${id}`, changes),
  deleteUser: (id) => request('DELETE', `/users/${id}`),
  projects: () => request('GET', '/projects'),
  createProject: (data) => request('POST', '/projects', data),
  updateProject: (id, changes) => request('PATCH', `/projects/${id}`, changes),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  tasks: () => request('GET', '/tasks'),
  createTask: (data) => request('POST', '/tasks', data),
  updateTask: (id, changes) => request('PATCH', `/tasks/${id}`, changes),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
  comments: (taskId) => request('GET', `/tasks/${taskId}/comments`),
  addComment: (taskId, text) => request('POST', `/tasks/${taskId}/comments`, { text }),
  deleteComment: (id) => request('DELETE', `/comments/${id}`),
}
