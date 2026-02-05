import React from "react";
import { X } from "lucide-react";

export default function TeacherFormModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSave,
  saving,
  isEdit,
}) {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Teacher" : "Add Teacher"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="modal-form">
          {/* Full width */}
          <label className="full">
            Teacher Name *
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              required
            />
          </label>

          {/* Two column grid */}
          <div className="grid">
            <label>
              Expertise
              <input
                name="expertise"
                value={form.expertise || ""}
                onChange={handleChange}
                placeholder="Classical / Bollywood / Guitar"
              />
            </label>

            <label>
              Experience (years)
              <input
                type="number"
                name="experience"
                value={form.experience || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Phone
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
              />
            </label>
          </div>

          {/* Full width */}
          <label className="full">
            Bio
            <textarea
              name="bio"
              rows="3"
              value={form.bio || ""}
              onChange={handleChange}
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Teacher"}
            </button>
            <button type="button" className="secondary" onClick={onClose}>
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
            width: 520px;
            max-width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 14px;
            padding: 1.2rem 1.4rem;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .modal-header h2 {
            font-size: 1.1rem;
            font-weight: 600;
          }

          .close-btn {
            background: transparent;
            padding: 0.2rem;
          }

          .modal-form label {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            font-size: 0.9rem;
            font-weight: 500;
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
          textarea {
            padding: 0.55rem 0.65rem;
            border-radius: 0.45rem;
            border: 1px solid #d1d5db;
            font-size: 0.9rem;
          }

          textarea {
            resize: vertical;
          }

          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.6rem;
            margin-top: 0.8rem;
          }

          button {
            padding: 0.45rem 1.2rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
          }

          button:not(.secondary) {
            background: #ea580c;
            color: white;
          }

          .secondary {
            background: #e5e7eb;
          }

          /* Mobile */
          @media (max-width: 600px) {
            .modal-box {
              width: 100%;
              padding: 1rem;
            }

            .grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
