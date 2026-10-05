import { event } from "@/config/event";

export function getCountdown(now: number) {
  const remaining = Math.max(0, Math.floor((new Date(event.startsAt).getTime() - now) / 1000));
  return [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
}
