<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    /** @use HasFactory<\Database\Factories\MovieFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'director',
        'release_year',
        'tmdb_id',
        'poster_path',
        'poster_url',
        'favorite',
    ];

    protected $casts = [
        'favorite' => 'boolean',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
