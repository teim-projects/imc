// --------------------------------------------------------------
// src/userDashboard/UserEvents.jsx
// THEME: Cream (#FFF7DF), Navy (#0B2545), Yellow (#FFD447), Orange (#FF7A3C)
// --------------------------------------------------------------

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaSearch,
  FaChair,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const EVENTS_URL = `${BASE}/user/events/`;
const BOOKINGS_URL = `${BASE}/user/event-bookings/`; // GET (my bookings) + POST (create)

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

// fixed color tokens
const COLORS = {
  cream: "#FFF7DF",
  navy: "#0B2545",
  yellow: "#FFD447",
  orange: "#FF7A3C",
};

// --------------------------------------------------------------
// SEAT LAYOUT CONFIG
// --------------------------------------------------------------
const SEAT_LAYOUT = {
  basic: { label: "Basic", rows: 3, cols: 10 }, // 30 seats
  premium: { label: "Premium", rows: 3, cols: 10 },
  vip: { label: "VIP", rows: 2, cols: 8 },
};

/* ======================================================================
   SEAT SELECTION MODAL  (shows booked + your seats)
====================================================================== */
function SeatSelectionModal({ event, onClose, onBookingCreated }) {
  const [selectedTier, setSelectedTier] = useState("basic");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!event) return null;

  const n = (v) => (v == null || v === "" ? 0 : Number(v));

  const tierPriceMap = {
    basic: n(event.basic_price ?? event.ticket_price ?? 0),
    premium: n(event.premium_price ?? event.ticket_price ?? 0),
    vip: n(event.vip_price ?? event.ticket_price ?? 0),
  };

  const pricePerSeat = tierPriceMap[selectedTier] || 0;
  const seatsCount = selectedSeats.length;
  const total = pricePerSeat * seatsCount;

  const seatsConfiguredForTier = (tierKey) => {
    const t = SEAT_LAYOUT[tierKey];
    if (!t) return 0;
    return t.rows * t.cols;
  };

  const maxSeatsForSelectedTier = seatsConfiguredForTier(selectedTier);

  // ------- booked seats from backend ----------------------
  const bookedSeatIds = new Set(event.booked_seats || []); // all booked seat ids
  const myBookedSeatIds = new Set(event.user_booked_seats || []); // my seats

  const handleSeatClick = (tierKey, seatId) => {
    // ignore click if already booked by anyone
    if (bookedSeatIds.has(seatId)) return;

    if (tierKey !== selectedTier) {
      setSelectedTier(tierKey);
      setSelectedSeats([seatId]);
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleTierChange = (tierKey) => {
    if (tierKey === selectedTier) return;
    setSelectedTier(tierKey);
    setSelectedSeats([]);
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
        ticket_type: selectedTier,
        number_of_tickets: seatsCount,
        seat_numbers: selectedSeats, // list of seat ids like "basic-1-02"
        total_amount: total,
        payment_method: paymentMethod,
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

  // labels of seats selected in this booking, e.g. ["02","03"]
  const selectedSeatLabels = selectedSeats
    .filter((s) => s.startsWith(selectedTier + "-"))
    .map((s) => s.split("-")[2])
    .sort((a, b) => Number(a) - Number(b));

  // labels of seats already booked by this user (all tiers)
  const myBookedSeatLabels = (event.user_booked_seats || [])
    .map((s) => s.split("-")[2] || s)
    .filter(Boolean);

  // seat grid for one tier
  const renderSeatGrid = (tierKey) => {
    const tier = SEAT_LAYOUT[tierKey];
    if (!tier) return null;

    const rows = [];
    for (let r = 0; r < tier.rows; r++) {
      const rowSeats = [];
      for (let c = 1; c <= tier.cols; c++) {
        const number = (c < 10 ? "0" : "") + c;
        const seatId = `${tierKey}-${r + 1}-${number}`;

        const isBooked = bookedSeatIds.has(seatId);
        const isMine = myBookedSeatIds.has(seatId);
        const isSelected =
          !isBooked && tierKey === selectedTier && selectedSeats.includes(seatId);

        let cls = "";

        if (isMine) {
          cls =
            "bg-[#0B2545] text-[#FFD447] border-[#0B2545] shadow-[0_0_18px_rgba(11,37,69,0.45)] cursor-not-allowed";
        } else if (isBooked) {
          cls =
            "bg-[#E5E7EB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed";
        } else if (isSelected) {
          cls =
            "bg-gradient-to-br from-[#FFD447] to-[#FF7A3C] text-[#0B2545] border-[#FF7A3C] shadow-[0_0_25px_rgba(255,122,60,0.4)]";
        } else {
          cls =
            "bg-white/80 border-[#E5E7EB] text-[#6B7280] hover:bg-white hover:border-[#D1D5DB] cursor-pointer";
        }

        rowSeats.push(
          <motion.button
            key={seatId}
            type="button"
            whileHover={!isBooked ? { scale: 1.15, y: -2 } : {}}
            whileTap={!isBooked ? { scale: 0.9 } : {}}
            onClick={() => handleSeatClick(tierKey, seatId)}
            className={`w-11 h-11 rounded-2xl text-[10px] font-bold flex items-center justify-center
              transition-all shadow-[0_4px_16px_rgba(0,0,0,0.05)] border backdrop-blur-xl ${cls}`}
          >
            {number}
          </motion.button>
        );
      }
      rows.push(
        <div key={r} className="flex gap-3 justify-center mb-2">
          {rowSeats}
        </div>
      );
    }
    return rows;
  };

  const tierBlock = (key) => {
    const priceLabel = tierPriceMap[key] || 0;
    const seatsForTier = seatsConfiguredForTier(key);
    const isCurrent = selectedTier === key;

    return (
      <div
        className={`mb-8 transition-all ${
          isCurrent ? "opacity-100 scale-[1.01]" : "opacity-40"
        }`}
        key={key}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex flex-col">
            <h4
              className="font-semibold text-lg"
              style={{ color: COLORS.navy }}
            >
              ₹{priceLabel.toFixed(2)}{" "}
              <span className="uppercase tracking-wide opacity-90">
                {SEAT_LAYOUT[key].label}
              </span>
            </h4>
            <span className="text-[11px] text-[#9CA3AF]">
              {seatsForTier} seats available for this tier
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTierChange(key)}
            className={`text-xs px-4 py-1.5 rounded-full border transition font-semibold ${
              isCurrent
                ? "text-white shadow"
                : "text-[#6B7280] bg-white/80 hover:bg-white"
            }`}
            style={
              isCurrent
                ? {
                    backgroundColor: "#22C55E",
                    borderColor: "#22C55E",
                  }
                : {
                    borderColor: "#E5E7EB",
                  }
            }
          >
            {isCurrent ? "Current tier" : "Select tier"}
          </button>
        </div>

        <div
          className="rounded-3xl px-5 py-4 shadow-inner border"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,247,223,0.85))",
            borderColor: "rgba(255,255,255,0.8)",
          }}
        >
          {renderSeatGrid(key)}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="max-w-6xl w-full mx-4 rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(15,23,42,0.65)]"
          style={{
            background: "linear-gradient(135deg,#FFFFFF,#FFF7DF)",
          }}
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-white/60 bg-white/80 backdrop-blur-lg">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold">
                Seat selection
              </p>
              <h3
                className="text-xl font-semibold flex items-center gap-2"
                style={{ color: COLORS.navy }}
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
                  style={{
                    backgroundColor: "rgba(11,37,69,0.06)",
                    color: COLORS.navy,
                  }}
                >
                  <FaChair />
                </span>
                {event.name}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                {event.location} • {event.event_date} • {event.event_time}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full w-9 h-9 flex items-center justify-center border text-[#6B7280]"
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderColor: "#E5E7EB",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* body */}
          <div className="grid md:grid-cols-3 gap-0">
            {/* LEFT – tiers + seats */}
            <div className="md:col-span-2 px-8 py-6">
              {tierBlock("vip")}
              {tierBlock("premium")}
              {tierBlock("basic")}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block bg-[#E5E7EB]" />
                  Available
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: COLORS.orange }}
                  />
                  Selected (this booking)
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block bg-[#9CA3AF]" />
                  Booked (others)
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: COLORS.navy }}
                  />
                  Your previous seats
                </div>
                <span className="text-[11px] text-[#9CA3AF]">
                  Max seats in this tier: {maxSeatsForSelectedTier}
                </span>
              </div>
            </div>

            {/* RIGHT – Booking Summary */}
            <div
              className="px-6 py-6 text-white relative"
              style={{
                background: `linear-gradient(135deg, ${COLORS.navy}, #04101F)`,
              }}
            >
              <div className="relative z-10">
                <h4 className="text-lg font-semibold">Booking Summary</h4>
                <p className="text-[11px] text-[#E5E7EB] mt-1 mb-4">
                  Review your details and confirm your booking.
                </p>

                <div className="mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#E5E7EB]">Tier</span>
                    <span
                      className="font-semibold capitalize"
                      style={{ color: COLORS.yellow }}
                    >
                      {selectedTier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E5E7EB]">Seats selected</span>
                    <span className="font-semibold">{seatsCount}</span>
                  </div>

                  {/* This booking seats */}
                  <div>
                    <span className="text-[#E5E7EB]">This booking seats</span>
                    {selectedSeatLabels.length === 0 ? (
                      <p className="text-[11px] text-[#9CA3AF] mt-1">
                        No seats selected yet.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSeatLabels.map((label) => (
                          <span
                            key={label + "-sel"}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: "rgba(255,212,71,0.16)",
                              border: "1px solid rgba(255,212,71,0.6)",
                              color: COLORS.yellow,
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Your already booked seats (if provided) */}
                  {myBookedSeatLabels.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[#E5E7EB]">
                        Your booked seats (existing)
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {myBookedSeatLabels.map((label, idx) => (
                          <span
                            key={label + "-mine-" + idx}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: "rgba(11,37,69,0.5)",
                              border: "1px solid rgba(148,163,184,0.7)",
                              color: COLORS.yellow,
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-1">
                    <span className="text-[#E5E7EB]">Price per seat</span>
                    <span className="font-semibold">
                      ₹{pricePerSeat.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1F2937]">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.12em]">
                        Total
                      </span>
                      <span className="text-xs text-[#9CA3AF]">
                        Inclusive of all charges
                      </span>
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: COLORS.yellow }}
                    >
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <label className="text-[11px] font-medium text-[#F9FAFB] block mb-3">
                  Your name
                  <input
                    className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#1F2937",
                      backgroundColor: "rgba(15,23,42,0.7)",
                      outlineColor: COLORS.yellow,
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </label>

                <label className="text-[11px] font-medium text-[#F9FAFB] block mb-3">
                  Contact number
                  <input
                    className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 text-xs text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#1F2937",
                      backgroundColor: "rgba(15,23,42,0.7)",
                      outlineColor: COLORS.yellow,
                    }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </label>

                <label className="text-[11px] font-medium text-[#F9FAFB] block mb-3">
                  Payment method
                  <select
                    className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 text-xs text-white focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#1F2937",
                      backgroundColor: "rgba(15,23,42,0.7)",
                      outlineColor: COLORS.yellow,
                    }}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI" className="text-black">
                      UPI
                    </option>
                    <option value="Card" className="text-black">
                      Card
                    </option>
                    <option value="Cash" className="text-black">
                      Cash
                    </option>
                  </select>
                </label>

                {error && (
                  <div className="mt-2 text-[11px] text-red-200 bg-red-900/30 border border-red-500/40 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0B2545] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFD447 0%,#FF7A3C 100%)",
                    boxShadow: "0 0 24px rgba(255,122,60,0.55)",
                  }}
                >
                  <FaTicketAlt />
                  {saving ? "Booking..." : "Confirm booking"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ======================================================================
   MY BOOKINGS MODAL  (uses GET /user/event-bookings/ i.e. BOOKINGS_URL)
====================================================================== */
function MyBookingsModal({ open, onClose, bookings, loading, error }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="max-w-4xl w-full mx-4 rounded-[28px] overflow-hidden shadow-[0_26px_70px_rgba(15,23,42,0.75)] bg-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#FFF7DF] to-[#FFEEC0]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                My bookings
              </p>
              <h3 className="text-xl font-semibold text-[#0B2545] flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B2545] text-[#FFD447] text-xs">
                  <FaTicketAlt />
                </span>
                Your tickets &amp; seats
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Data is loaded from <code>api_eventbooking</code> (GET
                {" /user/event-bookings/"}).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-[#F9FAFB]">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Loading your bookings…
              </div>
            ) : error ? (
              <div className="py-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4">
                {error}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                You have not booked any events yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => {
                  // backend may send event_detail or flat event fields
                  const ev = b.event_detail || {};
                  const eventName = ev.name || b.event_name || "Event";
                  const eventDate = ev.event_date || b.event_date || "-";
                  const eventTime = ev.event_time || b.event_time || "-";
                  const location = ev.location || b.location || "-";

                  // seat_numbers can be null, string, or list
                  let seatList = "—";
                  if (Array.isArray(b.seat_numbers) && b.seat_numbers.length) {
                    seatList = b.seat_numbers.join(", ");
                  } else if (
                    typeof b.seat_numbers === "string" &&
                    b.seat_numbers.trim()
                  ) {
                    seatList = b.seat_numbers;
                  }

                  return (
                    <div
                      key={b.id}
                      className="rounded-2xl bg-white shadow-sm border border-yellow-100 p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
                            {b.ticket_type?.toUpperCase() || "TICKET"}
                          </p>
                          <h4 className="text-lg font-semibold text-[#0B2545]">
                            {eventName}
                          </h4>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-[#E0F2FE] text-[#0B2545] border border-[#BFDBFE]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          Confirmed
                        </span>
                      </div>

                      <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-[#0B2545]" />
                          <span>
                            {eventDate} • {eventTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#0B2545]" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaChair className="text-[#0B2545]" />
                          <span>
                            Seats:{" "}
                            <span className="font-semibold text-[#0B2545]">
                              {seatList}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-[#0B2545]" />
                          <span>
                            Amount:{" "}
                            <span className="font-semibold text-[#0B2545]">
                              ₹{b.total_amount}
                            </span>{" "}
                            via {b.payment_method}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-[10px] text-right text-slate-400">
                        Booked on{" "}
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ======================================================================
   MAIN USER EVENTS PAGE
====================================================================== */
export default function UserEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);

  // my bookings state
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const [myBookingsError, setMyBookingsError] = useState("");

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

  const fetchMyBookings = async () => {
    setMyBookingsLoading(true);
    setMyBookingsError("");
    try {
      const res = await api.get(BOOKINGS_URL);
      setMyBookings(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      setMyBookingsError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load your bookings."
      );
    } finally {
      setMyBookingsLoading(false);
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
    // refresh events so available_seats & booked_seats update
    fetchEvents();
    // also refresh my bookings if modal is open
    if (myBookingsOpen) {
      fetchMyBookings();
    }
  };

  const formatPrice = (val) => {
    const num = val == null || val === "" ? 0 : Number(val);
    return num.toFixed(2);
  };

  // handle click of "My Bookings" pill
  const handleMyBookingsClick = () => {
    setMyBookingsOpen(true);
    fetchMyBookings();
  };

  return (
    <div
      className="min-h-screen px-4 pb-16 pt-6"
      style={{ backgroundColor: COLORS.cream }}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 shadow-sm border mb-3"
              style={{
                backgroundColor: "rgba(11,37,69,0.06)",
                borderColor: "rgba(11,37,69,0.12)",
                color: COLORS.navy,
              }}
            >
              <span className="text-xl">🎟️</span>
              <span className="text-xs font-semibold tracking-wide">
                IMC Live • Events &amp; Shows
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: COLORS.navy }}
            >
              Discover &amp; Book
              <span className="ml-2" style={{ color: COLORS.orange }}>
                Amazing Events
              </span>
            </h1>
            <p className="text-sm md:text-base mt-2 max-w-xl text-[#4B5563]">
              Concerts, karaoke nights, workshops and more – curated specially
              for IMC members. Reserve your spot with a few clicks.
            </p>
          </div>

          {/* RIGHT HEADER BUTTONS */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right text-xs text-[#6B7280]">
              <p>Logged in as:</p>
              <p className="font-semibold" style={{ color: COLORS.navy }}>
                IMC User Dashboard
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {/* My Bookings pill */}
              <button
                type="button"
                onClick={handleMyBookingsClick}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold shadow-sm border"
                style={{
                  backgroundColor: "#E6F1FF",
                  borderColor: "#BFDBFE",
                  color: COLORS.navy,
                }}
              >
                <span role="img" aria-label="clipboard">
                  📋
                </span>
                <span>My Bookings</span>
              </button>

              {/* My Events Panel pill */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold shadow-sm"
                style={{
                  borderColor: COLORS.navy,
                  borderWidth: 1,
                  borderStyle: "solid",
                  backgroundColor: "rgba(11,37,69,0.06)",
                  color: COLORS.navy,
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                My Events Panel
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">
              <FaSearch />
            </span>
            <input
              className="w-full rounded-full border px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#E5E7EB",
                backgroundColor: "rgba(255,255,255,0.9)",
              }}
              placeholder="Search by event name, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#4B5563]">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border"
              style={{
                borderColor: "#E5E7EB",
                backgroundColor: "rgba(255,255,255,0.9)",
              }}
            >
              <FaCalendarAlt style={{ color: COLORS.navy }} />
              <span>All upcoming events</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border px-4 py-3 text-sm text-red-700 bg-red-50 border-red-200">
            {error}
          </div>
        )}

        {/* TITLE ROW */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg md:text-xl font-semibold flex items-center gap-2"
            style={{ color: COLORS.navy }}
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
              style={{
                backgroundColor: "rgba(11,37,69,0.08)",
                color: COLORS.navy,
              }}
            >
              <FaTicketAlt />
            </span>
            Available Events
          </h2>
          <span className="text-[11px] text-[#6B7280]">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* EVENTS LIST */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-60 rounded-3xl border animate-pulse"
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderColor: "#E5E7EB",
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-[#6B7280] bg-white/80 border border-[#E5E7EB] rounded-2xl p-6 flex items-center gap-3">
            <span className="text-xl">🤔</span>
            <div>
              <p className="font-medium" style={{ color: COLORS.navy }}>
                No events found.
              </p>
              <p className="text-[11px]">
                Try changing the search text or check back later for new
                events.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event, idx) => {
              const soldOut = (event.available_seats ?? 0) <= 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl overflow-hidden shadow-md border flex flex-col"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    borderColor: "#E5E7EB",
                  }}
                >
                  {/* header bar navy+yellow */}
                  <div
                    className="h-20 flex items-stretch"
                    style={{ backgroundColor: COLORS.navy }}
                  >
                    <div className="flex-1 flex items-center px-4">
                      <span className="inline-flex items-center gap-2 text-[11px] font-medium text:white/90 text-white">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/30 capitalize">
                          {event.event_type}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: COLORS.yellow,
                            color: COLORS.navy,
                          }}
                        >
                          Upcoming
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-24 h-full"
                      style={{ backgroundColor: COLORS.yellow }}
                    />
                  </div>

                  {/* card body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3
                      className="text-lg font-semibold capitalize line-clamp-2"
                      style={{ color: COLORS.navy }}
                    >
                      {event.name}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-[#4B5563]">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt style={{ color: COLORS.navy }} />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock style={{ color: COLORS.navy }} />
                        <span>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt style={{ color: COLORS.navy }} />
                        <span className="capitalize truncate">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: COLORS.navy }}>
                          <FaChair />
                        </span>
                        <span>
                          {event.available_seats ?? 0} seats available
                        </span>
                      </div>
                    </div>

                    {/* footer */}
                    <div className="mt-4 border-t border-[#E5E7EB] pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-[#9CA3AF]">
                          Starts from
                        </p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: COLORS.orange }}
                        >
                          ₹{formatPrice(event.ticket_price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking(event)}
                        disabled={soldOut}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all"
                        style={
                          soldOut
                            ? {
                                backgroundColor: "#E5E7EB",
                                color: "#9CA3AF",
                                cursor: "not-allowed",
                              }
                            : {
                                background:
                                  "linear-gradient(90deg,#FFD447,#FF7A3C)",
                                color: COLORS.navy,
                                boxShadow:
                                  "0 0 18px rgba(255,122,60,0.45)",
                              }
                        }
                      >
                        <FaTicketAlt />
                        {soldOut ? "Sold out" : "Book now"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Seat selection modal */}
        {activeEvent && (
          <SeatSelectionModal
            event={activeEvent}
            onClose={() => setActiveEvent(null)}
            onBookingCreated={onBookingCreated}
          />
        )}

        {/* My bookings modal */}
        <MyBookingsModal
          open={myBookingsOpen}
          onClose={() => setMyBookingsOpen(false)}
          bookings={myBookings}
          loading={myBookingsLoading}
          error={myBookingsError}
        />
      </div>
    </div>
  );
}
