// src/components/Forms/ClassFormModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const TEACHER_API = `${BASE.replace(/\/$/, "")}/auth/teachers/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ClassFormModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSave,
  isEdit,
  saving = false,
}) {
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    if (isOpen) fetchTeachers();
  }, [isOpen]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const res = await api.get(TEACHER_API);
      setTeachers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Class" : "Add Class"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* FULL */}
          <label className="full">
            Class Name *
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="e.g. Beginner Vocal Training"
              required
            />
          </label>

          {/* GRID */}
          <div className="grid">
            <label>
              Trainer *
              <select
                name="trainer"
                value={form.trainer || ""}
                onChange={handleChange}
                disabled={loadingTeachers}
                required
              >
                <option value="">
                  {loadingTeachers ? "Loading trainers..." : "Select Trainer"}
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || `${t.first_name} ${t.last_name}`.trim()}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fee Per Month (₹) *
              <input
                type="number"
                name="fee"
                value={form.fee || ""}
                onChange={handleChange}
                placeholder="e.g. 2500"
                min="0"
                required
              />
            </label>
          </div>

          {/* FULL */}
          <label className="full">
            Description
            <textarea
              name="description"
              rows="3"
              value={form.description || ""}
              onChange={handleChange}
              placeholder="Class syllabus, goals, etc."
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={saving} className="save-btn">
              {saving ? "Saving..." : "Save Class"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal-box {
            background: #fff;
            width: 560px;
            max-width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 16px;
            padding: 1.4rem 1.6rem 1.6rem;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .modal-header h2 {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 0;
          }

          .close-btn {
            background: #ea580c;
            color: white;
            border: none;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          form label {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.9rem;
            margin-bottom: 0.9rem;
          }

          .full {
            margin-bottom: 0.9rem;
          }

          input,
          select,
          textarea {
            padding: 0.6rem 0.7rem;
            border-radius: 0.6rem;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 0.9rem;
          }

          textarea {
            resize: vertical;
          }

          .actions {
            display: flex;
            justify-content: center;
            gap: 0.8rem;
            margin-top: 1.2rem;
          }

          .save-btn {
            background: #ea580c;
            color: white;
            padding: 0.6rem 2.2rem;
            border-radius: 999px;
            border: none;
            font-weight: 600;
            cursor: pointer;
          }

          .save-btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
          }

          .cancel-btn {
            background: #e2e8f0;
            color: #475569;
            padding: 0.6rem 1.8rem;
            border-radius: 999px;
            border: none;
            font-weight: 600;
            cursor: pointer;
          }

          /* Mobile */
          @media (max-width: 600px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
