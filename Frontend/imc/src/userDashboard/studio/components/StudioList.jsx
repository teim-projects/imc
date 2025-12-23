// src/userDashboard/studio/components/StudioList.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
// ✅ use the existing StudioMaster endpoint (same as StudioForm)
const STUDIOS_URL = `${BASE}/auth/studio-master/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

export default function StudioList({ searchTerm = "", onBook }) {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchStudios = async () => {
      setLoading(true);
      setErr("");
      try {
        // if you add filtering in DRF later you can pass params here
        const resp = await api.get(STUDIOS_URL);
        // handle both: plain list OR {results: [...]}
        const rows = Array.isArray(resp.data)
          ? resp.data
          : resp.data?.results ?? resp.data ?? [];

        // show only active studios
        const active = (rows || []).filter((s) => s.is_active !== false);
        setStudios(active);
      } catch (e) {
        console.error("StudioList fetch error:", e?.response?.data || e.message);
        setErr("Failed to load studios.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();
  }, []);

  // 🔍 filter by search text (name or location)
  const filtered = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return studios;

    return studios.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const loc =
        (
          s.full_location ||
          s.location ||
          [s.area, s.city, s.state].filter(Boolean).join(", ")
        ).toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [studios, searchTerm]);

  if (loading) {
    return <div className="studio-list-loader">Loading studios…</div>;
  }

  if (err) {
    return <div className="studio-list-error">{err}</div>;
  }

  if (!filtered.length) {
    return (
      <section className="studio-list-section">
        <div className="studio-list-header">
          <h2>Find Your Perfect Studio</h2>
          <p>No studios match your search. Try another name or location.</p>
        </div>
        <div className="studio-list-empty">No studios found.</div>
      </section>
    );
  }

  return (
    <section className="studio-list-section">
      <div className="studio-list-header">
        <h2>Find Your Perfect Studio</h2>
        <p>Choose from our curated IMC studios and book instantly.</p>
      </div>

      <div className="studio-list-grid">
        {filtered.map((studio) => {
          const locationText =
            studio.full_location ||
            studio.location ||
            [studio.area, studio.city, studio.state].filter(Boolean).join(", ") ||
            "Location not available";

          const capacityText =
            studio.capacity && studio.capacity > 0
              ? `${studio.capacity} people`
              : "Capacity N/A";

          const price =
            studio.hourly_rate !== null &&
            studio.hourly_rate !== undefined &&
            studio.hourly_rate !== ""
              ? Number(studio.hourly_rate).toFixed(2)
              : "0.00";

          const imgUrl =
            (studio.images &&
              studio.images.length > 0 &&
              studio.images[0].url) ||
            studio.hero_image ||
            studio.cover_image ||
            "";

          return (
            <article key={studio.id} className="studio-card">
              {/* IMAGE PANEL */}
              <div className="studio-card-img-wrap">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={studio.name}
                    className="studio-card-img"
                  />
                ) : (
                  <div
                    className="studio-card-img"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#9ca3af",
                    }}
                  >
                    No image
                  </div>
                )}

                <div className="studio-card-rating">⭐ 4.8</div>
              </div>

              {/* CONTENT PANEL */}
              <div className="studio-card-body">
                <div className="studio-card-main">
                  <h3 className="studio-card-title">{studio.name}</h3>
                  <p className="studio-card-location">📍 {locationText}</p>

                  <div className="studio-card-tags">
                    <span className="tag capacity">{capacityText}</span>
                    <span className="tag instant">⚡ Instant Booking</span>
                  </div>
                </div>

                <div className="studio-card-footer">
                  <div className="studio-card-price">
                    <span className="price">₹{price}</span>
                    <span className="per">/ hour</span>
                  </div>

                  <button
                    type="button"
                    className="studio-card-btn"
                    onClick={() => onBook && onBook(studio)}
                  >
                    Book Now →
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
