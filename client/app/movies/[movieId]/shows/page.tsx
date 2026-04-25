"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getShows } from "@/services/api";

interface Show {
    show_id: number;
    show_time: string;
    price: number;
    movie_id: number;
    title: string;
    duration: number;
    language: string;
    screen_name: string;
    theater_name: string;
    location: string;
    poster_url?: string;
}

export default function ShowsPage() {
    const router = useRouter();
    const params = useParams();
    const movieId = Number(params.movieId);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);

    const [seatModalOpen, setSeatModalOpen] = useState(false);
    const [selectedShow, setSelectedShow] = useState<number | null>(null);
    const [seatCount, setSeatCount] = useState(2);

    useEffect(() => {
        getShows()
            .then((res) => {
                const filtered = res.data.filter(
                    (s: Show) => s.movie_id === movieId
                );
                setShows(filtered);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [movieId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const movieTitle = shows.length > 0 ? shows[0].title : "Movie";

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 page-enter">
            {/* Back link */}
            <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to movies
            </Link>

            <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                <div className="w-32 rounded-lg overflow-hidden shrink-0 shadow-lg hidden sm:block bg-background">
                    <img
                        src={shows?.[0]?.poster_url || "https://via.placeholder.com/500x750?text=Poster"}
                        alt={movieTitle}
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">{movieTitle}</h1>
                    <p className="text-muted text-sm">Select a showtime to continue</p>
                </div>
            </div>

            {shows.length === 0 ? (
                <div className="text-center text-muted py-16">
                    <p>No shows available for this movie.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shows.map((show) => {
                        const dt = new Date(show.show_time);
                        const date = dt.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        });
                        const time = dt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <button
                                key={show.show_id}
                                onClick={() => {
                                    setSelectedShow(show.show_id);
                                    setSeatModalOpen(true);
                                }}
                                className="w-full text-left card-hover flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-surface p-4 sm:p-5 group cursor-pointer gap-4"
                            >
                                <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                                    {/* Time badge */}
                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-background border border-border shadow-inner shrink-0">
                                        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">{date}</span>
                                        <span className="text-sm font-bold text-foreground mt-0.5">{time}</span>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors truncate">
                                            {show.theater_name}
                                        </h3>
                                        <p className="text-sm text-muted mt-1 truncate flex items-center gap-1.5">
                                            <span className="bg-background px-2 py-0.5 rounded text-[11px] uppercase tracking-wide border border-border">{show.screen_name}</span>
                                            <span>&middot;</span>
                                            <span>{show.location}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    <span className="text-xl font-black tracking-tight text-primary">
                                        &#8377;{show.price}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            className="text-primary group-hover:text-white transition-colors ml-0.5"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Seat Quantity Modal */}
            {seatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm shadow-2xl">
                    <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-in fade-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-2">How many seats?</h2>
                        <p className="text-sm text-muted mb-6">Select up to 6 seats for this show</p>

                        <div className="flex justify-center gap-3 mb-8">
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setSeatCount(num)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border font-medium transition-all ${seatCount === num
                                        ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30'
                                        : 'bg-background border-border text-foreground hover:border-primary/50 cursor-pointer'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSeatModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-surface-hover text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedShow) {
                                        router.push(`/shows/${selectedShow}/seats?count=${seatCount}`);
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Select Seats
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
