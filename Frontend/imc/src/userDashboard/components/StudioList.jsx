import { Sparkles } from 'lucide-react';
import StudioCard from "./StudioCard";

const studios = [
  {
    id: 1,
    name: "IMC Studio A",
    location: "Pune • Kothrud",
    price: 1200,
    rating: "4.8",
    capacity: "8-12",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=400&fit=crop"
  },
  {
    id: 2,
    name: "IMC Studio Loft",
    location: "Pune • Baner",
    price: 1500,
    rating: "4.9",
    capacity: "10-15",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=500&h=400&fit=crop"
  },
  {
    id: 3,
    name: "IMC Premium Studio",
    location: "Shivaji Nagar",
    price: 2000,
    rating: "4.9",
    capacity: "12-18",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=400&fit=crop"
  },
];

export default function StudioList() {
  return (
    <section className="relative py-8 px-4 overflow-hidden">
      {/* Background decoration with subtle color */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-50/30 via-purple-50/20 to-blue-50/30"></div>
      
      {/* Animated background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-red-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-bl from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-tr from-yellow-200/10 to-orange-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Floating musical elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Music notes floating - using dark icons with better visibility */}
        <div className="absolute top-20 left-[15%] text-6xl opacity-20 text-gray-800 animate-float">🎵</div>
        <div className="absolute top-40 right-[20%] text-5xl opacity-20 text-gray-700 animate-float-delayed">🎶</div>
        <div className="absolute bottom-32 left-[25%] text-7xl opacity-15 text-gray-800 animate-float" style={{animationDelay: '1.5s'}}>🎸</div>
        <div className="absolute top-1/3 right-[15%] text-6xl opacity-20 text-gray-700 animate-float-delayed" style={{animationDelay: '2s'}}>🎤</div>
        <div className="absolute bottom-40 right-[30%] text-5xl opacity-20 text-gray-800 animate-float">🎧</div>
        <div className="absolute top-1/2 left-[10%] text-6xl opacity-15 text-gray-700 animate-float-delayed" style={{animationDelay: '1s'}}>🎹</div>
        <div className="absolute bottom-1/4 left-[40%] text-5xl opacity-20 text-gray-800 animate-float" style={{animationDelay: '2.5s'}}>🎼</div>
      </div>
      
      {/* Add these keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Cool centered heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-600">Premium Studios</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Explore Our Studios
            </span>
          </h2>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Professional-grade studios equipped with cutting-edge technology for your creative projects
          </p>
          
          {/* Decorative underline */}
          <div className="flex justify-center mt-6">
            <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full"></div>
          </div>
        </div>

        {/* Studio cards */}
        <div className="grid gap-6">
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      </div>
    </section>
  );
}