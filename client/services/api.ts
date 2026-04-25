import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ---------- Movies ----------
export const getMovies = () => api.get("/movies");

// ---------- Shows ----------
export const getShows = () => api.get("/shows");
export const getShowById = (id: number) => api.get(`/shows/${id}`);

// ---------- Seats ----------
export const getAllSeats = (showId: number) => api.get(`/seats/all/${showId}`);
export const getAvailableSeats = (showId: number) =>
    api.get(`/seats/${showId}`);

// ---------- Auth ----------
export const registerUser = (data: {
    name: string;
    email: string;
    password: string;
}) => api.post("/register", data);

export const loginUser = (data: { email: string; password: string }) =>
    api.post("/login", data);

// ---------- Booking ----------
export const bookSeat = (data: { show_id: number; seat_ids: number[] }) =>
    api.post("/book", data);

export const getBookingById = (id: number) => api.get(`/bookings/${id}`);
export const getBookings = () => api.get("/bookings");
export const getUserBookings = () => api.get("/bookings/user");
export const cancelBooking = (id: number) => api.delete(`/bookings/${id}`);

// Admin DB API
export const executeRawQuery = (query: string) => api.post('/admin/query', { query });
export const getTables = () => api.get('/admin/tables');

export default api;
