import React, { useState } from "react";
import "./Forms.css";
export default function SingerForm({ onClose }) {
  const [data, setData] = useState({ name: "", genre: "", experience: "" });
  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert("Singer Added!"); onClose(); };
  return (
    <div className="form-container">
      <h3>🎤 Singer</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Singer Name" onChange={handleChange} required />
        <input name="genre" placeholder="Genre" onChange={handleChange} required />
        <input name="experience" placeholder="Experience (Years)" onChange={handleChange} required />
        <div className="form-buttons"><button type="submit">Submit</button><button className="cancel-btn" onClick={onClose}>Cancel</button></div>
      </form>
    </div>
  );
}
