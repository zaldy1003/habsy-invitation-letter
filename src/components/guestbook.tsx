"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PrivateResponse, invitationToken } from "./private-response";
import { Ornament } from "./ornaments";

type Draft = { name: string; attendance: "hadir" | "berhalangan"; message: string; publishConsent: boolean };
type Wish = { id: string; name: string; message: string; created_at: string };
const emptyDraft: Draft = { name: "", attendance: "hadir", message: "", publishConsent: true };
const draftKey = "habsy-response-draft-v3";

export function Guestbook() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [feedState, setFeedState] = useState<"loading" | "ready" | "error">("loading");
  const requestId = useRef("");
  const sendingRef = useRef(false);
  const website = useRef<HTMLInputElement>(null);

  async function loadWishes() {
    setFeedState("loading");
    try {
      const response = await fetch("/api/guestbook", { cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      const data = await response.json(); setWishes(data.wishes); setFeedState("ready");
    } catch { setFeedState("error"); }
  }
  useEffect(() => {
    setToken(invitationToken());
    void loadWishes();
    try {
      const value = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (value && typeof value.name === "string" && typeof value.message === "string" && ["hadir", "berhalangan"].includes(value.attendance)) {
        setDraft({ name: value.name.slice(0,160), message: value.message.slice(0,1000), attendance: value.attendance, publishConsent: true });
        if (typeof value.requestId === "string") requestId.current = value.requestId;
      }
    } catch { /* Optional local draft. */ }
  }, []);

  function edit(next: Draft) {
    setDraft(next); setSaved(false); setStatus(""); requestId.current = "";
    try { localStorage.setItem(draftKey, JSON.stringify(next)); } catch { /* Submission does not require storage. */ }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (sendingRef.current || saved) return;
    const clean = { ...draft, name: draft.name.trim(), message: draft.message.trim() };
    if (!clean.name) { setStatus("Mohon isi nama tamu atau keluarga."); return; }
    requestId.current ||= crypto.randomUUID();
    try { localStorage.setItem(draftKey, JSON.stringify({ ...clean, requestId: requestId.current })); } catch { /* Optional local draft. */ }
    sendingRef.current = true; setSending(true); setStatus("");
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...clean, requestId: requestId.current, website: website.current?.value || "" }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok || data.saved !== true) throw new Error(data.error || "Balasan belum dapat dikonfirmasi. Silakan coba kembali.");
      setSaved(true);
      setStatus("Terima kasih. Konfirmasi kehadiran dan doa Anda telah tersimpan." + (clean.publishConsent && clean.message ? " Ucapan akan tampil setelah disetujui keluarga." : ""));
      try { localStorage.removeItem(draftKey); } catch { /* Optional local draft. */ }
    } catch (error) {
      setStatus(error instanceof Error && error.name === "Error" ? error.message : "Koneksi terputus. Coba kirim kembali; balasan yang sama tidak akan digandakan.");
    } finally { sendingRef.current = false; setSending(false); }
  }
  function clear() {
    try { localStorage.removeItem(draftKey); } catch { /* Optional local draft. */ }
    setDraft(emptyDraft); requestId.current = ""; setSaved(false); setStatus("Draf pada perangkat ini telah dihapus.");
  }
  return <div className="guestbook-card">
    <h2 className="icon-heading" id="guestbook-title"><Ornament name="envelope" />Konfirmasi Kehadiran &amp; Doa</h2>
    <p className="form-intro">Mohon konfirmasikan kehadiran Anda untuk membantu kelancaran jamuan silaturahmi.</p>
    {token === undefined ? <p className="form-status">Memuat formulir…</p> : token !== null ? <PrivateResponse token={token} /> : <form onSubmit={submit} aria-busy={sending}>
      <fieldset className="response-fields" disabled={sending || saved}>
        <div className="form-field"><label className="small-label" htmlFor="guest-name">Nama tamu / keluarga</label><input id="guest-name" name="name" autoComplete="name" placeholder="Contoh: Keluarga H. Sulaiman" required maxLength={160} value={draft.name} onChange={e => edit({ ...draft, name: e.target.value })} /></div>
        <fieldset className="form-field"><legend className="small-label">Konfirmasi kehadiran</legend><div className="attendance-options">{([{ value: "hadir", label: "Insya Allah Hadir" }, { value: "berhalangan", label: "Berhalangan" }] as const).map(option => <label className="attendance-option" key={option.value}><input type="radio" name="attendance" value={option.value} checked={draft.attendance === option.value} onChange={() => edit({ ...draft, attendance: option.value })} /><span className="radio-indicator" aria-hidden="true">{draft.attendance === option.value && <Ornament name="radio" />}</span><span>{option.label}</span></label>)}</div></fieldset>
        <div className="form-field"><label className="small-label" htmlFor="guest-message">Untaian doa &amp; ucapan</label><textarea id="guest-message" name="message" rows={3} placeholder="Tuliskan ucapan selamat dan doa untuk Al-Habsy..." maxLength={1000} value={draft.message} onChange={e => edit({ ...draft, message: e.target.value })} /></div>
        <div className="form-trap" aria-hidden="true"><label htmlFor="guest-website">Website</label><input id="guest-website" name="website" ref={website} tabIndex={-1} autoComplete="off" /></div>
      </fieldset>
      <button className="button full-width" type="submit" disabled={sending || saved}><Ornament name="send" />{sending ? "Mengirim…" : saved ? "Konfirmasi tersimpan" : "Kirim ucapan & konfirmasi"}</button>
      <p className="form-status" role="status">{status}</p>
      {!saved && (draft.name || draft.message) && <button className="text-button" type="button" disabled={sending} onClick={clear}>Hapus draf saya</button>}
    </form>}
    <div className="guestbook-feed"><h3 className="eyebrow feed-heading"><Ornament name="wishes" />Doa dari Sahabat &amp; Kerabat</h3>
      {feedState === "loading" && <p className="form-status">Memuat doa dan ucapan…</p>}
      {feedState === "error" && <p className="form-status">Doa belum dapat dimuat. <button className="text-button" type="button" onClick={() => void loadWishes()}>Coba lagi</button></p>}
      {feedState === "ready" && wishes.length === 0 && <p className="form-status">Doa yang telah disetujui keluarga akan hadir di sini.</p>}
      <div className="wishes">{wishes.map(wish => <article className="wish" key={wish.id}><div className="wish-header"><h4>{wish.name}</h4></div><p>{wish.message}</p></article>)}</div>
    </div>
  </div>;
}
