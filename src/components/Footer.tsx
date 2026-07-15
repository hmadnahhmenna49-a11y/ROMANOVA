import { Link } from 'react-router';
import { ArrowUp, Facebook, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Map footer labels to actual section IDs on the home page
  const quickLinks = [
    { label: 'Inicio', href: '/#hero' },
    { label: 'Nosotros', href: '/#about' },
    { label: 'Especialidades', href: '/#dishes' },
    { label: 'Galería', href: '/#gallery' },
    { label: 'Reseñas', href: '/#reviews' },
    { label: 'Contacto', href: '/#contact' },
  ];

  return (
    <footer className="bg-[#0a0705] border-t border-[#d4a853]/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-[#d4a853] mb-4">ROMANOVA</h3>
            <p className="text-[#e8dcc8]/60 text-sm leading-relaxed">
              Cocina mediterránea de autor en el corazón de Gandia.
              Especialistas en fideuá y arroces desde 2017.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/Restaurante-Romanova-Gandia-105728558200616"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#d4a853]/10 flex items-center justify-center hover:bg-[#d4a853]/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-[#d4a853]" />
              </a>
              <Link
                to="/reservas"
                className="text-[#d4a853] hover:text-[#c49a48] text-sm font-medium tracking-wider uppercase transition-colors"
              >
                Reservar Mesa →
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-[#e8dcc8]/60 hover:text-[#d4a853] text-sm transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-[#e8dcc8]/60 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d4a853] mt-0.5 flex-shrink-0" />
                <div>
                  <p>Calle Rausell 17, Plaza del Prado</p>
                  <p>46702 Gandia, Valencia</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d4a853] flex-shrink-0" />
                <a href="tel:+34607279214" className="hover:text-[#d4a853] transition-colors">
                  +34 607 27 92 14
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d4a853]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#e8dcc8]/40 text-sm">
            © 2025 Restaurante Romanova. Todos los derechos reservados.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-[#d4a853]/10 hover:bg-[#d4a853]/20 flex items-center justify-center transition-colors"
            aria-label="Volver arriba"
          >
            <ArrowUp className="w-5 h-5 text-[#d4a853]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
