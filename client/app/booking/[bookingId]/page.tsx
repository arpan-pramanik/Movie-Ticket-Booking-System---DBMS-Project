"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookingById } from "@/services/api";

interface BookingDetails {
    booking_id: number;
    name: string;
    email: string;
    title: string;
    language: string;
    duration: number;
    show_time: string;
    price: number;
    seat_number: string;
    theater_name: string;
    screen_name: string;
    booking_time: string;
}

export default function BookingSummaryPage() {
    const params = useParams();
    const bookingId = Number(params.bookingId);
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBookingById(bookingId)
            .then((res) => setBooking(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center text-muted py-16">Booking not found.</div>
        );
    }

    const showDt = new Date(booking.show_time);
    const bookDt = new Date(booking.booking_time);

    return (
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-8 page-enter">
            {/* Success header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-4">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-success"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-1">Booking Confirmed</h1>
                <p className="text-sm text-muted">
                    Your ticket has been booked successfully
                </p>
            </div>

            {/* Ticket card */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
                {/* Movie title */}
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                    <h2 className="text-xl font-bold">{booking.title}</h2>
                    <p className="text-xs text-muted mt-1">
                        {booking.language} &middot; {booking.duration} min
                    </p>
                </div>

                {/* Details grid */}
                <div className="p-6 grid grid-cols-2 gap-5">
                    <div>
                        <p className="text-xs text-muted mb-0.5">Date</p>
                        <p className="text-sm font-medium">
                            {showDt.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted mb-0.5">Time</p>
                        <p className="text-sm font-medium">
                            {showDt.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted mb-0.5">Theater</p>
                        <p className="text-sm font-medium">{booking.theater_name}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted mb-0.5">Screen</p>
                        <p className="text-sm font-medium">{booking.screen_name}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted mb-0.5">Seat</p>
                        <p className="text-sm font-bold text-primary">
                            {booking.seat_number}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted mb-0.5">Price</p>
                        <p className="text-sm font-bold text-primary">
                            &#8377;{booking.price}
                        </p>
                    </div>
                </div>

                {/* Dashed divider */}
                <div className="mx-6 border-t border-dashed border-border" />

                {/* User info */}
                <div className="p-6 grid grid-cols-2 gap-5">
                    <div>
                        <p className="text-xs text-muted mb-0.5">Name</p>
                        <p className="text-sm font-medium">{booking.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-0.5">Email</p>
                        <p className="text-sm font-medium truncate">{booking.email}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-muted mb-0.5">Booking ID</p>
                        <p className="text-sm font-mono text-muted">
                            #{String(booking.booking_id).padStart(6, "0")}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-muted mb-0.5">Booked at</p>
                        <p className="text-sm text-muted">
                            {bookDt.toLocaleString("en-US")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-center">
                <Link
                    href="/"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors"
                >
                    Browse More Movies
                </Link>
            </div>
        </div>
    );
}
