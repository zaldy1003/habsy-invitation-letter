"use client";

import Image from "next/image";
import { useState } from "react";

type Props = { src: string; alt: string; width: number; height: number; sizes: string; className: string; eager?: boolean };

export function InvitationPhoto({ eager = false, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const frameStyle = { aspectRatio: `${props.width} / ${props.height}` };
  if (failed) return <div className={`${props.className} photo-fallback`} style={frameStyle} role="group" aria-label={props.alt}><p>Foto belum dapat dimuat.</p><button className="button button-outline" type="button" onClick={() => { setAttempt((value) => value + 1); setFailed(false); }}>Coba lagi</button></div>;
  // Retry the original local asset with a fresh URL: WebKit caches failed image requests.
  const source = attempt > 0 ? `${props.src}?retry=${attempt}` : props.src;
  return <div className={props.className} style={frameStyle}><Image src={source} alt={props.alt} sizes={props.sizes} fill key={attempt} unoptimized={attempt > 0} loading={eager ? "eager" : "lazy"} style={{ objectFit: "cover" }} onError={() => setFailed(true)} /></div>;
}
