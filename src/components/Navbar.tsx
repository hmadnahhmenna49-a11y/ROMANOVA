import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On Reservas page, navbar should always have solid background
  const isReservasPage = location.pathname.startsWith('/reservas');

  const navLinks = [
    { label: 'Inicio', href: '/#hero' },
    { label: 'Nosotros', href: '/#about' },
    { label: 'Especialidades', href: '/#dishes' },
    { label: 'Galería', href: '/#gallery' },
    { label: 'Reseñas', href: '/#reviews' },
    { label: 'Contacto', href: '/#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isReservasPage || scrolled ? 'bg-[#0d0a08]/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-2xl sm:text-3xl font-bold text-[#d4a853] tracking-wide">
            ROMANOVA
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#e8dcc8]/80 hover:text-[#d4a853] text-sm font-medium tracking-wider uppercase transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <Link to="/reservas">
              <Button className="bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold px-6 tracking-wider text-sm">
                RESERVAR
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-[#d4a853] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0d0a08]/98 backdrop-blur-md border-t border-[#d4a853]/20">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-[#e8dcc8]/80 hover:text-[#d4a853] text-base font-medium tracking-wider uppercase transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/reservas"
              onClick={() => setMobileOpen(false)}
              className="block pt-4"
            >
              <Button className="w-full bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold tracking-wider">
                RESERVAR MESA
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
