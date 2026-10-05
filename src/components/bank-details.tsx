"use client";

import { useState } from "react";
import { bankAccounts } from "@/config/event";

export function BankDetails() {
  const [notice, setNotice] = useState("");
  if (!bankAccounts.length) return <div className="bank-pending"><span className="small-label">Informasi rekening</span><p>Detail rekening belum tersedia.</p><span>Terima kasih atas perhatian dan doa baik Anda.</span></div>;
  return <div className="bank-accounts">{bankAccounts.map((account) => <div className="bank-account" key={`${account.bank}-${account.number}`}><span className="bank-card-ornament" aria-hidden="true" /><p className="bank-name">{account.bank}</p><p className="bank-number">{account.number}</p><p className="bank-owner"><span>Atas nama</span>{account.holder}</p><button type="button" className="button button-outline bank-copy" disabled={account.placeholder} onClick={async () => {
    try { await navigator.clipboard.writeText(account.number); setNotice(`Nomor rekening ${account.bank} berhasil disalin.`); }
    catch { setNotice("Nomor belum dapat disalin otomatis. Silakan pilih dan salin nomor rekening di atas."); }
  }}>Salin nomor</button>{account.placeholder && <span className="bank-example">Contoh rekening</span>}</div>)}<p role="status" className="form-status">{notice}</p></div>;
}
