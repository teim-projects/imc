import React, { useState } from "react";
import "./Forms.css";
export default function SoundForm({ onClose }) {
  const [data, setData] = useState({ equipment: "", setupDate: "", technician: "" });
  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert("Sound Setup Added!"); onClose(); };
  return (
    <div className="form-container">
      <h3>🔊 Sound System</h3>
      <form onSubmit={handleSubmit}>
        <input name="equipment" placeholder="Equipment Type" onChange={handleChange} required />
        <input type="date" name="setupDate" onChange={handleChange} required />
        <input name="technician" placeholder="Technician Name" onChange={handleChange} required />
        <div className="form-buttons"><button type="submit">Submit</button><button className="cancel-btn" onClick={onClose}>Cancel</button></div>
      </form>
    </div>
  );
}
