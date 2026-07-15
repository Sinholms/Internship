// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = isOpen ? 'menu' : 'close';
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (!header) return;
    if (window.scrollY > 20) {
        header.classList.add('shadow-lg');
    } else {
        header.classList.remove('shadow-lg');
    }
});

// Theme toggle - robust, no className wipe
const htmlEl = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIconLight = document.getElementById('theme-icon-light');
const themeIconDark = document.getElementById('theme-icon-dark');

function resolveTheme() {
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {}
    // fallback to current html class or media query
    if (htmlEl.classList.contains('dark')) return 'dark';
    if (htmlEl.classList.contains('light')) return 'light';
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
}

function getCurrentTheme() {
    return htmlEl.classList.contains('dark') ? 'dark' : 'light';
}

function updateThemeIcon() {
    const isDark = getCurrentTheme() === 'dark';
    if (themeIconLight) {
        themeIconLight.classList.toggle('hidden', isDark);
        themeIconLight.setAttribute('aria-hidden', String(isDark));
    }
    if (themeIconDark) {
        themeIconDark.classList.toggle('hidden', !isDark);
        themeIconDark.setAttribute('aria-hidden', String(!isDark));
    }
    if (themeToggle) themeToggle.setAttribute('aria-label', isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
}

function applyTheme(theme) {
    htmlEl.classList.remove('light', 'dark');
    htmlEl.classList.add(theme);
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {}
    updateThemeIcon();
}

// Sync class if inline script didn't run or was blocked (e.g. CSP stripped inline script)
try {
    const expected = resolveTheme();
    if (!htmlEl.classList.contains(expected)) {
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(expected);
    }
} catch (e) {}

updateThemeIcon();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    });
}

// Expose for inline usage / testing
if (typeof window !== 'undefined') {
    window.__applyTheme = applyTheme;
    window.__getCurrentTheme = getCurrentTheme;
}
