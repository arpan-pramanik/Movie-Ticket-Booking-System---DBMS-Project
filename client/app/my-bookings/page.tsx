"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserBookings, cancelBooking } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Booking {
    booking_id: number;
    title: string;
    show_time: string;
    seat_number: string;
    theater_name: string;
    screen_name: string;
    price: string;
}

export default function MyBookingsPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login?redirect=/my-bookings");
            return;
        }

        fetchBookings();
    }, [isAuthenticated, router]);

    const fetchBookings = () => {
        setLoading(true);
        getUserBookings()
            .then((res) => {
                setBookings(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setCancelling(id);
        try {
            await cancelBooking(id);
            setBookings((prev) => prev.filter((b) => b.booking_id !== id));
        } catch (err) {
            console.error("Failed to cancel booking", err);
            alert("Failed to cancel booking. Please try again.");
        } finally {
            setCancelling(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 page-enter">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center text-muted py-16 bg-surface border border-border rounded-xl">
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="mx-auto mb-4 text-muted/50"
                    >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                    <p className="text-lg font-medium text-foreground mb-2">No bookings yet</p>
                    <p className="mb-6">You haven&apos;t booked any tickets yet. Explore movies to get started!</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary-hover"
                    >
                        Find Movies
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const dt = new Date(booking.show_time);
                        const date = dt.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        });
                        const time = dt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        const isRecliner = booking.seat_number.startsWith("R");
                        const calculatedPrice = Number(booking.price) + (isRecliner ? 150 : 0);

                        return (
                            <div
                                key={booking.booking_id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface"
                            >
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{booking.title}</h3>
                                    <p className="text-sm text-foreground/80 mb-2">
                                        {date} at {time} &middot; Seat {booking.seat_number} {isRecliner && '(Recliner)'}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {booking.theater_name} &middot; {booking.screen_name}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                                    <span className="font-semibold text-lg">&#8377;{calculatedPrice}</span>
                                    <button
                                        onClick={() => handleCancel(booking.booking_id)}
                                        disabled={cancelling === booking.booking_id}
                                        className="px-4 py-2 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors disabled:opacity-50"
                                    >
                                        {cancelling === booking.booking_id ? "Cancelling..." : "Cancel Booking"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
