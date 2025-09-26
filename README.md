# Reviews

A simple app to track movies you watched. Frontend (React + Vite) and backend (Laravel) with MySQL.

---

## Features

- Search movies (TMDB-powered suggestions)
- Rate movies (supports decimal ratings, e.g. 3.5)
- Mark movies as favorite
- Catalog of watched movies and reviews (with movie metadata: poster, director, release year)

## Technologies Used

- React (Vite) — frontend
- Laravel (PHP 8.1+) — backend API
- MySQL / MariaDB — database
- TMDB API — movie metadata

## Deployment Instructions

Front
- Install dependencies: npm install
- Run dev server: npm run dev
- Build for production: npm run build and deploy the build output to reviews.sebastianrdz.com

Back
- Install PHP dependencies: composer install
- Copy example env and set credentials: copy back/.env.example to back/.env and edit values
- Generate app key: php artisan key:generate
- Run migrations: php artisan migrate
- Optional: php artisan serve for local dev

## Usage

- Open the frontend
- Search movies in the "New review" form; select a suggestion to fetch/save movie metadata
- Rate a movie and optionally add a comment; favorites can be toggled
- Reviews list shows recent entries; use the Sort control to view newest or top rated

Example workflow
- Click "New review" → type movie title → select suggestion → set rating/comment → Submit
- Newly created review appears at top of the list (frontend prepends new review)

## Notes

- Favorite movies catalog shows the latest 5 favorites (adjustable in frontend)

## Author

*Sebastián Rodríguez*
- [LinkedIn](https://www.linkedin.com/in/sebastian-rodriguez-zavala/)
- [Web](https://sebastianrdz.com)
- [Email](mailto:contact@sebastianrdz.com)

## License

This project is for personal use and is not licensed for commercial distribution.
