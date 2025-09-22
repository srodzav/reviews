import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { fetchReviews, login, logout, searchMovies, createMovieFromTmdb, createReview } from './api';

function App() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Auth components
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; }
  });

  // Review componentes
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  const debounceRef = useRef(null);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchReviews();
        if (mounted) setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleLogin(e) {
    e?.preventDefault();
    try {
      const data = await login({ username, password });
      setUser(data.user || { username });
      localStorage.setItem('authUser', JSON.stringify(data.user || { username }));
      setPassword('');
    } catch (error) {
      setErr(String(error));
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authUser');
    }
  }

  function openForm() {
    setShowForm(true);
    setQuery('');
    setSuggestions([]);
    setSelectedMovie(null);
    setComment('');
    setRating(4);
  }

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMovies(query);
        setSuggestions(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('searchMovies error', e);
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleSelectSuggestion(item) {
    try {
      // ensure movie exists in backend (creates/returns movie)
      const movie = await createMovieFromTmdb(item.tmdb_id);
      setSelectedMovie(movie);
      setQuery('');
      setSuggestions([]);
    } catch (e) {
      console.error('createFromTmdb error', e);
      setErr(String(e));
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!selectedMovie || !selectedMovie.id) {
      setErr('Selecciona una película primero');
      return;
    }
    try {
      const payload = {
        movie_id: selectedMovie.id,
        rating: Number(rating),
        comment: comment || null
      };
      const data = await createReview(payload);
      setReviews(prev => [data, ...prev]);
      setShowForm(false);
      setSelectedMovie(null);
      setComment('');
      setRating(4);
      setErr(null);
    } catch (e) {
      console.error('createReview error', e);
      setErr(String(e));
    }
  }

  return (
    <div className="container">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">My Reviews</h1>
        <p className="text-sm text-gray-600">Películas reseñadas</p>

        <div className="mt-4 flex items-center gap-4">
          {!user ? (
            <form onSubmit={handleLogin} className="flex items-center gap-2">
              <div className="text-sm text-gray-700">Usuario: <strong>{username}</strong></div>
              <input
                className="border p-2"
                placeholder="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="btn" type="submit">Login</button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-700">Logueado como <strong>{user.username || user.name || 'admin'}</strong></div>
              <button className="btn" onClick={handleLogout}>Logout</button>

              <button className="btn" onClick={openForm}>Write review</button>
            </div>
          )}
        </div>
      </header>

      <main>
        {showForm && (
          <section className="mb-6 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Nueva review</h2>

            <div className="mb-2">
              <label className="block text-sm text-gray-700">Buscar película</label>
              <input
                className="border p-2 w-full"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Escribe título..."
              />
              {suggestions.length > 0 && (
                <ul className="border mt-1 max-h-40 overflow-auto bg-white">
                  {suggestions.map(s => (
                    <li key={s.tmdb_id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectSuggestion(s)}>
                      {s.title} {s.release_year ? `(${s.release_year})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedMovie && (
              <div className="mb-2">
                <div className="text-sm font-medium">{selectedMovie.name} {selectedMovie.release_year ? `(${selectedMovie.release_year})` : ''}</div>
                <div className="text-xs text-gray-500">Director: {selectedMovie.director || '—'}</div>
              </div>
            )}
            {selectedMovie && (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-2">
                  <label className="block text-sm text-gray-700">Comentario</label>
                  <textarea className="border p-2 w-full" rows="4" value={comment} onChange={e => setComment(e.target.value)} />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Puntuación (1-5)</label>
                  <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} className="border p-2 w-24" />
                </div>

                <div className="flex gap-2">
                  <button className="btn" type="submit">Enviar review</button>
                  <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {err && <div className="text-red-600 mt-2">{err}</div>}
          </section>
        )}

        {loading && <div>Cargando reviews...</div>}
        {err && <div className="text-red-600">Error: {err}</div>}
        {!loading && !err && reviews.length === 0 && <div>No hay reviews aún.</div>}
        <div className="space-y-4 mt-4">
          {reviews.map(r => {
            const m = r.movie || {};
            return (
              <article key={r.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{m.name || '—' } {m.release_year ? `(${m.release_year})` : ''}</h3>
                    <div className="text-sm text-gray-500">Director: {m.director || '—'}</div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">{r.rating}</div>
                </div>
                <p className="mt-2 text-gray-700">{r.comment || <span className="text-gray-400">Sin comentario</span>}</p>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
