"use client";
import Link from "next/link";
import { AdminGuests } from "./admin-guests";
import { event } from "@/config/event";
import { eventDate } from "@/lib/event-format";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
type Row = { id: string; name: string; attendance: string; message: string; publish_consent: boolean; moderation_status: string; created_at: string };
type Results = { rows: Row[]; count: number; stats: { total: number; hadir: number; berhalangan: number; pending: number } };
const labels: Record<string,string> = { pending: "Menunggu", approved: "Ditampilkan", hidden: "Disembunyikan" };

export function AdminPanel() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Results | null>(null); const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); const [search, setSearch] = useState(""); const [query, setQuery] = useState(""); const [page, setPage] = useState(0);
  const generation = useRef(0);
  const [tab,setTab] = useState("guests");
  const expire = useCallback(() => { setUser(null); setData(null); setNotice("Sesi berakhir. Silakan masuk kembali."); }, []);
  useEffect(() => { fetch("/api/admin/session", { cache: "no-store" }).then(async r => { const d = await r.json(); if (r.ok) setUser(d.user); else if (r.status !== 401) setNotice(d.error); }).catch(() => setNotice("Koneksi belum tersedia. Silakan coba masuk kembali.")).finally(() => setChecking(false)); }, []);
  const load = useCallback(async () => {
    const current = ++generation.current; setLoading(true);
    try {
      const response = await fetch(`/api/admin/responses?${new URLSearchParams({ page: String(page), filter, q: query })}`, { cache: "no-store" });
      const result = await response.json(); if (current !== generation.current) return;
      if (response.status === 401) { setUser(null); setData(null); }
      if (!response.ok) throw new Error(result.error);
      setData(result);
    } catch (error) { if (current === generation.current) { setData(null); setNotice(error instanceof Error ? error.message : "Data gagal dimuat."); } }
    finally { if (current === generation.current) setLoading(false); }
  }, [page, filter, query]);
  useEffect(() => { if (user) void load(); return () => { generation.current++; }; }, [user, load]);
  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    try { const r = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setPassword(""); setUser(d.user); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Login gagal. Coba lagi."); } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try { const r = await fetch("/api/admin/session", { method: "DELETE" }); if (!r.ok) throw new Error(); generation.current++; setUser(null); setData(null); setNotice(""); }
    catch { setNotice("Belum dapat keluar. Silakan coba lagi."); } finally { setBusy(false); }
  }
  async function moderate(row: Row, status: string) {
    setBusy(true); setNotice("");
    try { const r = await fetch("/api/admin/responses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, status }) }); const d = await r.json(); if (r.status === 401) { setUser(null); setData(null); } if (!r.ok) throw new Error(d.error); setNotice(`Ucapan ${row.name}: ${labels[status].toLowerCase()}.`); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Perubahan gagal disimpan."); } finally { setBusy(false); }
  }
  if (checking) return <main className="admin-shell admin-loading"><p role="status">Membuka ruang pengelola…</p></main>;
  const brand = <div className="admin-brand"><p className="admin-kicker">Pengelola undangan</p><h1>{event.name}</h1></div>;
  if (!user) return <main className="admin-shell admin-login"><header className="admin-top">{brand}<Link href="/undangan">Lihat undangan</Link></header><div className="admin-login-form"><p className="admin-kicker">Selamat datang</p><h2>Kelola hari bahagia</h2><p>Masuk menggunakan akun pengelola yang sudah disiapkan.</p><form onSubmit={login}><label>Email pengelola<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>Kata sandi<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="button" disabled={busy}>{busy ? "Memeriksa…" : "Masuk ke panel"}</button></form><p className="admin-notice" role="status">{notice}</p><p className="admin-help">Gunakan akun yang telah diberi akses oleh pemilik undangan. Sesi berlaku maksimal satu jam.</p></div></main>;
  return <main className="admin-shell admin-dashboard">
    <header className="admin-top">{brand}<div className="admin-account"><span>Masuk sebagai {user.email}</span><Link href="/undangan" target="_blank" rel="noopener noreferrer">Lihat undangan</Link><button type="button" onClick={logout} disabled={busy}>Keluar</button></div></header>
    <section className="admin-heading"><h2>Ringkasan acara</h2><button className="button button-outline" onClick={() => { setNotice(""); void load(); }} disabled={loading || busy}>Muat ulang</button></section>
    <p className="admin-event"><strong>{event.name}</strong> · {eventDate}<span>Khataman Al-Qur’an</span></p>
    <div className="admin-stats">{([["total","Balasan diterima"],["hadir","Insya Allah hadir"],["berhalangan","Berhalangan"],["pending","Ucapan perlu ditinjau"]] as const).map(([key,label]) => <article key={key}><strong>{data ? data.stats[key] : "—"}</strong><p>{label}</p></article>)}</div><p className="admin-help">Angka kehadiran dihitung per balasan tamu / keluarga, bukan jumlah orang.</p>
    <nav className="admin-tabs" aria-label="Kelola undangan"><button aria-pressed={tab==="guests"} onClick={()=>setTab("guests")}>Daftar tamu</button><button aria-pressed={tab==="responses"} onClick={()=>{setTab("responses");void load();}}>Ucapan &amp; doa</button></nav>
    {tab==="guests" && <AdminGuests onExpired={expire} />}
    {tab==="responses" && <section className="admin-inbox" aria-label="Daftar balasan"><h2 className="admin-panel-title">Balasan tamu &amp; moderasi ucapan</h2><div className="admin-toolbar"><form onSubmit={e => { e.preventDefault(); setPage(0); setQuery(search); }}><label htmlFor="admin-search">Cari nama tamu</label><input id="admin-search" placeholder="Cari nama tamu / keluarga…" value={search} onChange={e => setSearch(e.target.value)} /><button type="submit">Cari</button></form><label><span>Filter balasan</span><select value={filter} onChange={e => { setPage(0); setFilter(e.target.value); }}><option value="all">Semua balasan</option><option value="hadir">Insya Allah hadir</option><option value="berhalangan">Berhalangan</option><option value="pending">Menunggu moderasi</option><option value="approved">Ditampilkan</option><option value="hidden">Disembunyikan</option></select></label></div>
      <p className="admin-notice" role="status">{notice}</p>
      {loading ? <p className="admin-empty" role="status">Memuat balasan…</p> : !data ? <p className="admin-empty">Data belum tersedia. Gunakan tombol Muat ulang untuk mencoba lagi.</p> : data.rows.length === 0 ? <div className="admin-empty"><h2>Belum ada balasan di sini.</h2><p>Balasan tamu akan muncul setelah undangan dikirim, atau coba ubah pencarian dan filter.</p></div> : <div className="admin-rows">{data.rows.map(row => <article className="admin-response" key={row.id}><div className="admin-response-head"><div><h2>{row.name}</h2><p>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(row.created_at))} WITA</p></div><span className={`admin-attendance ${row.attendance}`}>{row.attendance === "hadir" ? "Insya Allah hadir" : "Berhalangan"}</span></div><p className="admin-message">{row.message || "Tidak menyertakan ucapan."}</p><div className="admin-response-foot"><p><span className={`admin-badge ${row.moderation_status}`}>{labels[row.moderation_status]}</span>{row.publish_consent ? "Izin publikasi diberikan" : "Pribadi · tanpa izin publikasi"}</p><div><button disabled={busy || !row.publish_consent || !row.message.trim() || row.moderation_status === "approved"} onClick={() => void moderate(row,"approved")}>Tampilkan</button><button disabled={busy || row.moderation_status === "hidden"} onClick={() => void moderate(row,"hidden")}>Sembunyikan</button>{row.moderation_status !== "pending" && <button disabled={busy} onClick={() => void moderate(row,"pending")}>Tinjau ulang</button>}</div></div></article>)}</div>}
      {data && <nav className="admin-pagination" aria-label="Halaman balasan"><span>{data.count} balasan · Halaman {page+1}</span><div><button disabled={page===0 || loading} onClick={() => setPage(page-1)}>Sebelumnya</button><button disabled={(page+1)*25>=data.count || loading} onClick={() => setPage(page+1)}>Berikutnya</button></div></nav>}
    </section>}<footer className="admin-footer">Keluarga Mulfi Akil &amp; Isniani <span>Ruang pengelola Al-Habsy</span></footer>
  </main>;
}
