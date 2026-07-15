import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { MapPin, Phone, Clock, Star, ChefHat, Utensils, Award, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation hook
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Hero Section
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-exterior.png"
          alt="Restaurante Romanova Exterior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/70 via-[#0d0a08]/50 to-[#0d0a08]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className={`transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.3em] uppercase font-medium">Gandia · Valencia</span>
            <div className="h-px w-12 bg-[#d4a853]" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wide">
            ROMANOVA
          </h1>
          <p className="font-display text-xl sm:text-2xl md:text-3xl text-[#e8dcc8]/90 mb-8 italic">
            Cocina Mediterránea de Autor
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-[#d4a853] text-[#d4a853]" />
              ))}
            </div>
            <span className="text-[#e8dcc8]/80 text-sm">4.9 · 1,444 reseñas · TripAdvisor</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/reservas">
              <Button className="bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold px-8 py-6 text-base tracking-wider">
                RESERVAR MESA
              </Button>
            </Link>
            <a href="#dishes">
              <Button variant="outline" className="border-[#d4a853] text-[#d4a853] hover:bg-[#d4a853] hover:text-[#0d0a08] px-8 py-6 text-base tracking-wider">
                VER CARTA
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator - positioned relative to the section, not the content */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 border-2 border-[#d4a853]/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#d4a853] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

// About Section
function AboutSection() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#0d0a08]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#d4a853]/30 rounded-lg" />
              <img
                src="/images/interior.png"
                alt="Interior de Restaurante Romanova"
                className="relative rounded-lg w-full h-[400px] sm:h-[500px] object-cover shadow-2xl"
              />
              <div className="absolute bottom-6 left-6 bg-[#0d0a08]/90 backdrop-blur-sm px-6 py-4 rounded-lg border border-[#d4a853]/20">
                <p className="text-[#d4a853] font-display text-2xl font-bold">#1</p>
                <p className="text-[#e8dcc8]/80 text-sm">de 363 restaurantes en Gandia</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#d4a853]" />
              <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase">Nuestra Historia</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Un Templo del <span className="text-[#d4a853]">Bacalao</span> y la <span className="text-[#d4a853]">Fideuá</span>
            </h2>
            <p className="text-[#e8dcc8]/70 text-base sm:text-lg leading-relaxed mb-6">
              Dirigido por la chef <strong className="text-[#e8dcc8]">Farah</strong>, originaria de Beni Melal (Marruecos),
              el Restaurante Romanova se ha consolidado como uno de los mejores restaurantes de la comarca de la Safor.
              Con experiencia en cocinas de Londres, Dublín, Belfast y París, Farah trajo a Gandía en 2006
              su pasión por la cocina mediterránea.
            </p>
            <p className="text-[#e8dcc8]/70 text-base sm:text-lg leading-relaxed mb-8">
              Desde 2017, Romanova es sinónimo de excelencia gastronómica. Se abastece de pescado y marisco
              de la lonja de Gandía y de carne de la afamada carnicería Fuster, ofreciendo una fusión perfecta
              entre la cocina tradicional valenciana y toques innovadores.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <Award className="w-8 h-8 text-[#d4a853] mx-auto mb-2" />
                <p className="text-white font-bold text-lg">4.9/5</p>
                <p className="text-[#e8dcc8]/60 text-sm">TripAdvisor</p>
              </div>
              <div className="text-center">
                <ChefHat className="w-8 h-8 text-[#d4a853] mx-auto mb-2" />
                <p className="text-white font-bold text-lg">2017</p>
                <p className="text-[#e8dcc8]/60 text-sm">Desde</p>
              </div>
              <div className="text-center">
                <Utensils className="w-8 h-8 text-[#d4a853] mx-auto mb-2" />
                <p className="text-white font-bold text-lg">Med.</p>
                <p className="text-[#e8dcc8]/60 text-sm">Cocina</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Dishes Section
function DishesSection() {
  const { ref, isVisible } = useIntersectionObserver();

  const dishes = [
    {
      name: 'Fideuá de Marisco',
      description: 'Nuestra especialidad estrella. Fideuá tradicional con gambas rojas, calamares y mejillones frescos de la lonja de Gandía.',
      price: '18,50 €',
      image: '/images/fideua-paella.jpg',
      tag: 'Más Popular',
    },
    {
      name: 'Arroz del Senyoret',
      description: 'Arroz meloso con marisco pelado, calamares y gambas. Un clásico valenciano elaborado con pasión.',
      price: '17,50 €',
      image: '/images/arroz-senyoret.jpg',
      tag: 'Especialidad',
    },
    {
      name: 'Croquetas de Jamón Ibérico',
      description: 'Croquetas caseras con jamón ibérico de bellota. Crujientes por fuera, cremosas por dentro.',
      price: '12,00 €',
      image: '/images/croquetas.jpg',
      tag: 'Recomendado',
    },
    {
      name: 'Cornetes de Salmón con Kimchi',
      description: 'Crujientes cornetes rellenos de salmón fresco con un toque de kimchi casero.',
      price: '14,50 €',
      image: '/images/cornetes.jpg',
      tag: 'Innovación',
    },
    {
      name: 'Tarta de Queso',
      description: 'Nuestra tarta de queso casera, suave y cremosa, acompañada de coulis de frutos rojos.',
      price: '7,50 €',
      image: '/images/plato-elegante.jpg',
      tag: 'Postre',
    },
    {
      name: 'Ensalada de Queso de Cabra',
      description: 'Endivias con queso de cabra a la brasa, piñones, arándanos y tomate confitado.',
      price: '13,00 €',
      image: '/images/ensalada.jpg',
      tag: 'Fresco',
    },
  ];

  return (
    <section id="dishes" className="py-20 sm:py-28 bg-[#14100d]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase">Nuestra Carta</span>
            <div className="h-px w-8 bg-[#d4a853]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Especialidades de la Casa
          </h2>
          <p className="text-[#e8dcc8]/60 text-base sm:text-lg max-w-2xl mx-auto">
            Platos elaborados con productos frescos de la lonja de Gandía y la mejor carne de la carnicería Fuster.
          </p>
        </div>

        {/* Dishes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {dishes.map((dish, index) => (
            <div
              key={dish.name}
              className={`group relative bg-[#1a1510] rounded-xl overflow-hidden border border-[#d4a853]/10 hover:border-[#d4a853]/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d4a853]/5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#d4a853] text-[#0d0a08] text-xs font-semibold px-3 py-1 rounded-full">
                    {dish.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#d4a853] transition-colors">
                    {dish.name}
                  </h3>
                  <span className="text-[#d4a853] font-semibold text-lg whitespace-nowrap">{dish.price}</span>
                </div>
                <p className="text-[#e8dcc8]/60 text-sm leading-relaxed">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link to="/reservas">
            <Button className="bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold px-8 py-6 text-base tracking-wider">
              RESERVAR MESA
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Gallery Section - fixed layout to eliminate gaps on desktop
function GallerySection() {
  const { ref, isVisible } = useIntersectionObserver();
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const images = [
    { src: '/images/exterior.jpg', alt: 'Fachada del Restaurante Romanova' },
    { src: '/images/fideua.jpg', alt: 'Fideuá de Marisco' },
    { src: '/images/interior.png', alt: 'Interior del restaurante' },
    { src: '/images/arroz-senyoret.jpg', alt: 'Arroz del Senyoret' },
    { src: '/images/bar.jpg', alt: 'Barra del restaurante' },
    { src: '/images/croquetas.jpg', alt: 'Croquetas de Jamón' },
    { src: '/images/ensalada.jpg', alt: 'Ensalada fresca' },
    { src: '/images/plato-elegante.jpg', alt: 'Plato elaborado' },
  ];

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#0d0a08]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase">Galería</span>
            <div className="h-px w-8 bg-[#d4a853]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Momentos Romanova
          </h2>
          <p className="text-[#e8dcc8]/60 text-base sm:text-lg max-w-2xl mx-auto">
            Un vistazo a nuestra cocina, nuestro ambiente y los platos que nos han convertido en el #1 de Gandia.
          </p>
        </div>

        {/* Masonry-style gallery using CSS columns - no gaps, perfectly packed */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
          {images.map((img, index) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden rounded-lg cursor-pointer mb-3 sm:mb-4 break-inside-avoid transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ transitionDelay: `${index * 80 + 200}ms` }}
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#0d0a08]/0 group-hover:bg-[#0d0a08]/40 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#d4a853]/0 group-hover:bg-[#d4a853]/90 flex items-center justify-center transition-all duration-300 scale-0 group-hover:scale-100">
                  <span className="text-[#0d0a08] text-2xl font-light">+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-[#d4a853] transition-colors"
            aria-label="Cerrar"
          >
            <X size={32} />
          </button>
          <figure className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
            <figcaption className="text-center text-[#e8dcc8]/80 text-sm mt-4 font-display italic">
              {selectedImage.alt}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

// Reviews Section
function ReviewsSection() {
  const { ref, isVisible } = useIntersectionObserver();

  const reviews = [
    {
      name: 'Nath E',
      date: 'Julio 2026',
      text: 'Muy buena acogida, el servicio (bebidas y platos) es muy atento y ofrece buenos consejos. Las croquetas y las patatas bravas son deliciosas. Lo pasamos muy bien.',
      rating: 5,
    },
    {
      name: 'Laurent G',
      date: 'Julio 2024',
      text: 'Excelente restaurante en Gandia. La comida es deliciosa, el servicio es muy atento y rápido. La fideuá es impresionante. Altamente recomendado.',
      rating: 5,
    },
    {
      name: 'Clara C',
      date: 'Noviembre 2022',
      text: 'Una experiencia gastronómica increíble. La chef Farah es una artista. Cada plato es una obra de arte. Volveremos sin duda.',
      rating: 5,
    },
  ];

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#14100d]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase">Testimonios</span>
            <div className="h-px w-8 bg-[#d4a853]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Lo que Dicen Nuestros Clientes
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-[#d4a853] text-[#d4a853]" />
              ))}
            </div>
            <span className="text-[#e8dcc8]/80 text-lg font-medium">4.9 de 1,444 reseñas</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.name}
              className={`bg-[#1a1510] rounded-xl p-6 sm:p-8 border border-[#d4a853]/10 hover:border-[#d4a853]/30 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#d4a853] text-[#d4a853]" />
                ))}
              </div>
              <p className="text-[#e8dcc8]/80 text-base leading-relaxed mb-6 italic">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{review.name}</p>
                  <p className="text-[#e8dcc8]/50 text-sm">{review.date}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#d4a853]/20 flex items-center justify-center">
                  <span className="text-[#d4a853] font-bold text-sm">{review.name.charAt(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { value: '1,444+', label: 'Reseñas' },
            { value: '4.9/5', label: 'Puntuación' },
            { value: '#1', label: 'En Gandia' },
            { value: '2025', label: 'Travelers\' Choice' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[#d4a853] font-display text-3xl sm:text-4xl font-bold">{stat.value}</p>
              <p className="text-[#e8dcc8]/60 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Section
function ContactSection() {
  const { ref, isVisible } = useIntersectionObserver();

  const schedule = [
    { day: 'Domingo', hours: '13:00 - 16:00' },
    { day: 'Lunes', hours: 'Cerrado' },
    { day: 'Martes', hours: 'Cerrado' },
    { day: 'Miércoles', hours: '13:00 - 16:00' },
    { day: 'Jueves', hours: '13:30 - 17:00, 20:30 - 23:30' },
    { day: 'Viernes', hours: '13:00 - 16:00, 20:30 - 23:30' },
    { day: 'Sábado', hours: '13:00 - 16:00, 20:30 - 23:30' },
  ];

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#0d0a08]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase">Visítanos</span>
            <div className="h-px w-8 bg-[#d4a853]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Reserva tu Mesa
          </h2>
          <p className="text-[#e8dcc8]/60 text-base sm:text-lg max-w-2xl mx-auto">
            Ven a disfrutar de la mejor cocina mediterránea en el corazón de Gandia.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#d4a853]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Dirección</h3>
                  <p className="text-[#e8dcc8]/70">Calle Rausell 17, Plaza del Prado</p>
                  <p className="text-[#e8dcc8]/70">46702, Gandia, Valencia, España</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#d4a853]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Teléfono</h3>
                  <a href="tel:+34607279214" className="text-[#e8dcc8]/70 hover:text-[#d4a853] transition-colors">
                    +34 607 27 92 14
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#d4a853]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Horario</h3>
                  <div className="space-y-2">
                    {schedule.map((item) => (
                      <div key={item.day} className="flex justify-between gap-8 text-sm">
                        <span className="text-[#e8dcc8]/70">{item.day}</span>
                        <span className={item.hours === 'Cerrado' ? 'text-red-400' : 'text-[#e8dcc8]/70'}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[#d4a853]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Reservas</h3>
                  <Link to="/reservas">
                    <Button className="bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold mt-2">
                      RESERVAR ONLINE
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="rounded-xl overflow-hidden border border-[#d4a853]/20 h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3117.847985363613!2d-0.1828835!3d38.9646844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd61e84a257f5325%3A0xd2863d1c75ee8b76!2sRESTAURANTE%20ROMANOVA!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Restaurante Romanova"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <DishesSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
    </>
  );
}
