# Restaurante Romanova — Sitio Web

Sitio web oficial del Restaurante Romanova (Gandia, Valencia) — cocina mediterránea de autor dirigida por la chef Farah desde 2017.

## 🍽️ Características

- **Página de inicio** con secciones: Hero, Nosotros, Especialidades, Galería, Reseñas, Contacto
- **Página de reservas interna** (`/reservas`) con flujo de 3 pasos:
  1. Selección de fecha y número de comensales
  2. Selección de hora (con control de capacidad por slot)
  3. Formulario de datos del cliente
- **Envío automático de reservas por email** (vía Web3Forms)
- **Envío automático de reservas por WhatsApp** (vía CallMeBot — directo, sin abrir la app)
- **Galería de imágenes** con lightbox
- **Diseño responsive** (móvil, tablet, escritorio)
- **Animaciones de scroll** con IntersectionObserver

## 🛠️ Stack Técnico

- **React 19** + **TypeScript**
- **Vite 7** (bundler y dev server)
- **Tailwind CSS 3.4** (estilos)
- **React Router 7** (navegación entre páginas)
- **shadcn/ui** (componentes UI)
- **lucide-react** (iconos)

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/hmadnahhmenna49-a11y/ROMANOVA.git
cd ROMANOVA

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:3000`.

## 📦 Build de producción

```bash
npm run build      # Genera carpeta dist/
npm run preview    # Previsualiza el build de producción
```

## ⚙️ Configuración obligatoria (una sola vez)

Antes de poner el sitio en producción, hay que configurar dos servicios en `src/pages/Reservas.tsx`:

### 1. Web3Forms (envío de email)

Para recibir las reservas en `hmadnahhmenna49@gmail.com`:

1. Ir a https://web3forms.com/
2. Introducir el email: `hmadnahhmenna49@gmail.com`
3. Recibir el access key por email
4. Reemplazar en `src/pages/Reservas.tsx` (línea ~23):
   ```ts
   const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
   ```
   con la clave recibida.

### 2. CallMeBot (envío directo de WhatsApp)

Para recibir las reservas en WhatsApp (+34 642 055 235) **sin abrir la app**:

1. Desde el móvil con ese WhatsApp, añadir el contacto: **+34 644 79 27 34** (CallMeBot bot)
2. Enviarle el mensaje: `I allow callmebot to send me messages`
3. El bot responde con un API key
4. Reemplazar en `src/pages/Reservas.tsx` (línea ~77):
   ```ts
   const CALLMEBOT_API_KEY = 'YOUR_CALLMEBOT_API_KEY';
   ```
   con la clave recibida.

> **Nota sobre CORS:** CallMeBot no envía cabeceras CORS, por lo que el fetch se realiza con `mode: 'no-cors'`. La petición SÍ se envía y el mensaje SÍ se entrega, aunque el navegador no pueda leer la respuesta.

## 📁 Estructura del proyecto

```
ROMANOVA/
├── public/
│   └── images/              # Imágenes del restaurante (interior, platos, etc.)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx       # Barra de navegación (compartida)
│   │   ├── Footer.tsx       # Pie de página (compartido)
│   │   └── ui/              # Componentes shadcn/ui
│   ├── pages/
│   │   ├── Home.tsx         # Página principal
│   │   └── Reservas.tsx     # Página de reservas
│   ├── App.tsx              # Router principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales + Tailwind
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 📞 Contacto

- **Restaurante Romanova**
- Calle Rausell 17, Plaza del Prado, 46702 Gandia, Valencia
- Tel: +34 607 27 92 14
- Facebook: @RestauranteRomanovaGandia

## 📄 Licencia

© 2025 Restaurante Romanova. Todos los derechos reservados.
