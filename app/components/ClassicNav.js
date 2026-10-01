'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SafuuMark } from './SafuuMark';
import { TelegramButton } from './ReportButtons';

const links = [
  ['/#how', 'How it works'],
  ['/#agencies', 'Agencies'],
  ['/transparency', 'Wall'],
  ['/tracker', 'Track a report'],
  ['/faq', 'FAQ'],
  ['/about', 'About'],
];

export default function ClassicNav({ active }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef();
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'hashchange' || event.key === 'Escape') {
        setOpen(false);
        if (event.key === 'Escape') toggle.current?.focus();
      }
    };
    window.addEventListener('hashchange', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('hashchange', close);
      window.removeEventListener('keydown', close);
    };
  }, []);
  const renderLink = ([href, label]) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      aria-current={href === `/${active}` ? 'page' : undefined}
    >
      {label}
    </Link>
  );
  return (
    <header className="classic-nav">
      <Link href="/" className="classic-brand" aria-label="Safuu home">
        <SafuuMark size={28} tile />
        <span>
          SAFUU<small>INTEL · SAFUU.NET</small>
        </span>
      </Link>
      <nav className="classic-desktop-nav" aria-label="Main navigation">
        {links.map(renderLink)}
      </nav>
      <div className="classic-nav-actions">
        <Link className="classic-gold-button" href="/report">
          File a report
        </Link>
        <TelegramButton text="Telegram" size="sm" />
        <button
          ref={toggle}
          className={`classic-menu-toggle ${open ? 'open' : ''}`}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="classic-mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <nav id="classic-mobile-menu" className="classic-mobile-nav" aria-label="Mobile navigation">
          {links.map(renderLink)}
          <Link href="/report" onClick={() => setOpen(false)}>
            File a report
          </Link>
          <Link href="/privacy" onClick={() => setOpen(false)}>
            Privacy & safety
          </Link>
        </nav>
      )}
    </header>
  );
}
