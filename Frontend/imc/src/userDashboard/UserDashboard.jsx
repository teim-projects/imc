// src/userDashboard/UserDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaCamera,
  FaVideo,
  FaMusic,
  FaBuilding,
  FaUserFriends,
  FaCogs,
  FaMoneyBillWave,
  FaBell,
  FaCog,
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdEvent, MdClass, MdDashboard } from "react-icons/md";
import { PiTicketFill } from "react-icons/pi";

/* ---------------------- THEME COLORS ---------------------- */
/*
  Navy:   #0B1730
  Cream:  #FFF8E6
  Orange: #F97316
  Gold:   #FACC15
*/

/* ---------------------- MOCK DATA ---------------------- */

const STATS = [
  { label: "Total bookings", value: "24", chip: "+3 this month" },
  { label: "Upcoming", value: "2", chip: "Next in 3 days" },
  { label: "Amount spent", value: "₹35,200", chip: "4 services used" },
];

const SERVICES = [
  {
    key: "studio",
    title: "Studio Booking",
    desc: "Book soundproof studios with real-time slot view.",
    icon: FaBuilding,
    route: "/studio-booking",
    badge: "Prime",
  },
  {
    key: "photo",
    title: "Photography",
    desc: "Portrait, event & portfolio shoots.",
    icon: FaCamera,
    route: "/photography-booking",
    badge: "Popular",
  },
  {
    key: "video",
    title: "Videography",
    desc: "Cinematic films with pro editing.",
    icon: FaVideo,
    route: "/videography-booking",
    badge: "4K",
  },
  {
    key: "sound",
    title: "Sound System",
    desc: "Speakers, mixers, mics & full PA.",
    icon: FaMusic,
    route: "/sound-booking",
    badge: "On-site",
  },
  {
    key: "private",
    title: "Private Booking",
    desc: "Private rehearsal & jamming rooms.",
    icon: FaUserFriends,
    route: "/private-booking",
    badge: "Premium",
  },
  {
    key: "events",
    title: "Events",
    desc: "End-to-end event booking support.",
    icon: MdEvent,
    route: "/events-booking",
    badge: "Hot",
  },
  {
    key: "classes",
    title: "Classes",
    desc: "Music, vocal & performance batches.",
    icon: MdClass,
    route: "/classes",
    badge: "New",
  },
  {
    key: "equipment",
    title: "Equipment Rental",
    desc: "Rent cameras, lights & audio gear.",
    icon: FaCogs,
    route: "/equipment-rental",
    badge: "Add-on",
  },
];

const UPCOMING = [
  {
    title: "Studio Booking",
    date: "28 Nov 2025",
    time: "03:00 PM – 05:00 PM",
    location: "IMC Studio 1, Jaipur",
    status: "Confirmed",
  },
  {
    title: "Photography",
    date: "30 Nov 2025",
    time: "10:00 AM – 01:00 PM",
    location: "City Palace, Jaipur",
    status: "Pending",
  },
];

const BOOKINGS_BY_SERVICE = [
  { label: "Studio", value: 10 },
  { label: "Photo", value: 5 },
  { label: "Video", value: 4 },
  { label: "Sound", value: 3 },
];

const ACTIVITY = [
  {
    label: "Studio • 21 Nov",
    detail: "2-hour recording session",
    amount: "₹2,500",
    status: "Completed",
  },
  {
    label: "Videography • 15 Nov",
    detail: "Wedding full-day coverage",
    amount: "₹8,000",
    status: "Completed",
  },
  {
    label: "Photography • 10 Nov",
    detail: "Outdoor couple shoot",
    amount: "₹3,500",
    status: "Cancelled",
  },
];

const PAYMENTS = [
  { label: "Last payment", value: "₹2,500", meta: "#PAY-3421 • UPI" },
  { label: "This month", value: "₹10,500", meta: "3 completed bookings" },
];

/* ---------------------- MAIN COMPONENT ---------------------- */

export default function UserDashboard() {
  const navigate = useNavigate();
  const userName = "Bharat";
  const maxBookings = Math.max(...BOOKINGS_BY_SERVICE.map((b) => b.value));

  return (
    <div className="min-h-screen flex bg-[#FFF8E6] text-[#0B1730]">
      {/* SIDEBAR – navy + gold */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0B1730] text-white border-r border-[#132446]">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-[#132446] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center text-xs font-bold shadow-md shadow-black/40">
            IM
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide">
              IMC Studio Portal
            </div>
            <div className="text-[11px] text-[#FACC15]">User dashboard</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SidebarItem
            icon={<MdDashboard />}
            label="Overview"
            active
            onClick={() => navigate("/user-dashboard")}
          />
          <SidebarItem
            icon={<PiTicketFill />}
            label="My bookings"
            onClick={() => navigate("/bookings")}
          />
          <SidebarItem
            icon={<FaMoneyBillWave />}
            label="Payments"
            onClick={() => navigate("/payments")}
          />
          <SidebarItem
            icon={<FaBell />}
            label="Notifications"
            onClick={() => navigate("/notifications")}
          />
          <SidebarItem
            icon={<FaCog />}
            label="Settings"
            onClick={() => navigate("/settings")}
          />
        </nav>

        {/* User mini card */}
        <div className="px-4 pb-4 pt-3 border-t border-[#132446] bg-[#091021] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <FaUserCircle className="text-[#FACC15] text-2xl" />
            <div>
              <div className="font-semibold text-sm">{userName}</div>
              <div className="text-[11px] text-slate-200">Premium member</div>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1 text-[11px] text-[#F97316] hover:text-[#FDBA74]"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Decorative color blocks (orange + cream) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-[3rem] bg-[#F97316]/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-[3rem] bg-[#FACC15]/20 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 xl:px-10 py-6 space-y-6">
          {/* HERO / HEADER BLOCK */}
          <section className="rounded-3xl bg-white border border-[#FDE68A] shadow-[0_18px_40px_rgba(15,23,42,0.12)] p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#6B7280]">
                Welcome back
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold mt-1 flex items-center gap-2">
                Hi, {userName}
                <span className="text-[10px] font-medium text-[#0B1730] bg-[#FACC15]/70 px-2 py-1 rounded-full border border-[#FBBF24]">
                  Live overview
                </span>
              </h1>
              <p className="text-sm text-[#4B5563] mt-2 max-w-xl">
                Manage your studio, photography, videography, sound, events
                and classes in one clean dashboard.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
                <button
                  onClick={() => navigate("/studio-booking")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F97316] text-white font-semibold shadow hover:bg-[#EA580C]"
                >
                  New studio booking
                  <FaArrowRight className="text-xs" />
                </button>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0B1730] text-[#FACC15] px-2.5 py-1 border border-[#FACC15]/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  Profile completion: <b>82%</b>
                </span>
              </div>
            </div>

            {/* Next booking card */}
            <div className="w-full md:w-72 rounded-2xl bg-[#0B1730] text-white border border-[#111827]/60 p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200">Next booking</span>
                <span className="text-[10px] text-slate-400">
                  Time zone: IST
                </span>
              </div>
              {UPCOMING[0] ? (
                <>
                  <div className="font-semibold text-sm text-[#FACC15]">
                    {UPCOMING[0].title}
                  </div>
                  <div className="text-slate-100">
                    {UPCOMING[0].date} • {UPCOMING[0].time}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {UPCOMING[0].location}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full ${
                        UPCOMING[0].status === "Confirmed"
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-300/60"
                          : "bg-amber-500/20 text-amber-100 border border-amber-300/60"
                      }`}
                    >
                      {UPCOMING[0].status}
                    </span>
                    <button
                      onClick={() => navigate("/bookings/upcoming")}
                      className="text-[11px] text-[#FACC15] hover:text-white"
                    >
                      View all →
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-slate-300">No upcoming bookings yet.</p>
              )}
            </div>
          </section>

          {/* STAT CARDS + SMALL VISUALIZATION */}
          <section className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            {/* Stats */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-4 flex flex-col gap-1"
                >
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.16em]">
                    {s.label}
                  </p>
                  <p className="text-xl font-semibold text-[#0B1730]">
                    {s.value}
                  </p>
                  <p className="text-xs text-[#16A34A] mt-1">{s.chip}</p>
                </div>
              ))}
            </div>

            {/* Bookings by service (bar viz) */}
            <div className="rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-4 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-[#0B1730]">
                  <FaCalendarAlt className="text-[#F97316]" />
                  Bookings by service
                </h2>
                <span className="text-[10px] text-[#6B7280]">
                  Last 30 days
                </span>
              </div>
              <div className="space-y-2 mt-1">
                {BOOKINGS_BY_SERVICE.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="w-16 text-[11px] text-[#4B5563]">
                      {b.label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#FEF3C7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F97316] via-[#FACC15] to-[#0B1730]"
                        style={{
                          width:
                            maxBookings === 0
                              ? "0%"
                              : `${(b.value / maxBookings) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] text-[#4B5563]">
                      {b.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SERVICES GRID */}
          <section className="space-y-3" id="services">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-[#0B1730]">
                <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#0B1730] via-[#F97316] to-[#FACC15]" />
                Services you can book
              </h2>
              <span className="text-[11px] text-[#6B7280]">
                Tap any card to open its booking form
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {SERVICES.map((s) => (
                <ServiceCard key={s.key} service={s} onClick={navigate} />
              ))}
            </div>
          </section>

          {/* UPCOMING + ACTIVITY */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Upcoming */}
            <div className="xl:col-span-2 rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0B1730]">
                  Upcoming bookings
                </h2>
                <button
                  onClick={() => navigate("/bookings/upcoming")}
                  className="text-[11px] text-[#0F766E] hover:text-[#0D9488]"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {UPCOMING.map((u, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBEB] p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="text-[#0B1730] font-semibold text-xs">
                        {u.title}
                      </p>
                      <p className="text-[#4B5563] mt-0.5">
                        {u.date} • {u.time}
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {u.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full ${
                          u.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {u.status}
                      </span>
                      <button
                        className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6]"
                        onClick={() =>
                          navigate(
                            "/bookings/" +
                              u.title.toLowerCase().replace(/\s+/g, "-")
                          )
                        }
                      >
                        View details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-5 text-xs">
              <h2 className="text-sm font-semibold text-[#0B1730] mb-3">
                Recent booking activity
              </h2>
              <div className="space-y-3">
                {ACTIVITY.map((a, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="pt-1">
                      <span className="block w-1 h-10 rounded-full bg-gradient-to-b from-[#F97316] via-[#FACC15] to-[#0B1730]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0B1730] font-medium">
                        {a.label}
                      </p>
                      <p className="text-[#6B7280] mt-0.5">{a.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#0B1730] font-semibold">
                        {a.amount}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {a.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PAYMENTS + MEMBERSHIP + SUPPORT */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">
            {/* Payments */}
            <div className="rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-5 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-[#0B1730]">
                  <FaMoneyBillWave className="text-[#22C55E]" />
                  Payments
                </h2>
                <button
                  onClick={() => navigate("/payments")}
                  className="text-[11px] text-[#0F766E] hover:text-[#0D9488]"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {PAYMENTS.map((p) => (
                  <div
                    key={p.label}
                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[#111827]">{p.label}</p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {p.meta}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#0B1730]">
                      {p.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Membership */}
            <div className="rounded-2xl border border-[#FACC15]/70 bg-gradient-to-br from-[#FFF7C2] via-white to-[#FED7AA] shadow-sm p-5 text-xs flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#92400E]">
                Membership
              </p>
              <h2 className="text-sm font-semibold text-[#92400E]">
                Premium plan • Annual
              </h2>
              <p className="text-[#92400E]/90">
                Priority booking, exclusive discounts and faster support
                for every IMC service.
              </p>
              <ul className="text-[11px] text-[#92400E] space-y-1 mt-1">
                <li>• 10% off on photography & videography</li>
                <li>• Early access to prime studio slots</li>
                <li>• Priority support channel</li>
              </ul>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[#92400E]">
                  Valid till <b>21 Dec 2026</b>
                </span>
                <button
                  onClick={() => navigate("/membership")}
                  className="px-3 py-1.5 rounded-full bg-[#F97316] text-white font-semibold hover:bg-[#EA580C]"
                >
                  Manage plan
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-5 text-xs flex flex-col gap-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-[#0B1730]">
                <FaBell className="text-[#0EA5E9]" />
                Support & quick actions
              </h2>
              <p className="text-[#4B5563]">
                Facing an issue with a booking or payment? Reach support or
                adjust your settings.
              </p>
              <div className="text-[#111827] space-y-1">
                <p>📧 support@imcstudio.com</p>
                <p>📞 +91-98765-43210</p>
                <p>⏰ 10 AM – 7 PM (IST)</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <button
                  onClick={() => navigate("/support")}
                  className="px-3 py-1.5 rounded-full bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7]"
                >
                  Raise ticket
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="px-3 py-1.5 rounded-full bg-[#0B1730] text-[#F9FAFB] font-semibold hover:bg-black"
                >
                  Open settings
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------------------- SMALL COMPONENTS ---------------------- */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-all ${
        active
          ? "bg-[#FFF8E6] text-[#0B1730] font-semibold"
          : "text-slate-200 hover:bg-[#111827]"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ServiceCard({ service, onClick }) {
  const Icon = service.icon;
  return (
    <button
      type="button"
      onClick={() => onClick(service.route)}
      className="group relative rounded-2xl bg-white border border-[#F3F4F6] shadow-sm p-4 flex flex-col gap-2 text-left hover:border-[#F97316] hover:shadow-[0_10px_30px_rgba(248,113,22,0.35)] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#0B1730] flex items-center justify-center text-white text-lg">
            <Icon />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#0B1730]">
              {service.title}
            </span>
            <span className="text-[10px] mt-0.5 px-1.5 py-[2px] rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FBBF24]/60 w-max">
              {service.badge}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-[#6B7280]">Active</span>
      </div>
      <p className="text-xs text-[#4B5563]">{service.desc}</p>
      <div className="mt-1 flex items-center justify-between text-[11px] text-[#0B1730]">
        <span className="inline-flex items-center gap-1">
          Book now
          <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
        </span>
        <span className="text-[#9CA3AF]">Tap to continue</span>
      </div>
    </button>
  );
}
