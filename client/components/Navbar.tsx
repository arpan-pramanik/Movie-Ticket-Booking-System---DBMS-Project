"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary group-hover:text-primary-hover transition-colors"
                        >
                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                            <line x1="7" y1="2" x2="7" y2="22" />
                            <line x1="17" y1="2" x2="17" y2="22" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <line x1="2" y1="7" x2="7" y2="7" />
                            <line x1="2" y1="17" x2="7" y2="17" />
                            <line x1="17" y1="7" x2="22" y2="7" />
                            <line x1="17" y1="17" x2="22" y2="17" />
                        </svg>
                        <span className="text-lg font-bold gradient-text">MTBS</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-sm text-muted hover:text-foreground transition-colors"
                        >
                            Movies
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/my-bookings"
                                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                >
                                    My Bookings
                                </Link>
                                <span className="text-sm text-muted hidden sm:inline-flex items-center">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="inline mr-1"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {user?.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-muted hover:text-foreground transition-all cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors font-medium"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
