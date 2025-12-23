import React from "react";
import { Link } from "react-router-dom";
import {
  Mic2,
  Calendar,
  Users,
  Camera,
  Speaker,
  Star,
  Play,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
} from "lucide-react";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isLoggedIn = !!localStorage.getItem("access");
  const dashOrLogin = isLoggedIn ? "/dashboard" : "/login";

  const services = [
    { title: "Studio Booking", icon: Mic2 },
    { title: "Singing Classes", icon: Users },
    { title: "Live Events", icon: Calendar },
    { title: "Media Services", icon: Camera },
    { title: "Sound Systems", icon: Speaker },
    { title: "Club Membership", icon: Star },
  ];

  const events = [
    {
      id: 1,
      title: "Rock Band Live Night",
      time: "9:00 PM",
      location: "Main Auditorium",
      price: "$55",
      image:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    },
    {
      id: 2,
      title: "Acoustic Evening Session",
      time: "6:30 PM",
      location: "Rooftop Garden",
      price: "$40",
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    },
    {
      id: 3,
      title: "Karaoke Night Special",
      time: "8:00 PM",
      location: "Lounge Area",
      price: "$25",
      image:
        "https://images.unsplash.com/photo-1515165562835-c4c1c8b8d5aa",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cream)] overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)] to-[var(--orange)] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid md:grid-cols-2 gap-14 items-center">
          
          <div>
            <span className="inline-block mb-5 px-5 py-2 rounded-full bg-[var(--yellow)] text-[var(--navy)] font-semibold shadow">
              🎶 Welcome {user.full_name || "to IMC Music Center"}
            </span>

            <h1 className="text-6xl font-extrabold leading-tight text-[var(--navy)]">
              Where <span className="text-[var(--orange)]">Music</span><br />
              Comes Alive
            </h1>

            <p className="mt-6 text-lg text-slate-700 max-w-xl">
              Premium studios, unforgettable events, professional sound &
              creative services — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              <Link
                to={dashOrLogin}
                className="px-8 py-4 rounded-2xl bg-[var(--orange)] text-white font-semibold shadow-lg hover:scale-105 transition"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started"} →
              </Link>

              <Link
                to="/events"
                className="px-8 py-4 rounded-2xl border-2 border-[var(--navy)] text-[var(--navy)] font-semibold flex items-center gap-2 hover:bg-[var(--navy)] hover:text-white transition"
              >
                <Play size={18} /> View Events
              </Link>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d"
            alt="Music"
            className="rounded-[2.5rem] shadow-2xl hover:scale-[1.03] transition"
          />
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <h2 className="text-5xl font-extrabold text-center text-[var(--navy)]">
          Premium Services
        </h2>
        <p className="text-center text-slate-600 mt-4 text-lg">
          Designed for artists, creators & performers
        </p>

        <div className="grid md:grid-cols-3 gap-12 mt-20">
          {services.map((s, i) => (
            <Link
              to={dashOrLogin}
              key={i}
              className="group bg-white/80 backdrop-blur rounded-3xl p-10 shadow-xl hover:-translate-y-2 transition"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--orange)] to-[var(--yellow)] flex items-center justify-center mb-6 shadow">
                <s.icon className="text-white w-7 h-7" />
              </div>

              <h3 className="text-2xl font-bold text-[var(--navy)]">
                {s.title}
              </h3>
              <p className="text-slate-600 mt-2">
                High-end professional music solutions.
              </p>

              <div className="mt-5 flex items-center gap-2 text-[var(--orange)] font-semibold">
                Explore <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= EVENTS ================= */}
      <section className="bg-white/60 backdrop-blur py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[var(--orange)] font-semibold">
                DON’T MISS OUT
              </span>
              <h2 className="text-5xl font-extrabold text-[var(--navy)]">
                Upcoming Events
              </h2>
            </div>

            <Link
              to="/events"
              className="px-6 py-3 rounded-xl border border-[var(--navy)] text-[var(--navy)] font-semibold hover:bg-[var(--navy)] hover:text-white transition"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {events.map((e) => (
              <div
                key={e.id}
                className="group bg-white rounded-[2.5rem] shadow-xl overflow-hidden hover:-translate-y-2 transition"
              >
                <div className="relative h-56">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute top-4 right-4 bg-[var(--orange)] text-white px-4 py-1 rounded-full font-semibold">
                    {e.price}
                  </span>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-[var(--navy)]">
                    {e.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-slate-600">
                    <div className="flex gap-2">
                      <Clock size={16} /> {e.time}
                    </div>
                    <div className="flex gap-2">
                      <MapPin size={16} /> {e.location}
                    </div>
                  </div>

                  <Link
                    to="/events-booking"
                    className="mt-6 flex items-center justify-center gap-2 bg-[var(--navy)] text-white py-4 rounded-2xl font-semibold hover:bg-[var(--orange)] transition"
                  >
                    <Ticket size={18} /> Book Tickets
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[var(--navy)] text-[var(--cream)] py-8 text-center">
        © 2025 IMC Music Center. All rights reserved.
      </footer>
    </div>
  );
}
