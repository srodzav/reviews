<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class MovieController extends Controller
{
    public function index()
    {
        $movies = Movie::all();
        return response()->json($movies);
    }

    public function favorites()
    {
        $movies = Movie::where('favorite', true)
            ->orderByDesc('id')
            ->take(5)
            ->get();
            
        return response()->json($movies);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'director' => 'required|string', 
            'release_year' => 'required|integer' . date('Y'),
            'poster_path' => 'nullable|string',
            'poster_url' => 'nullable|url'
        ]);

        $data = $request->only(['name', 'director', 'release_year', 'poster_path', 'poster_url']);
        if (empty($data['poster_url']) && !empty($data['poster_path'])) {
            $data['poster_url'] = 'https://image.tmdb.org/t/p/w342/' . ltrim($data['poster_path'], '/');
        }

        $movie = Movie::create($data);
        return response()->json($movie, 201);
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        $apiKey = env('TMDB_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'TMDB API key not configured'], 500);
        }

        $res = Http::get("https://api.themoviedb.org/3/search/movie", [
            'api_key' => $apiKey,
            'query' => $request->input('query'),
            'page' => 1
        ]);

        if ($res->failed()) {
            return response()->json(['error' => 'TMDB API request failed'], 500);
        }

        $results = $res->json()['results'];
        
        $mapped = array_map(function ($r) {
            return [
                'tmdb_id' => $r['id'] ?? null,
                'title' => $r['title'] ?? ($r['name'] ?? ''),
                'release_year' => !empty($r['release_date']) ? (int)substr($r['release_date'], 0, 4) : null,
                'release_date' => $r['release_date'] ?? null,
                'overview' => $r['overview'] ?? null,
                'poster_path' => $r['poster_path'] ?? null,
            ];
        }, $results);

        return response()->json(array_values($mapped));
    }

    public function createFromTMDB(Request $request)
    {
        $request->validate([
            'tmdb_id' => 'required|integer'
        ]);

        $tmdbId = $request->input('tmdb_id');
        $apiKey = env('TMDB_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'TMDB API key not configured'], 500);
        }

        $res = Http::get("https://api.themoviedb.org/3/movie/{$tmdbId}", [
            'api_key' => $apiKey,
            'append_to_response' => 'credits'
        ]);

        if (! $res->ok()) {
            return response()->json(['error' => 'TMDB movie request failed'], 404);
        }

        $data = $res->json();
        $title = $data['title'] ?? ($data['name'] ?? '');
        $release_year = null;
        if (!empty($data['release_date'])) {
            $release_year = (int)substr($data['release_date'], 0, 4);
        }

        $director = '';
        foreach ($data['credits']['crew'] ?? [] as $crew) {
            if (($crew['job'] ?? '') === 'Director') {
                $director = $crew['name'];
                break;
            }
        }

        $poster_path = $data['poster_path'] ?? null;
        $poster_url = $poster_path ? 'https://image.tmdb.org/t/p/w342/' . ltrim($poster_path, '/') : null;

        $movie = Movie::updateOrCreate(
            ['tmdb_id' => $tmdbId],
            [
                'name' => $title,
                'release_year' => $release_year,
                'director' => $director,
                'poster_path' => $poster_path,
                'poster_url' => $poster_url
            ]
        );

        if (empty($movie->tmdb_id)) {
            $movie->update(['tmdb_id' => $tmdbId]);
        }

        return response()->json($movie, $movie->wasRecentlyCreated ? 201 : 200);
    }

    public function show($id)
    {
        $movie = Movie::findOrFail($id);
        return response()->json($movie);
    }
}