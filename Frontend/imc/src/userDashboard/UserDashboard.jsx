import Header from "./components/Header";
import Hero from "./components/Hero";
import SearchCard from "./components/SearchCard";
import About from "./components/About";
import StudioList from "./components/StudioList";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="homepage-root">
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
        <Header />
        <Hero>
          <SearchCard />
        </Hero>

        <main className="homepage-main">
          <StudioList />
        </main>

        <About />
        <Testimonials />
        <Footer />
      </div>

      <style>{`
        .homepage-root { position:relative; min-height:100vh; display:flex; flex-direction:column; background:linear-gradient(to bottom right,#ffedd5,#fce7f3,#ede9fe); overflow:hidden; }

        .homepage-ambient { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }

        .blob-red { position:absolute; top:80px; left:40px; width:380px; height:380px; background:linear-gradient(to bottom right,rgba(252,165,165,0.2),rgba(244,114,182,0.2)); border-radius:50%; filter:blur(60px); animation:pulse 6s infinite; }
        .blob-blue { position:absolute; top:33%; right:80px; width:500px; height:500px; background:linear-gradient(to bottom left,rgba(147,197,253,0.2),rgba(196,181,253,0.2)); border-radius:50%; filter:blur(70px); animation:pulse 6s infinite 1s; }
        .blob-yellow { position:absolute; bottom:160px; left:25%; width:320px; height:320px; background:linear-gradient(to top right,rgba(254,240,138,0.15),rgba(253,186,116,0.15)); border-radius:50%; filter:blur(60px); animation:pulse 6s infinite 2s; }
        .blob-pink { position:absolute; top:65%; right:33%; width:300px; height:300px; background:linear-gradient(to top left,rgba(244,114,182,0.15),rgba(252,165,165,0.15)); border-radius:50%; filter:blur(60px); animation:pulse 6s infinite 1.5s; }

        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.15);opacity:0.6;} }

        .music { position:absolute; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3)); animation:float 6s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-25px);} }

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
        .homepage-main { max-width:1200px; margin:auto; padding:0 16px; margin-top:40px; width:100%; }
      `}</style>
    </div>
  );
}
