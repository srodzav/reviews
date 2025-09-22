const API_BASE = 'http://127.0.0.1:8000/api';

// User login
export async function login({ username, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  if (data.token) setToken(data.token);
  return data;
}

// User logout
export async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() }
    });
  } catch (e) {
    console.debug('logout backend call failed', e);
  }
  setToken(null);
}

// Get all reviews
export async function fetchReviews() {
  const res = await fetch(`${API_BASE}/reviews`);
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Create a new review
export async function createReview(payload) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload)
  });
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Search movies by title
export async function searchMovies(query) {
  const url = `${API_BASE}/movies/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Create a movie from TMDB ID
export async function createMovieFromTmdb(tmdb_id) {
  const res = await fetch(`${API_BASE}/movies/from-tmdb`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ tmdb_id })
  });
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// yap yap yap
function setToken(token) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}
function getToken() {
  return localStorage.getItem('auth_token');
}
function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseTextResponse(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
