const API = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('gview_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...options, headers })
  return res
}
