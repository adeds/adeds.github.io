type Skin = 'ios' | 'android';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------ skin switch */

function syncToggle(skin: Skin) {
  document.querySelectorAll<HTMLButtonElement>('[data-skin-option]').forEach((btn) => {
    const on = btn.dataset.skinOption === skin;
    btn.setAttribute('aria-checked', String(on));
    btn.tabIndex = on ? 0 : -1;
  });
}

function setSkin(skin: Skin) {
  if (root.dataset.skin === skin) return;
  const apply = () => {
    root.dataset.skin = skin;
    syncToggle(skin);
    try {
      localStorage.setItem('skin', skin);
    } catch {
      /* private mode: the choice just won't persist */
    }
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reducedMotion.matches) doc.startViewTransition(apply);
  else apply();
}

syncToggle((root.dataset.skin as Skin) ?? 'ios');

document.querySelectorAll<HTMLElement>('.skin-toggle').forEach((group) => {
  group.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-skin-option]');
    if (btn) setSkin(btn.dataset.skinOption as Skin);
  });
  // Radio-group keyboard pattern: arrows move and select.
  group.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next: Skin = root.dataset.skin === 'ios' ? 'android' : 'ios';
    setSkin(next);
    group.querySelector<HTMLButtonElement>(`[data-skin-option="${next}"]`)?.focus();
  });
});

/* ------------------------------------------------ scroll-synced screens */

const phone = document.querySelector<HTMLElement>('[data-phone]');
const screens = phone ? [...phone.querySelectorAll<HTMLElement>('.screen')] : [];
const order = screens.map((s) => s.dataset.screen);
const titleEl = document.querySelector<HTMLElement>('[data-section-title]');
const sectionTitles: Record<string, string> = {
  hero: '',
  about: 'About',
  work: 'Experience',
  projects: 'Projects',
  writing: 'Writing',
  skills: 'Skills',
  contact: 'Contact',
};
let current = 'hero';

function activate(name: string) {
  if (name === current) return;
  const forward = order.indexOf(name) > order.indexOf(current);
  current = name;
  screens.forEach((s) => {
    const on = s.dataset.screen === name;
    s.classList.toggle('is-active', on);
    // Direction lets iOS push/pop and Android shared-axis read correctly.
    s.classList.toggle('is-behind', !on && order.indexOf(s.dataset.screen) < order.indexOf(name));
  });
  phone?.setAttribute('data-direction', forward ? 'forward' : 'back');
  if (titleEl) titleEl.textContent = sectionTitles[name] ?? '';
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.dataset.nav === name) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
  root.dataset.section = name;
}

const sections = document.querySelectorAll<HTMLElement>('.content > section[data-screen]');
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) activate((entry.target as HTMLElement).dataset.screen!);
    }
  },
  // A thin band just above the middle of the viewport decides the active section.
  { rootMargin: '-38% 0px -58% 0px' },
);
sections.forEach((s) => observer.observe(s));

/* ------------------------------------------------------------ live clock */

const clocks = document.querySelectorAll<HTMLElement>('[data-clock], [data-clock-big]');
function tick() {
  const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  clocks.forEach((c) => (c.textContent = t));
}
tick();
setInterval(tick, 15_000);

/* ------------------------------------------------------------------ tilt */

const device = document.querySelector<HTMLElement>('[data-tilt]');
const gyroLayer = document.querySelector<HTMLElement>('[data-gyro-layer]');
let raf = 0;

function setTilt(x: number, y: number) {
  // x, y in [-1, 1]
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    root.style.setProperty('--tilt-x', x.toFixed(3));
    root.style.setProperty('--tilt-y', y.toFixed(3));
  });
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (device && finePointer.matches) {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (reducedMotion.matches) return;
      const r = device.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      setTilt(x, y);
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => setTilt(0, 0));
}

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
const Orientation = (window as unknown as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;

function listenGyro() {
  window.addEventListener(
    'deviceorientation',
    (e) => {
      if (reducedMotion.matches || e.gamma == null || e.beta == null) return;
      // gamma: left/right [-90, 90]; beta: front/back, ~45° when held upright.
      setTilt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    },
    { passive: true },
  );
}

if (gyroLayer && !finePointer.matches && Orientation) {
  const permissionBtn = document.querySelector<HTMLButtonElement>('[data-tilt-permission]');
  if (typeof Orientation.requestPermission === 'function') {
    // iOS Safari only grants motion access from a user gesture, so offer a button.
    if (permissionBtn && !reducedMotion.matches) {
      permissionBtn.hidden = false;
      permissionBtn.addEventListener('click', async () => {
        try {
          if ((await Orientation.requestPermission!()) === 'granted') listenGyro();
        } finally {
          permissionBtn.hidden = true;
        }
      });
    }
  } else {
    listenGyro();
  }
}

/* ----------------------------------------------------------------- email */

const live = document.querySelector<HTMLElement>('[data-live]');
const emailBtn = document.querySelector<HTMLButtonElement>('[data-email]');

function address(): string | null {
  if (!emailBtn) return null;
  const u = (emailBtn.dataset.u ?? '').split('|').join('');
  const d = (emailBtn.dataset.d ?? '').split('|').join('.');
  return u && d ? `${u}@${d}` : null;
}

emailBtn?.addEventListener('click', () => {
  const a = address();
  if (a) window.location.href = `mailto:${a}`;
});

const copyBtn = document.querySelector<HTMLButtonElement>('[data-email-copy]');
const copyLabel = copyBtn?.querySelector<HTMLElement>('[data-copy-label]');
copyBtn?.addEventListener('click', async () => {
  const a = address();
  if (!a || !copyLabel) return;
  let msg = 'Copied';
  try {
    await navigator.clipboard.writeText(a);
  } catch {
    msg = a; // clipboard blocked: show the address so it can be copied by hand
  }
  copyLabel.textContent = msg;
  if (live) live.textContent = msg === 'Copied' ? 'Email address copied to clipboard' : `Email address: ${a}`;
  window.setTimeout(() => (copyLabel.textContent = 'Copy address'), 2400);
});
