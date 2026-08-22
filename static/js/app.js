/* Umarov-group tipidagi SPA frontend. Hash-router: #/about #/resume
   #/portfolio #/portfolio/<slug> #/thread #/thread/<slug> */

let contentEl, navTabsEl, sidebarEl;

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function nl2br(str) {
  return esc(str).replace(/\n/g, "<br>");
}

/* ---------------- Sichqoncha ortidan sekin yuruvchi kichkina iloncha ----------------
   Faqat haqiqiy sichqonchali qurilmalarda ishlaydi; sensorli ekranlarda
   umuman ishga tushmaydi. Bosh qism sichqonchani sekinlik bilan (past lerp
   koeffitsienti) ta'qib qiladi, har bir tana bo'g'ini esa oldingisini
   kuzatib, to'lqinsimon iloncha harakatini hosil qiladi. */
(function initCursorSnake() {
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SIZES = [22, 18, 15, 12, 10, 8, 6];
  const HEAD_LERP = 0.055;
  const BODY_LERP = 0.32;

  const wrap = document.createElement("div");
  wrap.className = "cursor-snake";

  const segments = SIZES.map((size, i) => {
    const el = document.createElement("div");
    el.className = "segment" + (i === 0 ? " is-head" : "");
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.marginLeft = `${-size / 2}px`;
    el.style.marginTop = `${-size / 2}px`;
    el.style.zIndex = String(SIZES.length - i);
    if (i === 0) {
      el.innerHTML = '<span class="eye left"></span><span class="eye right"></span>';
    }
    wrap.appendChild(el);
    return { el, x: 0, y: 0 };
  });
  document.body.appendChild(wrap);

  let mouseX = 0, mouseY = 0, started = false;

  window.addEventListener("mousemove", (ev) => {
    mouseX = ev.clientX;
    mouseY = ev.clientY;
    if (!started) {
      segments.forEach((seg) => { seg.x = mouseX; seg.y = mouseY; });
      started = true;
      wrap.classList.add("is-active");
    }
  });
  document.addEventListener("mouseleave", () => wrap.classList.remove("is-active"));
  document.addEventListener("mouseenter", () => { if (started) wrap.classList.add("is-active"); });

  function tick() {
    segments.forEach((seg, i) => {
      const targetX = i === 0 ? mouseX : segments[i - 1].x;
      const targetY = i === 0 ? mouseY : segments[i - 1].y;
      const lerp = i === 0 ? HEAD_LERP : BODY_LERP;
      seg.x += (targetX - seg.x) * lerp;
      seg.y += (targetY - seg.y) * lerp;
      seg.el.style.transform = `translate3d(${seg.x}px, ${seg.y}px, 0)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------------- Responsiv qayta joylashuv animatsiyasi (FLIP) ----------------
   Sidebar kontent panel yonidan uning ustiga o'tganda (980px chegarasi)
   birdaniga "sakramasin", balki eski joyidan yangi joyiga siljib
   ko'chsin — u yerdan g'oyib bo'lib bu yerda paydo bo'lmasin. Buning
   uchun FLIP texnikasi ishlatiladi: chegaradan o'tishdan oldingi holat
   (First) va o'tgandan keyingi holat (Last) orasidagi farq (Invert)
   transform sifatida darhol qo'llanadi, so'ng elastik ravishda 0'ga
   qaytariladi (Play) — natijada element haqiqatan ham joyidan siljib
   ko'chganday ko'rinadi. */
(function initSidebarReflowFlip() {
  if (!window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const TRACKED_SELECTORS = [".sidebar", ".content-panel"];
  let lastRects = new Map();
  let trackScheduled = false;

  function trackRects() {
    trackScheduled = false;
    TRACKED_SELECTORS.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) lastRects.set(sel, el.getBoundingClientRect());
    });
  }

  function scheduleTrack() {
    if (trackScheduled) return;
    trackScheduled = true;
    requestAnimationFrame(trackRects);
  }

  window.addEventListener("resize", scheduleTrack);
  trackRects();

  function flipFromLastRect(sel) {
    const el = document.querySelector(sel);
    const firstRect = lastRects.get(sel);
    if (!el || !firstRect) return;

    const lastRect = el.getBoundingClientRect();
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transition = "transform .6s var(--ease)";
      el.style.transform = "";
    });
  }

  const breakpoint = window.matchMedia("(max-width: 980px)");
  function onBreakpointCross() {
    TRACKED_SELECTORS.forEach(flipFromLastRect);
    scheduleTrack();
  }

  if (breakpoint.addEventListener) breakpoint.addEventListener("change", onBreakpointCross);
  else if (breakpoint.addListener) breakpoint.addListener(onBreakpointCross);
})();

/* ---------------- Sidebar ---------------- */
async function renderSidebar() {
  try {
    const [profile, socials] = await Promise.all([Api.profile(), Api.socialLinks()]);
    document.title = profile.display_name || "Umarov-group";

    const avatar = profile.avatar
      ? `<img src="${profile.avatar}" alt="${esc(profile.display_name)}">`
      : `<span class="avatar-placeholder">🙂</span>`;

    const rows = [];
    if (profile.email) rows.push(contactRow("email", "Email", profile.email));
    if (profile.phone) rows.push(contactRow("phone", "Phone", profile.phone));
    if (profile.birthday) rows.push(contactRow("cal", "Birthday", formatDate(profile.birthday)));
    if (profile.location) rows.push(contactRow("pin", "Location", profile.location));

    const socialsHtml = socials.length
      ? `<div class="social-row">${socials.map(s => `
          <a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.platform_display)}">
            ${socialIconSvg(s.platform)}
          </a>`).join("")}</div>`
      : "";

    sidebarEl.innerHTML = `
      <button type="button" class="show-contacts-btn" id="show-contacts-btn" aria-expanded="false">Show Contacts</button>
      <div class="sidebar-main">
        <div class="avatar-frame">${avatar}</div>
        <div class="sidebar-heading">
          <div class="profile-name">${esc(profile.display_name)}</div>
          <div class="profile-badge">${esc(profile.title)}</div>
        </div>
      </div>
      <div class="contact-panel" id="contact-panel">
        <div class="contact-info">${rows.join("")}</div>
        ${socialsHtml}
      </div>
    `;

    const toggleBtn = document.getElementById("show-contacts-btn");
    toggleBtn.addEventListener("click", () => {
      const isOpen = sidebarEl.classList.toggle("contacts-open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      toggleBtn.textContent = isOpen ? "Hide Contacts" : "Show Contacts";
    });
  } catch (e) {
    sidebarEl.innerHTML = `<p class="loading-text">Profil yuklanmadi.</p>`;
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

function formatMonthYear(iso) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch { return iso; }
}

/* Kategoriya nomidan barqaror rang tanlaydi — admin qanday nom qo'ymasin,
   bir xil kategoriya doim bir xil rangga ega bo'ladi. */
const STUDENT_PALETTE = ["#2f6bff", "#22c55e", "#a855f7", "#f97316", "#ec4899", "#06b6d4"];
function paletteColor(seed) {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return STUDENT_PALETTE[hash % STUDENT_PALETTE.length];
}

function contactRow(iconKey, label, value) {
  return `<div class="contact-row">
    <span class="contact-icon">${contactIconSvg(iconKey)}</span>
    <div><div class="contact-label">${label}</div><div class="contact-value">${esc(value)}</div></div>
  </div>`;
}

function contactIconSvg(key) {
  const icons = {
    email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 6l8 7 8-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  };
  return icons[key] || "";
}

function cardIconSvg(key) {
  const icons = {
    brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 3a3 3 0 00-3 3v.3A3 3 0 004 9v1a3 3 0 001 2.2A3 3 0 004 15v1a3 3 0 002.5 3H9V3H9.5zM14.5 3a3 3 0 013 3v.3A3 3 0 0120 9v1a3 3 0 01-1 2.2A3 3 0 0120 15v1a3 3 0 01-2.5 3H15V3h-.5z"/></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    "laptop-code": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M1 20h22M9 9l-2 2 2 2M13 9l2 2-2 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2H17a4 4 0 004-4c0-4-4-7.3-9-7.3z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7" r="1" fill="currentColor" stroke="none"/></svg>`,
    rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c3 1 5.5 4 5.5 8.5 0 2-.5 3.5-1.5 5l-4-4-4 4c-1-1.5-1.5-3-1.5-5C6.5 6 9 3 12 2z"/><path d="M9 15.5L7 21l3.5-2M15 15.5l2 5.5-3.5-2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    "device-mobile": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 19h4" stroke-linecap="round"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke-linejoin="round"/></svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r="1" fill="currentColor" stroke="none"/></svg>`,
    office: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9" stroke-linecap="round"/></svg>`,
    graduation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 5-10 5L2 8l10-5z" stroke-linejoin="round"/><path d="M6 10.5V16c0 1.5 2.8 3 6 3s6-1.5 6-3v-5.5" stroke-linecap="round"/></svg>`,
  };
  return icons[key] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`;
}

function socialIconSvg(platform) {
  const icons = {
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4L3 11l6 2m12-9l-4 17-8-6m12-11L9 13"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 7 9.8.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.3-.3-4.7-1.2-4.7-5.2 0-1.1.4-2 1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .6 1.5.2 2.6.1 2.9.6.8 1 1.7 1 2.8 0 4-2.4 4.9-4.7 5.2.4.3.7 1 .7 2v3c0 .3.2.6.7.5 4.1-1.4 7-5.3 7-9.8C22 6.6 17.5 2 12 2z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5zM.24 8.25h4.5V23h-4.5V8.25zM8.5 8.25h4.3v2h.06c.6-1.1 2.06-2.3 4.24-2.3 4.53 0 5.37 3 5.37 6.9V23h-4.5v-6.8c0-1.6 0-3.7-2.24-3.7-2.25 0-2.6 1.75-2.6 3.55V23h-4.5V8.25z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13.5 22v-8.5H16l.4-3.4h-2.9V7.9c0-1 .3-1.7 1.7-1.7H16.5V3.1C16.2 3.1 15.2 3 14 3c-2.5 0-4.2 1.5-4.2 4.4v2.7H7v3.4h2.8V22h3.7z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.9 3H22l-7.4 8.4L23 21h-6.8l-5.3-6.9L4.7 21H1.6l8-9.1L1 3h7l4.8 6.3L18.9 3zm-1.2 16h1.9L7.4 5H5.3l12.4 14z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23 12s0-3.4-.4-5c-.3-.9-1-1.6-1.9-1.9C19 4.7 12 4.7 12 4.7s-7 0-8.7.4c-.9.3-1.6 1-1.9 1.9C1 8.6 1 12 1 12s0 3.4.4 5c.3.9 1 1.6 1.9 1.9 1.7.4 8.7.4 8.7.4s7 0 8.7-.4c.9-.3 1.6-1 1.9-1.9.4-1.6.4-5 .4-5zM9.8 15.5v-7l6 3.5-6 3.5z"/></svg>`,
    threads: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.2 2C7 2 3.5 5.1 3.4 10.2c0 .1 0 4.6 0 4.7C3.5 19.9 7 23 12.3 23c4.2 0 7.1-1.9 7.9-5.4l-2.4-.5c-.6 2.1-2.3 3.4-5.4 3.4-3.4 0-5.4-1.7-5.6-4.7 4.6.1 9.3-.1 9.9-3.6.4-2.3-1.1-4.6-4.7-4.9-2.6-.2-4.5.8-5.4 2.6l2.2 1c.5-1 1.5-1.5 3-1.4 1.7.1 2.4 1 2.3 1.9-.2 1.2-2.3 1.4-6.6 1.3.3-3 2.1-4.4 4.7-4.4 2.9 0 4.6 1.4 5.1 3.7l2.3-.6C19.7 4.3 16.7 2 12.2 2z"/></svg>`,
  };
  return icons[platform] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>`;
}

function arrowIconSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function chevronIconSvg(dir) {
  const d = dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="${d}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ---------------- Site settings (favicon/title/accent) ---------------- */
async function applySiteSettings() {
  try {
    const s = await Api.siteSettings();
    if (s.site_name) document.title = s.site_name;
    if (s.favicon) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = s.favicon;
    }
    if (s.meta_description) {
      let m = document.querySelector("meta[name='description']");
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.content = s.meta_description;
    }
    if (s.accent_color) document.documentElement.style.setProperty("--accent", s.accent_color);
    if (s.background_image) {
      document.body.classList.add("has-bg-image");
      document.body.style.setProperty("--bg-image-url", `url('${s.background_image}')`);
    }
    if (s.cube_rotation_seconds) window.__cubeRotationSeconds = Number(s.cube_rotation_seconds);
  } catch (e) { /* sokin xato — default stil ishlatiladi */ }
}

/* ---------------- Nav tabs ---------------- */
function setActiveTab(tab) {
  navTabsEl.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
}

/* ---------------- Skills cube (About Me hero) ---------------- */
/* Tartib "top, left, right, front, back, bottom" ga mos keladi — shunda
   dastlabki (vitrina) burchakda aynan Web Development tepada, Python & Django
   chapda, Microsoft Office o'ngda ko'rinadi (mos rasm bo'yicha). */
const CUBE_FACES = [
  { title: "Web Development", icon: "laptop-code", tech: "HTML, CSS, JavaScript, React, Vue, Next.js" },
  { title: "Python & Django", icon: "python", tech: "Backend development\nREST API, ORM, Admin" },
  { title: "Microsoft Office", icon: "msoffice", tech: "Excel, Word, PowerPoint\nAdvanced automation" },
  { title: "Telegram Bot", icon: "telegram", tech: "TeleBot, Telegram API, Automation, Payment systems" },
  { title: "IT Training", icon: "graduation", tech: "Computer Literacy, Microsoft Office, Programming, Education" },
  { title: "Hosting & DevOps", icon: "server", tech: "Linux, Docker, Nginx, VPS, CI/CD, Deployment" },
];
const CUBE_FACE_CLASSES = ["cube-face-top", "cube-face-left", "cube-face-front", "cube-face-right", "cube-face-back", "cube-face-bottom"];

function cubeFaceIconSvg(key) {
  if (key === "python") return `<svg viewBox="0 0 32 32" fill="none"><path d="M15.9 2c-1.4 0-2.7.1-3.8.3-3.4.6-4 1.9-4 4.2v3.1h8v1H8.4C6 10.6 3.9 12 3.9 15.7c0 3.7 1.8 5.7 4.5 5.7h1.8v-2.4c0-2.8 2.4-5.3 5.3-5.3h6.4c2.5 0 4.5-2 4.5-4.5V6.5c0-2.4-2-4.2-4.5-4.6C20.1 2.1 17.9 2 15.9 2z" fill="#3776AB"/><path d="M16.1 30c1.4 0 2.7-.1 3.8-.3 3.4-.6 4-1.9 4-4.2v-3.1h-8v-1h11.7c2.4 0 4.5-1.4 4.5-5.1 0-3.7-1.8-5.7-4.5-5.7h-1.8v2.4c0 2.8-2.4 5.3-5.3 5.3H14c-2.5 0-4.5 2-4.5 4.5v4.2c0 2.4 2 4.2 4.5 4.6.9.1 3.1.4 2.1.4z" fill="#FFD43B"/><circle cx="12.5" cy="6" r="1.2" fill="#fff"/><circle cx="19.5" cy="26" r="1.2" fill="#fff"/></svg>`;
  if (key === "msoffice") return `<svg viewBox="0 0 32 32" fill="none"><path d="M18 2l11 4v20l-11 4V2z" fill="#ED6C47"/><path d="M18 2L3 6v20l15 4V2z" fill="#FF8F6B"/><path d="M3 6l15-4v28L3 26V6z" fill="#F9A583" opacity=".25"/><rect x="7" y="10" width="7" height="12" rx="1" fill="#fff" opacity=".92"/><path d="M8.5 12l4 8M12.5 12l-4 8" stroke="#D24726" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  return null;
}

function renderSkillsCube() {
  const facesHtml = CUBE_FACES.map((f, i) => {
    const brandIcon = cubeFaceIconSvg(f.icon);
    const iconHtml = brandIcon || (f.icon === "telegram" ? socialIconSvg("telegram") : cardIconSvg(f.icon));
    return `
    <div class="cube-face ${CUBE_FACE_CLASSES[i]}">
      <div class="cube-face-inner">
        <span class="cube-face-icon${brandIcon ? " cube-face-icon-brand" : ""}">${iconHtml}</span>
        <h4>${esc(f.title)}</h4>
        <p>${esc(f.tech).replace(/\n/g, "<br>")}</p>
      </div>
    </div>`;
  }).join("");
  return `
    <div class="skills-cube-wrap">
      <div class="skills-cube-scene">
        <div class="skills-cube" id="skills-cube">${facesHtml}</div>
      </div>
      <svg class="cube-rotate-hint-svg" viewBox="0 0 120 34" width="120" height="34" aria-hidden="true">
        <path d="M12 17 A46 46 0 0 0 52 32" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6"/>
        <path d="M108 17 A46 46 0 0 1 68 32" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6"/>
        <path d="M12 17l6.5-3.5M12 17l1.5 7" stroke="rgba(255,255,255,.75)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M108 17l-6.5-3.5M108 17l-1.5 7" stroke="rgba(255,255,255,.75)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </div>`;
}

/* Haqiqiy fizika: drag paytida burchak sichqoncha harakatiga mos, qo'yib
   yuborilganda inertiya bilan davom etadi, friction bilan sekinlashadi,
   so'ng eng yaqin yuzaga yumshoq snap qiladi va nihoyat sekin auto-rotate
   rejimiga qaytadi. Barchasi requestAnimationFrame bitta silliq davrida. */
function initSkillsCube(cube) {
  if (!cube || cube.dataset.inited) return;
  cube.dataset.inited = "1";

  // Doimiy "vitrina" og'ishi: kub qo'yib yuborilgandan keyin har doim shu
  // burchakka qaytadi (tekis 0/90gradusga emas) — shunda tepa qirrasi
  // doim sal ko'rinib, kub "havoda muallaq" turganday taassurot beradi.
  const SHOWCASE_TILT = -30;
  let rotX = SHOWCASE_TILT, rotY = 45;
  let velX = 0, velY = 0;
  let dragging = false;
  let snapping = false;
  let lastX = 0, lastY = 0, lastT = 0;
  let lastInteraction = performance.now();

  const FRICTION = 0.945;
  const VEL_STOP = 0.02;
  const SNAP_DELAY = 240;
  const SNAP_EASE = 0.1;
  const IDLE_DELAY = 1200;
  const rotationSeconds = Math.max(5, Number(window.__cubeRotationSeconds) || 40);
  const IDLE_SPEED = 360 / (rotationSeconds * 60); // 60fps taxminiy davr

  function apply() {
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }
  apply();

  function onDown(e) {
    dragging = true;
    snapping = false;
    velX = 0; velY = 0;
    cube.classList.add("grabbing");
    lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
    lastInteraction = lastT;
    try { cube.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotY += dx * 0.4;
    rotX = Math.max(-85, Math.min(85, rotX - dy * 0.4));
    velY = (dx * 0.4) / (dt / 16.7);
    velX = (-dy * 0.4) / (dt / 16.7);
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    lastInteraction = now;
    apply();
    e.preventDefault();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    cube.classList.remove("grabbing");
    lastInteraction = performance.now();
  }

  cube.addEventListener("pointerdown", onDown);
  cube.addEventListener("pointermove", onMove);
  cube.addEventListener("pointerup", onUp);
  cube.addEventListener("pointercancel", onUp);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function tick() {
    if (!document.body.contains(cube)) return; // sahifadan chiqilgan — davrni to'xtatamiz
    const now = performance.now();
    if (!dragging) {
      if (Math.abs(velX) > VEL_STOP || Math.abs(velY) > VEL_STOP) {
        rotX = Math.max(-85, Math.min(85, rotX + velX));
        rotY += velY;
        velX *= FRICTION;
        velY *= FRICTION;
        snapping = false;
      } else if (!snapping && now - lastInteraction > SNAP_DELAY) {
        snapping = true;
      }
      if (snapping) {
        const targetX = SHOWCASE_TILT;
        const targetY = Math.round((rotY - 45) / 90) * 90 + 45;
        rotX += (targetX - rotX) * SNAP_EASE;
        rotY += (targetY - rotY) * SNAP_EASE;
        if (Math.abs(targetX - rotX) < 0.25 && Math.abs(targetY - rotY) < 0.25) {
          rotX = targetX; rotY = targetY;
          snapping = false;
          lastInteraction = now;
        }
      } else if (now - lastInteraction > IDLE_DELAY) {
        rotY += IDLE_SPEED;
      }
      apply();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------------- Universal tilt + cursor-glow effect (barcha kartalar) ----------------
   Sichqoncha karta ustida qaysi burchakka yaqinlashsa, karta o'sha burchagi
   ko'tarilganday moyillashadi (3D tilt), shu bilan birga sichqoncha ortidan
   yumshoq glow effekti yuradi. Faqat aniq sichqonchali qurilmalarda ishlaydi. */
function initTiltCards(root) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const cards = (root || document).querySelectorAll(".tilt-card");
  cards.forEach(card => {
    if (card.dataset.tiltInited) return;
    card.dataset.tiltInited = "1";
    function onMove(e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 26;
      const ry = (px - 0.5) * 26;
      const shadowX = (px - 0.5) * -30;
      const shadowY = (py - 0.5) * -30;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px 34px -12px rgba(24,39,92,.45)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    }
    function onLeave() {
      card.style.transform = "";
      card.style.boxShadow = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    }
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  });
}

/* ---------------- Team carousel ---------------- */
function initTeamCarousel() {
  const track = document.getElementById("team-track");
  if (!track) return;
  const cards = Array.from(track.children);
  const dotsWrap = document.getElementById("team-dots");
  if (dotsWrap) {
    dotsWrap.innerHTML = cards.map((_, i) => `<button type="button" class="team-dot" data-i="${i}" aria-label="Slayd ${i + 1}"></button>`).join("");
  }
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function updateActive() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0, closestDist = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === closest));
  }

  let scrollTimer = null;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateActive, 90);
  }, { passive: true });

  dots.forEach(d => d.addEventListener("click", () => {
    const i = Number(d.dataset.i);
    cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }));

  const prev = document.querySelector(".team-prev");
  const next = document.querySelector(".team-next");
  const step = () => (cards[0] ? cards[0].getBoundingClientRect().width + 22 : 260);
  if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

  updateActive();
}

/* ---------------- Route: About ---------------- */
async function routeAbout() {
  setActiveTab("about");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [profile, services, insideWorld, stats] = await Promise.all([
      Api.profile(), Api.services(), Api.insideWorld(), Api.siteStats().catch(() => null),
    ]);

    const statsHtml = stats ? `
      <div class="stats-bar">
        <div class="stat-chip"><span class="stat-icon">👁️</span><b>${stats.visits}</b><span>tashrif</span></div>
        <div class="stat-chip"><span class="stat-icon">💬</span><b>${stats.comments}</b><span>izoh</span></div>
        <div class="stat-chip"><span class="stat-icon">✉️</span><b>${stats.contact_messages}</b><span>so'rov</span></div>
      </div>` : "";

    const servicesHtml = services.length ? `
      <h2 class="section-title">What I Do</h2>
      <div class="card-grid-2">
        ${services.map(s => `
          <div class="card tilt-card">
            <span class="card-icon">${cardIconSvg(s.icon)}</span>
            <div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
          </div>`).join("")}
      </div>` : "";

    const insideHtml = insideWorld.length ? `
      <h2 class="section-title">Inside ${esc(profile.display_name)}'s World</h2>
      <div class="inside-grid">
        ${insideWorld.map(card => `
          <div class="card tilt-card">
            <div class="card-head">
              <span class="card-icon">${cardIconSvg(card.icon)}</span>
              <h3>${esc(card.title)}</h3>
            </div>
            ${card.card_type === "text"
              ? `<p>${esc(card.body_text)}</p>`
              : `<ul class="inside-list">${card.items.map(i => `<li>${i.emoji ? esc(i.emoji) + " " : ""}${i.bold_part ? `<b>${esc(i.bold_part)}</b> ` : ""}${esc(i.rest_text)}</li>`).join("")}</ul>`}
          </div>`).join("")}
      </div>` : "";

    contentEl.innerHTML = `
      <h1 class="page-title">About Me</h1>
      <div class="title-underline"></div>
      ${statsHtml}
      <div class="about-hero-layout">
        <div class="about-hero-text">
          ${profile.about_intro ? `<p class="lead-text">${nl2br(profile.about_intro)}</p>` : ""}
          ${profile.about_extra ? `<p class="lead-text">${nl2br(profile.about_extra)}</p>` : ""}
        </div>
        ${renderSkillsCube()}
      </div>
      ${servicesHtml}
      ${insideHtml}
      <div class="contact-card">
        <h2 class="contact-heading">Let's Build Something</h2>
        <p class="contact-sub">Have a project in mind? Drop me a message and I'll get back within 24 hours.</p>
        <div id="contact-alert"></div>
        <form id="contact-form">
          <div class="form-grid">
            <input class="form-input" type="text" name="name" placeholder="Your name" required>
            <input class="form-input" type="email" name="email" placeholder="Your email" required>
          </div>
          <textarea class="form-textarea" name="message" placeholder="Tell me about your project..." required></textarea>
          <button class="btn-send" type="submit">Send Message</button>
        </form>
      </div>
    `;

    const skillsCubeEl = document.getElementById("skills-cube");
    if (skillsCubeEl) initSkillsCube(skillsCubeEl);

    document.getElementById("contact-form").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const form = ev.target;
      const alertBox = document.getElementById("contact-alert");
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await Api.sendContact(data);
        alertBox.innerHTML = `<div class="alert alert-success">${esc(res.detail)}</div>`;
        form.reset();
      } catch (e) {
        alertBox.innerHTML = `<div class="alert alert-error">Xatolik yuz berdi. Maydonlarni tekshirib qayta urinib ko'ring.</div>`;
      }
    });
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi. API ishlab turganini tekshiring.</p>`;
  }
}

/* ---------------- Route: Resume ---------------- */
async function routeResume() {
  setActiveTab("resume");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [skills, journey] = await Promise.all([Api.skills(), Api.journey()]);

    const skillsHtml = skills.length ? `
      <h2 class="section-title" style="margin-top:0">My Skills</h2>
      <div class="skills-card">
        ${skills.map(g => `
          <div class="skill-row">
            <div class="skill-label"><b>${esc(g.label)}:</b> ${esc(g.items)}</div>
            <div class="skill-bar-track"><div class="skill-bar-fill" data-level="${g.level_percent}"></div></div>
          </div>`).join("")}
      </div>` : "";

    const journeyHtml = journey.length ? `
      <div class="journey-header">
        <span class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg></span>
        <h2 class="section-title" style="margin:0">My Journey</h2>
      </div>
      <div class="journey-list">
        ${journey.map(j => `
          <div class="journey-item">
            <h4>${esc(j.title)}</h4>
            <span class="journey-year">${esc(j.year)}</span>
            <p>${esc(j.description)}</p>
          </div>`).join("")}
      </div>` : "";

    contentEl.innerHTML = `
      <h1 class="page-title">Resume</h1>
      <div class="title-underline"></div>
      ${skillsHtml}
      ${journeyHtml}
    `;
    animateSkillBars();
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
}

/* Skill barlarini 0 dan haqiqiy qiymatigacha animatsiya bilan to'ldiradi */
function animateSkillBars() {
  const bars = contentEl.querySelectorAll(".skill-bar-fill");
  requestAnimationFrame(() => {
    bars.forEach(bar => { bar.style.width = `${bar.dataset.level}%`; });
  });
}

/* ---------------- Route: Portfolio list ---------------- */
async function routePortfolio(activeCategory = "all") {
  setActiveTab("portfolio");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [categories, projects] = await Promise.all([
      Api.portfolioCategories(), Api.portfolioList(activeCategory),
    ]);

    const tabsHtml = `
      <a href="#/portfolio" class="${activeCategory === "all" ? "active" : ""}">All</a>
      ${categories.map(c => `<a href="#/portfolio?category=${encodeURIComponent(c.slug)}" class="${activeCategory === c.slug ? "active" : ""}">${esc(c.name)}</a>`).join("")}
    `;

    const gridHtml = projects.length ? projects.map(p => `
      <a class="portfolio-card tilt-card" href="#/portfolio/${encodeURIComponent(p.slug)}">
        <div class="portfolio-thumb">${p.cover_image ? `<img src="${p.cover_image}" alt="${esc(p.title)}">` : ""}</div>
        <h3>${esc(p.title)}</h3>
        <span>${esc(p.category ? p.category.name : "")}</span>
      </a>`).join("") : `<p class="lead-text">Hozircha loyihalar qo'shilmagan.</p>`;

    contentEl.innerHTML = `
      <h1 class="page-title">Portfolio</h1>
      <div class="title-underline"></div>
      <div class="filter-tabs">${tabsHtml}</div>
      <div class="portfolio-grid">${gridHtml}</div>
    `;
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
}

/* ---------------- Route: Portfolio detail ---------------- */
async function routePortfolioDetail(slug) {
  setActiveTab("portfolio");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const p = await Api.portfolioDetail(slug);
    const tagsHtml = p.tags.length ? `<div class="tag-row" style="margin-top:22px">${p.tags.map(t => `<span class="tag-pill">${esc(t.name)}</span>`).join("")}</div>` : "";
    const galleryHtml = p.gallery.length ? `
      <h2 class="section-title">Galereya</h2>
      <div class="portfolio-gallery-grid">${p.gallery.map(g => `<div class="portfolio-thumb"><img src="${g.image}" alt=""></div>`).join("")}</div>` : "";
    const linksHtml = `
      <div style="margin-top:26px; display:flex; gap:14px;">
        ${p.project_url ? `<a class="btn-send" href="${esc(p.project_url)}" target="_blank">Live ko'rish</a>` : ""}
        ${p.github_url ? `<a class="btn-send" style="background:#1b2440" href="${esc(p.github_url)}" target="_blank">GitHub</a>` : ""}
      </div>`;

    contentEl.innerHTML = `
      <a href="#/portfolio" style="color:var(--accent); text-decoration:none; font-size:14px;">&larr; Portfolio'ga qaytish</a>
      <h1 class="page-title" style="margin-top:14px">${esc(p.title)}</h1>
      <div class="title-underline"></div>
      <div class="post-cover">${p.cover_image ? `<img src="${p.cover_image}" alt="${esc(p.title)}">` : ""}</div>
      ${p.short_description ? `<p class="lead-text"><b>${esc(p.short_description)}</b></p>` : ""}
      <div class="post-body">${nl2br(p.description)}</div>
      ${tagsHtml}
      ${linksHtml}
      ${galleryHtml}
    `;
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Loyiha topilmadi.</p>`;
  }
}

/* ---------------- Route: Thread list ---------------- */
async function routeThread() {
  setActiveTab("thread");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const posts = await Api.threadList();
    const grid = posts.length ? posts.map(post => `
      <a class="thread-card tilt-card" href="#/thread/${encodeURIComponent(post.slug)}">
        <div class="thread-meta">${formatDate(post.published_at)} &nbsp; <span class="read-time">${post.read_minutes} min read</span> &nbsp; <span class="thread-stat">👁️ ${post.views}</span> &nbsp; <span class="thread-stat">💬 ${post.comment_count}</span></div>
        <h3>${esc(post.title)}</h3>
        <p>${esc(post.excerpt)}</p>
        <div class="tag-row">${post.tags.map(t => `<span class="tag-pill">${esc(t.name)}</span>`).join("")}</div>
      </a>`).join("") : `<p class="lead-text">Hozircha postlar yo'q.</p>`;

    contentEl.innerHTML = `
      <h1 class="page-title">Thread</h1>
      <div class="title-underline"></div>
      <p class="lead-text" style="margin-top:-14px">Thoughts, experiments, and learnings from building things.</p>
      <div class="thread-grid">${grid}</div>
    `;
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
}

/* ---------------- Route: Thread detail ---------------- */
async function routeThreadDetail(slug) {
  setActiveTab("thread");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [post, comments] = await Promise.all([Api.threadDetail(slug), Api.threadComments(slug)]);

    const commentsHtml = comments.length ? comments.map(c => `
      <div class="comment-item">
        <span class="c-name">${esc(c.name)}</span><span class="c-date">${new Date(c.created_at).toLocaleString()}</span>
        <p>${esc(c.message)}</p>
      </div>`).join("") : `<p class="comment-empty">Hozircha izohlar yo'q — birinchi bo'lib fikr bildiring.</p>`;

    contentEl.innerHTML = `
      <a href="#/thread" style="color:var(--accent); text-decoration:none; font-size:14px;">&larr; Thread'ga qaytish</a>
      <h1 class="page-title" style="margin-top:14px">${esc(post.title)}</h1>
      <div class="title-underline"></div>
      <div class="thread-meta" style="margin-bottom:24px">${formatDate(post.published_at)} &nbsp; <span class="read-time">${post.read_minutes} min read</span> &nbsp; <span class="thread-stat">👁️ ${post.views} ko'rish</span> &nbsp; <span class="thread-stat">💬 ${post.comment_count} izoh</span></div>
      ${post.cover_image ? `<div class="post-cover"><img src="${post.cover_image}" alt="${esc(post.title)}"></div>` : ""}
      <div class="post-body">${nl2br(post.body)}</div>
      ${post.tags.length ? `<div class="tag-row" style="margin-top:22px">${post.tags.map(t => `<span class="tag-pill">${esc(t.name)}</span>`).join("")}</div>` : ""}
      <h2 class="section-title">Izohlar</h2>
      <div class="comment-list" id="comment-list">${commentsHtml}</div>
      <div class="contact-card">
        <h2 class="contact-heading" style="font-size:19px">Izoh qoldirish</h2>
        <div id="comment-alert"></div>
        <form id="comment-form">
          <div class="form-grid">
            <input class="form-input" type="text" name="name" placeholder="Ismingiz *" required>
            <input class="form-input" type="email" name="email" placeholder="Email (ixtiyoriy)">
          </div>
          <textarea class="form-textarea" name="message" placeholder="Izohingiz..." required></textarea>
          <button class="btn-send" type="submit">Yuborish</button>
        </form>
      </div>
    `;

    document.getElementById("comment-form").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const form = ev.target;
      const alertBox = document.getElementById("comment-alert");
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await Api.postComment(slug, data);
        alertBox.innerHTML = `<div class="alert alert-success">${esc(res.detail)}</div>`;
        form.reset();
      } catch (e) {
        alertBox.innerHTML = `<div class="alert alert-error">Iltimos ismingizni kiriting va qayta urinib ko'ring.</div>`;
      }
    });
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Post topilmadi.</p>`;
  }
}

/* ---------------- Route: Team ---------------- */
async function routeTeam() {
  setActiveTab("team");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const members = await Api.team();
    const cards = members.map(m => {
      const primaryLink = m.portfolio_url || m.github_url || m.linkedin_url || m.telegram_url || "";
      return `
      <div class="team-card tilt-card" style="--accent-glow:${esc(m.accent_color)}">
        <span class="team-icon-badge" style="background:${esc(m.accent_color)}">${cardIconSvg(m.icon)}</span>
        <div class="team-avatar">${m.avatar ? `<img src="${m.avatar}" alt="${esc(m.name)}">` : `<span class="avatar-placeholder">🙂</span>`}</div>
        <h3>${esc(m.name)}</h3>
        <span class="team-role">${esc(m.role)}</span>
        ${m.skills ? `<div class="tag-row team-tags">${m.skills.split(",").filter(s => s.trim()).map(s => `<span class="tag-pill">${esc(s.trim())}</span>`).join("")}</div>` : ""}
        ${m.description ? `<p class="team-desc">${esc(m.description)}</p>` : ""}
        <div class="team-footer">
          <div class="team-socials">
            ${m.github_url ? `<a href="${esc(m.github_url)}" target="_blank" rel="noopener" title="GitHub">${socialIconSvg("github")}</a>` : ""}
            ${m.linkedin_url ? `<a href="${esc(m.linkedin_url)}" target="_blank" rel="noopener" title="LinkedIn">${socialIconSvg("linkedin")}</a>` : ""}
            ${m.telegram_url ? `<a href="${esc(m.telegram_url)}" target="_blank" rel="noopener" title="Telegram">${socialIconSvg("telegram")}</a>` : ""}
          </div>
          ${primaryLink ? `<a class="team-arrow-btn" style="background:${esc(m.accent_color)}" href="${esc(primaryLink)}" target="_blank" rel="noopener" aria-label="Ko'proq bilish">${arrowIconSvg()}</a>` : ""}
        </div>
      </div>`;
    });

    const bodyHtml = members.length ? `
      <div class="team-carousel">
        <button type="button" class="team-nav team-prev" aria-label="Oldingi">${chevronIconSvg("left")}</button>
        <div class="team-track" id="team-track">${cards.join("")}</div>
        <button type="button" class="team-nav team-next" aria-label="Keyingi">${chevronIconSvg("right")}</button>
      </div>
      <div class="team-dots" id="team-dots"></div>
    ` : `<p class="lead-text">Hozircha jamoa a'zolari qo'shilmagan.</p>`;

    contentEl.innerHTML = `
      <h1 class="page-title">Mening Jamoam 🚀</h1>
      <div class="title-underline"></div>
      <p class="lead-text" style="margin-top:-14px">Har bir loyiha ortida zo'r jamoa bor.</p>
      ${bodyHtml}
    `;

    if (members.length) initTeamCarousel();
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
}

/* ---------------- Route: Students ---------------- */
async function routeStudents(activeCategory = "all") {
  setActiveTab("students");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [categories, students] = await Promise.all([
      Api.studentCategories(), Api.studentList(activeCategory),
    ]);

    const tabsHtml = `
      <a href="#/students" class="${activeCategory === "all" ? "active" : ""}">Barchasi</a>
      ${categories.map(c => `<a href="#/students?category=${encodeURIComponent(c.slug)}" class="${activeCategory === c.slug ? "active" : ""}">${esc(c.name)}</a>`).join("")}
    `;

    const cardsHtml = students.length ? students.map(s => {
      const catColor = paletteColor(s.category ? s.category.slug : "default");
      const dateRange = (s.start_date || s.end_date)
        ? `${s.start_date ? formatMonthYear(s.start_date) : ""} – ${s.end_date ? formatMonthYear(s.end_date) : "hozir"}`
        : "";
      return `
      <div class="student-card tilt-card" data-name="${esc(s.name.toLowerCase())}" style="--cat-color:${catColor}">
        <div class="student-photo-ring">
          <div class="student-photo">${s.photo ? `<img src="${s.photo}" alt="${esc(s.name)}">` : `<span class="avatar-placeholder">🙂</span>`}</div>
        </div>
        <h3>${esc(s.name)}</h3>
        <span class="student-role">${esc(s.role)}</span>
        ${s.skills ? `<div class="tag-row student-tags">${s.skills.split(",").filter(t => t.trim()).map(t => `<span class="tag-pill">${esc(t.trim())}</span>`).join("")}</div>` : ""}
        <div class="student-meta">
          ${dateRange ? `<span>${dateRange}</span>` : ""}
          <span>${s.project_count} ta loyiha</span>
        </div>
        ${s.portfolio_url ? `<a class="student-btn" href="${esc(s.portfolio_url)}" target="_blank" rel="noopener">📁 Portfolio &rarr;</a>` : ""}
      </div>`;
    }).join("") : `<p class="lead-text">Hozircha o'quvchilar qo'shilmagan.</p>`;

    contentEl.innerHTML = `
      <h1 class="page-title">Mening O'quvchilarim 🎓</h1>
      <div class="title-underline"></div>
      <p class="lead-text" style="margin-top:-14px">Bilim ulashish — eng katta boylik.</p>
      <div class="students-toolbar">
        <div class="filter-tabs">${tabsHtml}</div>
        <input type="search" id="student-search" class="form-input student-search" placeholder="O'quvchi qidirish...">
      </div>
      <div class="students-grid" id="students-grid">${cardsHtml}</div>
    `;

    const searchInput = document.getElementById("student-search");
    if (searchInput) {
      searchInput.addEventListener("input", (ev) => {
        const q = ev.target.value.trim().toLowerCase();
        document.querySelectorAll("#students-grid .student-card").forEach(card => {
          card.classList.toggle("hidden", !!q && !card.dataset.name.includes(q));
        });
      });
    }
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
}

/* ---------------- Router ---------------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const query = new URLSearchParams(queryPart || "");
  return { segments, query };
}

async function router() {
  const { segments, query } = parseHash();
  const [section, param] = segments;

  if (!section || section === "about") await routeAbout();
  else if (section === "resume") await routeResume();
  else if (section === "portfolio") await (param ? routePortfolioDetail(param) : routePortfolio(query.get("category") || "all"));
  else if (section === "team") await routeTeam();
  else if (section === "students") await routeStudents(query.get("category") || "all");
  else if (section === "thread") await (param ? routeThreadDetail(param) : routeThread());
  else await routeAbout();

  initTiltCards(contentEl);
}

let publicHashListenerAttached = false;

/* Bosh sahifa uchun HTML skelet + kerakli render funksiyalarini ishga tushiradi.
   router.js shu funksiyani chaqiradi. */
async function mountPublicApp() {
  const root = document.getElementById("app-root");
  root.innerHTML = `
    <div class="page-wrap">
      <aside class="sidebar" id="sidebar-root">
        <p class="loading-text">Yuklanmoqda...</p>
      </aside>
      <main class="content-panel">
        <nav class="nav-tabs" id="nav-tabs">
          <a href="#/about" data-tab="about">About</a>
          <a href="#/resume" data-tab="resume">Resume</a>
          <a href="#/portfolio" data-tab="portfolio">Portfolio</a>
          <a href="#/team" data-tab="team">Team</a>
          <a href="#/students" data-tab="students">Students</a>
          <a href="#/thread" data-tab="thread">Thread</a>
        </nav>
        <div id="content-panel-body">
          <p class="loading-text">Yuklanmoqda...</p>
        </div>
      </main>
    </div>
  `;
  contentEl = document.getElementById("content-panel-body");
  navTabsEl = document.getElementById("nav-tabs");
  sidebarEl = document.getElementById("sidebar-root");

  renderSidebar();
  await applySiteSettings();
  router();

  if (!publicHashListenerAttached) {
    window.addEventListener("hashchange", () => {
      if (window.__activeApp === "public") router();
    });
    publicHashListenerAttached = true;
  }

  if (!window.__visitTracked) {
    window.__visitTracked = true;
    Api.trackVisit().catch(() => {});
  }
}

window.PublicApp = { mount: mountPublicApp };
