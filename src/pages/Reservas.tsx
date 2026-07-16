import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Star, MapPin, Clock, Phone, Calendar, Users, ChevronLeft, ChevronRight,
  Utensils, Award, Check, Leaf, Fish, Wheat, Facebook, Info, CheckCircle2,
  Loader2, AlertCircle, Mail, MessageCircle, Users2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Email submission configuration ----------------------------------------
// Web3Forms: free service that sends form submissions to an email address
// directly from the browser — no backend required.
//
// IMPORTANT: To activate email delivery, get your free access key:
//   1. Open https://web3forms.com/
//   2. Enter the email: hmadnahhmenna49@gmail.com
//   3. You will receive the access key at that email
//   4. Replace 'YOUR_WEB3FORMS_ACCESS_KEY' below with the received key
//
// Until you replace it, submissions will still succeed but only on Web3Forms'
// demo endpoint (no real email sent). After replacing the key, every booking
// will be delivered to hmadnahhmenna49@gmail.com.
const WEB3FORMS_ACCESS_KEY = 'eed000e9-4de9-461d-84bf-e04ef91a7591';
const RESTAURANT_EMAIL = 'hmadnahhmenna49@gmail.com';

// --- WhatsApp configuration ------------------------------------------------
// Restaurant's WhatsApp number in international format (no +, no spaces).
// This is the number that will RECEIVE the booking notifications.
const RESTAURANT_WHATSAPP = '34642055235';

// --- CallMeBot configuration (DIRECT WhatsApp sending) ---------------------
// CallMeBot is a free service that sends WhatsApp messages DIRECTLY to a
// phone number via HTTP API — no app opening, no "Send" button press.
// The message simply arrives at the restaurant's WhatsApp.
//
// === ONE-TIME SETUP (≈2 minutes, must be done from the restaurant's phone) ===
//
// STEP 1 — On the phone whose WhatsApp number is RESTAURANT_WHATSAPP above
//          (currently +34 642 055 235), open WhatsApp and add this new contact:
//            Name: CallMeBot
//            Phone: +34 644 79 27 34
//
// STEP 2 — Send the CallMeBot contact this EXACT message (no quotes):
//            I allow callmebot to send me messages
//
// STEP 3 — The bot replies within ~10 seconds with a message like:
//            "APIKey: 123456789"
//          Copy that API key.
//
// STEP 4 — Open this file (src/pages/Reservas.tsx), find the line below,
//          and replace 'YOUR_CALLMEBOT_API_KEY' with your actual key:
//
//            const CALLMEBOT_API_KEY = '123456789';
//
// STEP 5 — Save the file and restart the dev server (npm run dev).
//          From now on, every booking sends a WhatsApp message directly
//          to +34 642 055 235 — no app opens, no manual send needed.
//
// === HOW TO VERIFY IT WORKS ===
// After configuring the key, make a test booking. The confirmation screen
// should show: "✓ WhatsApp enviado al restaurante". If you see that, the
// message arrived at your WhatsApp. Check your phone.
//
// === IF IT STILL DOESN'T WORK ===
// 1. Make sure you sent "I allow callmebot to send me messages" from the
//    EXACT phone number configured above (+34 642 055 235), not another.
// 2. Make sure the API key has no extra spaces or quotes.
// 3. CallMeBot free tier allows ~30 messages/day. If exceeded, wait 24h.
// 4. Check your phone's internet connection.
//
// === WHY NOT JUST USE wa.me? ===
// wa.me (https://api.whatsapp.com/send?...) always opens the WhatsApp app
// and forces the user to press "Send" manually — there is no way around
// this. CallMeBot is the only free service that sends WhatsApp messages
// programmatically without manual interaction.
//
const CALLMEBOT_API_KEY = '6035236';
const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

// Sends a WhatsApp message DIRECTLY to the restaurant via CallMeBot.
// The message arrives at the restaurant's WhatsApp without any app opening
// or user interaction. Returns { ok: true } on success.
async function sendWhatsAppDirectly(message: string): Promise<{ ok: boolean; error?: string }> {
  // If the API key is not configured, return an error — DO NOT fall back
  // to opening wa.me (the user explicitly does not want that behavior).
  if (!CALLMEBOT_API_KEY || CALLMEBOT_API_KEY === '6035236') {
    return {
      ok: false,
      error: 'CallMeBot API key not configured. See instructions in src/pages/Reservas.tsx.',
    };
  }
  try {
    const url = `${CALLMEBOT_API_URL}?phone=${RESTAURANT_WHATSAPP}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();
    // CallMeBot returns the API key in the response on success, or an
    // error message starting with "Error" on failure.
    if (response.ok && !text.toLowerCase().startsWith('error')) {
      return { ok: true };
    }
    return { ok: false, error: text.slice(0, 200) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// --- Capacity configuration ------------------------------------------------
// Maximum number of guests that can be seated per time slot.
// Adjust this number to match the restaurant's real capacity.
const MAX_CAPACITY_PER_SLOT = 20;
// localStorage key prefix for tracking bookings per slot.
const BOOKING_STORAGE_PREFIX = 'romanova_bookings_';

// --- Capacity helpers (localStorage-based) ---------------------------------
// NOTE: localStorage tracks bookings made from THIS browser only.
// For real cross-visitor capacity tracking, you would need a backend
// (e.g., Supabase, Firebase, or a simple Google Sheets API). The UI below
// is already wired to display remaining seats and block full slots — once
// a backend is in place, just replace these helpers with API calls.
function getSlotBookings(date: Date, time: string): number {
  try {
    const key = `${BOOKING_STORAGE_PREFIX}${formatYmd(date)}_${time}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  } catch {
    return 0;
  }
}

function incrementSlotBookings(date: Date, time: string, partySize: number) {
  try {
    const current = getSlotBookings(date, time);
    const key = `${BOOKING_STORAGE_PREFIX}${formatYmd(date)}_${time}`;
    localStorage.setItem(key, String(current + partySize));
  } catch {
    // ignore storage errors (e.g., private browsing)
  }
}

function getSlotRemaining(date: Date, time: string): number {
  return Math.max(0, MAX_CAPACITY_PER_SLOT - getSlotBookings(date, time));
}

// Bump a counter so all components re-render after a booking is made.
function useBookingVersion() {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  return { version, bump };
}

// --- Helpers --------------------------------------------------------------

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Restaurant schedule (matches home page)
// 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
const SCHEDULE: Record<number, { lunch?: [string, string]; dinner?: [string, string] }> = {
  0: { lunch: ['13:00', '16:00'] },                                  // Sunday
  1: {},                                                              // Monday closed
  2: {},                                                              // Tuesday closed
  3: { lunch: ['13:00', '16:00'] },                                   // Wednesday
  4: { lunch: ['13:30', '17:00'], dinner: ['20:30', '23:30'] },       // Thursday
  5: { lunch: ['13:00', '16:00'], dinner: ['20:30', '23:30'] },       // Friday
  6: { lunch: ['13:00', '16:00'], dinner: ['20:30', '23:30'] },       // Saturday
};

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// Generate 30-min time slots between open & close, ending 90 min before close
function generateSlots(open: string, close: string): string[] {
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  const lastSeatMin = closeMin - 90; // last seating 90 min before close
  const slots: string[] = [];
  for (let m = openMin; m <= lastSeatMin; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}

// --- Sub-components -------------------------------------------------------

function RatingStars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(value) ? 'fill-[#d4a853] text-[#d4a853]' : 'text-[#e8dcc8]/30'}
        />
      ))}
    </div>
  );
}

function InfoRow({
  icon: Icon, title, children,
}: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-[#d4a853]/10 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#d4a853]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#e8dcc8]/50 text-xs uppercase tracking-wider mb-1">{title}</p>
        <div className="text-[#e8dcc8] text-sm">{children}</div>
      </div>
    </div>
  );
}

// --- Calendar component ---------------------------------------------------

function BookingCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startDay = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const canGoPrev = useMemo(() => {
    return viewMonth.getFullYear() > today.getFullYear()
      || (viewMonth.getFullYear() === today.getFullYear()
        && viewMonth.getMonth() > today.getMonth());
  }, [viewMonth, today]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          className="w-9 h-9 rounded-lg border border-[#d4a853]/20 text-[#d4a853] flex items-center justify-center hover:bg-[#d4a853]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-display text-lg text-white">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          className="w-9 h-9 rounded-lg border border-[#d4a853]/20 text-[#d4a853] flex items-center justify-center hover:bg-[#d4a853]/10 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-xs uppercase tracking-wider text-[#e8dcc8]/40 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const isPast = d < today;
          const dow = d.getDay();
          const closed = Object.keys(SCHEDULE[dow]).length === 0;
          const disabled = isPast || closed;
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={formatYmd(d)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all relative
                ${isSelected
                  ? 'bg-[#d4a853] text-[#0d0a08] font-bold'
                  : disabled
                    ? 'text-[#e8dcc8]/15 cursor-not-allowed'
                    : 'text-[#e8dcc8]/80 hover:bg-[#d4a853]/10 hover:text-[#d4a853]'}
                ${isToday && !isSelected ? 'ring-1 ring-[#d4a853]/40' : ''}`}
              title={closed ? 'Cerrado' : ''}
            >
              {d.getDate()}
              {closed && !isPast && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Reservas page ---------------------------------------------------

export default function Reservas() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Find next available day (skip closed/past days)
  const initialDate = useMemo(() => {
    let d = new Date(today);
    for (let i = 0; i < 14; i++) {
      const dow = d.getDay();
      if (Object.keys(SCHEDULE[dow]).length > 0) return d;
      d = new Date(d.getTime() + 86400000);
    }
    return today;
  }, [today]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [partySize, setPartySize] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  // Tracks the outcome of the WhatsApp direct-send attempt so the
  // confirmation screen can show the right status badge.
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle');
  const { version: bookingVersion, bump: bumpBookings } = useBookingVersion();

  // Generate available slots for the selected date
  const slots = useMemo(() => {
    const dow = selectedDate.getDay();
    const daySchedule = SCHEDULE[dow] || {};
    const lunchSlots = daySchedule.lunch ? generateSlots(...daySchedule.lunch) : [];
    const dinnerSlots = daySchedule.dinner ? generateSlots(...daySchedule.dinner) : [];
    return { lunch: lunchSlots, dinner: dinnerSlots };
  }, [selectedDate]);

  // Reset selected slot when date changes
  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    setSelectedSlot(null);
    setCapacityError(null);
  };

  // Select a slot only if it still has enough remaining capacity
  const handleSlotSelect = (time: string) => {
    const remaining = getSlotRemaining(selectedDate, time);
    if (remaining <= 0) {
      setCapacityError(`Este horario está completo. Por favor, elige otro.`);
      return;
    }
    if (remaining < partySize) {
      setCapacityError(`Solo quedan ${remaining} ${remaining === 1 ? 'plaza' : 'plazas'} en este horario. Elige menos comensales u otro horario.`);
      return;
    }
    setCapacityError(null);
    setSelectedSlot(time);
  };

  const formattedDate = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // --- Capacity check before submitting ---
    const remaining = getSlotRemaining(selectedDate, selectedSlot);
    if (remaining <= 0) {
      setCapacityError(`Lo sentimos, este horario acaba de llenarse. Por favor, elige otro horario.`);
      setSelectedSlot(null);
      bumpBookings(); // refresh slot badges
      return;
    }
    if (remaining < partySize) {
      setCapacityError(`Lo sentimos, solo quedan ${remaining} ${remaining === 1 ? 'plaza' : 'plazas'} en este horario. Elige menos comensales u otro horario.`);
      bumpBookings();
      return;
    }
    setCapacityError(null);

    setSubmitting(true);
    setSubmitError(null);

    const bookingDetails = [
      `Restaurante: Romanova (Gandia)`,
      `Cliente: ${formData.name}`,
      `Email: ${formData.email}`,
      `Teléfono: ${formData.phone}`,
      `Fecha: ${formattedDate}`,
      `Hora: ${selectedSlot}`,
      `Comensales: ${partySize}`,
      formData.notes ? `Notas: ${formData.notes}` : '',
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Nueva reserva — ${formData.name} · ${partySize} pax · ${formattedDate} · ${selectedSlot}`,
          from_name: 'Web Romanova — Reservas',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          replyto: formData.email,
          booking_date: formattedDate,
          booking_time: selectedSlot,
          party_size: partySize,
          notes: formData.notes || '(sin notas)',
          message: bookingDetails,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Increment the slot's booking count so future visitors (or this
        // visitor if they retry) see the updated remaining capacity.
        incrementSlotBookings(selectedDate, selectedSlot, partySize);
        bumpBookings();

        setConfirmed(true);
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // --- Send WhatsApp message DIRECTLY via CallMeBot ---
        // This sends a real WhatsApp message to the restaurant's WhatsApp
        // number WITHOUT opening any app and WITHOUT requiring the customer
        // to press "Send". The message simply arrives at the restaurant.
        //
        // If CallMeBot is not configured or fails, we set status to 'fallback'
        // and show a clear error on the confirmation screen telling the
        // restaurant owner to configure the API key. We do NOT open wa.me
        // anymore — that was the old behavior the owner asked us to remove.
        setWhatsappStatus('sending');
        const waMessage = `*Nueva reserva — Romanova*\n\n${bookingDetails}`;
        const directResult = await sendWhatsAppDirectly(waMessage);

        if (directResult.ok) {
          setWhatsappStatus('sent');
        } else {
          // Show a configuration error on the confirmation screen.
          // The wa.me link is NOT opened — the owner wants messages to
          // arrive automatically, and a half-working manual fallback was
          // more confusing than a clear error message.
          setWhatsappStatus('fallback');
          console.warn('[Reservas] WhatsApp direct send failed:', directResult.error);
        }
      } else {
        throw new Error(result.message || 'No se pudo enviar la reserva');
      }
    } catch (err) {
      setSubmitting(false);
      setSubmitError(
        err instanceof Error
          ? `Error: ${err.message}`
          : 'Hubo un problema al enviar la reserva. Por favor, inténtalo de nuevo o llámanos.'
      );
    }
  };

  // Build a mailto: fallback link with all booking details pre-filled
  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent(
      `Nueva reserva — ${formData.name} · ${partySize} pax · ${formattedDate} · ${selectedSlot || ''}`
    );
    const body = encodeURIComponent(
      [
        `Restaurante: Romanova (Gandia)`,
        `Cliente: ${formData.name}`,
        `Email: ${formData.email}`,
        `Teléfono: ${formData.phone}`,
        `Fecha: ${formattedDate}`,
        `Hora: ${selectedSlot || ''}`,
        `Comensales: ${partySize}`,
        `Notas: ${formData.notes || '(sin notas)'}`,
      ].join('\n')
    );
    return `mailto:${RESTAURANT_EMAIL}?subject=${subject}&body=${body}`;
  }, [formData, formattedDate, selectedSlot, partySize]);

  // Check if ALL slots for the selected date are full (used to show a
  // friendly "fully booked" message instead of the slot grids).
  const allSlotsFull = useMemo(() => {
    // Include bookingVersion in deps so this recomputes after a booking.
    void bookingVersion;
    const all = [...slots.lunch, ...slots.dinner];
    if (all.length === 0) return false; // closed day is handled separately
    return all.every((t) => getSlotRemaining(selectedDate, t) <= 0);
  }, [slots, selectedDate, bookingVersion]);

  return (
    <div className="min-h-screen bg-[#0d0a08] pt-20">
      {/* Confirmation banner */}
      {confirmed && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#1a3a1a] border-b border-green-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm sm:text-base">¡Solicitud de reserva enviada!</p>
              <p className="text-green-200/80 text-xs sm:text-sm">
                {formData.name} · {partySize} personas · {formattedDate} · {selectedSlot}
              </p>
            </div>
            <button
              onClick={() => {
                setConfirmed(false);
                setSelectedSlot(null);
                setFormData({ name: '', email: '', phone: '', notes: '' });
              }}
              className="text-green-200 hover:text-white text-sm underline"
            >
              Nueva reserva
            </button>
          </div>
        </div>
      )}

      {/* Hero header */}
      <header className="relative h-[280px] sm:h-[340px] overflow-hidden">
        <img
          src="/images/interior.png"
          alt="Interior Restaurante Romanova"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/70 to-[#0d0a08]/40" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
          <div className="flex items-center gap-2 mb-3 text-[#d4a853] text-xs sm:text-sm tracking-[0.2em] uppercase">
            <Link to="/" className="hover:text-[#e8dcc8] transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#e8dcc8]/70">Reservas</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
            Reservar en <span className="text-[#d4a853]">Romanova</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[#e8dcc8]/80 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#d4a853]" /> Gandia, Valencia
            </span>
            <span className="flex items-center gap-1">
              <Utensils size={14} className="text-[#d4a853]" /> Mediterránea · Arroces · Marisco
            </span>
            <span className="flex items-center gap-2">
              <RatingStars value={5} size={14} />
              <span className="text-[#e8dcc8]/80">4.9 · 1,444 reseñas</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">

          {/* LEFT — Booking flow */}
          <div>
            {!confirmed ? (
              <>
                {/* Step 1 — Date & party size */}
                <section className="bg-[#14100d] border border-[#d4a853]/15 rounded-xl p-6 sm:p-8 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#d4a853] text-[#0d0a08] font-bold flex items-center justify-center text-sm">1</div>
                    <h2 className="font-display text-2xl text-white">Selecciona fecha y comensales</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-3">Fecha</p>
                      <BookingCalendar selectedDate={selectedDate} onSelect={handleDateSelect} />
                    </div>

                    <div>
                      <p className="text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-3">Comensales</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => { setPartySize(n); setCapacityError(null); }}
                            className={`py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5
                              ${partySize === n
                                ? 'bg-[#d4a853] border-[#d4a853] text-[#0d0a08]'
                                : 'border-[#d4a853]/20 text-[#e8dcc8]/80 hover:border-[#d4a853]/50 hover:text-[#d4a853]'}`}
                          >
                            <Users size={14} />
                            {n}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setPartySize(9); setCapacityError(null); }}
                          className={`py-3 rounded-lg border text-sm font-medium transition-all col-span-3
                            ${partySize >= 9
                              ? 'bg-[#d4a853] border-[#d4a853] text-[#0d0a08]'
                              : 'border-[#d4a853]/20 text-[#e8dcc8]/80 hover:border-[#d4a853]/50 hover:text-[#d4a853]'}`}
                        >
                          {partySize >= 9 ? `${partySize}+ comensales` : '9 o más (grupo)'}
                        </button>
                      </div>
                      {partySize >= 9 && (
                        <p className="mt-3 text-xs text-[#d4a853]/80 bg-[#d4a853]/10 rounded-lg p-3 flex items-start gap-2">
                          <Info size={14} className="flex-shrink-0 mt-0.5" />
                          Para grupos de 9 o más, el restaurante confirmará la disponibilidad. Te contactaremos por teléfono.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Step 2 — Time slots */}
                <section className="bg-[#14100d] border border-[#d4a853]/15 rounded-xl p-6 sm:p-8 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#d4a853] text-[#0d0a08] font-bold flex items-center justify-center text-sm">2</div>
                    <h2 className="font-display text-2xl text-white">Elige tu hora</h2>
                  </div>

                  <p className="text-[#e8dcc8]/60 text-sm mb-4 capitalize">
                    {formattedDate} · {partySize} {partySize === 1 ? 'persona' : 'personas'}
                  </p>

                  {/* Capacity info banner */}
                  <div className="mb-4 flex items-center gap-2 text-xs text-[#e8dcc8]/50 bg-[#0d0a08] rounded-lg px-3 py-2 border border-[#d4a853]/10">
                    <Users2 size={14} className="text-[#d4a853] flex-shrink-0" />
                    <span>Cada horario tiene un máximo de <strong className="text-[#d4a853]">{MAX_CAPACITY_PER_SLOT}</strong> comensales. Los horarios llenos aparecen como <span className="text-red-400 font-medium">Completo</span>.</span>
                  </div>

                  {/* Capacity error message (party size > remaining) */}
                  {capacityError && (
                    <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-200 text-sm">{capacityError}</p>
                    </div>
                  )}

                  {slots.lunch.length === 0 && slots.dinner.length === 0 ? (
                    <div className="text-center py-12 text-[#e8dcc8]/50">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>El restaurante está cerrado este día. Elige otra fecha.</p>
                    </div>
                  ) : allSlotsFull ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <p className="text-white font-display text-xl mb-2">Todos los horarios están completos</p>
                      <p className="text-[#e8dcc8]/60 text-sm max-w-md mx-auto">
                        Lo sentimos, no quedan plazas disponibles para este día. Por favor, elige otra fecha en el calendario.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {slots.lunch.length > 0 && (
                        <div>
                          <p className="text-[#d4a853] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="h-px w-6 bg-[#d4a853]/40" />
                            Comida · {SCHEDULE[selectedDate.getDay()].lunch?.[0]} - {SCHEDULE[selectedDate.getDay()].lunch?.[1]}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {slots.lunch.map((time) => {
                              const remaining = getSlotRemaining(selectedDate, time);
                              const isFull = remaining <= 0;
                              const tooSmall = !isFull && remaining < partySize;
                              const isSelected = selectedSlot === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={isFull || tooSmall}
                                  onClick={() => handleSlotSelect(time)}
                                  className={`relative py-3 px-2 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-0.5
                                    ${isSelected
                                      ? 'bg-[#d4a853] border-[#d4a853] text-[#0d0a08]'
                                      : isFull
                                        ? 'border-red-500/20 text-red-400/50 cursor-not-allowed bg-red-500/5'
                                        : tooSmall
                                          ? 'border-[#d4a853]/10 text-[#e8dcc8]/30 cursor-not-allowed'
                                          : 'border-[#d4a853]/20 text-[#e8dcc8]/80 hover:border-[#d4a853]/50 hover:text-[#d4a853]'}`}
                                >
                                  <span>{time}</span>
                                  {isFull ? (
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-red-400/70">Completo</span>
                                  ) : isSelected ? (
                                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{remaining} libres</span>
                                  ) : (
                                    <span className={`text-[9px] uppercase tracking-wider ${tooSmall ? 'opacity-50' : 'text-[#d4a853]/60'}`}>{remaining} libres</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {slots.dinner.length > 0 && (
                        <div>
                          <p className="text-[#d4a853] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="h-px w-6 bg-[#d4a853]/40" />
                            Cena · {SCHEDULE[selectedDate.getDay()].dinner?.[0]} - {SCHEDULE[selectedDate.getDay()].dinner?.[1]}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {slots.dinner.map((time) => {
                              const remaining = getSlotRemaining(selectedDate, time);
                              const isFull = remaining <= 0;
                              const tooSmall = !isFull && remaining < partySize;
                              const isSelected = selectedSlot === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={isFull || tooSmall}
                                  onClick={() => handleSlotSelect(time)}
                                  className={`relative py-3 px-2 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-0.5
                                    ${isSelected
                                      ? 'bg-[#d4a853] border-[#d4a853] text-[#0d0a08]'
                                      : isFull
                                        ? 'border-red-500/20 text-red-400/50 cursor-not-allowed bg-red-500/5'
                                        : tooSmall
                                          ? 'border-[#d4a853]/10 text-[#e8dcc8]/30 cursor-not-allowed'
                                          : 'border-[#d4a853]/20 text-[#e8dcc8]/80 hover:border-[#d4a853]/50 hover:text-[#d4a853]'}`}
                                >
                                  <span>{time}</span>
                                  {isFull ? (
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-red-400/70">Completo</span>
                                  ) : isSelected ? (
                                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{remaining} libres</span>
                                  ) : (
                                    <span className={`text-[9px] uppercase tracking-wider ${tooSmall ? 'opacity-50' : 'text-[#d4a853]/60'}`}>{remaining} libres</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Step 3 — Contact form */}
                <section className={`bg-[#14100d] border rounded-xl p-6 sm:p-8 mb-6 transition-all ${
                  selectedSlot ? 'border-[#d4a853]/30 opacity-100' : 'border-[#d4a853]/10 opacity-50 pointer-events-none'
                }`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm transition-colors ${
                      selectedSlot ? 'bg-[#d4a853] text-[#0d0a08]' : 'bg-[#d4a853]/20 text-[#d4a853]/50'
                    }`}>3</div>
                    <h2 className="font-display text-2xl text-white">Tus datos</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#0d0a08] border border-[#d4a853]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#d4a853] focus:outline-none focus:ring-1 focus:ring-[#d4a853]/30 transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#0d0a08] border border-[#d4a853]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#d4a853] focus:outline-none focus:ring-1 focus:ring-[#d4a853]/30 transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#0d0a08] border border-[#d4a853]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#d4a853] focus:outline-none focus:ring-1 focus:ring-[#d4a853]/30 transition-colors"
                        placeholder="+34 600 00 00 00"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-2">
                        Notas para el restaurante (opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#0d0a08] border border-[#d4a853]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#d4a853] focus:outline-none focus:ring-1 focus:ring-[#d4a853]/30 transition-colors resize-none"
                        placeholder="Alergias, occasiones especiales, peticiones..."
                      />
                    </div>

                    {/* Summary */}
                    <div className="sm:col-span-2 bg-[#0d0a08] rounded-lg p-4 border border-[#d4a853]/15">
                      <p className="text-[#e8dcc8]/50 text-xs uppercase tracking-wider mb-2">Resumen de tu reserva</p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#e8dcc8]">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#d4a853]" />
                          <span className="capitalize">{formattedDate}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={14} className="text-[#d4a853]" />
                          {selectedSlot || '—'}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users size={14} className="text-[#d4a853]" />
                          {partySize} {partySize === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>
                    </div>

                    {submitError && (
                      <div className="sm:col-span-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-200 text-sm font-medium mb-2">No se pudo enviar la reserva online.</p>
                          <p className="text-red-200/70 text-xs mb-3">Puedes enviarnos los datos directamente por email:</p>
                          <a
                            href={mailtoLink}
                            className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs font-medium px-3 py-2 rounded-md transition-colors"
                          >
                            <Mail size={14} />
                            Enviar por email a {RESTAURANT_EMAIL}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        disabled={!selectedSlot || submitting}
                        className="w-full bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold py-6 text-base tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            ENVIANDO RESERVA...
                          </>
                        ) : (
                          'CONFIRMAR RESERVA'
                        )}
                      </Button>
                      <p className="text-center text-[#e8dcc8]/40 text-xs mt-3">
                        Recibirás un email de confirmación. El restaurante puede contactarte para verificar detalles.
                      </p>
                    </div>
                  </form>
                </section>
              </>
            ) : (
              <section className="bg-[#14100d] border border-[#d4a853]/30 rounded-xl p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">¡Reserva solicitada!</h2>
                <p className="text-[#e8dcc8]/70 mb-8 max-w-md mx-auto">
                  Gracias <strong className="text-[#d4a853]">{formData.name}</strong>. Hemos recibido tu solicitud de reserva y te enviaremos una confirmación a <strong className="text-[#d4a853]">{formData.email}</strong> en breve.
                </p>

                <div className="bg-[#0d0a08] rounded-lg p-6 max-w-md mx-auto mb-8 text-left border border-[#d4a853]/15">
                  <div className="flex items-center justify-between py-2 border-b border-[#d4a853]/10">
                    <span className="text-[#e8dcc8]/60 text-sm">Restaurante</span>
                    <span className="text-white font-medium text-sm">Romanova · Gandia</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#d4a853]/10">
                    <span className="text-[#e8dcc8]/60 text-sm">Fecha</span>
                    <span className="text-white font-medium text-sm capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#d4a853]/10">
                    <span className="text-[#e8dcc8]/60 text-sm">Hora</span>
                    <span className="text-white font-medium text-sm">{selectedSlot}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#d4a853]/10">
                    <span className="text-[#e8dcc8]/60 text-sm">Comensales</span>
                    <span className="text-white font-medium text-sm">{partySize} {partySize === 1 ? 'persona' : 'personas'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#e8dcc8]/60 text-sm">Teléfono</span>
                    <span className="text-white font-medium text-sm">{formData.phone}</span>
                  </div>
                </div>

                <div className="bg-[#0d0a08] rounded-lg p-4 max-w-md mx-auto mb-6 border border-[#d4a853]/15 text-left">
                  <p className="text-[#e8dcc8]/60 text-xs uppercase tracking-wider mb-2">Email del restaurante</p>
                  <a
                    href={`mailto:${RESTAURANT_EMAIL}`}
                    className="text-[#d4a853] hover:underline text-sm break-all"
                  >
                    {RESTAURANT_EMAIL}
                  </a>
                </div>

                {/* WhatsApp notification banner — shows dynamic status */}
                <div className={`bg-[#0d0a08] rounded-lg p-4 max-w-md mx-auto mb-6 border text-left ${
                  whatsappStatus === 'fallback'
                    ? 'border-amber-500/40'
                    : 'border-green-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {whatsappStatus === 'sent' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : whatsappStatus === 'sending' ? (
                        <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                      ) : whatsappStatus === 'fallback' ? (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">
                        {whatsappStatus === 'sent'
                          ? 'WhatsApp enviado al restaurante'
                          : whatsappStatus === 'sending'
                            ? 'Enviando WhatsApp...'
                            : whatsappStatus === 'fallback'
                              ? 'WhatsApp no enviado — configuración pendiente'
                              : 'Notificación por WhatsApp'}
                      </p>
                      {whatsappStatus === 'sent' ? (
                        <p className="text-[#e8dcc8]/60 text-xs">
                          La reserva se ha enviado automáticamente al WhatsApp del restaurante (+{RESTAURANT_WHATSAPP}). No necesitas hacer nada más.
                        </p>
                      ) : whatsappStatus === 'sending' ? (
                        <p className="text-[#e8dcc8]/60 text-xs">
                          Enviando mensaje directo al WhatsApp del restaurante...
                        </p>
                      ) : whatsappStatus === 'fallback' ? (
                        <div className="text-xs space-y-2">
                          <p className="text-amber-200/90">
                            El envío directo por WhatsApp no está configurado todavía. Para recibir las reservas automáticamente en tu WhatsApp (+{RESTAURANT_WHATSAPP}):
                          </p>
                          <ol className="text-amber-200/80 space-y-1 list-decimal list-inside pl-1">
                            <li>Desde el móvil con ese WhatsApp, añade el contacto <strong className="text-amber-100">+34 644 79 27 34</strong> (CallMeBot).</li>
                            <li>Envíale el mensaje: <code className="bg-amber-500/20 px-1 rounded text-amber-100">I allow callmebot to send me messages</code></li>
                            <li>Te responderá con tu <strong className="text-amber-100">API key</strong>.</li>
                            <li>Pégalo en <code className="bg-amber-500/20 px-1 rounded text-amber-100">src/pages/Reservas.tsx</code> (constante <code className="bg-amber-500/20 px-1 rounded text-amber-100">CALLMEBOT_API_KEY</code>).</li>
                          </ol>
                          <p className="text-amber-200/60 mt-2">
                            La reserva SÍ se ha guardado y enviado por email. Solo falta el WhatsApp.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[#e8dcc8]/60 text-xs">
                          Esperando confirmación del envío por WhatsApp...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setConfirmed(false);
                      setSelectedSlot(null);
                      setSubmitError(null);
                      setCapacityError(null);
                      setWhatsappStatus('idle');
                      setFormData({ name: '', email: '', phone: '', notes: '' });
                    }}
                    className="px-6 py-3 rounded-lg border border-[#d4a853]/30 text-[#d4a853] hover:bg-[#d4a853]/10 transition-colors text-sm font-medium tracking-wider"
                  >
                    HACER OTRA RESERVA
                  </button>
                  <Link to="/">
                    <Button className="bg-[#d4a853] hover:bg-[#c49a48] text-[#0d0a08] font-semibold px-6 py-3 tracking-wider">
                      VOLVER AL INICIO
                    </Button>
                  </Link>
                </div>
              </section>
            )}

            {/* About / Popular dishes */}
            <section className="mt-8 grid sm:grid-cols-2 gap-6">
              <div className="bg-[#14100d] border border-[#d4a853]/15 rounded-xl p-6">
                <h3 className="font-display text-xl text-white mb-3">Sobre Romanova</h3>
                <p className="text-[#e8dcc8]/70 text-sm leading-relaxed mb-4">
                  Dirigido por la chef Farah, Romanova ofrece cocina mediterránea de autor desde 2017. Especialistas en fideuá, arroces y pescado fresco de la lonja de Gandía.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-[#d4a853]/10 text-[#d4a853] px-3 py-1 rounded-full">
                    <Fish size={12} /> Marisco
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#d4a853]/10 text-[#d4a853] px-3 py-1 rounded-full">
                    <Wheat size={12} /> Arroces
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#d4a853]/10 text-[#d4a853] px-3 py-1 rounded-full">
                    <Leaf size={12} /> Mediterránea
                  </span>
                </div>
              </div>

              <div className="bg-[#14100d] border border-[#d4a853]/15 rounded-xl p-6">
                <h3 className="font-display text-xl text-white mb-3">Platos populares</h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Fideuá de Marisco', price: '18,50 €' },
                    { name: 'Arroz del Senyoret', price: '17,50 €' },
                    { name: 'Croquetas de Jamón Ibérico', price: '12,00 €' },
                  ].map((d) => (
                    <li key={d.name} className="flex items-center justify-between text-sm border-b border-[#d4a853]/10 pb-3 last:border-0 last:pb-0">
                      <span className="text-[#e8dcc8]/80">{d.name}</span>
                      <span className="text-[#d4a853] font-medium">{d.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* RIGHT — Sidebar info */}
          <aside className="space-y-6">
            <div className="bg-[#14100d] border border-[#d4a853]/15 rounded-xl p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#d4a853]" />
                <h3 className="font-display text-xl text-white">Información</h3>
              </div>

              <InfoRow icon={MapPin} title="Dirección">
                <p>Calle Rausell 17, Plaza del Prado</p>
                <p>46702 Gandia, Valencia, España</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=RESTAURANTE+ROMANOVA+Gandia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d4a853] hover:underline text-xs mt-1 inline-block"
                >
                  Ver en mapa →
                </a>
              </InfoRow>

              <InfoRow icon={Phone} title="Teléfono">
                <a href="tel:+34607279214" className="hover:text-[#d4a853] transition-colors">
                  +34 607 27 92 14
                </a>
              </InfoRow>

              <InfoRow icon={Utensils} title="Cocina">
                Mediterránea · Arroces · Marisco
                <p className="text-[#e8dcc8]/60 text-xs mt-1">Rango de precio: 25 - 50 €</p>
              </InfoRow>

              <InfoRow icon={Clock} title="Horario">
                <div className="space-y-1.5 mt-1">
                  {[
                    { d: 'Dom', h: '13:00 - 16:00' },
                    { d: 'Lun', h: 'Cerrado', closed: true },
                    { d: 'Mar', h: 'Cerrado', closed: true },
                    { d: 'Mié', h: '13:00 - 16:00' },
                    { d: 'Jue', h: '13:30 - 17:00 · 20:30 - 23:30' },
                    { d: 'Vie', h: '13:00 - 16:00 · 20:30 - 23:30' },
                    { d: 'Sáb', h: '13:00 - 16:00 · 20:30 - 23:30' },
                  ].map((s) => (
                    <div key={s.d} className="flex justify-between gap-4 text-xs">
                      <span className="text-[#e8dcc8]/60 w-8">{s.d}</span>
                      <span className={`text-right flex-1 ${s.closed ? 'text-red-400/80' : 'text-[#e8dcc8]'}`}>{s.h}</span>
                    </div>
                  ))}
                </div>
              </InfoRow>

              <div className="mt-6 pt-6 border-t border-[#d4a853]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[#d4a853] text-[#d4a853]" />
                    ))}
                  </div>
                  <span className="text-white font-bold">4.9</span>
                  <span className="text-[#e8dcc8]/50 text-xs">/ 5</span>
                </div>
                <p className="text-[#e8dcc8]/60 text-xs">
                  Basado en 1,444 reseñas en TripAdvisor. Travelers' Choice 2025.
                </p>
              </div>

              <a
                href="https://www.facebook.com/Restaurante-Romanova-Gandia-105728558200616"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#d4a853]/20 text-[#d4a853] hover:bg-[#d4a853]/10 transition-colors text-sm font-medium"
              >
                <Facebook size={16} />
                Síguenos en Facebook
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
