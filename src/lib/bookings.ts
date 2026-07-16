// Booking service: stores reservations in Firebase Firestore and tracks
// remaining capacity per (date, time) slot.
//
// When Firebase is configured (see firebase.ts), bookings are stored in
// a "bookings" collection. Each booking has:
//   - date: "YYYY-MM-DD"
//   - time: "HH:MM"
//   - party_size: number
//   - name, email, phone, notes
//   - created_at: server timestamp
//
// Capacity per slot is computed by querying all bookings for that date+time
// and summing their party_size. This works in real-time across all visitors.
//
// When Firebase is NOT configured, we fall back to localStorage so the site
// keeps working locally (capacity is per-browser only in that case).
//
import {
  collection, addDoc, query, where, getDocs, onSnapshot,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';

const BOOKINGS_COLLECTION = 'bookings';
const LOCAL_STORAGE_PREFIX = 'romanova_bookings_';

export interface Booking {
  id?: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM"
  party_size: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  created_at?: Timestamp | null;
}

export interface BookingInput {
  date: string;
  time: string;
  party_size: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

// --- localStorage helpers (fallback when Firebase not configured) --------

function localStorageKey(date: string, time: string): string {
  return `${LOCAL_STORAGE_PREFIX}${date}_${time}`;
}

function getLocalStorageBookings(date: string, time: string): number {
  try {
    return parseInt(localStorage.getItem(localStorageKey(date, time)) || '0', 10);
  } catch {
    return 0;
  }
}

function addLocalStorageBooking(date: string, time: string, partySize: number): void {
  try {
    const current = getLocalStorageBookings(date, time);
    localStorage.setItem(localStorageKey(date, time), String(current + partySize));
  } catch {
    // ignore
  }
}

// --- Public API -----------------------------------------------------------

/**
 * Save a new booking. Works with Firebase if configured, otherwise
 * falls back to localStorage.
 */
export async function saveBooking(input: BookingInput): Promise<{ ok: boolean; error?: string }> {
  if (firebaseEnabled && db) {
    try {
      await addDoc(collection(db, BOOKINGS_COLLECTION), {
        ...input,
        created_at: serverTimestamp(),
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Firebase write failed',
      };
    }
  }
  // Fallback: localStorage
  addLocalStorageBooking(input.date, input.time, input.party_size);
  return { ok: true };
}

/**
 * Get the total number of booked seats for a specific (date, time) slot.
 * Used to compute remaining capacity.
 */
export async function getSlotBookedCount(date: string, time: string): Promise<number> {
  if (firebaseEnabled && db) {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('date', '==', date),
        where('time', '==', time),
      );
      const snapshot = await getDocs(q);
      let total = 0;
      snapshot.forEach((d) => {
        const data = d.data();
        if (typeof data.party_size === 'number') total += data.party_size;
      });
      return total;
    } catch (err) {
      console.warn('[bookings] getSlotBookedCount failed, using localStorage:', err);
      return getLocalStorageBookings(date, time);
    }
  }
  return getLocalStorageBookings(date, time);
}

/**
 * Get the booked count for ALL time slots of a given date at once.
 * Returns a map like { "13:00": 4, "13:30": 2, ... }.
 *
 * More efficient than calling getSlotBookedCount for each slot separately
 * because it issues a single Firestore query.
 */
export async function getDateBookedCounts(date: string): Promise<Record<string, number>> {
  if (firebaseEnabled && db) {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('date', '==', date),
      );
      const snapshot = await getDocs(q);
      const counts: Record<string, number> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        const time = data.time as string;
        const size = data.party_size as number;
        if (time && typeof size === 'number') {
          counts[time] = (counts[time] || 0) + size;
        }
      });
      return counts;
    } catch (err) {
      console.warn('[bookings] getDateBookedCounts failed, using localStorage:', err);
      // fall through to localStorage
    }
  }
  // localStorage fallback — scan all stored keys for this date
  const counts: Record<string, number> = {};
  try {
    const prefix = `${LOCAL_STORAGE_PREFIX}${date}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const time = key.slice(prefix.length);
        counts[time] = getLocalStorageBookings(date, time);
      }
    }
  } catch {
    // ignore
  }
  return counts;
}

/**
 * Subscribe to real-time updates of booked counts for a given date.
 * The callback is called immediately with the current counts, and again
 * whenever any booking for that date is added/modified/removed.
 *
 * Returns an unsubscribe function (call it on unmount).
 *
 * If Firebase is not configured, the callback is called once with the
 * localStorage-derived counts and no subscription is set up.
 */
export function subscribeToDateBookings(
  date: string,
  callback: (counts: Record<string, number>) => void,
): () => void {
  if (firebaseEnabled && db) {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('date', '==', date),
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const counts: Record<string, number> = {};
          snapshot.forEach((d) => {
            const data = d.data();
            const time = data.time as string;
            const size = data.party_size as number;
            if (time && typeof size === 'number') {
              counts[time] = (counts[time] || 0) + size;
            }
          });
          callback(counts);
        },
        (err) => {
          console.warn('[bookings] subscribe failed, falling back to one-shot read:', err);
          // Fallback: one-shot read
          getDateBookedCounts(date).then(callback);
        },
      );
      return unsub;
    } catch (err) {
      console.warn('[bookings] subscribe setup failed:', err);
    }
  }
  // localStorage fallback: read once, no real-time updates
  getDateBookedCounts(date).then(callback);
  return () => {};
}

/**
 * Returns true if Firebase is configured and being used for booking storage.
 * Used by the UI to show a small "live" indicator.
 */
export function isUsingFirebase(): boolean {
  return firebaseEnabled && db !== null;
}
