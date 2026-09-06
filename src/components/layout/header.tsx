"use client";

import { useState } from "react";
import { ArrowUpRight, Github, Menu, X } from "lucide-react";

const links = [{ href: "#about", label: "Về mình" }, { href: "#skills", label: "Kỹ năng" }, { href: "#contact", label: "Hợp tác" }];
export function Header({ siteName }: { siteName: string; logo?: string }) {
  const [open, setOpen] = useState(false);
  return <header className="floating-header">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:bg-black focus:p-4">Đến nội dung chính</a>
    <div className="nav-shell">
      <a href="#home" className="wordmark" aria-label={siteName} onClick={() => setOpen(false)}>Xnha<span>.</span>Dev</a>
      <nav className="desktop-nav" aria-label="Điều hướng">{links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
      <a href="https://github.com/XuanNha204" className="nav-cta" target="_blank" rel="noopener noreferrer"><Github size={16} aria-hidden />GitHub</a>
      <button className="mobile-menu-button" aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Điều hướng di động" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      {links.map((link) => <a href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={16} /></a>)}
    </nav>}
    <div className="scroll-progress" aria-hidden="true" />
  </header>;
}
