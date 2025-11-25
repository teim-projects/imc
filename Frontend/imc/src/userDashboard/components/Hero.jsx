import { Sparkles, Camera, Video, Package, ArrowRight } from "lucide-react";

export default function Hero({ children }) {
  return (
    <div className="hero-section">
      <div className="hero-bg-image">
        <img src="/banner.jpg" alt="IMC Studio Banner" />
      </div>

      <div className="hero-overlay"></div>
      <div className="hero-gradient-orbs"></div>

      <div className="hero-content">
        <div className="hero-badge animate-fade-in">
          <Sparkles className="hero-badge-icon animate-pulse-glow" />
          <span>Premium Studio Booking Platform</span>
        </div>

        <h1 className="hero-title animate-slide-up">
          Book Premium Studio <br />
          <span className="hero-title-gradient">Space Instantly</span>
        </h1>

        <p className="hero-subtitle animate-slide-up-delay">
          Professional-grade studios with cutting-edge equipment for your creative vision.
          <br />
          <span className="hero-subtitle-highlight">Available 24/7 • Instant Booking • Professional Equipment</span>
        </p>

        <div className="hero-features animate-slide-up-delay-2">
          {[
            { icon: Camera, label: "Photoshoots", color: "#f87171" }, 
            { icon: Video, label: "Reels & Videos", color: "#fb923c" }, 
            { icon: Package, label: "Product Shoots", color: "#facc15" }
          ].map((item, i) => (
            <div key={i} className="hero-pill" style={{ animationDelay: `${i * 100}ms` }}>
              <item.icon className="hero-pill-icon" style={{ color: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="hero-children animate-slide-up-delay-3">{children}</div>

        <div className="hero-stats animate-fade-in-delay">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Bookings</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>

      <style>{`
        .hero-section { 
          position: relative; 
          width: 100%; 
          overflow: hidden; 
          padding-top: 96px; 
          padding-bottom: 48px; 
          min-height: 100vh; 
          display: flex;
          align-items: center;
        }
        @media(min-width: 768px) { 
          .hero-section { padding-top: 128px; }
        }

        .hero-bg-image { 
          position: absolute; 
          inset: 0; 
          height: 100%; 
          z-index: 0; 
        }
        .hero-bg-image img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: center;
          animation: subtle-zoom 20s ease-in-out infinite alternate;
        }

        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        .hero-overlay { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,0,10,0.7) 50%, rgba(0,0,0,0.85) 100%);
          z-index: 10; 
        }

        .hero-gradient-orbs {
          position: absolute;
          inset: 0;
          z-index: 11;
          pointer-events: none;
        }

        .hero-gradient-orbs::before {
          content: '';
          position: absolute;
          top: 20%;
          right: 10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(248,113,113,0.15) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: float-orb-1 15s ease-in-out infinite;
        }

        .hero-gradient-orbs::after {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 15%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(50px);
          animation: float-orb-2 18s ease-in-out infinite;
        }

        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }

        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -40px) scale(1.15); }
        }

        .hero-content { 
          position: relative; 
          z-index: 20; 
          max-width: 1200px; 
          margin: auto; 
          padding: 0 16px; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          height: 100%; 
        }

        .hero-badge { 
          display: inline-flex; 
          align-items: center; 
          gap: 8px; 
          background: rgba(255,255,255,0.08); 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(255,255,255,0.15); 
          border-radius: 9999px; 
          padding: 8px 20px; 
          margin-bottom: 24px; 
          width: max-content;
          box-shadow: 0 8px 32px rgba(248,113,113,0.1);
          transition: all 0.3s ease;
        }
        .hero-badge:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(248,113,113,0.3);
          transform: translateY(-2px);
        }
        .hero-badge span { 
          color: white; 
          font-size: 14px; 
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .hero-badge-icon { 
          width: 18px; 
          height: 18px; 
          color: #facc15; 
        }

        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px #facc15); }
          50% { filter: drop-shadow(0 0 12px #facc15); }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .hero-title { 
          color: white; 
          font-weight: 900; 
          font-size: 32px; 
          line-height: 1.1; 
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        @media(min-width: 640px) { 
          .hero-title { font-size: 56px; }
        }
        @media(min-width: 768px) { 
          .hero-title { font-size: 72px; }
        }
        .hero-title-gradient { 
          background: linear-gradient(120deg, #f87171 0%, #ef4444 40%, #fb923c 70%, #facc15 100%);
          -webkit-background-clip: text; 
          background-clip: text;
          color: transparent;
          animation: gradient-shift 8s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle { 
          color: rgba(255,255,255,0.9); 
          font-size: 17px; 
          line-height: 1.6;
          max-width: 600px; 
          margin-bottom: 32px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        @media(min-width: 640px) { 
          .hero-subtitle { font-size: 20px; }
        }

        .hero-subtitle-highlight {
          display: block;
          margin-top: 12px;
          color: #fb923c;
          font-weight: 600;
          font-size: 15px;
        }

        .hero-features { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 12px; 
          margin-bottom: 40px; 
        }
        .hero-pill { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          background: rgba(255,255,255,0.08); 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(255,255,255,0.15); 
          border-radius: 9999px; 
          padding: 10px 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .hero-pill:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(248,113,113,0.4);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 24px rgba(248,113,113,0.3);
        }
        .hero-pill-icon { 
          width: 20px; 
          height: 20px;
          filter: drop-shadow(0 2px 4px currentColor);
        }
        .hero-pill span { 
          color: white; 
          font-size: 15px; 
          font-weight: 600; 
        }

        .hero-children { 
          width: 100%;
          margin-bottom: 40px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 32px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          width: max-content;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          color: white;
          font-size: 28px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #fff 0%, #fb923c 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .stat-label {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.2);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
        }

        .scroll-arrow {
          width: 24px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 12px;
          position: relative;
        }

        .scroll-arrow::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 2px;
          animation: scroll-down 2s ease-in-out infinite;
        }

        @keyframes scroll-down {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(16px); opacity: 0; }
        }

        /* Animation Classes */
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.9s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay {
          animation: slideUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-2 {
          animation: slideUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-3 {
          animation: slideUp 0.8s ease-out 0.75s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @media(max-width: 640px) {
          .hero-stats {
            flex-direction: column;
            gap: 16px;
            padding: 16px 24px;
          }
          .stat-divider {
            width: 40px;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );
}