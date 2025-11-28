import { useState } from "react";
import { MapPin, Calendar, Search, Sparkles } from "lucide-react";

export default function SearchCard() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [isFocused, setIsFocused] = useState({ location: false, date: false });

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for studios in ${location} on ${date}`);
  };

  return (
    <div className="search-card">
      <div className="search-card-overlay"></div>
      <div className="search-card-pattern"></div>
      <div className="search-card-orb-red"></div>
      <div className="search-card-orb-orange"></div>
      <div className="search-card-orb-yellow"></div>
      <div className="search-card-border"></div>

      <div className="search-card-header">
        <div className="search-card-badge">
          <Sparkles className="badge-sparkle" />
          <span>Find Your Perfect Studio</span>
        </div>
      </div>

      <div className="search-card-inputs">
        <div className="input-group">
          <label className="input-label">
            <MapPin className="label-icon" />
            Location
          </label>
          <div className={`input-wrapper ${isFocused.location ? 'focused' : ''}`}>
            <MapPin className="input-icon" />
            <input
              className="input-field"
              placeholder="Pune, Baner, Kothrud..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setIsFocused({ ...isFocused, location: true })}
              onBlur={() => setIsFocused({ ...isFocused, location: false })}
            />
            <div className="input-glow"></div>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">
            <Calendar className="label-icon" />
            Date
          </label>
          <div className={`input-wrapper ${isFocused.date ? 'focused' : ''}`}>
            <Calendar className="input-icon" />
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onFocus={() => setIsFocused({ ...isFocused, date: true })}
              onBlur={() => setIsFocused({ ...isFocused, date: false })}
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="input-glow"></div>
          </div>
        </div>

        <div className="search-btn-group">
          <button type="button" onClick={handleSearch} className="search-btn">
            <span className="search-btn-content">
              <Search className="search-icon" />
              Search Studios
            </span>
            <div className="search-btn-shine"></div>
            <div className="search-btn-particles">
              <span className="particle"></span>
              <span className="particle"></span>
              <span className="particle"></span>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        .search-card {
          position: relative;
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1px solid rgba(239, 68, 68, 0.1);
          padding: 32px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          animation: cardSlideUp 0.6s ease-out;
        }

        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.16),
            0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .search-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(254, 226, 226, 0.4) 0%,
            transparent 40%,
            transparent 60%,
            rgba(255, 237, 213, 0.4) 100%
          );
          pointer-events: none;
          opacity: 0.6;
        }

        .search-card-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(248, 113, 113, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(251, 146, 60, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .search-card-orb-red {
          position: absolute;
          top: -120px;
          right: -120px;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(248, 113, 113, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: float-orb-1 15s ease-in-out infinite;
        }

        .search-card-orb-orange {
          position: absolute;
          bottom: -120px;
          left: -120px;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: float-orb-2 18s ease-in-out infinite;
        }

        .search-card-orb-yellow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(50px);
          animation: float-orb-3 12s ease-in-out infinite;
        }

        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }

        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        @keyframes float-orb-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        .search-card-border {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(239, 68, 68, 0.3) 0%,
            rgba(251, 146, 60, 0.3) 50%,
            rgba(250, 204, 21, 0.3) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .search-card:hover .search-card-border {
          opacity: 1;
        }

        .search-card-header {
          position: relative;
          z-index: 2;
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .search-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
          animation: badgePulse 3s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .badge-sparkle {
          width: 16px;
          height: 16px;
          color: #facc15;
          animation: sparkle-spin 4s linear infinite;
        }

        @keyframes sparkle-spin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
        }

        .search-card-inputs {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 24px;
          grid-template-columns: 1fr;
        }

        @media(min-width: 640px) {
          .search-card-inputs {
            grid-template-columns: 1fr 1fr auto;
            align-items: end;
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #374151;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .label-icon {
          width: 14px;
          height: 14px;
          color: #f87171;
        }

        .input-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }

        .input-wrapper.focused {
          transform: translateY(-2px);
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #f87171;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .input-wrapper.focused .input-icon {
          color: #ef4444;
          transform: translateY(-50%) scale(1.15) rotate(5deg);
        }

        .input-field {
          width: 100%;
          background: linear-gradient(135deg, #fefefe 0%, #f9fafb 100%);
          border: 2px solid #e5e7eb;
          padding: 14px 14px 14px 46px;
          border-radius: 16px;
          font-size: 15px;
          color: #111827;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .input-field:focus {
          outline: none;
          border-color: #ef4444;
          background: white;
          box-shadow: 
            0 0 0 4px rgba(254, 202, 202, 0.2),
            0 8px 16px rgba(239, 68, 68, 0.1);
          transform: translateY(-1px);
        }

        .input-glow {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(135deg, #ef4444, #f97316, #facc15);
          opacity: 0;
          filter: blur(8px);
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .input-wrapper.focused .input-glow {
          opacity: 0.3;
        }

        .search-btn-group {
          display: flex;
        }

        .search-btn {
          position: relative;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #f97316 100%);
          color: white;
          font-weight: 700;
          font-size: 16px;
          border-radius: 16px;
          padding: 15px 28px;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 10px 30px rgba(239, 68, 68, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          overflow: hidden;
          cursor: pointer;
          border: none;
        }

        @media(min-width: 640px) {
          .search-btn {
            width: auto;
            min-width: 200px;
          }
        }

        .search-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #ea580c 100%);
          box-shadow: 
            0 15px 40px rgba(239, 68, 68, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          transform: translateY(-2px) scale(1.02);
        }

        .search-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .search-btn-content {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .search-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .search-btn:hover .search-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .search-btn-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .search-btn:hover .search-btn-shine {
          transform: translateX(100%);
        }

        .search-btn-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          opacity: 0;
        }

        .search-btn:hover .particle {
          animation: particleFloat 1.5s ease-out forwards;
        }

        .particle:nth-child(1) {
          left: 20%;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          left: 50%;
          animation-delay: 0.2s;
        }

        .particle:nth-child(3) {
          left: 80%;
          animation-delay: 0.4s;
        }

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }

        @media(min-width: 640px) {
          .search-card {
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}