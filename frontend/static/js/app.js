/* Hanzo-Dev tipidagi SPA frontend. Hash-router: #/about #/resume
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

/* ---------------- Sidebar ---------------- */
async function renderSidebar() {
  try {
    const [profile, socials] = await Promise.all([Api.profile(), Api.socialLinks()]);
    document.title = profile.display_name || "Hanzo-Dev";

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
      <div class="avatar-frame">${avatar}</div>
      <div class="profile-name">${esc(profile.display_name)}</div>
      <div class="profile-badge">${esc(profile.title)}</div>
      <div class="contact-info">${rows.join("")}</div>
      ${socialsHtml}
    `;
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
  } catch (e) { /* sokin xato — default stil ishlatiladi */ }
}

/* ---------------- Nav tabs ---------------- */
function setActiveTab(tab) {
  navTabsEl.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
}

/* ---------------- Route: About ---------------- */
async function routeAbout() {
  setActiveTab("about");
  contentEl.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const [profile, services, insideWorld] = await Promise.all([
      Api.profile(), Api.services(), Api.insideWorld(),
    ]);

    const servicesHtml = services.length ? `
      <h2 class="section-title">What I Do</h2>
      <div class="card-grid-2">
        ${services.map(s => `
          <div class="card">
            <span class="card-icon">${cardIconSvg(s.icon)}</span>
            <div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
          </div>`).join("")}
      </div>` : "";

    const insideHtml = insideWorld.length ? `
      <h2 class="section-title">Inside ${esc(profile.display_name)}'s World</h2>
      <div class="inside-grid">
        ${insideWorld.map(card => `
          <div class="card">
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
      ${profile.about_intro ? `<p class="lead-text">${nl2br(profile.about_intro)}</p>` : ""}
      ${profile.about_extra ? `<p class="lead-text">${nl2br(profile.about_extra)}</p>` : ""}
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
            <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${g.level_percent}%"></div></div>
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
  } catch (e) {
    contentEl.innerHTML = `<p class="loading-text">Ma'lumot yuklanmadi.</p>`;
  }
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
      <a class="portfolio-card" href="#/portfolio/${encodeURIComponent(p.slug)}">
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
      <div class="portfolio-grid">${p.gallery.map(g => `<div class="portfolio-thumb"><img src="${g.image}" alt=""></div>`).join("")}</div>` : "";
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
      <a class="thread-card" href="#/thread/${encodeURIComponent(post.slug)}">
        <div class="thread-meta">${formatDate(post.published_at)} &nbsp; <span class="read-time">${post.read_minutes} min read</span></div>
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
      <div class="thread-meta" style="margin-bottom:24px">${formatDate(post.published_at)} &nbsp; <span class="read-time">${post.read_minutes} min read</span></div>
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

/* ---------------- Router ---------------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const query = new URLSearchParams(queryPart || "");
  return { segments, query };
}

function router() {
  const { segments, query } = parseHash();
  const [section, param] = segments;

  if (!section || section === "about") return routeAbout();
  if (section === "resume") return routeResume();
  if (section === "portfolio") return param ? routePortfolioDetail(param) : routePortfolio(query.get("category") || "all");
  if (section === "thread") return param ? routeThreadDetail(param) : routeThread();
  return routeAbout();
}

let publicHashListenerAttached = false;

/* Bosh sahifa uchun HTML skelet + kerakli render funksiyalarini ishga tushiradi.
   router.js shu funksiyani chaqiradi. */
function mountPublicApp() {
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

  applySiteSettings();
  renderSidebar();
  router();

  if (!publicHashListenerAttached) {
    window.addEventListener("hashchange", () => {
      if (window.__activeApp === "public") router();
    });
    publicHashListenerAttached = true;
  }
}

window.PublicApp = { mount: mountPublicApp };
