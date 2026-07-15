import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Reservas from '@/pages/Reservas';

// Scroll to top on route change (or to hash if present)
function ScrollToHashOrTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Defer to allow the target page to render first
      const t = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-[#0d0a08] text-white">
      <ScrollToHashOrTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
