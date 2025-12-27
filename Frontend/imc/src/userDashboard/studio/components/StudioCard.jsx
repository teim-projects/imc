import React from "react";
import { Star, MapPin, Zap, Users } from "lucide-react";

export default function StudioCard({ studio }) {
  return (
    <div className="bg-white rounded-[28px] shadow-xl flex flex-col lg:flex-row gap-10 p-6 lg:p-8">

      {/* LEFT IMAGE */}
      <div className="relative w-full lg:w-[380px] flex-shrink-0">
        <img
          src={studio.image}
          alt={studio.name}
          className="w-full h-[260px] object-cover rounded-2xl"
        />

        {/* RATING BADGE */}
        <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
          <Star size={14} fill="white" />
          {studio.rating}
        </div>
      </div>

      {/* CENTER INFO */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {studio.name}
          </h2>

          <p className="flex items-center gap-2 text-gray-600 mt-3">
            <MapPin size={16} className="text-red-500" />
            {studio.location}
          </p>

          {/* TAGS */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <span className="px-4 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold flex items-center gap-1">
              <Users size={14} /> {studio.capacity} people
            </span>

            {studio.instant && (
              <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold flex items-center gap-1">
                <Zap size={14} /> Instant Booking
              </span>
            )}
          </div>

          {/* EXTRA INFO */}
          <ul className="mt-6 text-gray-600 text-sm space-y-2">
            <li>🎧 Professional sound-treated rooms</li>
            <li>🎤 Premium microphones & mixers</li>
            <li>⚡ Power backup & AC studio</li>
            <li>🕒 Flexible hourly booking</li>
          </ul>
        </div>
      </div>

      {/* RIGHT PRICE + CTA */}
      <div className="flex flex-col justify-between items-end gap-6">
        <div className="text-right">
          <div className="text-3xl font-extrabold text-red-600">
            ₹{studio.price.toLocaleString()}
          </div>
          <div className="text-gray-500 text-sm">/ hour</div>
        </div>

        <button className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition">
          Book Now →
        </button>
      </div>
    </div>
  );
}
