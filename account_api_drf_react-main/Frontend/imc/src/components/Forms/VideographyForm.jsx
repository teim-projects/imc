import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Forms.css";

const API_URL = "http://127.0.0.1:8000/api/videography/";

export default function VideographyForm({ onClose, onDataChange }) {
  const [formData, setFormData] = useState({
    project: "",
    duration: "",
    editor: "",
  });

  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  // 🔹 Fetch Videography Records
  const fetchRecords = async () => {
    try {
      const res = await axios.get(API_URL);
      setRecords(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Handle Form Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}${editId}/`, formData);
        alert("✅ Videography project updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        alert("✅ Videography project added successfully!");
      }
      setFormData({ project: "", duration: "", editor: "" });
      setEditId(null);
      fetchRecords();
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("❌ Failed to save data. Check console for details.");
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (record) => {
    setFormData(record);
    setEditId(record.id);
  };

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`${API_URL}${id}/`);
        fetchRecords();
        if (onDataChange) onDataChange();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  return (
    <div className="form-container">
      <h3>🎥 Videography Management</h3>

      {/* 📋 Add / Edit Form */}
      <form onSubmit={handleSubmit}>
        <input
          name="project"
          placeholder="Project Title"
          value={formData.project}
          onChange={handleChange}
          required
        />
        <input
          name="duration"
          placeholder="Duration (mins)"
          value={formData.duration}
          onChange={handleChange}
          required
        />
        <input
          name="editor"
          placeholder="Editor Name"
          value={formData.editor}
          onChange={handleChange}
          required
        />

        <div className="form-buttons">
          <button type="submit">{editId ? "Update" : "Submit"}</button>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>

      {/* 📊 Data Table */}
      <table>
        <thead>
          <tr>
            <th>Project Title</th>
            <th>Duration (mins)</th>
            <th>Editor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id}>
              <td>{item.project}</td>
              <td>{item.duration}</td>
              <td>{item.editor}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
