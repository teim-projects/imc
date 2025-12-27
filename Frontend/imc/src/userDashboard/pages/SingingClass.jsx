// src/components/SingingClassManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, BookOpen, UserCheck, Calendar, Users, X } from "lucide-react";

const BASE = import.meta.env.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API = `${BASE.replace(/\/$/, "")}/auth/singing-classes/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES = ["07:00 - 08:00","08:00 - 09:00","16:00 - 17:00","17:00 - 18:00","18:00 - 19:00"];

export default function SingingClassManagement() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await api.get(API);
    setStudents(res.data);
  };

  const openAdd = () => {
    setForm({});
    setIsEdit(false);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setForm(row);
    setIsEdit(true);
    setModalOpen(true);
  };

  const saveStudent = async (e) => {
    e.preventDefault();

    if (isEdit) {
      await api.patch(`${API}${form.id}/`, form);
    } else {
      await api.post(API, form);
    }

    setModalOpen(false);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete student?")) return;
    await api.delete(`${API}${id}/`);
    fetchStudents();
  };

  const filtered = useMemo(() => {
    if (!search) return students;
    return students.filter(s =>
      `${s.first_name} ${s.last_name} ${s.phone}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, students]);

  return (
    <div className="singing-page">

      {/* Tabs */}
      <div className="tabs">
        <button className="tab">Class</button>
        <button className="tab">Teachers</button>
        <button className="tab">Batch</button>
        <button className="tab active">Students</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Students Management</h2>
          <button className="add-btn" type="button" onClick={openAdd}>
            <Plus /> Add Student
          </button>
        </div>

        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Batch</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.first_name} {s.last_name}</td>
                <td>{s.phone}</td>
                <td>{s.day} {s.time_slot}</td>
                <td>₹{s.fee}</td>
                <td>
                  <button onClick={() => openEdit(s)}>Edit</button>
                  <button onClick={() => deleteStudent(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Edit Student" : "Add Student"}</h2>

            <form onSubmit={saveStudent}>
              <input placeholder="First Name" value={form.first_name || ""} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <input placeholder="Last Name" value={form.last_name || ""} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              <input placeholder="Phone" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />

              <select value={form.day || ""} onChange={e => setForm({ ...form, day: e.target.value })}>
                <option value="">Select Day</option>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>

              <select value={form.time_slot || ""} onChange={e => setForm({ ...form, time_slot: e.target.value })}>
                <option value="">Select Time</option>
                {TIMES.map(t => <option key={t}>{t}</option>)}
              </select>

              <input type="number" placeholder="Fee" value={form.fee || ""} onChange={e => setForm({ ...form, fee: e.target.value })} />

              <div className="actions">
                <button type="submit">{isEdit ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
