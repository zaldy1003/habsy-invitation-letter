import { event } from "@/config/event";

const date = new Date(event.startsAt);
const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: event.timezone, ...options }).format(date);

export const eventDate = format({ day: "numeric", month: "long", year: "numeric" });
export const eventDay = format({ weekday: "long" });
export const eventYear = format({ year: "numeric" });
export const eventClock = format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).replace(".", ":");
