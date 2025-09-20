<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Movie;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with('movie')->get();
        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'required|integer|min:0|max:5',
            'comment' => 'nullable|string'
        ]);

        $review = Review::create($request->all());
        $review->load('movie');
        
        return response()->json($review, 201);
    }

    public function show($id)
    {
        $review = Review::with('movie')->findOrFail($id);
        return response()->json($review);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'rating' => 'sometimes|integer|min:0|max:5',
            'comment' => 'sometimes|nullable|string'
        ]);

        $review = Review::findOrFail($id);
        $review->update($request->all());
        $review->load('movie');
        
        return response()->json($review);
    }
}