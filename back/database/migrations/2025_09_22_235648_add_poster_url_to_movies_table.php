<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            if (!Schema::hasColumn('movies', 'tmdb_id')) {
                $table->unsignedBigInteger('tmdb_id')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('movies', 'poster_path')) {
                $table->string('poster_path')->nullable()->after('director');
            }
            if (!Schema::hasColumn('movies', 'poster_url')) {
                $table->string('poster_url')->nullable()->after('poster_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            if (Schema::hasColumn('movies', 'poster_url')) {
                $table->dropColumn('poster_url');
            }
            if (Schema::hasColumn('movies', 'poster_path')) {
                $table->dropColumn('poster_path');
            }
            if (Schema::hasColumn('movies', 'tmdb_id')) {
                $table->dropColumn('tmdb_id');
            }
        });
    }
};
