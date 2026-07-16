# Restaurante Romanova — Sitio Web

Sitio web oficial del Restaurante Romanova (Gandia, Valencia) — cocina mediterránea de autor dirigida por la chef Farah desde 2017.

## 🍽️ Características

- **Página de inicio** con secciones: Hero, Nosotros, Especialidades, Galería, Reseñas, Contacto
- **Página de reservas interna** (`/reservas`) con flujo de 3 pasos:
  1. Selección de fecha y número de comensales
  2. Selección de hora (con control de capacidad por slot en tiempo real)
  3. Formulario de datos del cliente
- **Base de datos Firebase Firestore** para guardar todas las reservas
- **Control de capacidad en tiempo real** — cuando un slot se llena, se bloquea
  automáticamente para todos los visitantes (no solo para el navegador actual)
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

## ☁️ Despliegue en Cloudflare Pages

Este proyecto incluye un archivo `public/_redirects` con el contenido:

```
/*    /index.html   200
```

Esto es **imprescindible** para que las rutas de React Router (como `/reservas`)
funcionen al recargar la página o al entrar directamente por URL. Sin este
archivo, Cloudflare Pages devuelve 404 al acceder a `/reservas` directamente.

### Pasos para desplegar en Cloudflare Pages

1. **Sube el proyecto a GitHub** (repositorio `hmadnahhmenna49-a11y/ROMANOVA`)

2. Ve a https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

3. Selecciona el repositorio `ROMANOVA`

4. Configura el build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20` (o superior)

5. **IMPORTANTE — Variables de entorno:** Antes de desplegar, configura las
   API keys en `src/pages/Reservas.tsx` y `src/lib/firebase.ts` (ver sección
   "Configuración obligatoria" abajo). Las API keys no se pueden poner como
   variables de entorno porque el código corre en el navegador (no hay backend).

6. Click **Save and Deploy**. El despliegue tarda ~2 minutos.

7. Cloudflare te dará una URL como `https://romanova.pages.dev`. Para usar
   un dominio propio, ve a **Custom domains** en la configuración del proyecto.

### Solución de problemas en Cloudflare Pages

| Problema | Causa | Solución |
|----------|-------|----------|
| 404 al recargar `/reservas` | Falta `_redirects` | El archivo ya está incluido en `public/_redirects` — asegúrate de que está en el build |
| WhatsApp no enviado | CallMeBot API key sin configurar | Reemplazar `'YOUR_CALLMEBOT_API_KEY'` en `src/pages/Reservas.tsx` |
| Capacidad no sincroniza entre visitantes | Firebase sin configurar | Reemplazar placeholders en `src/lib/firebase.ts` y crear Firestore DB |
| Reserva no se guarda | Firebase sin configurar o permisos incorrectos | Revisar reglas de Firestore (deben permitir `create`) |
| Página en blanco | Build fallido | Revisa los logs de build en Cloudflare Pages |


## ⚙️ Configuración obligatoria (una sola vez)

Antes de poner el sitio en producción, hay que configurar dos servicios en
`src/pages/Reservas.tsx` y `src/lib/firebase.ts`:

### 1. Firebase Firestore (base de datos de reservas + control de capacidad)

Para que la capacidad por slot se sincronice en tiempo real entre todos
los visitantes (cuando alguien reserva, los demás ven las plazas actualizadas,
y los horarios llenos se bloquean automáticamente para todos):

1. Ir a https://console.firebase.google.com/ y crear un proyecto "romanova"
2. Añadir una web app (`</>`) y copiar los valores de `firebaseConfig`
3. Reemplazar los valores placeholder en `src/lib/firebase.ts` (líneas 50-57)
4. En Firebase Console → Firestore Database → Create database (production mode)
5. Región: `europe-west1` (o la más cercana a España)
6. En la pestaña "Rules", pegar y publicar:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /bookings/{bookingId} {
         allow read: if true;
         allow create: if request.resource.data.party_size is int
                         && request.resource.data.party_size <= 20
                         && request.resource.data.party_size >= 1;
       }
     }
   }
   ```

> Si Firebase no se configura, el sitio sigue funcionando pero la capacidad
> se trackea solo por navegador (localStorage), no entre visitantes.

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
│   ├── lib/
│   │   ├── firebase.ts      # Configuración de Firebase Firestore
│   │   ├── bookings.ts      # Servicio de reservas (Firebase + fallback localStorage)
│   │   └── utils.ts         # Utilidades (cn)
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
