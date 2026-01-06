// src/userDashboard/pages/MyBookings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Video,
  Camera,
  Star,
  Mic2,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const BASE = import.meta.env.VITE_BASE_API_URL || "http://127.0.0.1:8000";

// === CORRECTED ENDPOINTS - USING "my-" FOR USER-SPECIFIC BOOKINGS ===
const BOOKING_ENDPOINTS = {
  singer: `${BASE}/auth/my-singer-bookings/`,        // Confirmed working
  studio: `${BASE}/auth/my-studio-bookings/`,        // Ask backend to create if not exists
  photography: `${BASE}/auth/my-photography-bookings/`,
  videography: `${BASE}/auth/my-videography-bookings/`,
  private: `${BASE}/auth/my-private-bookings/`,
  classes: `${BASE}/auth/my-singing-classes/`,       // or my-enrollments if different
};

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Icon mapping
const getBookingIcon = (type) => {
  const icons = {
    classes: <Music className="w-8 h-8" />,
    studio: <Mic2 className="w-8 h-8" />,
    videography: <Video className="w-8 h-8" />,
    photography: <Camera className="w-8 h-8" />,
    private: <Star className="w-8 h-8" />,
    singer: <Mic2 className="w-8 h-8 text-purple-600" />,
  };
  return icons[type] || <Calendar className="w-8 h-8" />;
};

const getBookingTitle = (type) => {
  const titles = {
    classes: "Singing Class Enrollment",
    studio: "Studio Recording Session",
    videography: "Videography Booking",
    photography: "Photography Shoot",
    private: "Private Event Performance",
    singer: "Singer Performance Booking",
  };
  return titles[type] || "My Booking";
};

const getStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("confirmed") || s.includes("paid") || s.includes("success") || s.includes("approved")) {
    return { text: "Confirmed", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5" /> };
  }
  if (s.includes("cancelled") || s.includes("rejected") || s.includes("failed")) {
    return { text: "Cancelled", color: "bg-red-100 text-red-800", icon: <XCircle className="w-5 h-5" /> };
  }
  return { text: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="w-5 h-5" /> };
};

export default function MyBookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllBookings = async () => {
      setLoading(true);
      setError("");
      const bookings = [];

      try {
        const requests = Object.entries(BOOKING_ENDPOINTS).map(async ([type, url]) => {
          try {
            const res = await api.get(url);
            console.log(`Fetched ${type} bookings:`, res.data); // Debug log

            let data = [];
            if (Array.isArray(res.data)) {
              data = res.data;
            } else if (res.data?.results) {
              data = res.data.results;
            } else if (res.data?.data) {
              data = res.data.data;
            }

            return data.map((item) => ({
              ...item,
              _type: type,
            }));
          } catch (e) {
            console.warn(`No data or error for ${type}:`, e.response?.status, e.message);
            return []; // Silently skip if endpoint not ready yet
          }
        });

        const results = await Promise.all(requests);
        results.forEach((list) => bookings.push(...list));

        // Sort by newest first
        bookings.sort((a, b) => {
          const dateA = new Date(
            a.created_at || a.performance_date || a.date || a.shoot_date || 0
          );
          const dateB = new Date(
            b.created_at || b.performance_date || b.date || b.shoot_date || 0
          );
          return dateB - dateA;
        });

        setAllBookings(bookings);
      } catch (err) {
        console.error("General fetch error:", err);
        setError("Failed to load your bookings. Some services may be unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center py-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-6 border-amber-500 border-t-transparent mb-8"></div>
          <p className="text-3xl font-bold text-gray-800">Loading Your Bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center py-32 px-6">
        <div className="text-center max-w-lg">
          <AlertCircle className="w-32 h-32 text-orange-500 mx-auto mb-8" />
          <p className="text-xl text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (allBookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gray-100 border-4 border-dashed border-gray-300 rounded-full w-64 h-64 mx-auto mb-12 flex items-center justify-center">
            <Calendar className="w-32 h-32 text-gray-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            No Bookings Yet
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            You haven't booked anything yet. Explore and book your first service!
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a
              href="/services"
              className="px-12 py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition"
            >
              Explore Services
            </a>
            <a
              href="/singer-booking"
              className="px-12 py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition"
            >
              Book a Singer
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent mb-6">
          My Bookings
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-5xl mx-auto">
          All your singer performances, studio sessions, shoots, and events in one place.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {allBookings.map((booking, index) => {
          const type = booking._type;
          const status = getStatusBadge(booking.status || booking.payment_status || "pending");

          const title =
            booking.singer_name ||
            booking.studio_name ||
            booking.project_title ||
            booking.event_name ||
            getBookingTitle(type);

          const date =
            booking.performance_date ||
            booking.shoot_date ||
            booking.booking_date ||
            booking.date ||
            "To be confirmed";

          const time =
            booking.time_slot ||
            booking.start_time ||
            "Time TBD";

          const location =
            booking.performance_location ||
            booking.location ||
            booking.venue ||
            "Location TBD";

          const price =
            booking.rate ||
            booking.package_price ||
            booking.total_amount ||
            "Contact for price";

          return (
            <motion.div
              key={booking.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur">
                    {getBookingIcon(type)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <p className="text-lg opacity-90">{getBookingTitle(type)}</p>
                  </div>
                </div>
                <div className={`px-6 py-3 rounded-full font-bold flex items-center gap-3 ${status.color}`}>
                  {status.icon}
                  <span className="text-lg">{status.text}</span>
                </div>
              </div>

              <div className="p-8 space-y-7">
                <div className="flex items-center gap-4">
                  <Calendar className="w-7 h-7 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Clock className="w-7 h-7 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-lg font-semibold">{time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-7 h-7 text-amber-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-semibold">{location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t-2 border-dashed border-gray-200">
                  <IndianRupee className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      ₹{typeof price === "number" ? price.toLocaleString("en-IN") : price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 text-sm text-gray-600">
                Booked on {new Date(booking.created_at || Date.now()).toLocaleDateString("en-IN")}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}