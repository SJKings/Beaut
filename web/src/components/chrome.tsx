import Link from "next/link";
import { SITE } from "@/lib/site";

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M4 2.6v18.8c0 .4.4.6.7.4L21 12.4c.3-.2.3-.6 0-.8L4.7 2.2c-.3-.2-.7 0-.7.4z" />
  </svg>
);

/** "Get it on Google Play" pill. */
export function PlayButton({ className = "" }: { className?: string }) {
  return (
    <a href={SITE.playStore} className={`btn btn-pink ${className}`} target="_blank" rel="noreferrer">
      <PlayIcon />
      Get it on Google Play
    </a>
  );
}

/** Sticky header. On inner pages the section links point back to the home page. */
export function Header({ home = false }: { home?: boolean }) {
  const at = (id: string) => (home ? `#${id}` : `/#${id}`);
  return (
    <header className="header">
      <div className="wrap header-row">
        <Link href={home ? "#top" : "/"} className="logo">
          Beaut<span className="dot">.</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <a className="nav-link" href={at("how")}>
            How it works
          </a>
          <a className="nav-link" href={at("code")}>
            Booking code
          </a>
          <a className="nav-link" href={at("studios")}>
            For studios
          </a>
          <a className="nav-cta" href={at("get")}>
            Get the app
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <Link href="/" className="logo">
          Beaut<span className="dot">.</span>
        </Link>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={`mailto:${SITE.email}`}>Contact</a>
        </div>
        <span>© 2026 {SITE.business}</span>
      </div>
    </footer>
  );
}
