# Restaurante Romanova — Sitio Web

Sitio web oficial del Restaurante Romanova (Gandia, Valencia) — cocina mediterránea de autor dirigida por la chef Farah desde 2017.

## 🍽️ Características

- **Página de inicio** con secciones: Hero, Nosotros, Especialidades, Galería, Reseñas, Contacto
- **Reservas externas** — todos los botones de "Reservar" (Navbar, Footer, Hero,
  Especialidades y Contacto) redirigen a la página de AutoReserve:
  `https://autoreserve.com/en/restaurants/Zeo2fTJAjtsbDwGEMcty`
- **Galería de imágenes** con lightbox
- **Diseño responsive** (móvil, tablet, escritorio)
- **Animaciones de scroll** con IntersectionObserver

## 🛠️ Stack Técnico

- **React 19** + **TypeScript**
- **Vite 7** (bundler y dev server)
- **Tailwind CSS 3.4** (estilos)
- **React Router 7** (navegación)
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

## ☁️ Despliegue en Cloudflare Pages

Este proyecto incluye un archivo `public/_redirects` con el contenido:

```
/*    /index.html   200
```

Esto es **imprescindible** para que las rutas de React Router funcionen al
recargar la página o al entrar directamente por URL. Sin este archivo,
Cloudflare Pages devuelve 404 al acceder a una ruta interna directamente.

### Pasos para desplegar en Cloudflare Pages

1. **Sube el proyecto a GitHub** (repositorio `hmadnahhmenna49-a11y/ROMANOVA`)

2. Ve a https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

3. Selecciona el repositorio `ROMANOVA`

4. Configura el build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20` (o superior)

5. Click **Save and Deploy**. El despliegue tarda ~2 minutos.

6. Cloudflare te dará una URL como `https://romanova.pages.dev`. Para usar
   un dominio propio, ve a **Custom domains** en la configuración del proyecto.

### Solución de problemas en Cloudflare Pages

| Problema | Causa | Solución |
|----------|-------|----------|
| 404 al recargar una ruta interna | Falta `_redirects` | El archivo ya está incluido en `public/_redirects` — asegúrate de que está en el build |
| Página en blanco | Build fallido | Revisa los logs de build en Cloudflare Pages |

## 🔗 Configuración del enlace de reservas

El enlace de reservas se define como una constante `RESERVA_URL` en tres
archivos:

- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/pages/Home.tsx`

Para cambiar el destino de los botones de "Reservar", edita el valor de
`RESERVA_URL` en esos tres archivos:

```ts
const RESERVA_URL = 'https://autoreserve.com/en/restaurants/Zeo2fTJAjtsbDwGEMcty';
```

Los botones abren el enlace en una pestaña nueva (`target="_blank"` con
`rel="noopener noreferrer"`).

## 📁 Estructura del proyecto

```
ROMANOVA/
├── public/
│   ├── images/              # Imágenes del restaurante (interior, platos, etc.)
│   └── _redirects           # Regla SPA para Cloudflare Pages
├── src/
│   ├── components/
│   │   ├── Navbar.tsx       # Barra de navegación (compartida)
│   │   ├── Footer.tsx       # Pie de página (compartido)
│   │   └── ui/              # Componentes shadcn/ui
│   ├── lib/
│   │   └── utils.ts         # Utilidades (cn)
│   ├── pages/
│   │   └── Home.tsx         # Página principal
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
