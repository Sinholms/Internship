"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import logoImg from '@/assets/logo-kominfo.png';
import { adaptMenuItems, DEFAULT_HEADER_NAV_ITEMS, type HeaderNavItem } from '@/lib/adaptMenuItems';

const ACTIVE_DESKTOP = 'text-primary dark:text-secondary-container border-b-2 border-primary dark:border-secondary-container pb-1';
const INACTIVE_DESKTOP = 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed';
const ACTIVE_MOBILE = 'text-primary bg-primary-fixed';
const INACTIVE_MOBILE = 'text-on-surface-variant hover:bg-surface-subtle';

function isActive(currentPath: string, matchList: readonly string[]): boolean {
  const lower = currentPath.toLowerCase();
  return matchList.some(m => {
    const ml = m.toLowerCase();
    if (ml === '/') return lower === '/' || lower === '/index.html' || lower.endsWith('/index');
    return lower.includes(ml);
  });
}

export default function Header() {
  const [navItems, setNavItems] = useState<readonly HeaderNavItem[]>(DEFAULT_HEADER_NAV_ITEMS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname() || '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/menu-items', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`Menu request failed with status ${response.status}`);
        return response.json();
      })
      .then(payload => setNavItems(adaptMenuItems(payload)))
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (error instanceof Error) {
          console.warn(`[Header] ${error.message}; using static navigation`);
          return;
        }
        console.warn('[Header] Menu request failed; using static navigation');
      });

    return () => controller.abort();
  }, []);

  return (
    <header
      id="site-header"
      className={`sticky top-0 w-full z-50 bg-surface-white dark:bg-surface-container-highest shadow-md h-16 md:h-20 transition-all duration-300 ease-in-out ${scrolled ? 'shadow-lg' : ''}`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-container-max mx-auto h-full">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-3 md:gap-4">
            <img alt="Logo Dinkominfo" className="h-10 md:h-12 object-contain" src={typeof logoImg === 'string' ? logoImg : logoImg.src} />
            <div className="hidden lg:block">
              <h1 className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed leading-none">Dinkominfo</h1>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Kabupaten Pekalongan</p>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navigasi utama">
          {navItems.map(item => {
            const active = isActive(pathname, item.match);
            if (item.children && item.children.length > 0) {
              return (
                <div key={item.path} className="relative group py-2">
                  <button
                    type="button"
                    suppressHydrationWarning
                    className={`nav-link font-label-md text-label-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
                      active ? ACTIVE_DESKTOP : INACTIVE_DESKTOP
                    }`}
                  >
                    {item.label}
                    <span className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:rotate-180">
                      expand_more
                    </span>
                  </button>
                  <div className="absolute left-0 top-full hidden group-hover:block pt-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="w-64 bg-surface-white dark:bg-[#1e2023] border border-border-light rounded-2xl shadow-xl p-2 backdrop-blur-lg">
                      {item.children.map(sub => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-label-md font-label-md text-on-surface hover:bg-surface-container-low hover:text-primary dark:hover:text-primary transition-all group/sub"
                        >
                          <span>{sub.label}</span>
                          <span className="material-symbols-outlined text-sm opacity-0 group-hover/sub:opacity-100 transition-opacity">
                            chevron_right
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link font-label-md text-label-md transition-colors duration-200 ${active ? ACTIVE_DESKTOP : INACTIVE_DESKTOP}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button aria-label="Cari" suppressHydrationWarning className="p-2 rounded-full hover:bg-surface-subtle transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>
          <button
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            role="switch"
            aria-checked={theme === 'dark'}
            id="theme-toggle"
            onClick={toggleTheme}
            suppressHydrationWarning
            className="p-2 rounded-full hover:bg-surface-subtle transition-colors"
          >
            <span
              className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-primary' : 'bg-surface-subtle'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-surface-white shadow transition-transform duration-200 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
              >
                <span className="material-symbols-outlined text-primary text-[18px] leading-none">
                  {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                </span>
              </span>
            </span>
          </button>
          <button aria-label="Buka menu" id="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)} suppressHydrationWarning className="md:hidden p-2 rounded-full hover:bg-surface-subtle transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      <nav id="mobile-menu" className={`${mobileOpen ? '' : 'hidden'} md:hidden bg-surface-white border-t border-border-light`} aria-label="Navigasi mobile">
        <div className="px-4 py-4 space-y-1">
          {navItems.map(item => {
            const active = isActive(pathname, item.match);
            if (item.children && item.children.length > 0) {
              return (
                <div key={item.path} className="space-y-1 py-1">
                  <div className="px-4 py-2 font-label-md text-label-md font-bold text-primary dark:text-primary-fixed flex items-center gap-1">
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                  <div className="pl-4 space-y-1 border-l-2 border-primary/20 ml-4">
                    {item.children.map(sub => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className="nav-mobile-link block px-4 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-mobile-link block px-4 py-3 rounded-lg font-label-md text-label-md ${active ? ACTIVE_MOBILE : INACTIVE_MOBILE}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
