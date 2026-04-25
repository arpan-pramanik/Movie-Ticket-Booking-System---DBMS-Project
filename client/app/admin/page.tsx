"use client";

import { useEffect, useState, useRef } from "react";
import { getBookings, executeRawQuery, getTables, getMovies } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface GlobalBooking {
    name: string;
    title: string;
    show_time: string;
    seat_number: string;
}

interface Movie {
    movie_id: number;
    title: string;
    duration: number;
    language: string;
    poster_url: string;
}

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [bookings, setBookings] = useState<GlobalBooking[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    // Tab State
    const [activeTab, setActiveTab] = useState<"bookings" | "database" | "cms">("bookings");

    // DB Explorer State
    const [tables, setTables] = useState<string[]>([]);
    const [rawQuery, setRawQuery] = useState("");
    const [queryResult, setQueryResult] = useState<any[] | null>(null);
    const [queryFields, setQueryFields] = useState<string[]>([]);
    const [queryError, setQueryError] = useState("");
    const [executing, setExecuting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (user?.email !== "arpan@admin.com") {
            router.push("/");
            return;
        }

        fetchBookings();
        fetchTables();
    }, [isAuthenticated, user, router]);

    const fetchBookings = () => {
        setLoading(true);
        Promise.all([getBookings(), getMovies()])
            .then(([resBookings, resMovies]) => {
                setBookings(resBookings.data);
                setMovies(resMovies.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const fetchTables = () => {
        getTables()
            .then(res => setTables(res.data.tables))
            .catch(err => console.error("Error fetching tables", err));
    };

    const runQuery = async (queryStr: string = rawQuery) => {
        if (!queryStr.trim()) return;
        setExecuting(true);
        setQueryError("");
        setQueryResult(null);
        setQueryFields([]);

        try {
            const res = await executeRawQuery(queryStr);
            if (Array.isArray(res.data.results)) {
                // Determine if it's a select result or an OK packet
                if (res.data.results.length > 0 && typeof res.data.results[0] === 'object' && res.data.fields?.length > 0) {
                    setQueryResult(res.data.results);
                    setQueryFields(res.data.fields);
                } else if (res.data.results.affectedRows !== undefined) {
                    setQueryResult([{ Status: `Success`, 'Affected Rows': res.data.results.affectedRows }]);
                    setQueryFields(['Status', 'Affected Rows']);
                } else if (res.data.results.length === 0) {
                    setQueryResult([]);
                    setQueryFields(res.data.fields || []);
                }
            } else if (res.data.results.affectedRows !== undefined) {
                setQueryResult([{ Status: `Success`, 'Affected Rows': res.data.results.affectedRows }]);
                setQueryFields(['Status', 'Affected Rows']);
            }
        } catch (err: any) {
            setQueryError(err.response?.data?.error || err.message || "Query failed");
        } finally {
            setExecuting(false);
        }
    };

    const viewTable = (tableName: string) => {
        setRawQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
        runQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
    };

    const exportCSV = () => {
        if (!queryResult || queryResult.length === 0 || queryFields.length === 0) return;

        const header = queryFields.join(",");
        const rows = queryResult.map(row =>
            queryFields.map(field => {
                let val = row[field];
                if (val === null || val === undefined) return '';
                if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                return val;
            }).join(",")
        );

        const csvContent = "\uFEFF" + [header, ...rows].join("\n");
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.href = encodedUri;
        link.download = `database_export_${Date.now()}.csv`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
        }, 200);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target?.result as string;
            if (!text) return;

            const targetTable = prompt("Enter the exact target table name for insertion:");
            if (!targetTable) return;

            // Simple CSV parse (assumes no commas in quotes for simplicity)
            const lines = text.split("\n").filter(l => l.trim().length > 0);
            if (lines.length < 2) return alert("Invalid CSV: missing headers or data");

            const headers = lines[0].split(",");
            let valuesStr = [];

            for (let i = 1; i < lines.length; i++) {
                const rowVals = lines[i].split(",").map(val => {
                    const clean = val.trim().replace(/^"|"$/g, '');
                    if (clean === '' || clean === 'NULL') return 'NULL';
                    if (!isNaN(Number(clean))) return clean;
                    return `'${clean.replace(/'/g, "''")}'`;
                });
                valuesStr.push(`(${rowVals.join(",")})`);
            }

            const insertSQL = `INSERT INTO ${targetTable} (${headers.join(",")}) VALUES \n${valuesStr.join(",\n")};`;
            setRawQuery(insertSQL);
            runQuery(insertSQL);
        };
        reader.readAsText(file);
    };

    if (loading || user?.email !== "arpan@admin.com") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 page-enter">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted mt-1">System Management Console</p>
                </div>

                <div className="flex bg-surface border border-border rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab("bookings")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'bookings' ? 'bg-primary text-white' : 'hover:bg-background text-muted'}`}
                    >
                        Global Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab("database")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'database' ? 'bg-primary text-white' : 'hover:bg-background text-muted'}`}
                    >
                        Database Explorer
                    </button>
                    <button
                        onClick={() => setActiveTab("cms")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'cms' ? 'bg-primary text-white' : 'hover:bg-background text-muted'}`}
                    >
                        Manage Content
                    </button>
                </div>
            </div>

            {/* TAB: Global Bookings */}
            {activeTab === "bookings" && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                        <h2 className="font-semibold">Recent Bookings ({bookings.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted uppercase bg-background/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Customer Name</th>
                                    <th className="px-6 py-4 font-medium">Movie Title</th>
                                    <th className="px-6 py-4 font-medium">Show Time</th>
                                    <th className="px-6 py-4 font-medium">Seat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted">No bookings found.</td>
                                    </tr>
                                ) : (
                                    bookings.map((booking, idx) => {
                                        const dt = new Date(booking.show_time);
                                        const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                        return (
                                            <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{booking.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{booking.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted">{dateStr}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${booking.seat_number.startsWith("R") ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                        {booking.seat_number}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Database Explorer */}
            {activeTab === "database" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Left: Schema Explorer */}
                    <div className="lg:col-span-1 border border-border bg-surface rounded-xl p-4">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted">Tables</h3>
                        <div className="space-y-1">
                            {tables.map(table => (
                                <button
                                    key={table}
                                    onClick={() => viewTable(table)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                                    {table}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Query Runner */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="border border-border bg-surface rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold uppercase tracking-wider text-muted">Raw SQL Query</label>
                                <div className="flex gap-2">
                                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                                    <button onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-background transition-colors cursor-pointer text-muted">
                                        Import CSV (Bulk Insert)
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={rawQuery}
                                onChange={(e) => setRawQuery(e.target.value)}
                                className="w-full h-32 bg-[#1a1a1a] text-[#4af626] font-mono p-4 rounded-lg text-sm border border-border focus:outline-none focus:border-primary resize-y"
                                placeholder="SELECT * FROM Users;"
                            />

                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-muted">Use double-quotes carefully. Supports DROP, ALTER, UPDATE.</span>
                                <button
                                    onClick={() => runQuery()}
                                    disabled={executing || !rawQuery.trim()}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    {executing && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Execute
                                </button>
                            </div>
                        </div>

                        {/* Query Status / Error */}
                        {queryError && (
                            <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger font-mono text-sm break-words">
                                {queryError}
                            </div>
                        )}

                        {/* Results Table */}
                        {queryResult && (
                            <div className="border border-border bg-surface rounded-xl overflow-hidden flex flex-col h-[500px]">
                                <div className="p-3 border-b border-border flex justify-between items-center bg-background/50">
                                    <span className="text-sm font-medium text-muted">Result Set ({queryResult.length} rows)</span>
                                    {queryResult.length > 0 && queryFields.length > 0 && (
                                        <button onClick={exportCSV} className="text-xs px-3 py-1.5 bg-background border border-border rounded-lg hover:text-primary transition-colors cursor-pointer">
                                            Export to CSV
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-auto flex-1 p-0">
                                    <table className="w-full text-sm text-left whitespace-nowrap">
                                        <thead className="text-xs text-muted font-mono uppercase bg-surface sticky top-0 shadow-sm">
                                            <tr>
                                                {queryFields.map((col, i) => (
                                                    <th key={col + i} className="px-4 py-3 font-semibold border-b border-border">{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="font-mono text-[13px]">
                                            {queryResult.length === 0 ? (
                                                <tr><td colSpan={queryFields.length || 1} className="p-6 text-center text-muted">Zero rows returned</td></tr>
                                            ) : (
                                                queryResult.map((row, i) => (
                                                    <tr key={i} className="border-b border-border/30 hover:bg-background/50">
                                                        {queryFields.map((col, j) => {
                                                            let cell = row[col];
                                                            if (cell === null) cell = <span className="text-muted italic">NULL</span>;
                                                            else if (typeof cell === 'boolean') cell = cell ? 'TRUE' : 'FALSE';
                                                            else if (typeof cell === 'object') cell = JSON.stringify(cell);
                                                            else cell = String(cell);

                                                            return <td key={j} className="px-4 py-2 border-r border-border/20 last:border-0">{cell}</td>
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* TAB: Content Manager */}
            {activeTab === "cms" && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold text-lg">Movies Master Configuration</h2>
                        <span className="text-sm text-muted">Use exact string matches and valid secure URLs.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {movies.map((m) => (
                            <div key={m.movie_id} className="border border-border bg-background/50 rounded-xl p-4 flex flex-col gap-3">
                                <div>
                                    <label className="text-xs uppercase text-muted font-semibold tracking-wider block mb-1">Movie Title</label>
                                    <input
                                        type="text"
                                        defaultValue={m.title}
                                        className="w-full bg-surface border border-border rounded p-2 text-sm focus:border-primary focus:outline-none"
                                        id={`title-${m.movie_id}`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs uppercase text-muted font-semibold tracking-wider block mb-1">Language</label>
                                        <input
                                            type="text"
                                            defaultValue={m.language}
                                            className="w-full bg-surface border border-border rounded p-2 text-sm focus:border-primary focus:outline-none"
                                            id={`lang-${m.movie_id}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-muted font-semibold tracking-wider block mb-1">Duration</label>
                                        <input
                                            type="number"
                                            defaultValue={m.duration}
                                            className="w-full bg-surface border border-border rounded p-2 text-sm focus:border-primary focus:outline-none"
                                            id={`dur-${m.movie_id}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-muted font-semibold tracking-wider block mb-1">Poster URL</label>
                                    <input
                                        type="text"
                                        defaultValue={m.poster_url || ""}
                                        className="w-full bg-surface border border-border rounded p-2 text-sm focus:border-primary focus:outline-none"
                                        id={`url-${m.movie_id}`}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const title = (document.getElementById(`title-${m.movie_id}`) as HTMLInputElement)?.value;
                                        const lang = (document.getElementById(`lang-${m.movie_id}`) as HTMLInputElement)?.value;
                                        const dur = (document.getElementById(`dur-${m.movie_id}`) as HTMLInputElement)?.value;
                                        const url = (document.getElementById(`url-${m.movie_id}`) as HTMLInputElement)?.value;

                                        const sql = `UPDATE Movies SET title = '${title.replace(/'/g, "''")}', language = '${lang.replace(/'/g, "''")}', duration = ${dur}, poster_url = '${url.replace(/'/g, "''")}' WHERE movie_id = ${m.movie_id};`;
                                        executeRawQuery(sql).then(() => {
                                            alert(`Successfully updated DB schema mapping for ${title}! Refresh to view.`);
                                        }).catch(err => alert("Error: " + err.message));
                                    }}
                                    className="mt-2 w-full bg-primary/20 hover:bg-primary border border-primary/30 hover:border-primary rounded py-2 text-sm font-semibold transition-all text-primary hover:text-white"
                                >
                                    Save Movie
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
