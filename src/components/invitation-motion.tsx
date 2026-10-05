"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function InvitationMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/admin") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const animation = entry.target.animate([
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 2000, easing: "cubic-bezier(.22,.45,.25,1)" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.06 });
    document.querySelectorAll(".cover-frame, .invitation-session > div, .footer").forEach(el => observer.observe(el));
    const stop = () => { observer.disconnect(); animations.forEach(a => a.cancel()); };
    preference.addEventListener("change", stop);
    return () => { stop(); preference.removeEventListener("change", stop); };
  }, [pathname]);
  return null;
}
