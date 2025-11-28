// src/userDashboard/studio/components/StudioCard.jsx
import React from "react";

export default function StudioCard({ studio, onBook }) {
  const {
    name,
    area,
    city,
    state,
    location,
    capacity,
    hourly_rate,
    first_image,
    full_location,
  } = studio;

  const imgUrl =
    first_image && first_image.trim() !== ""
      ? first_image
      : "https://via.placeholder.com/400x250?text=Studio";

  const displayedLocation =
    full_location ||
    (area || city || state
      ? `${area ? area + ", " : ""}${city ? city + ", " : ""}${state || ""}`
      : location || "Location not set");

  const handleBookClick = () => {
    if (typeof onBook === "function") {
      onBook(studio);
    }
  };

  return (
    <article className="studio-card">
      <div className="studio-card-img-wrap">
        <img src={imgUrl} alt={name} className="studio-card-img" />
        <div className="studio-card-rating">⭐ 4.8</div>
      </div>

      <div className="studio-card-body">
        <div className="studio-card-main">
          <h3 className="studio-card-title">{name}</h3>
          <div className="studio-card-location">📍 {displayedLocation}</div>
          <div className="studio-card-tags">
            <span className="tag capacity">
              {capacity ? `${capacity} people` : "Capacity N/A"}
            </span>
            <span className="tag instant">⚡ Instant Booking</span>
          </div>
        </div>

        <div className="studio-card-footer">
          <div className="studio-card-price">
            <span className="price">₹{hourly_rate || "0"}</span>
            <span className="per">/ hour</span>
          </div>
          <button className="studio-card-btn" type="button" onClick={handleBookClick}>
            Book Now →
          </button>
        </div>
      </div>
    </article>
  );
}
