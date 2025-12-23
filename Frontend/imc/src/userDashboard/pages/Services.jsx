import React from "react";
import { Link } from "react-router-dom";
import {
  Mic2,
  Calendar,
  Camera,
  Speaker,
  Music,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- SERVICES DATA ---------------- */

const services = [
  {
    icon: Music,
    title: "Club Membership",
    description:
      "Join our exclusive music community with premium benefits and priority access.",
    features: [
      "Priority event booking",
      "Member-only discounts",
      "Exclusive masterclasses",
      "VIP lounge access",
    ],
    color: "from-violet-500 to-purple-600",
    price: "From $99/month",
    link: "/singer/register",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  },

  {
    icon: Mic2,
    title: "Studio Booking",
    description:
      "Professional recording studios equipped with industry-standard gear.",
    features: [
      "State-of-the-art equipment",
      "Sound-proof rooms",
      "Professional engineers",
      "Flexible time slots",
    ],
    color: "from-fuchsia-500 to-pink-600",
    price: "From $50/hour",
    link: "/studio-booking",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
  },

  {
    icon: Users,
    title: "Singing Classes",
    description:
      "Learn from industry professionals with personalized coaching.",
    features: [
      "Expert instructors",
      "All skill levels",
      "Flexible batches",
      "Performance opportunities",
    ],
    color: "from-blue-500 to-cyan-600",
    price: "From $150/month",
    link: "/singing-class",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600",
  },

  {
    icon: Calendar,
    title: "Live Events & Shows",
    description:
      "Experience electrifying live performances and music festivals.",
    features: [
      "Live performances",
      "Karaoke nights",
      "Open mic sessions",
      "Music festivals",
    ],
    color: "from-orange-500 to-red-600",
    price: "Tickets from $25",
    link: "/events",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
  },

  {
    icon: Star,
    title: "Private Events",
    description:
      "Host special occasions with our customized private event packages.",
    features: [
      "Birthday parties",
      "Corporate events",
      "Wedding celebrations",
      "Private concerts",
    ],
    color: "from-emerald-500 to-teal-600",
    price: "Custom pricing",
    link: "/private-booking",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
  },

  {
    icon: Camera,
    title: "Photography & Videography",
    description:
      "Capture precious moments with professional media services.",
    features: [
      "Event photography",
      "Music videos",
      "Album artwork",
      "Behind-the-scenes",
    ],
    color: "from-pink-500 to-rose-600",
    price: "From $200/session",
    link: "/media-services",
    image:
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600",
  },

  {
    icon: Speaker,
    title: "Sound System Services",
    description:
      "Complete sound solutions for events of any scale.",
    features: [
      "PA systems",
      "DJ equipment",
      "Stage monitoring",
      "Live mixing",
    ],
    color: "from-amber-500 to-yellow-600",
    price: "From $300/event",
    link: "/sound-booking",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600",
  },

  /* ----------- NEW SINGER SERVICE ----------- */
  {
    icon: Mic2,
    title: "Singer Booking",
    description:
      "Book professional singers for live shows, weddings, parties, and studio sessions.",
    features: [
      "Professional solo & band singers",
      "Multiple music genres",
      "Live & studio performances",
      "Custom performance packages",
    ],
    color: "from-indigo-500 to-violet-600",
    price: "From $250/event",
    link: "/singer-booking",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600",
  },
];

/* ---------------- COMPONENT ---------------- */

export default function Services() {
  return (
    <div className="min-h-screen bg-[#FFF6E5]">

      {/* ---------- HERO ---------- */}
      <section className="py-24 text-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-[#0B2B4E]"
        >
          Our Services
        </motion.h1>
        <p className="mt-4 text-slate-600 max-w-3xl mx-auto">
          Everything you need for your musical journey — from recording to live performances.
        </p>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-16">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Image */}
            <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
              <img
                src={service.image}
                alt={service.title}
                className="rounded-3xl shadow-xl"
              />
            </div>

            {/* Content */}
            <div>
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}
              >
                <service.icon className="text-white w-7 h-7" />
              </div>

              <h2 className="text-3xl font-bold text-[#0B2B4E]">
                {service.title}
              </h2>

              <p className="text-slate-600 mt-3">
                {service.description}
              </p>

              <ul className="mt-4 space-y-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="text-green-500" size={18} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-6">
                <span className="text-xl font-bold text-violet-600">
                  {service.price}
                </span>
                <Link
                  to={service.link}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${service.color} text-white px-6 py-3 rounded-xl font-semibold`}
                >
                  Get Started <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
