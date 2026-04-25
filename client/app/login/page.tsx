"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser, loginUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const { login } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const res = await loginUser({ email, password });
                login(res.data.token, res.data.user);
                if (res.data.user.email === 'arpan@admin.com') {
                    router.push('/admin');
                } else {
                    router.push(redirect);
                }
            } else {
                await registerUser({ name, email, password });
                // Auto-login after register
                const res = await loginUser({ email, password });
                login(res.data.token, res.data.user);
                if (res.data.user.email === 'arpan@admin.com') {
                    router.push('/admin');
                } else {
                    router.push(redirect);
                }
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 page-enter">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-primary mx-auto"
                        >
                            <rect
                                x="2"
                                y="2"
                                width="20"
                                height="20"
                                rx="2.18"
                                ry="2.18"
                            />
                            <line x1="7" y1="2" x2="7" y2="22" />
                            <line x1="17" y1="2" x2="17" y2="22" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <line x1="2" y1="7" x2="7" y2="7" />
                            <line x1="2" y1="17" x2="7" y2="17" />
                            <line x1="17" y1="7" x2="22" y2="7" />
                            <line x1="17" y1="17" x2="22" y2="17" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        {isLogin
                            ? "Sign in to book your tickets"
                            : "Sign up to get started"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs text-muted mb-1.5 font-medium">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-muted mb-1.5 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-muted mb-1.5 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="Min 4 characters"
                        />
                    </div>

                    {error && (
                        <div className="text-danger text-xs bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </span>
                        ) : isLogin ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <p className="text-center text-sm text-muted mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="text-primary hover:text-primary-hover font-medium cursor-pointer"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <LoginPageContent />
        </Suspense>
    );
}
