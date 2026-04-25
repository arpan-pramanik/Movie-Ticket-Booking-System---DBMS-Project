"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAllSeats, getShowById, bookSeat } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Seat {
    seat_id: number;
    show_id: number;
    seat_number: string;
    is_booked: boolean | number;
}

interface ShowInfo {
    show_id: number;
    show_time: string;
    price: number;
    title: string;
    duration: number;
    language: string;
    screen_name: string;
    theater_name: string;
    location: string;
}

export default function SeatsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const showId = Number(params.showId);
    const maxSeats = Number(searchParams.get("count")) || 1;
    const { isAuthenticated } = useAuth();

    const [seats, setSeats] = useState<Seat[]>([]);
    const [show, setShow] = useState<ShowInfo | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([getAllSeats(showId), getShowById(showId)])
            .then(([seatsRes, showRes]) => {
                setSeats(seatsRes.data);
                setShow(showRes.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [showId]);

    const handleBook = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/shows/${showId}/seats?count=${maxSeats}`);
            return;
        }
        if (selectedSeats.length === 0) return;

        setBooking(true);
        setError("");

        try {
            await bookSeat({
                show_id: showId,
                seat_ids: selectedSeats.map(s => s.seat_id),
            });
            router.push(`/my-bookings`);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || "Booking failed");
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!show) {
        return (
            <div className="text-center text-muted py-16">Show not found.</div>
        );
    }

    const dt = new Date(show.show_time);
    const dateStr = dt.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const timeStr = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // Group seats by row (letter prefix)
    const rows: Record<string, Seat[]> = {};
    seats.forEach((seat) => {
        const row = seat.seat_number.replace(/[0-9]/g, "");
        if (!rows[row]) rows[row] = [];
        rows[row].push(seat);
    });

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

            {/* Show info */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">{show.title}</h1>
                <p className="text-muted text-sm">
                    {show.theater_name} &middot; {show.screen_name} &middot;{" "}
                    {show.location}
                </p>
                <p className="text-muted text-sm mt-1">
                    {dateStr} at {timeStr}
                </p>
            </div>

            {/* Screen indicator */}
            <div className="mb-10 text-center">
                <div className="mx-auto w-64 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-2" />
                <p className="text-xs text-muted tracking-widest uppercase mb-4">Screen</p>
                <div className="inline-block px-4 py-1.5 bg-surface text-xs font-medium rounded-full border border-border">
                    Select up to {maxSeats} seat{maxSeats > 1 ? 's' : ''} ({selectedSeats.length}/{maxSeats} selected)
                </div>
            </div>

            {/* Seat Grid */}
            <div className="flex flex-col items-center gap-3 mb-8">
                {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-muted font-mono text-right">
                            {row}
                        </span>
                        <div className="flex gap-2">
                            {rowSeats.map((seat) => {
                                const booked = seat.is_booked === true || seat.is_booked === 1;
                                const selected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                                const isRecliner = seat.seat_number.startsWith("R");

                                const toggleSeat = () => {
                                    if (booked) return;
                                    if (selected) {
                                        setSelectedSeats(selectedSeats.filter(s => s.seat_id !== seat.seat_id));
                                    } else {
                                        if (selectedSeats.length < maxSeats) {
                                            setSelectedSeats([...selectedSeats, seat]);
                                        }
                                    }
                                };

                                return (
                                    <button
                                        key={seat.seat_id}
                                        disabled={booked}
                                        onClick={toggleSeat}
                                        className={`
                      w-10 h-10 rounded-lg text-xs transition-all cursor-pointer relative
                      flex items-center justify-center border
                      ${isRecliner ? "font-bold tracking-tight" : "font-medium"}
                      ${booked
                                                ? "bg-danger/20 border-danger/30 text-danger/50 cursor-not-allowed"
                                                : selected
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                                                    : isRecliner
                                                        ? "bg-warning/10 border-warning/40 text-warning hover:bg-warning/20 seat-available shadow-sm"
                                                        : "bg-success/15 border-success/30 text-success hover:bg-success/25 seat-available"
                                            }
                    `}
                                        title={
                                            booked
                                                ? `${seat.seat_number} - Booked`
                                                : `${seat.seat_number} ${isRecliner ? '(Recliner)' : ''} - Available`
                                        }
                                    >
                                        {isRecliner && !booked && !selected && (
                                            <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
                                        )}
                                        {seat.seat_number.replace(/[A-Z]/g, "")}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-5 text-xs text-muted mb-8 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-success/15 border border-success/30" />
                    Standard
                </div>
                <div className="flex items-center gap-1.5 relative">
                    <span className="w-4 h-4 rounded bg-warning/10 border border-warning/40" />
                    <span className="absolute -top-1 left-3 text-[8px]">⭐</span>
                    Recliner
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-primary border border-primary" />
                    Selected
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-danger/20 border border-danger/30" />
                    Booked
                </div>
            </div>

            {/* Booking bar */}
            {selectedSeats.length > 0 && (() => {
                const totalPrice = selectedSeats.reduce((sum, s) => {
                    return sum + (s.seat_number.startsWith("R") ? Number(show.price) + 150 : Number(show.price));
                }, 0);

                return (
                    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border p-4 z-40">
                        <div className="mx-auto max-w-4xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    {selectedSeats.map(s => s.seat_number).join(", ")}
                                </p>
                                <p className="text-xs text-muted">
                                    &#8377;{totalPrice} &middot; {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {error && (
                                    <span className="text-xs text-danger">{error}</span>
                                )}
                                <button
                                    onClick={handleBook}
                                    disabled={booking}
                                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {booking ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Booking...
                                        </span>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
