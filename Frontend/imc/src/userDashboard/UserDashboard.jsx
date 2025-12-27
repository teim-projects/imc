import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Import reusable Footer
import Footer from "../components/Footer.jsx";

import heroVideo from "../assets/bharat.mp4";

export default function UserDashboard() {
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const services = [
    {
      tag: "MEMBERSHIP",
      title: "Club Membership",
      desc: "Join our exclusive music community",
      
      link: "/singer/register",
      img: "https://thumbs.dreamstime.com/b/dj-celebrating-stage-arms-raised-vibrant-concert-dynamic-scene-standing-triumphantly-high-celebration-as-373546700.jpg",
    },
    {
      tag: "STUDIO",
      title: "Studio Booking",
      desc: "World-class recording & rehearsal rooms",

      link: "/studio-booking",
      img: "https://images.stockcake.com/public/4/a/1/4a1dd2e0-ef33-4189-aeab-32d173e773e1_large/professional-recording-studio-stockcake.jpg",
    },
    {
      tag: "CLASSES",
      title: "Singing Classes",
      desc: "Professional vocal training with experts",
     
      link: "/singing-classes",
      img: "https://vocalgym.throga.com/wp-content/uploads/2022/02/website-1.jpg",
    },
    {
      tag: "PHOTOGRAPHY",
      title: "Event Photography",
      desc: "Capture your moments professionally",
      
      link: "/photography-booking",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    },
    {
      tag: "VIDEOGRAPHY",
      title: "Music Videography",
      desc: "Cinematic videos for your music",
      
      link: "/videography-booking",
      img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    },
    {
      tag: "SOUND",
      title: "Sound Services",
      desc: "Premium audio setup & rental",
     
      link: "/studio-booking",
      img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    },
  ];

  // Duplicate services for seamless infinite loop
  const duplicatedServices = [...services, ...services, ...services];

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered || !carouselRef.current) return;

    const scrollSpeed = 1; // pixels per frame
    let animationFrame;

    const scroll = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft += scrollSpeed;

        // Reset scroll when reaching the duplicated section
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 3) {
          carouselRef.current.scrollLeft = 0;
        }
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isHovered]);

  // Manual scroll
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden min-h-screen flex flex-col">
      {/* ================= HERO VIDEO ================= */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
            Where Music <span className="text-yellow-400">Comes Alive</span>
          </h1>

          <p className="text-lg md:text-2xl max-w-4xl mx-auto mb-10 text-gray-200">
            Recording Studios • Singing Classes • Live Shows • Karaoke • Sound •
            Photography • Videography
          </p>

          <div className="flex justify-center gap-5 flex-wrap">
            <Link
              to="/services"
              className="bg-yellow-400 text-black px-10 py-4 font-black rounded-full hover:bg-yellow-300 transition transform hover:scale-105"
            >
              Explore Services →
            </Link>

            <Link
              to="#upcoming-events"
              className="border-2 border-white px-10 py-4 font-black rounded-full hover:bg-white/10 transition transform hover:scale-105"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICES - CONTINUOUS INFINITE CAROUSEL ================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Our Premium Services
            </h2>
            <p className="text-gray-600 text-lg">
              Professional facilities and experiences for every musician
            </p>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex overflow-x-hidden gap-8"
            >
              {duplicatedServices.map((service, i) => (
                <div
                  key={i}
                  className="flex-none w-full sm:w-1/2 lg:w-1/3"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full group">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="h-96 w-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    <div className="absolute top-6 left-6">
                      <span className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
                        {service.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl font-black mb-2">{service.title}</h3>
                      <p className="text-gray-200 mb-6">{service.desc}</p>

                      <div className="flex justify-between items-end">
                        <p className="text-3xl font-black">{service.price}</p>
                        <Link
                          to={service.link}
                          className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition transform hover:scale-110 shadow-xl"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-2xl z-10"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-2xl z-10"
            >
              →
            </button>
          </div>

          
        </div>
      </section>

      {/* ================= UPCOMING EVENTS ================= */}
      <section id="upcoming-events" className="py-28 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Upcoming Events & Workshops
            </h2>
            <p className="text-gray-300 text-lg">
              Join us for exciting live performances and training sessions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                tag: "WORKSHOP",
                title: "Vocal Training Workshop",
                date: "08 Mar 2025",
                price: "₹1499",
                img: "https://www.ensembleschools.com/the-inside-voice/wp-content/uploads/sites/47/2023/11/mollys-music-group-lessons.jpg",
              },
              {
                tag: "CONCERT",
                title: "Classical Music Night",
                date: "01 Mar 2025",
                price: "₹799",
                img: "https://static.wixstatic.com/media/fbd6ab_ec3c65ff7ecd4da580d6a35cc5d95d5b~mv2.jpeg",
              },
              {
                tag: "KARAOKE",
                title: "Friday Karaoke Party",
                date: "22 Feb 2025",
                price: "₹299",
                img: "https://thumbs.dreamstime.com/b/asian-friends-singing-microphone-karaoke-party.jpg",
              },
            ].map((event, i) => (
              <div key={i} className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src={event.img}
                  alt={event.title}
                  className="h-96 w-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="absolute top-6 left-6">
                  <span className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
                    {event.tag}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-black mb-2">{event.title}</h3>
                  <p className="text-gray-200 text-xl mb-6">{event.date}</p>

                  <div className="flex justify-between items-end">
                    <p className="text-4xl font-black">{event.price}</p>
                    <Link
                      to="/events-booking"
                      className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition transform hover:scale-110 shadow-xl"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className="py-20 text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(234,88,12,.9),rgba(194,65,12,.95)),url('https://images.unsplash.com/photo-1511379938547-c1f69419868d')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Start Your Musical Journey?
            </h2>
            <p className="text-orange-100 mb-8 text-lg">
              Join IMC Music Club today and unlock a world of musical possibilities.
            </p>

            <Link
              to="/membership"
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-black hover:bg-gray-100 transition inline-block transform hover:scale-105"
            >
              Become a Member →
            </Link>
          </div>

          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8">
            <h3 className="text-2xl font-black mb-6">Quick Contact</h3>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-5 bg-white/20 p-5 rounded-xl mb-5 hover:bg-white/30 transition"
            >
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-3xl">
                💬
              </div>
              <div>
                <p className="font-bold text-lg">WhatsApp Us</p>
                <p className="text-orange-100">Get instant response</p>
              </div>
            </a>

            <a
              href="tel:+919999999999"
              className="flex items-center gap-5 bg-white/20 p-5 rounded-xl hover:bg-white/30 transition"
            >
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-black text-3xl">
                📞
              </div>
              <div>
                <p className="font-bold text-lg">Call Us</p>
                <p className="text-orange-100">+91 99999 99999</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ================= REUSABLE FOOTER ================= */}
      <Footer />
    </div>
  );
}