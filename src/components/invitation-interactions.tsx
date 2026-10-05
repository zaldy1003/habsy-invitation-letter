"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { invitationToken } from "./private-response";
import { usePathname } from "next/navigation";
import { event } from "@/config/event";
import { getCountdown } from "@/lib/countdown";
import { eventClock, eventDate } from "@/lib/event-format";
export { Guestbook } from "./guestbook";
import { Ornament } from "./ornaments";

export function OpenInvitation() {
  const [href,setHref] = useState("/undangan");
  useEffect(() => { const token=invitationToken(); if(token!==null)setHref(`/undangan?guest=${encodeURIComponent(token)}`); }, []);
  return <Link className="button open-button" href={href} onClick={() => {
    window.dispatchEvent(new Event("invitation:open"));
  }}>Buka Undangan</Link>;
}

export function Countdown() {
  const [remaining, setRemaining] = useState<number[] | null>(null);
  useEffect(() => {
    const update = () => setRemaining(getCountdown(Date.now()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);
  const ended = remaining?.every((value) => value === 0);
  return <div className="countdown-card"><Ornament name="rosetteSmall" /><h2 className="eyebrow">{ended ? "Hari bahagia telah tiba" : "Menuju Hari Bahagia"}</h2><div className="countdown" role="timer" aria-label={`Waktu menuju ${eventDate} pukul ${eventClock} WITA`}>{["Hari", "Jam", "Menit", "Detik"].map((label, index) => <div className="countdown-unit" key={label}><span className="countdown-number">{remaining ? String(remaining[index]).padStart(2, "0") : "—"}</span><span className="countdown-label">{label}</span></div>)}</div></div>;
}

export function AudioControl() {
  const pathname = usePathname();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (pathname !== "/undangan") audio.current?.pause();
  }, [pathname]);

  useEffect(() => {
    const start = () => {
      if (event.musicUrl && audio.current) {
        audio.current.volume = 1;
        void audio.current.play().catch(() => setNotice("Audio belum dapat diputar. Tekan tombol audio untuk mencoba lagi."));
      }
    };
    const dismiss = (e: KeyboardEvent) => { if (e.key === "Escape") setNotice(""); };
    window.addEventListener("invitation:open", start);
    window.addEventListener("keydown", dismiss);
    return () => { window.removeEventListener("invitation:open", start); window.removeEventListener("keydown", dismiss); };
  }, []);

  function toggle() {
    if (!event.musicUrl) { setNotice(notice ? "" : "Musik belum tersedia untuk undangan ini."); return; }
    if (!audio.current) return;
    if (playing) audio.current.pause();
    else { if (audio.current.error) audio.current.load(); audio.current.volume = 1; void audio.current.play().catch(() => setNotice("Audio gagal diputar. Silakan coba lagi.")); }
  }

  return <aside className="audio-control" aria-label="Audio undangan" hidden={pathname !== "/undangan"}>
    {event.musicUrl && <audio ref={audio} src={event.musicUrl} loop preload="none" onPlay={() => { setPlaying(true); setNotice(""); }} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setNotice("Audio tidak dapat dimuat. Silakan coba lagi."); }} />}
    {notice && <div className="audio-notice" role="status">{notice}<button type="button" aria-label="Tutup pemberitahuan audio" onClick={() => setNotice("")}>×</button></div>}
    <button type="button" className={`audio-button ${playing ? "is-playing" : ""}`} aria-label={playing ? "Jeda musik" : "Putar musik"} aria-pressed={playing} onClick={toggle}><Ornament name="audio" />{playing && <span className="playing-dot" aria-hidden="true" />}</button>
  </aside>;
}
