import React from "react";

const reviews = [
  {
    id: 1,
    name: "Rohan Patil",
    title: "Photographer",
    comment:
      "IMC Studio A is perfect for reels and product shoots. Clean environment and great lighting setup!",
    rating: 5,
    avatar: null,
  },
  {
    id: 2,
    name: "Sneha Kulkarni",
    title: "Content Creator",
    comment:
      "Very professional and affordable. Booking was super easy. Highly recommended for creators.",
    rating: 5,
    avatar: null,
  },
  {
    id: 3,
    name: "Aman Deshmukh",
    title: "Brand Manager",
    comment:
      "Amazing space! Great management, AC rooms, and props available. Will book again.",
    rating: 4.5,
    avatar: null,
  },
];

function Stars({ value }) {
  const full = Math.floor(value);
  const half = value % 1 !== 0;

  return (
    <div className="stars-row">
      {Array.from({ length: full }).map((_, i) => (
        <svg
          key={i}
          className="star-icon"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118L10 15.347l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.645 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}

      {half && (
        <svg className="star-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118L10 15.347V2.927z" />
        </svg>
      )}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-badge-wrap">
          <span className="testimonials-badge">🌟 Client Testimonials</span>
        </div>

        <h2 className="testimonials-title">
          What Our <span className="highlight-red">Clients Say</span>
        </h2>

        <p className="testimonials-subtitle">
          Real feedback from creators, photographers and brands who booked with IMC.
        </p>

        <div className="testimonials-grid">
          {reviews.map((r) => (
            <article key={r.id} className="testimonial-card">
              <header className="testimonial-header">
                <div className="testimonial-avatar">
                  {r.avatar ? (
                    <img src={r.avatar} className="avatar-img" />
                  ) : (
                    r.name[0] + r.name.split(" ")[1][0]
                  )}
                </div>

                <div>
                  <h3 className="testimonial-name">{r.name}</h3>
                  <p className="testimonial-role">{r.title}</p>
                </div>
              </header>

              <div className="testimonial-body">
                <Stars value={r.rating} />
                <p className="testimonial-comment">“{r.comment}”</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .testimonials-section { padding:80px 0; background:transparent; }
        .testimonials-container { max-width:1200px; margin:auto; padding:0 16px; }

        .testimonials-badge-wrap { display:flex; justify-content:center; margin-bottom:16px; }
        .testimonials-badge { padding:6px 16px; background:rgba(254,226,226,0.4); border:1px solid rgba(252,165,165,0.4); backdrop-filter:blur(6px); border-radius:50px; color:#ef4444; font-size:14px; font-weight:600; }

        .testimonials-title { text-align:center; font-size:36px; font-weight:700; color:#111827; margin-bottom:12px; }
        .highlight-red { color:#ef4444; }

        .testimonials-subtitle { text-align:center; color:#4b5563; max-width:600px; margin:0 auto 40px; }

        .testimonials-grid { display:grid; gap:24px; }
        @media(min-width:768px){ .testimonials-grid{ grid-template-columns:repeat(3,1fr); }}

        .testimonial-card { background:rgba(255,255,255,0.3); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.4); padding:24px; border-radius:20px; transition:.3s; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
        .testimonial-card:hover { box-shadow:0 12px 40px rgba(0,0,0,0.15); }

        .testimonial-header { display:flex; align-items:center; gap:12px; }
        .testimonial-avatar { width:56px; height:56px; border-radius:50%; background:linear-gradient(to bottom right,#fca5a5,#ef4444); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:20px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
        .avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; }

        .testimonial-name { font-weight:600; font-size:16px; color:#111827; }
        .testimonial-role { color:#6b7280; font-size:14px; }

        .testimonial-body { margin-top:12px; }
        .stars-row { display:flex; align-items:center; gap:4px; }
        .star-icon { width:16px; height:16px; color:#facc15; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.2)); }

        .testimonial-comment { margin-top:12px; color:#1f2937; font-style:italic; }
      `}</style>
    </section>
  );
}