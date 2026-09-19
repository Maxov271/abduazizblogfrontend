/* Umarov Group — ochiq sayt (hash-router SPA).
   Yo'llar: #/  #/haqida  #/xizmatlar  #/portfolio[/slug]  #/jamoa
   #/oquvchilar  #/blog[/slug]  #/narxlar  #/resume  #/aloqa
   Eski yo'llar (#/about, #/thread, #/team, #/students) ham ishlaydi. */
(function () {
  "use strict";

  /* ================= Sozlamalar va statik kontent ================= */
  const NAV = [
    { label: "Bosh sahifa", href: "#/", key: "home" },
    { label: "Men haqimda", href: "#/haqida", key: "about" },
    { label: "Xizmatlar", href: "#/xizmatlar", key: "services" },
    { label: "Portfolio", href: "#/portfolio", key: "portfolio" },
    { label: "Jamoa", href: "#/jamoa", key: "team" },
    { label: "O'quvchilar", href: "#/oquvchilar", key: "students" },
    { label: "Blog", href: "#/blog", key: "blog" },
    { label: "Narxlar", href: "#/narxlar", key: "pricing" },
    { label: "Resume", href: "#/resume", key: "resume" },
  ];
  const SLUG_MAP = {
    haqida: "about", about: "about", xizmatlar: "services", portfolio: "portfolio",
    blog: "blog", thread: "blog", resume: "resume", narxlar: "pricing",
    aloqa: "contact", jamoa: "team", team: "team", oquvchilar: "students", students: "students",
  };
  const HERO_LEAD = "Umarov Group — Django asosidagi veb-ilovalar, Telegram botlar va IT ta'lim. Brifdan ishga tushirishgacha bitta jamoa bilan.";
  const MARQUEE = "PYTHON · DJANGO · REST API · TELEGRAM BOT · POSTGRESQL · DOCKER · NGINX · IT TA'LIM · ";

  /* DIQQAT: narxlar hozircha backendda yo'q — bu yerdagi matn va
     narxlar dizayn namunasidan olingan. Haqiqiy ma'lumotga almashtiring. */
  const PLANS = [
    { name: "Vizitka", tagline: "Kichik biznes va shaxsiy sahifa uchun", price: "3 mln so'mdan", features: ["5 tagacha sahifa", "Mobil moslashuv", "Aloqa formasi + Telegram", "Domen va hosting sozlash"] },
    { name: "Biznes", tagline: "Katalog, blog va admin panel", price: "8 mln so'mdan", features: ["Cheksiz sahifa va bo'limlar", "Admin panel orqali kontent", "SEO asoslari va tezlik", "1 oy bepul qo'llab-quvvatlash"] },
    { name: "Tizim", tagline: "CRM, bot va integratsiyalar", price: "Kelishuv asosida", features: ["Texnik tahlil va prototip", "REST API va integratsiyalar", "Telegram bot", "DevOps va monitoring"] },
  ];

  /* ================= Yordamchi funksiyalar ================= */
  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? esc(u) : ""; }
  const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return String(iso).slice(0, 10);
    return d.getDate() + "-" + MONTHS[d.getMonth()] + ", " + d.getFullYear();
  }
  function fmtMonthYear(iso) {
    const d = new Date(iso);
    return isNaN(d) ? "" : MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  const WARM_PALETTE = ["#c67139", "#7a8a5e", "#b2622d", "#728157", "#d67f48", "#56633f"];
  function paletteColor(seed) {
    let h = 0;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return WARM_PALETTE[h % WARM_PALETTE.length];
  }
  function tagList(csv) {
    return String(csv || "").split(",").map((t) => t.trim()).filter(Boolean);
  }
  function parseRoute() {
    const parts = (location.hash || "#/").replace(/^#/, "").split("?")[0].split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    const name = SLUG_MAP[parts[0]] || "home";
    if (name === "portfolio" && parts[1]) return { name: "project", slug: decodeURIComponent(parts[1]) };
    if (name === "blog" && parts[1]) return { name: "post", slug: decodeURIComponent(parts[1]) };
    return { name };
  }

    /* ================= Ikonkalar va 3D kub ================= */
  const CUBE_FACES = [
    { title: "Web Development", icon: "laptop-code", tech: "HTML, CSS, JavaScript, React, Vue, Next.js" },
    { title: "Python & Django", icon: "python", tech: "Backend development\nREST API, ORM, Admin" },
    { title: "Microsoft Office", icon: "msoffice", tech: "Excel, Word, PowerPoint\nAdvanced automation" },
    { title: "Telegram Bot", icon: "telegram", tech: "TeleBot, Telegram API, Automation, Payment systems" },
    { title: "IT Training", icon: "graduation", tech: "Computer Literacy, Microsoft Office, Programming, Education" },
    { title: "Hosting & DevOps", icon: "server", tech: "Linux, Docker, Nginx, VPS, CI/CD, Deployment" },
  ];
  const CUBE_FACE_CLASSES = ["ug-face-top", "ug-face-left", "ug-face-front", "ug-face-right", "ug-face-back", "ug-face-bottom"];

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

  function cubeFaceIconSvg(key) {
    if (key === "python") return `<svg viewBox="0 0 32 32" fill="none"><path d="M15.9 2c-1.4 0-2.7.1-3.8.3-3.4.6-4 1.9-4 4.2v3.1h8v1H8.4C6 10.6 3.9 12 3.9 15.7c0 3.7 1.8 5.7 4.5 5.7h1.8v-2.4c0-2.8 2.4-5.3 5.3-5.3h6.4c2.5 0 4.5-2 4.5-4.5V6.5c0-2.4-2-4.2-4.5-4.6C20.1 2.1 17.9 2 15.9 2z" fill="#3776AB"/><path d="M16.1 30c1.4 0 2.7-.1 3.8-.3 3.4-.6 4-1.9 4-4.2v-3.1h-8v-1h11.7c2.4 0 4.5-1.4 4.5-5.1 0-3.7-1.8-5.7-4.5-5.7h-1.8v2.4c0 2.8-2.4 5.3-5.3 5.3H14c-2.5 0-4.5 2-4.5 4.5v4.2c0 2.4 2 4.2 4.5 4.6.9.1 3.1.4 2.1.4z" fill="#FFD43B"/><circle cx="12.5" cy="6" r="1.2" fill="#fff"/><circle cx="19.5" cy="26" r="1.2" fill="#fff"/></svg>`;
    if (key === "msoffice") return `<svg viewBox="0 0 32 32" fill="none"><path d="M18 2l11 4v20l-11 4V2z" fill="#ED6C47"/><path d="M18 2L3 6v20l15 4V2z" fill="#FF8F6B"/><path d="M3 6l15-4v28L3 26V6z" fill="#F9A583" opacity=".25"/><rect x="7" y="10" width="7" height="12" rx="1" fill="#fff" opacity=".92"/><path d="M8.5 12l4 8M12.5 12l-4 8" stroke="#D24726" stroke-width="1.4" stroke-linecap="round"/></svg>`;
    return null;
  }

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
    let needsSnap = false; // faqat foydalanuvchi tegib/uloqtirgandan keyin snap kerak
    let lastX = 0, lastY = 0, lastT = 0;
    let lastInteraction = performance.now();

    const FRICTION = 0.945;
    const VEL_STOP = 0.02;
    const SNAP_DELAY = 240;
    const SNAP_EASE = 0.1;
    const IDLE_DELAY = 500;
    const rotationSeconds = Math.max(5, Number(window.__cubeRotationSeconds) || 40);
    const IDLE_SPEED = 360 / (rotationSeconds * 60); // 60fps taxminiy davr

    function apply() {
      cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
    apply();

    function onDown(e) {
      dragging = true;
      snapping = false;
      needsSnap = true;
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

    /* setInterval ishlatiladi, chunki requestAnimationFrame ba'zi brauzer
       holatlarida (masalan sahifa fokusda bo'lmasa yoki ba'zi kengaytmalar
       bilan) chegaralanib qolishi mumkin — kub esa doim, tegilmasa ham
       ishonchli aylanib turishi kerak. */
    const timerId = setInterval(() => {
      if (!document.body.contains(cube)) { clearInterval(timerId); return; } // sahifadan chiqilgan — davrni to'xtatamiz
      const now = performance.now();
      if (dragging) return;
      if (Math.abs(velX) > VEL_STOP || Math.abs(velY) > VEL_STOP) {
        rotX = Math.max(-85, Math.min(85, rotX + velX));
        rotY += velY;
        velX *= FRICTION;
        velY *= FRICTION;
        snapping = false;
        needsSnap = true;
      } else if (needsSnap && !snapping && now - lastInteraction > SNAP_DELAY) {
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
          needsSnap = false;
          lastInteraction = now;
        }
      } else if (!needsSnap && now - lastInteraction > IDLE_DELAY) {
        rotY += IDLE_SPEED;
      }
      apply();
    }, 16);
  }


  /* ================= Ma'lumot yuklash ================= */
  let dataPromise = null;
  function loadData() {
    if (dataPromise) return dataPromise;
    const safe = (p, fb) => p.catch(() => fb);
    let statsP;
    if (!window.__visitTracked) {
      window.__visitTracked = true;
      statsP = Api.trackVisit().catch(() => Api.siteStats());
    } else {
      statsP = Api.siteStats();
    }
    dataPromise = Promise.all([
      safe(Api.siteSettings(), {}), safe(Api.profile(), {}), safe(Api.socialLinks(), []),
      safe(Api.services(), []), safe(Api.insideWorld(), []), safe(Api.skills(), []),
      safe(Api.journey(), []), safe(Api.portfolioCategories(), []), safe(Api.portfolioList(), []),
      safe(Api.threadList(), []), safe(Api.team(), []), safe(Api.studentCategories(), []),
      safe(Api.studentList(), []), safe(statsP, null),
    ]).then((r) => {
      const d = {
        settings: r[0] || {}, profile: r[1] || {}, socials: r[2] || [], services: r[3] || [], insideWorld: r[4] || [],
        skills: r[5] || [], journey: r[6] || [], categories: r[7] || [], projects: r[8] || [], posts: r[9] || [],
        team: r[10] || [], studentCats: r[11] || [], students: r[12] || [], stats: r[13],
      };
      applySiteSettings(d.settings);
      return d;
    });
    return dataPromise;
  }

  function applySiteSettings(s) {
    if (s.site_name) document.title = s.site_name;
    if (s.meta_description) {
      let m = document.querySelector("meta[name='description']");
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.content = s.meta_description;
    }
    if (s.cube_rotation_seconds) window.__cubeRotationSeconds = Number(s.cube_rotation_seconds);
  }

  /* ================= Umumiy bo'laklar ================= */
  function sectionHead(kicker, title, linkHref, linkText) {
    return `<div class="ug-sec-head" data-reveal>
      <div><span class="ug-eyebrow">${esc(kicker)}</span><h2 class="ug-h2">${esc(title)}</h2></div>
      ${linkHref ? `<a class="ug-pill-link" href="${linkHref}">${esc(linkText)}</a>` : ""}
    </div>`;
  }
  function projectCard(p) {
    return `<a class="ug-card ug-project ug-lift" data-reveal data-cat="${esc(p.category ? p.category.slug : "")}" href="#/portfolio/${encodeURIComponent(p.slug)}">
      <div class="ug-project-cover">${p.cover_image ? `<img src="${esc(p.cover_image)}" alt="${esc(p.title)}" loading="lazy">` : ""}</div>
      <div class="ug-project-body">
        <span class="ug-tag">${esc(p.category ? p.category.name : "Loyiha")}</span>
        <h3 class="ug-h3">${esc(p.title)}</h3>
        <p>${esc(p.short_description)}</p>
      </div>
    </a>`;
  }
  function postMeta(b) {
    const parts = [fmtDate(b.published_at), (b.read_minutes || 5) + " daqiqa"];
    if (b.views != null) parts.push("👁 " + b.views);
    if (b.comment_count != null) parts.push("💬 " + b.comment_count);
    return parts.filter(Boolean).join(" · ");
  }
  function postCard(b) {
    return `<a class="ug-card ug-post ug-lift" data-reveal href="#/blog/${encodeURIComponent(b.slug)}">
      <span class="ug-meta">${esc(postMeta(b))}</span>
      <h3 class="ug-h3">${esc(b.title)}</h3>
      <p>${esc(b.excerpt)}</p>
    </a>`;
  }
  function socialsHtml(list) {
    const items = (list || []).filter((s) => safeUrl(s.url));
    if (!items.length) return "";
    return `<div class="ug-socials">${items.map((s) => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.platform)}">${socialIconSvg(s.platform)}</a>`).join("")}</div>`;
  }
  function contactRows(profile) {
    const rows = [];
    if (profile.email) rows.push({ icon: "✉", label: "Email", value: profile.email });
    if (profile.phone) rows.push({ icon: "☎", label: "Telefon", value: profile.phone });
    if (profile.location) rows.push({ icon: "◎", label: "Manzil", value: profile.location });
    if (profile.birthday) rows.push({ icon: "✦", label: "Tug'ilgan kun", value: fmtDate(profile.birthday) });
    return rows;
  }
  function yearsSince(journey) {
    const years = (journey || []).map((j) => parseInt(j.year, 10)).filter((y) => y > 1990);
    if (!years.length) return 0;
    return Math.max(1, new Date().getFullYear() - Math.min.apply(null, years));
  }

  /* ================= Sahifalar ================= */
  const views = {};

  views.home = function (d) {
    const p = d.profile;
    const stats = [];
    if (d.projects.length) stats.push({ n: d.projects.length, l: "Tugallangan loyiha" });
    if (d.students.length) stats.push({ n: d.students.length, l: "O'quvchi" });
    const yrs = yearsSince(d.journey);
    if (yrs) stats.push({ n: yrs, l: "Yillik tajriba" });
    return `
    <section class="ug-hero">
      <div class="ug-hero-bg"><div class="ug-blob ug-blob-1"></div><div class="ug-blob ug-blob-2"></div><div class="ug-blob ug-blob-3"></div></div>
      <div class="ug-hero-grid">
        <div>
          <span class="ug-badge"><i></i>Yangi loyihalar uchun ochiq</span>
          <h1>
            <span class="ug-line"><span>G'oyani ishlaydigan</span></span>
            <span class="ug-line"><span>mahsulotga</span></span>
            <span class="ug-line"><span>aylantiramiz</span></span>
          </h1>
          <p class="ug-hero-lead">${esc(HERO_LEAD)}</p>
          <div class="ug-hero-cta">
            <a class="ug-btn ug-btn-primary" href="#/portfolio">Ishlarni ko'rish</a>
            <a class="ug-btn ug-btn-ghost" href="#/xizmatlar">Xizmatlar va narxlar</a>
          </div>
          ${stats.length ? `<div class="ug-stats">${stats.map((s) => `<div class="ug-stat"><b data-count="${s.n}">0</b><span>${esc(s.l)}</span></div>`).join("")}</div>` : ""}
        </div>
        <div class="ug-hero-art">
          <div class="ug-ring"></div>
          <div class="ug-avatar-blob">${p.avatar ? `<img src="${esc(p.avatar)}" alt="${esc(p.display_name || p.full_name || "Umarov")}">` : "U"}</div>
          <div class="ug-chip ug-chip-1">🐍 Django</div>
          <div class="ug-chip ug-chip-2">✈️ Telegram bot</div>
          <div class="ug-chip ug-chip-3">⚙️ DevOps</div>
        </div>
      </div>
    </section>
    <div class="ug-marquee"><div class="ug-marquee-track"><span>${esc(MARQUEE)}</span><span>${esc(MARQUEE)}</span></div></div>
    ${d.services.length ? `<section class="ug-sec"><div class="ug-w">
      ${sectionHead("Xizmatlar", "Nima bilan shug'ullanamiz", "#/xizmatlar", "Barchasi →")}
      <div class="ug-grid" style="--min:260px">${d.services.slice(0, 4).map((s, i) => serviceCard(s, i, false)).join("")}</div>
    </div></section>` : ""}
    ${d.projects.length ? `<section class="ug-sec"><div class="ug-w">
      ${sectionHead("Portfolio", "Tanlangan ishlar", "#/portfolio", "Barcha loyihalar →")}
      <div class="ug-grid" style="--min:300px;gap:26px">${d.projects.slice(0, 3).map(projectCard).join("")}</div>
    </div></section>` : ""}
    <section class="ug-sec" style="padding-bottom:96px">
      <div class="ug-cta-band" data-reveal><div class="ug-cta-in">
        <h2>Loyihangiz haqida gaplashamizmi?</h2>
        <p>Qisqa brifdan boshlaymiz — 24 soat ichida taklif va taxminiy muddatni yuboraman.</p>
        <div class="ug-hero-cta" style="margin:0">
          <a class="ug-btn ug-btn-on" href="#/aloqa">Xabar yuborish</a>
          <a class="ug-btn ug-btn-line-on" href="#/narxlar">Narxlarni ko'rish</a>
        </div>
      </div></div>
    </section>
    ${d.posts.length ? `<section class="ug-sec" style="padding-bottom:100px"><div class="ug-w">
      ${sectionHead("Blog", "So'nggi yozuvlar", "#/blog", "Blogga o'tish →")}
      <div class="ug-grid">${d.posts.slice(0, 3).map(postCard).join("")}</div>
    </div></section>` : ""}`;
  };

  function serviceCard(s, i, large) {
    return `<div class="ug-card ug-service ${large ? "ug-service-lg" : ""} ug-lift" data-reveal>
      <span class="ug-num">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="ug-h3">${esc(s.title)}</h3>
      <p>${esc(s.description)}</p>
      ${large ? `<a class="ug-more" href="#/aloqa">Buyurtma berish →</a>` : ""}
    </div>`;
  }

  views.services = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w">
      <span class="ug-eyebrow">Xizmatlar</span>
      <h1 class="ug-h1" style="max-width:16ch">G'oyadan ishga tushirishgacha</h1>
      <p class="ug-lead">Har bir loyiha bir xil tartibda boradi: brif, prototip, ishlab chiqish, serverga joylash va qo'llab-quvvatlash.</p>
      <div class="ug-grid" style="--min:300px;gap:24px;margin-top:56px">${d.services.map((s, i) => serviceCard(s, i, true)).join("") || `<p class="ug-empty">Hozircha xizmatlar qo'shilmagan.</p>`}</div>
    </div></section>`;
  };

  function cubeHtml() {
    const faces = CUBE_FACES.map((f, i) => {
      const brand = cubeFaceIconSvg(f.icon);
      const ico = brand || (f.icon === "telegram" ? socialIconSvg("telegram") : cardIconSvg(f.icon));
      return `<div class="ug-face ${CUBE_FACE_CLASSES[i]}"><div class="ug-face-in">
        <span class="ug-face-ico">${ico}</span><h4>${esc(f.title)}</h4><p>${esc(f.tech).replace(/\n/g, "<br>")}</p>
      </div></div>`;
    }).join("");
    return `<div class="ug-cube-wrap"><div class="ug-cube-scene"><div class="ug-cube" id="ug-cube">${faces}</div></div></div>`;
  }

  views.about = function (d) {
    const p = d.profile;
    const st = d.stats;
    return `<section class="ug-page-sec" style="padding-bottom:60px"><div class="ug-w ug-w1080">
      <span class="ug-eyebrow">Men haqimda</span>
      <h1 class="ug-h1">${esc(p.display_name || p.full_name || "Abduaziz Umarov")}</h1>
      <div class="ug-about-hero">
        <div class="ug-about-text">
          ${p.about_intro ? `<p>${esc(p.about_intro).replace(/\n/g, "<br>")}</p>` : ""}
          ${p.about_extra ? `<p>${esc(p.about_extra).replace(/\n/g, "<br>")}</p>` : ""}
          ${st ? `<div class="ug-chips"><span class="ug-tag">👁 ${esc(st.visits)} tashrif</span><span class="ug-tag ug-tag-accent">💬 ${esc(st.comments)} izoh</span><span class="ug-tag">✉ ${esc(st.contact_messages)} so'rov</span></div>` : ""}
        </div>
        ${cubeHtml()}
      </div>
      ${d.insideWorld.length ? `<div class="ug-grid" data-reveal style="--min:240px;gap:20px;margin-top:56px">${d.insideWorld.map((c) => `<div class="ug-card ug-inside">
        <h3 class="ug-h3">${esc(c.title)}</h3>
        ${c.card_type === "list" && c.items && c.items.length
          ? `<ul>${c.items.map((i) => `<li>${i.emoji ? esc(i.emoji) + " " : ""}${i.bold_part ? `<b>${esc(i.bold_part)}</b> ` : ""}${esc(i.rest_text)}</li>`).join("")}</ul>`
          : `<p>${esc(c.body_text)}</p>`}
      </div>`).join("")}</div>` : ""}
    </div></section>
    ${d.journey.length ? `<section class="ug-sec" style="padding-bottom:96px"><div class="ug-w ug-w1080">
      <h2 class="ug-h2" data-reveal style="margin:0 0 40px">Yo'lim</h2>
      <div class="ug-timeline">${d.journey.map((j) => `<div class="ug-tl-item" data-reveal>
        <span class="ug-tag">${esc(j.year)}</span><h3 class="ug-h3">${esc(j.title)}</h3><p>${esc(j.description)}</p>
      </div>`).join("")}</div>
    </div></section>` : ""}`;
  };

  views.portfolio = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w">
      <span class="ug-eyebrow">Portfolio</span>
      <h1 class="ug-h1" style="margin-bottom:0">Ishlar arxivi</h1>
      <div class="ug-filters" data-filter-group="cat">
        <button type="button" class="ug-filter active" data-filter="all">Barchasi</button>
        ${d.categories.map((c) => `<button type="button" class="ug-filter" data-filter="${esc(c.slug)}">${esc(c.name)}</button>`).join("")}
      </div>
      <div class="ug-grid" id="ug-filter-target" style="--min:300px;gap:26px">${d.projects.map(projectCard).join("") || `<p class="ug-empty">Hozircha loyihalar qo'shilmagan.</p>`}</div>
    </div></section>`;
  };

  views.project = function (d, extra) {
    const p = extra;
    if (!p) return notFound("Loyiha topilmadi", "#/portfolio", "← Portfolioga qaytish");
    return `<section class="ug-page-sec ug-project-detail" style="padding-top:clamp(40px,5vw,72px)"><div class="ug-w ug-w940">
      <a class="ug-back" href="#/portfolio">← Portfolioga qaytish</a>
      <h1 class="ug-h1" style="font-size:clamp(32px,5vw,64px);margin-top:18px">${esc(p.title)}</h1>
      ${p.short_description ? `<p class="ug-lead" style="margin:18px 0 32px">${esc(p.short_description)}</p>` : ""}
      ${p.cover_image ? `<div class="ug-cover"><img src="${esc(p.cover_image)}" alt="${esc(p.title)}"></div>` : ""}
      ${p.description ? `<p class="ug-body" style="white-space:pre-line">${esc(p.description)}</p>` : ""}
      ${p.tags && p.tags.length ? `<div class="ug-tags" style="margin-top:26px">${p.tags.map((t) => `<span class="ug-tag">${esc(t.name)}</span>`).join("")}</div>` : ""}
      <div class="ug-detail-actions">
        ${safeUrl(p.project_url) ? `<a class="ug-btn ug-btn-primary" href="${safeUrl(p.project_url)}" target="_blank" rel="noopener">Saytni ochish</a>` : ""}
        ${safeUrl(p.github_url) ? `<a class="ug-btn ug-btn-ghost" href="${safeUrl(p.github_url)}" target="_blank" rel="noopener">GitHub</a>` : ""}
        <a class="ug-btn ug-btn-ghost" href="#/aloqa">Shunday loyiha kerak</a>
      </div>
      ${p.gallery && p.gallery.length ? `<div class="ug-gallery">${p.gallery.map((g) => `<img src="${esc(g.image)}" alt="" loading="lazy">`).join("")}</div>` : ""}
    </div></section>`;
  };

  views.pricing = function () {
    return `<section class="ug-page-sec"><div class="ug-w ug-w1180">
      <span class="ug-eyebrow">Narxlar</span>
      <h1 class="ug-h1">Shaffof paketlar</h1>
      <p class="ug-lead" style="max-width:56ch">Narx loyiha hajmiga qarab aniqlashtiriladi. Quyidagilar — eng ko'p buyurtma qilinadigan uch paket.</p>
      <div class="ug-grid" style="--min:280px;gap:24px;align-items:start;margin-top:52px">${PLANS.map((p) => `<div class="ug-card ug-plan" data-reveal>
        <h3 class="ug-h3">${esc(p.name)}</h3><p>${esc(p.tagline)}</p>
        <div class="ug-price">${esc(p.price)}</div>
        <div class="ug-feats">${p.features.map((f) => `<div><i>✓</i><span>${esc(f)}</span></div>`).join("")}</div>
        <a class="ug-btn ug-btn-primary ug-btn-block" href="#/aloqa">Tanlash</a>
      </div>`).join("")}</div>
    </div></section>`;
  };

  views.resume = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w ug-w960">
      <span class="ug-eyebrow">Resume</span>
      <h1 class="ug-h1" style="margin-bottom:40px">Ko'nikmalar va tajriba</h1>
      <div class="ug-skills">${d.skills.map((k) => `<div data-reveal>
        <div class="ug-skill-top"><span><b>${esc(k.label)}</b> — ${esc(k.items)}</span><em>${esc(k.level_percent)}%</em></div>
        <div class="ug-bar"><div data-bar="${esc(k.level_percent)}"></div></div>
      </div>`).join("") || `<p class="ug-empty">Ko'nikmalar hali qo'shilmagan.</p>`}</div>
      ${d.journey.length ? `<h2 class="ug-h2" style="margin:66px 0 32px;font-size:clamp(26px,3.4vw,42px)">Tajriba</h2>
      <div style="display:grid;gap:18px">${d.journey.map((j) => `<div class="ug-exp" data-reveal><span>${esc(j.year)}</span><h3 class="ug-h3">${esc(j.title)}</h3><p>${esc(j.description)}</p></div>`).join("")}</div>` : ""}
    </div></section>`;
  };

  views.blog = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w ug-w1080">
      <span class="ug-eyebrow">Blog</span>
      <h1 class="ug-h1" style="margin-bottom:40px">Yozuvlar</h1>
      <div style="display:grid;gap:20px">${d.posts.map((b) => `<a class="ug-card ug-post-row ug-lift" data-reveal href="#/blog/${encodeURIComponent(b.slug)}">
        <div class="ug-post-cover">${b.cover_image ? `<img src="${esc(b.cover_image)}" alt="${esc(b.title)}" loading="lazy">` : ""}</div>
        <div><span class="ug-meta">${esc(postMeta(b))}</span><h2>${esc(b.title)}</h2><p>${esc(b.excerpt)}</p></div>
      </a>`).join("") || `<p class="ug-empty">Hozircha postlar yo'q.</p>`}</div>
    </div></section>`;
  };

  views.post = function (d, extra) {
    if (!extra) return notFound("Post topilmadi", "#/blog", "← Blogga qaytish");
    const b = extra.post, comments = extra.comments || [];
    return `<section class="ug-page-sec ug-post-detail" style="padding-top:clamp(40px,5vw,72px)"><div class="ug-w ug-w760">
      <a class="ug-back" href="#/blog">← Blogga qaytish</a>
      <span class="ug-meta" style="display:block;margin-top:22px">${esc(postMeta(b))}</span>
      <h1 class="ug-h1" style="font-size:clamp(32px,4.6vw,58px);margin:14px 0 24px;line-height:1.08">${esc(b.title)}</h1>
      ${b.cover_image ? `<div class="ug-cover"><img src="${esc(b.cover_image)}" alt="${esc(b.title)}"></div>` : ""}
      <p class="ug-body" style="white-space:pre-line">${esc(b.body)}</p>
      ${b.tags && b.tags.length ? `<div class="ug-tags" style="margin-top:26px">${b.tags.map((t) => `<span class="ug-tag">${esc(t.name)}</span>`).join("")}</div>` : ""}
      <h2 class="ug-h2" style="font-size:clamp(24px,3vw,36px);margin-top:56px">Izohlar</h2>
      <div class="ug-comments">${comments.map((c) => `<div class="ug-comment"><b>${esc(c.name)}</b><small>${esc(fmtDate(c.created_at))}</small><p>${esc(c.message)}</p></div>`).join("") || `<p class="ug-muted">Hozircha izohlar yo'q — birinchi bo'lib fikr bildiring.</p>`}</div>
      <div class="ug-comment-box">
        <h3 class="ug-h3">Izoh qoldiring</h3>
        <form class="ug-form" id="ug-comment-form" data-slug="${esc(b.slug)}">
          <input class="ug-input" name="name" placeholder="Ismingiz" required>
          <textarea class="ug-textarea" name="message" placeholder="Fikringiz..." rows="4" required></textarea>
          <button class="ug-btn ug-btn-primary" type="submit" style="justify-self:start">Yuborish</button>
        </form>
        <p class="ug-form-msg" id="ug-form-msg"></p>
      </div>
    </div></section>`;
  };

  views.contact = function (d) {
    const rows = contactRows(d.profile);
    return `<section class="ug-page-sec"><div class="ug-w ug-w1080"><div class="ug-contact-grid">
      <div>
        <span class="ug-eyebrow">Aloqa</span>
        <h1 class="ug-h1" style="font-size:clamp(34px,4.8vw,62px);line-height:1.04">Keling, gaplashamiz</h1>
        <p class="ug-lead" style="font-size:17px;max-width:44ch;margin-top:20px">Loyiha, kurs yoki hamkorlik — qaysi savol bo'lsa ham yozing. Odatda bir ish kuni ichida javob beraman.</p>
        <div class="ug-contact-list">${rows.map((r) => `<div class="ug-contact-row"><span>${r.icon}</span><div><small>${esc(r.label)}</small><b>${esc(r.value)}</b></div></div>`).join("")}</div>
        ${socialsHtml(d.socials)}
      </div>
      <div class="ug-form-card">
        <h2>Brif yuborish</h2>
        <form class="ug-form" id="ug-contact-form">
          <input class="ug-input" name="name" placeholder="Ismingiz" required>
          <input class="ug-input" name="email" type="email" placeholder="Email" required>
          <textarea class="ug-textarea" name="message" placeholder="Loyihangiz haqida qisqacha..." rows="5" required></textarea>
          <button class="ug-btn ug-btn-primary" type="submit">Yuborish</button>
        </form>
        <p class="ug-form-msg" id="ug-form-msg"></p>
      </div>
    </div></div></section>`;
  };

  views.team = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w">
      <span class="ug-eyebrow">Jamoa</span>
      <h1 class="ug-h1">Har bir loyiha ortida zo'r jamoa bor</h1>
      <div class="ug-grid" style="--min:260px;gap:24px;margin-top:52px">${d.team.map((m) => {
        const link = safeUrl(m.portfolio_url) || safeUrl(m.github_url) || safeUrl(m.linkedin_url) || safeUrl(m.telegram_url);
        const socials = [["github", m.github_url], ["linkedin", m.linkedin_url], ["telegram", m.telegram_url]].filter((s) => safeUrl(s[1]));
        return `<div class="ug-card ug-person ug-lift" data-reveal style="--c:${/^#[0-9a-f]{3,8}$/i.test(m.accent_color || "") ? m.accent_color : "#c67139"}">
          <span class="ug-badge-ico">${cardIconSvg(m.icon)}</span>
          <div class="ug-person-photo">${m.avatar ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}" loading="lazy">` : "🙂"}</div>
          <h3 class="ug-h3">${esc(m.name)}</h3>
          <span class="ug-role">${esc(m.role)}</span>
          ${m.skills ? `<div class="ug-tags">${tagList(m.skills).map((t) => `<span class="ug-tag">${esc(t)}</span>`).join("")}</div>` : ""}
          ${m.description ? `<p>${esc(m.description)}</p>` : ""}
          <div class="ug-person-foot">
            <div class="ug-socials">${socials.map((s) => `<a href="${safeUrl(s[1])}" target="_blank" rel="noopener" aria-label="${s[0]}">${socialIconSvg(s[0])}</a>`).join("")}</div>
            ${link ? `<a class="ug-go" href="${link}" target="_blank" rel="noopener" aria-label="Portfolio">${arrowIconSvg()}</a>` : ""}
          </div>
        </div>`;
      }).join("") || `<p class="ug-empty">Hozircha jamoa a'zolari qo'shilmagan.</p>`}</div>
    </div></section>`;
  };

  views.students = function (d) {
    return `<section class="ug-page-sec"><div class="ug-w">
      <span class="ug-eyebrow">O'quvchilar</span>
      <h1 class="ug-h1">Bilim ulashish — eng katta boylik</h1>
      <div class="ug-filters" data-filter-group="cat">
        <button type="button" class="ug-filter active" data-filter="all">Barchasi</button>
        ${d.studentCats.map((c) => `<button type="button" class="ug-filter" data-filter="${esc(c.slug)}">${esc(c.name)}</button>`).join("")}
        <input type="search" class="ug-input ug-search" id="ug-student-search" placeholder="O'quvchi qidirish...">
      </div>
      <div class="ug-grid" id="ug-filter-target" style="--min:220px;gap:22px">${d.students.map((s) => {
        const slug = s.category ? s.category.slug : "";
        const range = (s.start_date || s.end_date) ? `${s.start_date ? fmtMonthYear(s.start_date) : ""} – ${s.end_date ? fmtMonthYear(s.end_date) : "hozir"}` : "";
        return `<div class="ug-card ug-student ug-lift" data-reveal data-cat="${esc(slug)}" data-name="${esc((s.name || "").toLowerCase())}" style="--c:${paletteColor(slug || "x")}">
          <div class="ug-student-photo">${s.photo ? `<img src="${esc(s.photo)}" alt="${esc(s.name)}" loading="lazy">` : "🙂"}</div>
          <h3 class="ug-h3">${esc(s.name)}</h3>
          <span class="ug-role">${esc(s.role)}</span>
          ${s.skills ? `<div class="ug-tags">${tagList(s.skills).map((t) => `<span class="ug-tag">${esc(t)}</span>`).join("")}</div>` : ""}
          <div class="ug-student-meta">${range ? esc(range) + "<br>" : ""}${esc(s.project_count)} ta loyiha</div>
          ${safeUrl(s.portfolio_url) ? `<a class="ug-btn" href="${safeUrl(s.portfolio_url)}" target="_blank" rel="noopener">Portfolio →</a>` : ""}
        </div>`;
      }).join("") || `<p class="ug-empty">Hozircha o'quvchilar qo'shilmagan.</p>`}</div>
    </div></section>`;
  };

  function notFound(title, href, back) {
    return `<section class="ug-page-sec"><div class="ug-w ug-w760"><h1 class="ug-h1">${esc(title)}</h1><p class="ug-lead"><a class="ug-back" href="${href}">${esc(back)}</a></p></div></section>`;
  }

  /* ================= Qobiq (header/footer) ================= */
  function shellHtml() {
    return `
    <div class="ug-progress"><div></div></div>
    <div class="ug-glow" id="ug-glow"></div>
    <div class="ug-shell">
      <header class="ug-header"><div class="ug-header-in">
        <a class="ug-brand" href="#/"><span class="ug-mark" aria-hidden="true"></span><span class="ug-brand-name">Umarov Group</span></a>
        <nav class="ug-nav" id="ug-nav">${NAV.map((n) => `<a href="${n.href}" data-key="${n.key}">${esc(n.label)}</a>`).join("")}</nav>
        <div class="ug-actions">
          <button type="button" class="ug-theme-btn" id="ug-theme" aria-label="Rejimni almashtirish"></button>
          <a class="ug-btn ug-btn-primary ug-btn-sm" href="#/aloqa">Loyiha boshlash</a>
        </div>
      </div></header>
      <main id="ug-page"><p class="ug-boot">Yuklanmoqda...</p></main>
      <footer class="ug-footer" id="ug-footer"></footer>
    </div>`;
  }

  function footerHtml(d) {
    const rows = contactRows(d.profile);
    return `<div class="ug-footer-grid">
      <div><a class="ug-brand" href="#/"><span class="ug-mark" aria-hidden="true"></span><span class="ug-brand-name">Umarov Group</span></a>
        <p>Web ishlab chiqish, Telegram botlar va IT ta'lim.</p></div>
      <div><h4>Sahifalar</h4><div class="ug-footer-links">${NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("")}</div></div>
      <div><h4>Aloqa</h4><div class="ug-footer-links">
        ${rows.map((r) => `<span>${esc(r.value)}</span>`).join("")}
        <a href="#/aloqa">Xabar yuborish</a>
        <a href="/admin" data-admin-link>Admin panel</a>
      </div></div>
    </div>
    <div class="ug-footer-bottom"><span>© ${new Date().getFullYear()} Umarov Group</span><span>${d.stats ? "👁 " + esc(d.stats.visits) + " tashrif" : ""}</span></div>`;
  }

  /* ================= Router va effektlar ================= */
  let io = null, listenersBound = false, renderToken = 0;

  function currentTheme() { return document.documentElement.getAttribute("data-ugtheme") === "dark" ? "dark" : "light"; }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-ugtheme", t);
    try { localStorage.setItem("ug-theme", t); } catch (e) { /* ignore */ }
    const btn = document.getElementById("ug-theme");
    if (btn) btn.textContent = t === "dark" ? "☀" : "☾";
  }

  async function render() {
    const token = ++renderToken;
    const route = parseRoute();
    const page = document.getElementById("ug-page");
    if (!page) return;
    const activeKey = route.name === "project" ? "portfolio" : route.name === "post" ? "blog" : route.name;
    document.querySelectorAll("#ug-nav a").forEach((a) => a.classList.toggle("active", a.dataset.key === activeKey));
    const d = await loadData();
    if (token !== renderToken) return;

    let extra = null;
    if (route.name === "project") {
      page.innerHTML = `<p class="ug-boot">Yuklanmoqda...</p>`;
      try { extra = await Api.portfolioDetail(route.slug); } catch (e) { extra = null; }
    } else if (route.name === "post") {
      page.innerHTML = `<p class="ug-boot">Yuklanmoqda...</p>`;
      try {
        const [post, comments] = await Promise.all([Api.threadDetail(route.slug), Api.threadComments(route.slug).catch(() => [])]);
        extra = { post, comments };
      } catch (e) { extra = null; }
    }
    if (token !== renderToken) return;

    page.innerHTML = (views[route.name] || views.home)(d, extra);
    const footer = document.getElementById("ug-footer");
    if (footer) footer.innerHTML = footerHtml(d);
    window.scrollTo({ top: 0, behavior: "auto" });
    if (page.animate) page.animate([{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "none" }], { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" });
    afterRender(route);
  }

  function afterRender(route) {
    const page = document.getElementById("ug-page");

    page.querySelectorAll("[data-reveal]").forEach((el) => { if (io) io.observe(el); });
    setTimeout(() => page.querySelectorAll("[data-reveal]:not([data-reveal='in'])").forEach((el) => el.setAttribute("data-reveal", "in")), 2600);

    page.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step); else el.textContent = String(target);
      };
      requestAnimationFrame(step);
    });
    page.querySelectorAll("[data-bar]").forEach((el) => {
      const v = el.getAttribute("data-bar");
      setTimeout(() => { el.style.width = v + "%"; }, 80);
    });

    const cube = document.getElementById("ug-cube");
    if (cube) initSkillsCube(cube);

    const filters = page.querySelectorAll(".ug-filter");
    const target = document.getElementById("ug-filter-target");
    if (filters.length && target) {
      const search = document.getElementById("ug-student-search");
      const apply = () => {
        const active = page.querySelector(".ug-filter.active").dataset.filter;
        const q = search ? search.value.trim().toLowerCase() : "";
        target.querySelectorAll("[data-cat]").forEach((card) => {
          const okCat = active === "all" || card.dataset.cat === active;
          const okName = !q || (card.dataset.name || "").includes(q);
          card.style.display = okCat && okName ? "" : "none";
        });
      };
      filters.forEach((btn) => btn.addEventListener("click", () => {
        filters.forEach((b) => b.classList.toggle("active", b === btn));
        apply();
      }));
      if (search) search.addEventListener("input", apply);
    }

    const contactForm = document.getElementById("ug-contact-form");
    if (contactForm) contactForm.addEventListener("submit", (ev) => submitForm(ev, (data) => Api.sendContact(data),
      "Rahmat! Xabaringiz yuborildi.", "Hozircha yuborib bo'lmadi — Telegram yoki email orqali yozing."));
    const commentForm = document.getElementById("ug-comment-form");
    if (commentForm) commentForm.addEventListener("submit", (ev) => submitForm(ev, (data) => Api.postComment(commentForm.dataset.slug, data),
      "Izohingiz qabul qilindi — tasdiqlangach chiqadi.", "Izohni yuborib bo'lmadi. Keyinroq urinib ko'ring."));
  }

  async function submitForm(ev, send, okMsg, errMsg) {
    ev.preventDefault();
    const form = ev.target;
    const msg = document.getElementById("ug-form-msg");
    if (msg) msg.textContent = "Yuborilmoqda...";
    try {
      await send(Object.fromEntries(new FormData(form).entries()));
      form.reset();
      if (msg) msg.textContent = okMsg;
    } catch (e) {
      if (msg) msg.textContent = errMsg;
    }
  }

  function bindGlobalListeners() {
    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener("hashchange", () => { if (window.__activeApp === "public") render(); });
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--prog", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
    }, { passive: true });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("mousemove", (e) => {
        if (window.__activeApp !== "public") return;
        document.documentElement.style.setProperty("--mx", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        document.documentElement.style.setProperty("--my", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
        const glow = document.getElementById("ug-glow");
        if (glow) glow.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      });
    }

    io = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        setTimeout(() => el.setAttribute("data-reveal", "in"), (i % 6) * 70);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.addEventListener("click", (ev) => {
      if (window.__activeApp !== "public") return;
      const themeBtn = ev.target.closest("#ug-theme");
      if (themeBtn) { applyTheme(currentTheme() === "dark" ? "light" : "dark"); return; }
      const adminLink = ev.target.closest("[data-admin-link]");
      if (adminLink && window.navigateTo) { ev.preventDefault(); window.navigateTo("/admin"); }
    });
  }

  function mount() {
    const root = document.getElementById("app-root");
    root.innerHTML = shellHtml();
    applyTheme(currentTheme());
    bindGlobalListeners();
    render();
    loadData().then((d) => {
      if (window.UgAssistant) window.UgAssistant.mount(root.querySelector(".ug-shell"), d.settings);
    });
  }

  window.PublicApp = { mount: mount };
})();
