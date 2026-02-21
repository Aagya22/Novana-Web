"use client";

import { useEffect, useRef } from "react";
import { API } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";

type ReminderNotification = {
  _id: string;
  title: string;
  type: "journal" | "mood" | "exercise";
  deliveredAt: string;
  scheduledFor: string;
  readAt?: string;
};

type ToastState = {
  shownCount: number; // 0..3
  scheduledFor: string;
  title: string;
  type: "journal" | "mood" | "exercise";
};

const TOAST_OFFSETS_MIN = [0, 15, 20] as const;
const STORAGE_KEY = "reminder_toast_state_v1";
const SHOW_WINDOW_MS = 2 * 60_000; // only show when within 2 minutes of scheduled repeat

function safeParseDateMs(value: string | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function loadState(): Record<string, ToastState> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveState(next: Record<string, ToastState>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function toastLabel(type: ReminderNotification["type"]) {
  return type === "journal" ? "Journal" : type === "mood" ? "Mood" : "Exercise";
}

function playReminderBeep() {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    // A noticeable triple-beep pattern.
    const now = ctx.currentTime;
    const pattern = [880, 740, 880];
    const beepDur = 0.22;
    const gap = 0.07;

    for (let i = 0; i < pattern.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = pattern[i];
      osc.connect(gain);

      const t0 = now + i * (beepDur + gap);
      const t1 = t0 + beepDur;

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t1);

      osc.start(t0);
      osc.stop(t1);
    }

    const total = pattern.length * (beepDur + gap);
    window.setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    }, Math.ceil(total * 1000) + 200);
  } catch {
    // Many browsers block autoplay audio until a user gesture; ignore failures.
  }
}

export default function ReminderToastPoller() {
  const stateRef = useRef<Record<string, ToastState>>({});
  const isRunningRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    // Hydrate persisted state once.
    try {
      stateRef.current = loadState();
    } catch {
      stateRef.current = {};
    }

    const maybeShowOneToastFor = (n: ReminderNotification, nowMs: number) => {
      if (!n?._id) return false;
      if (n.readAt) return false;

      const existing = stateRef.current[n._id];
      const shownCount = Math.max(0, Math.min(3, existing?.shownCount ?? 0));
      if (shownCount >= 3) return false;

      const baseMs = safeParseDateMs(n.scheduledFor) ?? safeParseDateMs(n.deliveredAt) ?? nowMs;
      const nextOffsetMin = TOAST_OFFSETS_MIN[shownCount] ?? TOAST_OFFSETS_MIN[TOAST_OFFSETS_MIN.length - 1];
      const nextAtMs = baseMs + nextOffsetMin * 60_000;

      // Only show within a small window to avoid "catch-up" spam.
      if (nowMs < nextAtMs || nowMs > nextAtMs + SHOW_WINDOW_MS) return false;

      const scheduled = n.scheduledFor
        ? new Date(n.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

      playReminderBeep();
      showToast(`${toastLabel(n.type)} reminder${scheduled ? ` (${scheduled})` : ""}: ${n.title}`, "info", "top", 12_000);

      const next: ToastState = {
        shownCount: shownCount + 1,
        scheduledFor: n.scheduledFor,
        title: n.title,
        type: n.type,
      };
      stateRef.current = { ...stateRef.current, [n._id]: next };
      saveState(stateRef.current);
      return true;
    };

    const reconcileStateWith = (notifications: ReminderNotification[]) => {
      const byId = new Map<string, ReminderNotification>();
      for (const n of notifications) {
        if (n?._id) byId.set(n._id, n);
      }

      const next: Record<string, ToastState> = {};
      for (const [id, s] of Object.entries(stateRef.current)) {
        const n = byId.get(id);
        if (!n) continue; // deleted from history
        if (n.readAt) continue; // read => stop repeating
        if ((s.shownCount ?? 0) >= 3) continue; // already repeated enough
        next[id] = s;
      }
      stateRef.current = next;
      saveState(next);
    };

    const poll = async () => {
      if (disposed) return;
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const token = window.localStorage.getItem("token");
        if (!token) return;

        // 1) Trigger delivery creation for any due reminders (returns *newly* created notifications).
        const dueRes = await fetch(API.REMINDERS.DUE(2), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const duePayload = await dueRes.json();
        const newlyDelivered: ReminderNotification[] = Array.isArray(duePayload?.data) ? duePayload.data : [];

        if (newlyDelivered.length > 0) {
          window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
        }

        // 2) Fetch notification history so we can stop repeats when read/deleted.
        const listRes = await fetch(API.REMINDERS.NOTIFICATIONS(50), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listPayload = await listRes.json();
        if (!listPayload?.success || !Array.isArray(listPayload?.data)) return;

        const history: ReminderNotification[] = listPayload.data;
        const unread = history.filter((n) => n && !n.readAt);

        // Ensure we track any new unread notifications in state.
        let changed = false;
        for (const n of unread) {
          if (!n?._id) continue;
          if (!stateRef.current[n._id]) {
            stateRef.current[n._id] = {
              shownCount: 0,
              scheduledFor: n.scheduledFor,
              title: n.title,
              type: n.type,
            };
            changed = true;
          }
        }
        if (changed) saveState(stateRef.current);

        // Cleanup any read/deleted/finished notifications.
        reconcileStateWith(history);

        // 3) Show at most one toast per notification per tick, based on 0/15/20 schedule.
        const nowMs = Date.now();
        for (const n of unread) {
          const didShow = maybeShowOneToastFor(n, nowMs);
          if (didShow) {
            window.dispatchEvent(new CustomEvent("reminder_notifications_updated"));
          }
        }
      } catch {
        // silent
      } finally {
        isRunningRef.current = false;
      }
    };

    poll();
    const id = window.setInterval(poll, 60_000);
    return () => {
      disposed = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
