// src/userDashboard/UserEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
} from "react-icons/fa";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const EVENTS_URL = `${BASE}/user/events/`;
const BOOKINGS_URL = `${BASE}/user/event-bookings/`;

// axios client with JWT token
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* SeatSelectionModal                                                  */
/* ------------------------------------------------------------------ */

// layout = how many seats we show for each tier
const SEAT_LAYOUT = {
  basic: { label: "Basic", rows: 3, cols: 10 },    // 30 seats
  premium: { label: "Premium", rows: 3, cols: 10 },// 30 seats
  vip: { label: "VIP", rows: 2, cols: 8 },         // 16 seats
};

function SeatSelectionModal({ event, onClose, onBookingCreated }) {
  const [selectedTier, setSelectedTier] = useState("basic");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!event) return null;

  // ensure numeric prices
  const n = (v) => (v == null || v === "" ? 0 : Number(v));

  const tierPriceMap = {
    basic: n(event.basic_price ?? event.ticket_price ?? 0),
    premium: n(event.premium_price ?? event.ticket_price ?? 0),
    vip: n(event.vip_price ?? event.ticket_price ?? 0),
  };

  const pricePerSeat = tierPriceMap[selectedTier] || 0;
  const seatsCount = selectedSeats.length;
  const total = pricePerSeat * seatsCount;

  // helper: seats we *show* for a tier (rows × cols)
  const seatsConfiguredForTier = (tierKey) => {
    const t = SEAT_LAYOUT[tierKey];
    if (!t) return 0;
    return t.rows * t.cols;
  };

  // when user clicks a seat
  const handleSeatClick = (tierKey, seatId) => {
    // change tier automatically if clicking other tier
    if (tierKey !== selectedTier) {
      setSelectedTier(tierKey);
      setSelectedSeats([seatId]);
      return;
    }
    // same tier → toggle seat
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleTierChange = (tierKey) => {
    if (tierKey === selectedTier) return;
    setSelectedTier(tierKey);
    setSelectedSeats([]); // clear when user manually changes tier
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your contact number.");
      return;
    }
    if (!seatsCount) {
      setError("Please select at least one seat.");
      return;
    }

    try {
      setSaving(true);
      await api.post(BOOKINGS_URL, {
        event: event.id,
        customer_name: name,
        contact_number: phone,
        email: "",
        ticket_type: selectedTier,            // basic / premium / vip
        number_of_tickets: seatsCount,
        total_amount: total,
        payment_method: paymentMethod,        // UPI / Card / Cash
      });

      onBookingCreated?.();
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const key = Object.keys(data)[0];
        const val = data[key];
        const msg = Array.isArray(val) ? val[0] : val;
        setError(`${key}: ${msg}`);
      } else {
        setError(err?.message || "Failed to create booking.");
      }
    } finally {
      setSaving(false);
    }
  };

  // build grid for one tier
  const renderSeatGrid = (tierKey) => {
    const tier = SEAT_LAYOUT[tierKey];
    if (!tier) return null;

    const rows = [];
    for (let r = 0; r < tier.rows; r++) {
      const rowSeats = [];
      for (let c = 1; c <= tier.cols; c++) {
        const number = (c < 10 ? "0" : "") + c;
        const seatId = `${tierKey}-${r + 1}-${number}`;
        const isSelected =
          tierKey === selectedTier && selectedSeats.includes(seatId);

        rowSeats.push(
          <button
            key={seatId}
            type="button"
            onClick={() => handleSeatClick(tierKey, seatId)}
            className={`w-9 h-9 rounded border text-xs font-semibold flex items-center justify-center transition
              ${
                isSelected
                  ? "bg-amber-400 border-amber-500 text-white shadow"
                  : "bg-white border-emerald-400 text-emerald-700 hover:bg-emerald-50"
              }`}
          >
            {number}
          </button>
        );
      }
      rows.push(
        <div key={r} className="flex gap-1 justify-center mb-1">
          {rowSeats}
        </div>
      );
    }
    return rows;
  };

  const tierBlock = (key, colorClass) => {
    const priceLabel = tierPriceMap[key] || 0;
    const seatsForTier = seatsConfiguredForTier(key);

    return (
      <div className="mb-6" key={key}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h4 className="font-semibold text-slate-900">
                ₹{priceLabel.toFixed(2)} {SEAT_LAYOUT[key].label.toUpperCase()}
              </h4>
              {selectedTier === key && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-100">
                  Selected
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {seatsForTier} seats available for this tier
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTierChange(key)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              selectedTier === key
                ? `${colorClass} text-white border-transparent`
                : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
            }`}
          >
            {selectedTier === key ? "Current tier" : "Choose tier"}
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-2">
          {renderSeatGrid(key)}
        </div>
      </div>
    );
  };

  const maxSeatsForSelectedTier = seatsConfiguredForTier(selectedTier);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Select seats – {event.name}
            </h3>
            <p className="text-xs text-slate-500">
              {event.location} • {event.event_date} • {event.event_time}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* LEFT: tiers + seat grids */}
          <div className="md:col-span-2">
            {tierBlock("vip", "bg-purple-600")}
            {tierBlock("premium", "bg-indigo-600")}
            {tierBlock("basic", "bg-emerald-600")}

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded border border-emerald-400 bg-white inline-block" />
                Available
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-amber-400 inline-block" />
                Selected
              </div>
              <span>
                Max seats you can select in this tier: {maxSeatsForSelectedTier}
              </span>
            </div>
          </div>

          {/* RIGHT: summary + form */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
            <h4 className="font-semibold text-slate-900 mb-1">
              Booking details
            </h4>

            <label className="text-xs font-medium text-slate-600">
              Your name
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>

            <label className="text-xs font-medium text-slate-600">
              Contact number
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </label>

            <label className="text-xs font-medium text-slate-600">
              Payment method
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
            </label>

            <div className="mt-2 border-t border-slate-200 pt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Tier:{" "}
                  <strong className="capitalize">{selectedTier}</strong>
                </span>
                <span className="font-medium text-slate-800">
                  ₹{pricePerSeat.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">
                  Seats selected: {seatsCount}
                </span>
                <span className="font-medium text-slate-800">
                  × ₹{pricePerSeat.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-violet-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaTicketAlt />
              {saving ? "Booking..." : "Confirm booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Events list page                                                    */
/* ------------------------------------------------------------------ */

export default function UserEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(EVENTS_URL);
      setEvents(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      e.name?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    );
  });

  const openBooking = (event) => {
    if ((event.available_seats ?? 0) <= 0) return;
    setActiveEvent(event);
  };

  const onBookingCreated = () => {
    fetchEvents();
  };

  const formatPrice = (val) => {
    const num = val == null || val === "" ? 0 : Number(val);
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-rose-50 px-4 pb-16 pt-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm border border-orange-100 mb-2">
              <span className="text-xl">📅</span>
              <span className="text-xs font-medium text-orange-700">
                Events &amp; Shows
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Events &amp; Shows
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Live concerts, karaoke nights, workshops and more happening at
              IMC.
            </p>
          </div>

          <button
            type="button"
            className="self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm"
          >
            ● User Panel
          </button>
        </header>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              className="w-full rounded-full border border-slate-200 bg-white/80 px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Search by event name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Events list */}
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
          All events
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-white/80 shadow-md animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-slate-500">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => {
              const soldOut = (event.available_seats ?? 0) <= 0;
              return (
                <div
                  key={event.id}
                  className="rounded-3xl overflow-hidden shadow-lg bg-white/90 border border-slate-100 flex flex-col"
                >
                  <div className="h-24 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white capitalize">
                        {event.event_type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        upcoming
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 capitalize">
                      {event.name}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-slate-400" />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-slate-400" />
                        <span>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-400" />
                        <span className="capitalize">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">🪑</span>
                        <span>
                          {event.available_seats ?? 0} seats available
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-500">
                          Ticket price
                        </p>
                        <p className="text-lg font-bold text-violet-600">
                          ₹{formatPrice(event.ticket_price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking(event)}
                        disabled={soldOut}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-md transition ${
                          soldOut
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg"
                        }`}
                      >
                        <FaTicketAlt />
                        {soldOut ? "Not available" : "Book"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeEvent && (
          <SeatSelectionModal
            event={activeEvent}
            onClose={() => setActiveEvent(null)}
            onBookingCreated={onBookingCreated}
          />
        )}
      </div>
    </div>
  );
}
