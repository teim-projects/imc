import React, { useState } from "react";
import "./Forms.css";
export default function PhotographyForm({ onClose }) {
  const [data, setData] = useState({ client: "", date: "", packageType: "" });
  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert("Photography Request Added!"); onClose(); };
  return (
    <div className="form-container">
      <h3>📸 Photography</h3>
      <form onSubmit={handleSubmit}>
        <input name="client" placeholder="Client Name" onChange={handleChange} required />
        <input type="date" name="date" onChange={handleChange} required />
        <input name="packageType" placeholder="Package Type" onChange={handleChange} required />
        <div className="form-buttons"><button type="submit">Submit</button><button className="cancel-btn" onClick={onClose}>Cancel</button></div>
      </form>
    </div>
  );
}
