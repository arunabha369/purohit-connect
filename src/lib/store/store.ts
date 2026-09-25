"use client";

import { useSyncExternalStore } from "react";
import * as actions from "./actions";
import { ActionError, type ActionContext, type ActionOutput } from "./actions";
import { DB_VERSION, EMPTY_DB, createSeed } from "./seed";
import type { DB, Result } from "./types";

/**
 * Client-side persistence for the demo. Swap `read`/`write` (and the actions'
 * callers) for API calls to move to a real backend — the action functions
 * already contain the business rules a server would enforce.
 */
const STORAGE_KEY = "purohitconnect:db";

let state: DB | null = null;
const listeners = new Set<() => void>();
let crossTabListenerAttached = false;

function write(db: DB) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full, disabled or in private mode: keep working in memory.
  }
}

function read(): DB {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.version === DB_VERSION && Array.isArray(parsed.bookings) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    // Corrupt JSON or blocked storage: fall through to a fresh seed.
  }
  const seeded = createSeed(new Date());
  write(seeded);
  return seeded;
}

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): DB {
  if (!state) state = read();
  return state;
}

function getServerSnapshot(): DB {
  return EMPTY_DB;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!crossTabListenerAttached) {
    crossTabListenerAttached = true;
    // Keep tabs in sync (e.g. a booking made in one tab appears in another).
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      state = read();
      emit();
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

function setState(next: DB) {
  state = next;
  write(next);
  emit();
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

function makeContext(): ActionContext {
  return {
    now: new Date(),
    newId: (prefix) => (prefix === "BK" ? `BK-${randomCode(6)}` : `${prefix}-${Date.now().toString(36)}${randomCode(4).toLowerCase()}`),
  };
}

function run<I, O>(fn: (db: DB, input: I, ctx: ActionContext) => ActionOutput<O>, input: I): Result<O> {
  try {
    const current = getSnapshot();
    const out = fn(current, input, makeContext());
    if (out.db !== current) setState(out.db);
    return { ok: true, value: out.value };
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, error: error.message };
    throw error;
  }
}

/** Every state change goes through these. Each returns `{ ok, value }` or `{ ok: false, error }`. */
export const api = {
  checkSignIn: (input: Parameters<typeof actions.checkSignIn>[1]) => run(actions.checkSignIn, input),
  signIn: (input: Parameters<typeof actions.signIn>[1]) => run(actions.signIn, input),
  signOut: () => run(actions.signOut, undefined),
  resetDemo: () => run(actions.resetDemo, undefined),

  updateProfile: (input: Parameters<typeof actions.updateProfile>[1]) => run(actions.updateProfile, input),
  addAddress: (input: Parameters<typeof actions.addAddress>[1]) => run(actions.addAddress, input),
  setDefaultAddress: (id: string) => run(actions.setDefaultAddress, id),
  removeAddress: (id: string) => run(actions.removeAddress, id),
  toggleFavorite: (purohitId: string) => run(actions.toggleFavorite, purohitId),
  addMoney: (amount: number) => run(actions.addMoney, amount),

  createBooking: (input: actions.CreateBookingInput) => run(actions.createBooking, input),
  cancelBooking: (input: Parameters<typeof actions.cancelBooking>[1]) => run(actions.cancelBooking, input),
  rescheduleBooking: (input: Parameters<typeof actions.rescheduleBooking>[1]) => run(actions.rescheduleBooking, input),
  submitReview: (input: Parameters<typeof actions.submitReview>[1]) => run(actions.submitReview, input),
  markNotificationsRead: (ids?: string[]) => run(actions.markNotificationsRead, ids),

  purohitAccept: (bookingId: string) => run(actions.purohitAccept, bookingId),
  purohitDecline: (input: Parameters<typeof actions.purohitDecline>[1]) => run(actions.purohitDecline, input),
  purohitAdvance: (bookingId: string) => run(actions.purohitAdvance, bookingId),
  setAccepting: (accepting: boolean) => run(actions.setAccepting, accepting),
  toggleBlockedDate: (date: string) => run(actions.toggleBlockedDate, date),

  adminCancelBooking: (input: Parameters<typeof actions.adminCancelBooking>[1]) => run(actions.adminCancelBooking, input),
  setPurohitSuspended: (input: Parameters<typeof actions.setPurohitSuspended>[1]) => run(actions.setPurohitSuspended, input),
  setUserStatus: (input: Parameters<typeof actions.setUserStatus>[1]) => run(actions.setUserStatus, input),
  submitApplication: (input: actions.ApplicationInput) => run(actions.submitApplication, input),
  reviewApplication: (input: Parameters<typeof actions.reviewApplication>[1]) => run(actions.reviewApplication, input),
};

/** The whole database. Returns `EMPTY_DB` on the server and during hydration. */
export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function isHydratedDB(db: DB) {
  return db !== EMPTY_DB;
}
