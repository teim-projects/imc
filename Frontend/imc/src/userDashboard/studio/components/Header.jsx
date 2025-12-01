import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, MapPin, Phone } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* FIXED HEADER + PREMIUM GRADIENT */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-red-700/40
          bg-gradient-to-r from-[#0b0f19] via-[#131a26] to-[#1a222f]
          ${scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.35)]" : "shadow-md"}
        `}
      >
        {/* Red animated strip */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 animate-gradient"></div>

        {/* NAV CONTAINER */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-5 flex items-center justify-between">

          {/* LOGO LEFT */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>

              <div className="relative w-12 h-12 rounded-xl 
                bg-gradient-to-br from-red-600 via-red-700 to-red-800 
                flex items-center justify-center text-white font-bold text-lg 
                shadow-lg shadow-red-600/30 group-hover:scale-110 transition-all cursor-pointer">
                IMC
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-bold text-white tracking-tight">
                IMC Studio Rentals
              </div>
              <div className="text-xs text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Premium studio booking platform
              </div>
            </div>
          </a>

          {/* DESKTOP NAV RIGHT */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">

            <a href="#studios" className="relative group py-1">
              <span className="font-medium group-hover:text-red-400 transition-colors">Studios</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all"></span>
            </a>

            {/* SERVICES DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="relative group py-1 flex items-center gap-1.5"
              >
                <span className="font-medium group-hover:text-red-400">Services</span>
                <ChevronDown
                  className={`w-4 h-4 transition-all ${
                    servicesOpen ? "rotate-180 text-red-400" : "group-hover:text-red-400"
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full mt-3 left-0 bg-[#111827] text-gray-200 
                  rounded-xl shadow-2xl border border-gray-700/50 py-2 w-56">

                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-700"></div>

                  <a className="flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 hover:text-red-400 transition-all">
                    🎵 <span>Audio Recording</span>
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 hover:text-red-400 transition-all">
                    🎬 <span>Video Production</span>
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 hover:text-red-400 transition-all">
                    🎚️ <span>Mixing & Mastering</span>
                  </a>
                  <a className="flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 hover:text-red-400 transition-all">
                    📦 <span>Equipment Rental</span>
                  </a>
                </div>
              )}
            </div>

            <a href="#help" className="relative group py-1">
              <span className="font-medium group-hover:text-red-400">Help</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all"></span>
            </a>

            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all">
              Sign In
            </button>
          </nav>

          {/* MOBILE - MENU BUTTON */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 bg-gray-800 text-gray-200 rounded-xl border border-gray-700 hover:text-red-400 transition-all"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

           {/* MOBILE MENU DROPDOWN */}
{mobileMenuOpen && (
  <div className="md:hidden w-full bg-[#0b0f19] text-gray-200 border-b border-gray-700 pt-20 pb-6 px-6 space-y-4 fixed top-0 left-0 z-40">

    <a href="#studios" className="block py-2 text-lg font-medium hover:text-red-400 transition-all">
      Studios
    </a>

    {/* SERVICES - Mobile */}
    <div>
      <button
        onClick={() => setServicesOpen(!servicesOpen)}
        className="w-full flex justify-between items-center py-2 text-lg font-medium hover:text-red-400"
      >
        Services
        <ChevronDown className={`${servicesOpen ? "rotate-180 text-red-400" : ""} transition-all`} />
      </button>

      {servicesOpen && (
        <div className="pl-4 space-y-3 text-gray-300">
          <div className="hover:text-red-400">🎵 Audio Recording</div>
          <div className="hover:text-red-400">🎬 Video Production</div>
          <div className="hover:text-red-400">🎚️ Mixing & Mastering</div>
          <div className="hover:text-red-400">📦 Equipment Rental</div>
        </div>
      )}
    </div>

    <a href="#help" className="block py-2 text-lg font-medium hover:text-red-400 transition-all">
      Help
    </a>

    <button className="bg-red-600 hover:bg-red-700 w-full text-white px-6 py-3 rounded-xl shadow-lg transition-all">
      Sign In
    </button>

  </div>
)}
   



      {/* --- Animation Keyframes --- */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
