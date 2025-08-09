// src/api.js

const baseURL = 'http://localhost:3001';

export async function login(username, password) {
  const res = await fetch(`${baseURL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}



// Fetch betting history with Authorization Bearer token
export function getAccessToken() {
  return localStorage.getItem('accessToken') || '';
}

export function logout() {
  localStorage.removeItem('accessToken');
}

export async function getBettingHistory() {
  const url = `${baseURL}/history`;
  const accessToken = getAccessToken();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('Failed to fetch betting history');
  return res.json();
}
