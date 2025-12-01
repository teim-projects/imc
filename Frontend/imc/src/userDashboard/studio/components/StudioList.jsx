// src/userDashboard/studio/components/StudioList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import StudioCard from "./StudioCard";

const BASE = import.meta.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const USER_STUDIOS_URL = `${BASE}/user/studios/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

export default function StudioList({ onBook }) {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchStudios = async () => {
    setLoading(true);
    setErr("");
    try {
      const resp = await api.get(USER_STUDIOS_URL);
      const rows = Array.isArray(resp.data) ? resp.data : resp.data?.results ?? [];
      setStudios(rows);
    } catch (e) {
      console.error(e);
      setErr("Failed to load studios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  if (loading) return <div className="studio-list-loader">Loading studios…</div>;
  if (err) return <div className="studio-list-error">{err}</div>;

  return (
    <section className="studio-list-section">
      <div className="studio-list-header">
        <h2>Choose from our curated IMC studios and book instantly.</h2>
        <p>Each studio is configured in Studio Master and appears here automatically.</p>
      </div>

      {studios.length === 0 && (
        <div className="studio-list-empty">No studios available yet.</div>
      )}

      <div className="studio-list-grid">
        {studios.map((s) => (
          <StudioCard
            key={s.id}
            studio={s}
            onBook={onBook} // pass callback down
          />
        ))}
      </div>
    </section>
  );
}
