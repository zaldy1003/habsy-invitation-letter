import type { Metadata, Viewport } from "next";
import { InvitationMotion } from "@/components/invitation-motion";
import { AudioControl } from "@/components/invitation-interactions";
import { event } from "@/config/event";
import { eventClock, eventDate, eventDay } from "@/lib/event-format";
import "@fontsource-variable/eb-garamond";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/plus-jakarta-sans/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `Undangan Khataman Al-Qur’an | ${event.name}`,
  description: `Undangan syukuran Khataman Al-Qur’an ${event.name}. ${eventDay}, ${eventDate}, pukul ${eventClock} WITA di ${event.venue}, Makassar.`,
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4efe5" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}<AudioControl /><InvitationMotion /></body></html>;
}
