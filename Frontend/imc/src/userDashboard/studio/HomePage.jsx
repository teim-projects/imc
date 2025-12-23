// src/userDashboard/studio/HomePage.jsx
import React, { useState } from "react";


import StudioList from "./components/StudioList";


import UserStudioRentalForm from "../Forms/UserStudioRentalForm";

export default function HomePage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);

  // 🔍 search text coming from SearchCard
  const [searchTerm, setSearchTerm] = useState("");

  const openBooking = (studio) => {
    setSelectedStudio(studio || null);
    setShowBookingModal(true);
  };

  const closeBooking = () => {
    setShowBookingModal(false);
    setSelectedStudio(null);
  };

  // called when user types / submits search in hero
  // const handleSearch = (value) => {
  //   setSearchTerm(value.trim());
  // };

  return (
    <div className="homepage-root">
      {/* Ambient decorative layer */}
      <div className="homepage-ambient">
        <div className="blob-red"></div>
        <div className="blob-blue"></div>
        <div className="blob-yellow"></div>
        <div className="blob-pink"></div>

        <div className="music m1">🎵</div>
        <div className="music m2">🎶</div>
        <div className="music m3">🎸</div>
        <div className="music m4">🎤</div>
        <div className="music m5">🎧</div>
        <div className="music m6">🎹</div>
        <div className="music m7">🎼</div>
        <div className="music m8">🎺</div>
        <div className="music m9">🥁</div>
        <div className="music m10">🎻</div>
        <div className="music m11">🎙️</div>
        <div className="music m12">🎷</div>
      </div>

      <div className="homepage-content">
        

        <main className="homepage-main">
          {/* Studio list filtered by searchTerm */}
          <StudioList searchTerm={searchTerm} onBook={openBooking} />
        </main>

        
      </div>

      {/* ====== USER STUDIO RENTAL MODAL ====== */}
      {showBookingModal && (
        <div className="booking-modal-backdrop" onClick={closeBooking}>
          <div
            className="booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal-header">
              <h2>Studio Rental</h2>
              {selectedStudio && (
                <span className="booking-modal-sub">
                  For: <strong>{selectedStudio.name}</strong>
                </span>
              )}
              <button
                type="button"
                className="booking-modal-close"
                onClick={closeBooking}
              >
                ×
              </button>
            </div>

            <UserStudioRentalForm
              initialStudio={selectedStudio}
              onClose={closeBooking}
            />
          </div>
        </div>
      )}

      {/* (same CSS as before – unchanged) */}
      <style>{`
        .homepage-root { 
          position:relative; 
          min-height:100vh; 
          display:flex; 
          flex-direction:column; 
          background:linear-gradient(to bottom right,#ffedd5,#fce7f3,#ede9fe); 
          overflow:hidden; 
        }

        .homepage-ambient { 
          position:fixed; 
          inset:0; 
          pointer-events:none; 
          z-index:0; 
          overflow:hidden; 
        }

        .blob-red { 
          position:absolute; 
          top:80px; 
          left:40px; 
          width:380px; 
          height:380px; 
          background:linear-gradient(to bottom right,rgba(252,165,165,0.2),rgba(244,114,182,0.2)); 
          border-radius:50%; 
          filter:blur(60px); 
          animation:pulse 6s infinite; 
        }
        .blob-blue { 
          position:absolute; 
          top:33%; 
          right:80px; 
          width:500px; 
          height:500px; 
          background:linear-gradient(to bottom left,rgba(147,197,253,0.2),rgba(196,181,253,0.2)); 
          border-radius:50%; 
          filter:blur(70px); 
          animation:pulse 6s infinite 1s; 
        }
        .blob-yellow { 
          position:absolute; 
          bottom:160px; 
          left:25%; 
          width:320px; 
          height:320px; 
          background:linear-gradient(to top right,rgba(254,240,138,0.15),rgba(253,186,116,0.15)); 
          border-radius:50%; 
          filter:blur(60px); 
          animation:pulse 6s infinite 2s; 
        }
        .blob-pink { 
          position:absolute; 
          top:65%; 
          right:33%; 
          width:300px; 
          height:300px; 
          background:linear-gradient(to top left,rgba(244,114,182,0.15),rgba(252,165,165,0.15)); 
          border-radius:50%; 
          filter:blur(60px); 
          animation:pulse 6s infinite 1.5s; 
        }

        @keyframes pulse { 
          0%,100%{transform:scale(1);opacity:0.4;} 
          50%{transform:scale(1.15);opacity:0.6;} 
        }

        .music { 
          position:absolute; 
          filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3)); 
          animation:float 6s ease-in-out infinite; 
        }

        @keyframes float { 
          0%,100%{transform:translateY(0);} 
          50%{transform:translateY(-25px);} 
        }

        .m1{ top:120px; left:8%; font-size:72px; opacity:.25; }
        .m2{ top:20%; right:12%; font-size:64px; opacity:.30; animation-delay:.5s; }
        .m3{ top:45%; left:15%; font-size:80px; opacity:.20; animation-delay:1.5s; }
        .m4{ top:35%; right:18%; font-size:72px; opacity:.25; animation-delay:2s; }
        .m5{ bottom:25%; right:25%; font-size:64px; opacity:.30; }
        .m6{ top:60%; left:12%; font-size:72px; opacity:.25; animation-delay:1s; }
        .m7{ bottom:35%; left:35%; font-size:64px; opacity:.30; animation-delay:2.5s; }
        .m8{ top:75%; right:8%; font-size:72px; opacity:.25; animation-delay:3s; }
        .m9{ bottom:15%; left:20%; font-size:64px; opacity:.30; animation-delay:.5s; }
        .m10{ top:15%; left:40%; font-size:56px; opacity:.25; animation-delay:2.8s; }
        .m11{ bottom:45%; right:5%; font-size:64px; opacity:.30; animation-delay:1.8s; }
        .m12{ top:85%; left:45%; font-size:56px; opacity:.25; animation-delay:3.5s; }

        .homepage-content { position:relative; z-index:10; }

        .homepage-main { 
          max-width:1200px; 
          margin:auto; 
          padding:0 16px 40px; 
          margin-top:40px; 
          width:100%; 
        }

        /* --- studio list base styles (same as before) --- */
        .studio-list-section { background: transparent; }
        .studio-list-header { text-align: center; margin-bottom: 24px; }
        .studio-list-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
          color: #111827;
        }
        .studio-list-header p { font-size: 0.95rem; color: #6b7280; }
        .studio-list-grid { display: flex; flex-direction: column; gap: 20px; }

        .studio-card {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          background: #ffffff;
          border-radius: 26px;
          box-shadow: 0 18px 40px rgba(15,23,42,0.12);
          padding: 18px 22px;
          align-items: center;
        }
        .studio-card-img-wrap {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          background: #f3f4f6;
        }
        .studio-card-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        .studio-card-rating {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f97316;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 999px;
          padding: 4px 10px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .studio-card-body {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 16px;
        }
        .studio-card-main {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .studio-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        .studio-card-location {
          font-size: 0.95rem;
          color: #6b7280;
        }
        .studio-card-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 999px;
          padding: 4px 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .tag.capacity { background: #fee2e2; color: #b91c1c; }
        .tag.instant { background: #dbeafe; color: #1d4ed8; }

        .studio-card-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
        }
        .studio-card-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .studio-card-price .price {
          font-size: 1.4rem;
          font-weight: 800;
          color: #dc2626;
        }
        .studio-card-price .per {
          font-size: 0.85rem;
          color: #6b7280;
        }
        .studio-card-btn {
          padding: 10px 20px;
          border-radius: 999px;
          border: none;
          outline: none;
          background: #ef4444;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(248,113,113,0.45);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .studio-card-btn:hover { transform: translateY(-1px); }

        .studio-list-loader,
        .studio-list-error,
        .studio-list-empty {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
        }
        .studio-list-error { color: #b91c1c; font-weight: 500; }

        @media (max-width: 900px) {
          .studio-card { grid-template-columns: 1fr; }
          .studio-card-img { height: 200px; }
          .studio-card-body { flex-direction: column; }
          .studio-card-footer {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* -------- modal styles -------- */
        .booking-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .booking-modal {
          width: min(1000px, 96vw);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 24px;
          background: #f9fafb;
          box-shadow: 0 24px 80px rgba(15,23,42,0.4);
          padding: 18px 20px 22px;
        }
        .booking-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .booking-modal-header h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
        }
        .booking-modal-sub {
          font-size: 0.85rem;
          color: #6b7280;
          margin-left: 8px;
        }
        .booking-modal-close {
          border: none;
          background: #111827;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
