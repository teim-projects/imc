import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowUp, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="footer-pattern"></div>
      <div className="footer-orb-red"></div>
      <div className="footer-orb-orange"></div>
      <div className="footer-orb-yellow"></div>
      <div className="footer-top-border"></div>

      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-company">
            <div className="footer-logo-wrap">
              <div className="footer-logo">
                <span className="footer-logo-text">IMC</span>
                <div className="footer-logo-shine"></div>
              </div>
              <div>
                <div className="footer-title">IMC Studio Rentals</div>
                <div className="footer-sub">
                  <Sparkles className="footer-sparkle" />
                  Premium studio booking platform
                </div>
              </div>
            </div>

            <p className="footer-desc">
              Your go-to platform for booking premium photography and videography studio spaces in Pune.
              Professional equipment, instant booking, and flexible rates.
            </p>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <div className="footer-icon-wrap">
                  <MapPin className="footer-icon-red" />
                </div>
                <span>Pimpri-Chinchwad, Pune, Maharashtra</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-icon-wrap">
                  <Phone className="footer-icon-red" />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-icon-wrap">
                  <Mail className="footer-icon-red" />
                </div>
                <span>hello@imcstudios.com</span>
              </div>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">
              <span className="footer-heading-line"></span>
              Quick Links
            </h3>
            <ul className="footer-links">
              <li><a className="footer-link" href="#studios"><span className="footer-link-bar"></span>Browse Studios</a></li>
              <li><a className="footer-link" href="#about"><span className="footer-link-bar"></span>About Us</a></li>
              <li><a className="footer-link" href="#services"><span className="footer-link-bar"></span>Services</a></li>
              <li><a className="footer-link" href="#contact"><span className="footer-link-bar"></span>Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">
              <span className="footer-heading-line"></span>
              Legal
            </h3>
            <ul className="footer-links">
              <li><a className="footer-link" href="#privacy"><span className="footer-link-bar"></span>Privacy Policy</a></li>
              <li><a className="footer-link" href="#terms"><span className="footer-link-bar"></span>Terms of Service</a></li>
              <li><a className="footer-link" href="#cancellation"><span className="footer-link-bar"></span>Cancellation Policy</a></li>
              <li><a className="footer-link" href="#support"><span className="footer-link-bar"></span>Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">
              <span className="footer-heading-line"></span>
              Newsletter
            </h3>
            <p className="footer-newsletter-text">
              Subscribe to get special offers and updates
            </p>
            <div className="footer-newsletter">
              <input 
                type="email" 
                placeholder="Your email" 
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-btn">
                <ArrowUp className="footer-newsletter-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} IMC Studio Rentals. Made with
            <Heart className="footer-heart" /> in Pune
          </div>

          <div className="footer-socials">
            <a className="footer-social" href="#" aria-label="Facebook">
              <Facebook className="footer-social-icon" />
              <div className="footer-social-glow"></div>
            </a>
            <a className="footer-social" href="#" aria-label="Instagram">
              <Instagram className="footer-social-icon" />
              <div className="footer-social-glow"></div>
            </a>
            <a className="footer-social" href="#" aria-label="Twitter">
              <Twitter className="footer-social-icon" />
              <div className="footer-social-glow"></div>
            </a>
            <a className="footer-social" href="#" aria-label="LinkedIn">
              <Linkedin className="footer-social-icon" />
              <div className="footer-social-glow"></div>
            </a>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUp className="scroll-to-top-icon" />
        </button>
      )}

      <style>{`
        .footer-section {
          position: relative;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0f0f 50%, #0f0a0a 100%);
          overflow: hidden;
        }

        .footer-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(248,113,113,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(251,146,60,0.1) 0%, transparent 50%),
            radial-gradient(circle, white 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 30px 30px;
          animation: pattern-drift 30s ease-in-out infinite;
        }

        @keyframes pattern-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
        }

        .footer-orb-red {
          position: absolute;
          top: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          animation: float-orb-1 20s ease-in-out infinite;
        }

        .footer-orb-orange {
          position: absolute;
          bottom: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          animation: float-orb-2 25s ease-in-out infinite;
        }

        .footer-orb-yellow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(70px);
          animation: float-orb-3 18s ease-in-out infinite;
        }

        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.15); }
        }

        @keyframes float-orb-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        .footer-top-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%,
            #ef4444 20%,
            #dc2626 40%,
            #f97316 60%,
            #facc15 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: border-flow 8s linear infinite;
        }

        @keyframes border-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .footer-container {
          position: relative;
          max-width: 1200px;
          margin: auto;
          padding: 64px 16px 32px;
        }

        .footer-grid {
          display: grid;
          gap: 48px;
          grid-template-columns: 1fr;
          margin-bottom: 48px;
        }

        @media(min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
          }
        }

        .footer-company {
          max-width: 100%;
        }

        .footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .footer-logo {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 22px;
          box-shadow: 
            0 0 30px rgba(220,38,38,0.4),
            0 8px 16px rgba(0,0,0,0.3),
            inset 0 1px 1px rgba(255,255,255,0.2);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .footer-logo:hover {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 
            0 0 40px rgba(220,38,38,0.6),
            0 12px 24px rgba(0,0,0,0.4);
        }

        .footer-logo-text {
          position: relative;
          z-index: 2;
        }

        .footer-logo-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
          animation: logo-shine 3s ease-in-out infinite;
        }

        @keyframes logo-shine {
          0%, 100% { transform: translate(-100%, -100%) rotate(45deg); }
          50% { transform: translate(100%, 100%) rotate(45deg); }
        }

        .footer-title {
          color: white;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .footer-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 500;
        }

        .footer-sparkle {
          width: 14px;
          height: 14px;
          color: #facc15;
          animation: sparkle-rotate 4s linear infinite;
        }

        @keyframes sparkle-rotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
        }

        .footer-desc {
          color: #9ca3af;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 24px;
          opacity: 0.9;
        }

        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #d1d5db;
          font-size: 14px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .footer-contact-item:hover {
          background: rgba(248,113,113,0.1);
          transform: translateX(4px);
        }

        .footer-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(248,113,113,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .footer-contact-item:hover .footer-icon-wrap {
          background: rgba(248,113,113,0.2);
          transform: scale(1.1);
        }

        .footer-icon-red {
          width: 16px;
          height: 16px;
          color: #f87171;
        }

        .footer-column {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .footer-column:nth-child(2) { animation-delay: 0.1s; }
        .footer-column:nth-child(3) { animation-delay: 0.2s; }
        .footer-column:nth-child(4) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .footer-heading {
          color: white;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-heading-line {
          width: 24px;
          height: 2px;
          background: linear-gradient(90deg, #ef4444, #f97316);
          border-radius: 2px;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          color: #9ca3af;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          padding: 4px 0;
          position: relative;
        }

        .footer-link:hover {
          color: #f87171;
          transform: translateX(4px);
        }

        .footer-link-bar {
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ef4444, #f97316);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .footer-link:hover .footer-link-bar {
          width: 20px;
        }

        .footer-newsletter-text {
          color: #9ca3af;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .footer-newsletter {
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }

        .footer-newsletter:focus-within {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .footer-newsletter-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          padding: 8px 12px;
          outline: none;
        }

        .footer-newsletter-input::placeholder {
          color: #6b7280;
        }

        .footer-newsletter-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }

        .footer-newsletter-btn:hover {
          transform: translateY(-2px) rotate(45deg);
          box-shadow: 0 6px 20px rgba(239,68,68,0.5);
        }

        .footer-newsletter-icon {
          width: 18px;
          height: 18px;
        }

        .footer-divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(248,113,113,0.2) 20%,
            rgba(248,113,113,0.3) 50%,
            rgba(248,113,113,0.2) 80%,
            transparent 100%
          );
          margin: 48px 0 32px;
        }

        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          justify-content: space-between;
        }

        @media(min-width: 640px) {
          .footer-bottom {
            flex-direction: row;
          }
        }

        .footer-copy {
          color: #9ca3af;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-heart {
          width: 16px;
          height: 16px;
          color: #ef4444;
          fill: #ef4444;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.2); }
          20%, 40% { transform: scale(1); }
        }

        .footer-socials {
          display: flex;
          gap: 12px;
        }

        .footer-social {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .footer-social:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-color: transparent;
          color: white;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 24px rgba(220,38,38,0.4);
        }

        .footer-social-icon {
          width: 18px;
          height: 18px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .footer-social:hover .footer-social-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .footer-social-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .footer-social:hover .footer-social-glow {
          opacity: 1;
        }

        .scroll-to-top {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 8px 24px rgba(239,68,68,0.4);
          transition: all 0.3s ease;
          animation: slideInUp 0.4s ease-out;
        }

        .scroll-to-top:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 32px rgba(239,68,68,0.6);
        }

        .scroll-to-top-icon {
          width: 24px;
          height: 24px;
          animation: bounce-arrow 2s ease-in-out infinite;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </footer>
  );
}