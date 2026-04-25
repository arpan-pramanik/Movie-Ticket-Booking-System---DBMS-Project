"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMovies } from "@/services/api";

interface Movie {
  movie_id: number;
  title: string;
  duration: number;
  language: string;
  poster_url: string;
}

const HERO_BANNERS = [
  {
    image: "https://www.cinematerial.com/media/box-office/8rpDcsfLJypbO6vtecsmEZzAUoi.jpg",
    title: "Dune: Part Two",
    subtitle: "Experience the IMAX epic.",
    id: 5
  },
  {
    image: "https://www.cinematerial.com/media/box-office/fm6KqXpk3M2HVveHwCrBRoOoA0i.jpg",
    title: "Oppenheimer",
    subtitle: "The world forever changes.",
    id: 6
  }
];
export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovies()
      .then((res) => setMovies(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden group">
        <div className="absolute inset-0 transition-opacity duration-1000">
          <img
            src={"https://images.ctfassets.net/c4ucztjx9pmu/7nk0vUUuHUv1vXrDJGzuqx/d166b434d4d779f039b9cb8a51262a80/D752DUNE2_R0-67_1080x1600px_DUNE2_Master_ENG_V2_R05_UR.jpg"}
            alt="Hero Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-6xl mx-auto z-10 page-enter">
          <h1 className="text-4xl sm:text-6xl font-black mb-4 text-white drop-shadow-lg">{HERO_BANNERS[0].title}</h1>
          <p className="text-lg sm:text-xl text-white/90 mb-6 drop-shadow-md max-w-2xl">{HERO_BANNERS[0].subtitle}</p>
          <Link
            href={`/movies/${HERO_BANNERS[0].id}/shows`}
            className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-lg transition-colors inline-block cursor-pointer shadow-xl shadow-primary/20"
          >
            Book Now
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 page-enter" style={{ animationDelay: '0.1s' }}>
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Now <span className="gradient-text">Showing</span></h2>
          <p className="text-lg text-muted">Book tickets for the latest blockbusters</p>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {movies.map((movie) => (
            <Link
              href={`/movies/${movie.movie_id}/shows`}
              key={movie.movie_id}
              className="card-hover group rounded-xl border border-border bg-surface p-5 block"
            >
              {/* Poster placeholder with film icon */}
              <div className="aspect-[3/4] rounded-lg bg-background mb-4 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10 pointer-events-none" />
                <img
                  src={movie.poster_url || "https://via.placeholder.com/500x750?text=Poster"}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {movie.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {movie.language}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {movies.length === 0 && (
          <p className="text-center text-muted mt-12">
            No movies available at the moment.
          </p>
        )}
      </div>
    </>
  );
}
