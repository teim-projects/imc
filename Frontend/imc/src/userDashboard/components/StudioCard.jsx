import { MapPin, Star, Users, ArrowRight, Zap } from 'lucide-react';

export default function StudioCard({ studio }) {
  return (
    <div className="studio-card">
      <div className="studio-bg-red"></div>
      <div className="studio-bg-blue"></div>
      <div className="studio-grid-pattern"></div>
      <div className="studio-corner-red"></div>
      <div className="studio-corner-blue"></div>
      <div className="studio-hover-glow"></div>

      <div className="studio-inner">
        <div className="studio-image">
          <img
            src={studio.image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=400&fit=crop"}
            alt={studio.name}
          />

          <div className="studio-rating">
            <Star className="studio-rating-icon" />
            <span>{studio.rating || '4.9'}</span>
          </div>

          <div className="studio-image-overlay"></div>
        </div>

        <div className="studio-content">
          <div>
            <h3 className="studio-title">{studio.name}</h3>

            <div className="studio-location">
              <MapPin className="studio-location-icon" />
              <span>{studio.location}</span>
            </div>

            <div className="studio-features">
              <div className="studio-feature-red">
                <Users className="studio-feature-icon" />
                <span>{studio.capacity || '10-15'} people</span>
              </div>

              <div className="studio-feature-blue">
                <Zap className="studio-feature-icon" />
                <span>Instant Booking</span>
              </div>
            </div>
          </div>

          <div className="studio-price-row">
            <div className="studio-price-wrap">
              <span className="studio-price">₹{studio.price}</span>
              <span className="studio-price-unit">/ hour</span>
            </div>

            <button className="studio-btn">
              <span className="studio-btn-text">Book Now</span>
              <ArrowRight className="studio-btn-icon" />
              <div className="studio-btn-shine"></div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .studio-card { position:relative; background:linear-gradient(to bottom right,#fff,#f9fafb,#fff); border-radius:24px; border:1px solid #e5e7eb; overflow:hidden; transition:.4s; box-shadow:0 10px 25px rgba(0,0,0,0.1); margin-bottom:24px; }
        .studio-card:hover { transform:translateY(-4px); border-color:#fca5a5; box-shadow:0 20px 40px rgba(0,0,0,0.15); }

        .studio-bg-red { position:absolute; top:0; right:0; width:256px; height:256px; background:linear-gradient(to bottom right,#ef4444,#ec4899); opacity:.08; border-radius:50%; filter:blur(48px); }
        .studio-bg-blue { position:absolute; bottom:0; left:0; width:192px; height:192px; background:linear-gradient(to top right,#3b82f6,#06b6d4); opacity:.08; border-radius:50%; filter:blur(48px); }

        .studio-grid-pattern { position:absolute; inset:0; opacity:.05; background-image:repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 20px), repeating-linear-gradient(90deg,#000 0px,#000 1px,transparent 1px,transparent 20px); }

        .studio-corner-red { position:absolute; top:0; right:0; width:80px; height:80px; background:linear-gradient(to bottom left,rgba(255,0,0,.2),transparent); border-bottom-left-radius:50%; opacity:.5; }
        .studio-corner-blue { position:absolute; bottom:0; left:0; width:80px; height:80px; background:linear-gradient(to top right,rgba(0,150,255,.2),transparent); border-top-right-radius:50%; opacity:.5; }

        .studio-hover-glow { position:absolute; inset:0; background:linear-gradient(to right,transparent,rgba(255,0,80,.05),transparent); opacity:0; transition:.4s; }
        .studio-card:hover .studio-hover-glow { opacity:1; }

        .studio-inner { position:relative; display:flex; gap:20px; padding:20px; flex-direction:column; }
        @media(min-width:640px){ .studio-inner{ flex-direction:row; }}

        .studio-image { position:relative; width:100%; height:200px; border-radius:16px; overflow:hidden; background:#1e1b4b; flex-shrink:0; box-shadow:0 4px 20px rgba(0,0,0,0.2); }
        @media(min-width:640px){ .studio-image{ width:180px; height:150px; }}
        @media(min-width:768px){ .studio-image{ width:210px; height:160px; }}
        .studio-image img { width:100%; height:100%; object-fit:cover; transition:.6s; }
        .studio-card:hover .studio-image img { transform:scale(1.05); }

        .studio-rating { position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.95); padding:6px 10px; border-radius:12px; display:flex; align-items:center; gap:4px; font-weight:700; font-size:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .studio-rating-icon { width:16px; height:16px; color:#facc15; fill:#facc15; }

        .studio-image-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.3),transparent); opacity:0; transition:.4s; }
        .studio-card:hover .studio-image-overlay { opacity:1; }

        .studio-content { display:flex; flex-direction:column; justify-content:space-between; flex:1; min-width:0; }

        .studio-title { font-size:20px; font-weight:700; color:#111827; margin-bottom:8px; transition:.3s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .studio-card:hover .studio-title { color:#dc2626; }

        .studio-location { display:flex; align-items:center; gap:6px; color:#4b5563; font-size:14px; margin-bottom:12px; }
        .studio-location-icon { width:16px; height:16px; color:#ef4444; }

        .studio-features { display:flex; flex-wrap:wrap; gap:10px; }
        .studio-feature-red, .studio-feature-blue { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:12px; font-size:12px; font-weight:600; border:1px solid; }
        .studio-feature-red { background:linear-gradient(to right,#fee2e2,#fce7f3); color:#b91c1c; border-color:#fecaca; }
        .studio-feature-blue { background:linear-gradient(to right,#dbeafe,#cffafe); color:#1e40af; border-color:#bfdbfe; }
        .studio-feature-icon { width:16px; height:16px; }

        .studio-price-row { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb; }
        .studio-price-wrap { display:flex; align-items:baseline; gap:4px; }

        .studio-price { font-size:28px; font-weight:700; color:#dc2626; }
        .studio-price-unit { font-size:14px; color:#6b7280; font-weight:500; }

        .studio-btn { position:relative; background:linear-gradient(to right,#dc2626,#b91c1c); color:white; padding:12px 20px; border-radius:12px; font-size:14px; font-weight:700; display:flex; align-items:center; gap:10px; overflow:hidden; cursor:pointer; transition:.3s; box-shadow:0 10px 25px rgba(220,38,38,.3); }
        .studio-btn:hover { background:linear-gradient(to right,#b91c1c,#7f1d1d); box-shadow:0 15px 35px rgba(220,38,38,.4); }
        .studio-btn:active { transform:scale(.95); }

        .studio-btn-text { position:relative; z-index:2; }
        .studio-btn-icon { width:20px; height:20px; transition:.3s; position:relative; z-index:2; }
        .studio-btn:hover .studio-btn-icon { transform:translateX(4px); }

        .studio-btn-shine { position:absolute; inset:0; background:linear-gradient(to right,transparent,rgba(255,255,255,0.25),transparent); transform:translateX(-100%); transition:1s; }
        .studio-btn:hover .studio-btn-shine { transform:translateX(100%); }
      `}</style>
    </div>
  );
}
