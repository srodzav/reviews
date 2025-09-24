import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { fetchReviews, login, logout, searchMovies, createMovieFromTmdb, createReview, fetchFavoriteMovies } from './api';
import ProfileHeader from './components/ProfileHeader';
import HorizontalCarousel from './components/HorizontalCarousel';
import ReviewCard from './components/ReviewCard';
import StarInput from './components/StarInput';

function App() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Auth components
  const [username] = useState('admin');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; }
  });

  // Review components
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  const debounceRef = useRef(null);

  // Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch favorite movies
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch reviews
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchReviews();
        const favs = await fetchFavoriteMovies();
        if (mounted) setReviews(Array.isArray(data) ? data : []);
        if (mounted) setFavoriteMovies(Array.isArray(favs) ? favs : []);
      } catch (e) {
        if (mounted) setErr(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Auth handlers
  async function handleLogin(e) {
    e?.preventDefault();
    try {
      const data = await login({ username, password });
      setUser(data.user || { username });
      localStorage.setItem('authUser', JSON.stringify(data.user || { username }));
      setPassword('');
      setShowLoginModal(false);
    } catch (error) {
      setErr(String(error));
    }
  }

  // Auth handlers
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

  // Review form handlers
  function openForm() {
    setShowForm(true);
    setQuery('');
    setSuggestions([]);
    setSelectedMovie(null);
    setComment('');
    setRating(4);
  }

  // Debounced movie search
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

  // Handle selecting a movie suggestion
  async function handleSelectSuggestion(item) {
    try {
      const movie = await createMovieFromTmdb(item.tmdb_id);
      setSelectedMovie(movie);
      setQuery('');
      setSuggestions([]);
    } catch (e) {
      console.error('createFromTmdb error', e);
      setErr(String(e));
    }
  }

  // Handle review submission
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
      setReviews(prev => [data, ...prev]); // reorder reviews, newest first
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

  // Prepare recent movies for carousel (from reviews)
  const recentMovies = [];
  const seen = new Set();
  for (const r of reviews) {
    const m = r.movie || {};
    const id = m.id || m.tmdb_id;
    if (!id) continue;
    if (!seen.has(id)) {
      seen.add(id);
      recentMovies.push({ id, name: m.name || m.title, poster_url: m.poster_url, poster_path: m.poster_path, release_year: m.release_year || (m.release_date ? m.release_date.slice(0,4) : undefined) });
    }
    if (recentMovies.length >= 8) break;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ProfileHeader title="My Reviews" user={user} onOpenForm={openForm} />

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* Carousel */}
        <section className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-lg font-semibold text-white">Recently watched</h2>
          </div>
          <HorizontalCarousel items={recentMovies}/>
        </section>

        {/* Carousel */}
        <section className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-lg font-semibold text-white">Favorite films</h2>
          </div>
          <HorizontalCarousel items={favoriteMovies}/>
        </section>

        {/* Form */}
        {showForm && (
          <section className="mb-6 bg-gray-800 p-4 rounded">
            <h3 className="text-white font-semibold mb-2">New review</h3>

            <div className="mb-3">
              <label className="text-sm text-gray-300 block mb-1">Search movie</label>
              <input className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" value={query} onChange={e => setQuery(e.target.value)} placeholder="Type title..." />
              {suggestions.length > 0 && (
                <ul className="bg-gray-800 border border-gray-700 mt-2 rounded max-h-44 overflow-auto">
                  {suggestions.map(s => (
                    <li key={s.tmdb_id} className="p-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSelectSuggestion(s)}>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-gray-400">{s.release_year}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedMovie && (
              <div className="mb-3 text-gray-200">
                <div className="font-medium">{selectedMovie.name} {selectedMovie.release_year ? `(${selectedMovie.release_year})` : ''}</div>
                <div className="text-xs text-gray-400">Director: {selectedMovie.director || '—'}</div>
              </div>
            )}

            {selectedMovie && (
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="text-sm text-gray-300 block mb-1">Comment</label>
                  <textarea className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" rows="4" value={comment} onChange={e => setComment(e.target.value)} />
                </div>

                <div className="flex gap-4 mb-4">
                  <label className="text-sm text-gray-300 block mb-1">Rating</label>
                  <StarInput value={rating} onChange={(v) => setRating(v)} size={26} />

                  <div className="" />
                  <input type="checkbox" className="w-5 h-5" checked={isFavorite} onChange={e => setIsFavorite(e.target.checked)} />
                  <label className="ms-0 text-sm font-medium text-gray-900 dark:text-gray-300">Favorite</label>

                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-indigo-600 rounded text-white" type="submit">Submit</button>
                  <button type="button" className="px-3 py-2 bg-gray-700 rounded text-white" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {err && <div className="text-red-400 mt-2">{err}</div>}
          </section>
        )}

        {/* Reviews list */}
        <section>
          {loading && <div className="text-gray-300">Loading reviews...</div>}
          {!loading && reviews.length === 0 && <div className="text-gray-400">No reviews yet.</div>}
          <div className="space-y-4 mt-4">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </section>
      </div>

      {/* Info footer */}
      <footer className="py-4 text-center">
        <button className="text-sm text-gray-400 hover:text-white" onClick={handleLogout}>
          2025 
        </button>
        &nbsp;·&nbsp;
        <button className="text-sm text-gray-400 hover:text-white" onClick={() => setShowLoginModal(true)}>
          Sebastian Rodriguez
        </button>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-md z-10">
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="submit" className="px-3 py-2 bg-indigo-600 rounded">Login</button>
              </div>
            </form>
            {err && <div className="text-red-400 mt-3">{err}</div>}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;