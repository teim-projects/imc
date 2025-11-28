import { Award, Users, Camera, Star, CheckCircle, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-bg-pattern"></div>

      <div className="orb-red"></div>
      <div className="orb-orange"></div>

      <div className="about-container">
        <div className="flex justify-center mb-8">
          <div className="about-badge">
            <Sparkles className="w-5 h-5 text-red-400" />
            <span>ABOUT US</span>
          </div>
        </div>

        <div className="about-grid">
          <div>
            <h2 className="about-title">
              <span className="block text-white">Welcome to</span>
              <span className="block mt-3 about-gradient-text">
                IMC Studios
                <div className="about-underline"></div>
              </span>
            </h2>

            <p className="about-text">
              IMC Studio Rentals is a premium photography and videography studio platform based in Pune.
              We provide fully equipped studio spaces designed for photoshoots, video shoots, content creation,
              reels, product photography, and commercial projects.
            </p>

            <p className="about-text">
              With professional lighting, clean makeup rooms, modern backdrops, and on-demand equipment — IMC helps
              creators and brands bring their ideas to life. Our mission is to make studio booking quick, affordable
              and reliable.
            </p>

            <div>
              <div className="about-list-item">
                <div className="about-list-icon"><CheckCircle className="w-4 h-4 text-red-400" /></div>
                <span>Professional lighting & equipment</span>
              </div>
              <div className="about-list-item">
                <div className="about-list-icon"><CheckCircle className="w-4 h-4 text-red-400" /></div>
                <span>Instant online booking system</span>
              </div>
              <div className="about-list-item">
                <div className="about-list-icon"><CheckCircle className="w-4 h-4 text-red-400" /></div>
                <span>Flexible hourly rates with no hidden costs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
              <div className="stats-box">
                <Camera className="w-6 h-6 text-red-400 mb-2" />
                <div className="stats-number">5+</div>
                <p className="stats-label">Premium Studios</p>
              </div>

              <div className="stats-box">
                <Award className="w-6 h-6 text-red-400 mb-2" />
                <div className="stats-number">500+</div>
                <p className="stats-label">Completed Shoots</p>
              </div>

              <div className="stats-box">
                <Users className="w-6 h-6 text-red-400 mb-2" />
                <div className="stats-number">1000+</div>
                <p className="stats-label">Happy Creators</p>
              </div>

              <div className="stats-box">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mb-2" />
                <div className="stats-number">4.9</div>
                <p className="stats-label">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="image-wrapper">
            <div className="image-bg"></div>

            <div className="image-box">
              <img src="/studio1.jpg" alt="IMC studio interior" />

              <div className="image-overlay"></div>

              <div className="image-info">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Professional Setup</h4>
                    <p className="text-sm text-gray-300">
                      Fully equipped studio with professional lights, backdrops and makeup area — ready for small
                      to large productions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* --- FULL NORMAL CSS (Tailwind → Pure CSS) --- */
.about-section { position: relative; background: linear-gradient(to bottom right, #111827, #1f2937, #000); padding: 80px 0; overflow: hidden; }
.about-bg-pattern { position: absolute; inset: 0; opacity: 0.05; pointer-events: none; background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 40px 40px; }
.orb-red { position: absolute; top: 80px; left: 40px; width: 18rem; height: 18rem; background: rgba(220,38,38,0.2); border-radius: 50%; filter: blur(64px); animation: pulse 4s ease-in-out infinite; }
.orb-orange { position: absolute; bottom: 80px; right: 40px; width: 24rem; height: 24rem; background: rgba(234,88,12,0.1); border-radius: 50%; filter: blur(64px); animation: pulse 4s ease-in-out infinite; animation-delay:1s; }
.about-container { position: relative; max-width: 1200px; margin: auto; padding: 0 16px; }
.about-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.3); backdrop-filter:blur(6px); border-radius:9999px; padding:10px 20px; cursor:pointer; transition:0.3s; }
.about-badge:hover { background: rgba(220,38,38,0.2); }
.about-badge span { color:#f87171; font-weight:bold; letter-spacing:1px; }
.about-grid { display:grid; gap:48px; align-items:center; }
@media(min-width:1024px){ .about-grid{ grid-template-columns:1fr 1fr; }}
.about-title { font-size:4rem; font-weight:900; line-height:1.1; color:white; margin-bottom:32px; }
.about-gradient-text { background:linear-gradient(to right,#f87171,#ef4444,#f97316); -webkit-background-clip:text; color:transparent; position:relative; display:inline-block; }
.about-underline { position:absolute; left:0; right:0; bottom:-8px; height:8px; background:linear-gradient(to right,#dc2626,#ea580c); opacity:0.5; border-radius:8px; filter:blur(4px); }
.about-text { color:#d1d5db; font-size:1.1rem; line-height:1.7; margin-bottom:16px; }
.about-list-item { display:flex; align-items:center; gap:12px; color:#e5e7eb; margin-bottom:12px; }
.about-list-icon { width:24px; height:24px; background:rgba(220,38,38,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; }
.stats-box { text-align:center; padding:16px; background:rgba(255,255,255,0.05); backdrop-filter:blur(6px); border-radius:12px; border:1px solid rgba(255,255,255,0.1); transition:0.3s; }
.stats-box:hover{ border-color:rgba(220,38,38,0.5); background:rgba(255,255,255,0.1); }
.stats-number{ font-size:2.5rem; font-weight:bold; color:white; }
.stats-label{ color:#9ca3af; font-size:0.9rem; }
.image-wrapper{ position:relative; }
.image-bg{ position:absolute; inset:0; background:linear-gradient(to bottom right,rgba(220,38,38,0.3),rgba(234,88,12,0.3)); border-radius:20px; filter:blur(40px); transition:0.5s; }
.image-wrapper:hover .image-bg{ filter:blur(60px); }
.image-box{ position:relative; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 20px 50px rgba(0,0,0,0.4); transition:0.3s; }
.image-box:hover{ border-color:rgba(220,38,38,0.5); }
.image-box img{ width:100%; height:380px; object-fit:cover; transition:0.5s; }
.image-wrapper:hover img{ transform:scale(1.05); }
.image-overlay{ position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.8),rgba(0,0,0,0.2),transparent); opacity:0; transition:0.3s; }
.image-wrapper:hover .image-overlay{ opacity:1; }
.image-info{ position:absolute; bottom:0; width:100%; padding:24px; background:linear-gradient(to top,rgba(0,0,0,0.9),transparent); }
@keyframes pulse{ 0%,100%{opacity:0.3; transform:scale(1);} 50%{opacity:0.5; transform:scale(1.1);} }
      `}</style>
    </section>
  );
}
