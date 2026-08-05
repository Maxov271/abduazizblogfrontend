/* Admin panel — /admin yo'lida ishlaydi. Token localStorage'da saqlanadi,
   har bir so'rovda Authorization: Token <key> header'i bilan yuboriladi. */

const ADMIN_TOKEN_KEY = "hanzodev_admin_token";

function getToken() { return localStorage.getItem(ADMIN_TOKEN_KEY); }
function setToken(t) { localStorage.setItem(ADMIN_TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); }

async function adminFetch(path, { method = "GET", body = null, isFormData = false } = {}) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Token ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401) { clearToken(); navigateTo("/admin"); throw new Error("Sessiya tugadi"); }

  let data = null;
  try { data = await res.json(); } catch (_) { /* 204 no content */ }
  if (!res.ok) { const e = new Error("Admin API xatosi"); e.body = data; e.status = res.status; throw e; }
  return data;
}

/* ---------------- Model configuratsiyasi ---------------- */
/* Har bir field: {name, label, type} — type: text|textarea|number|email|url|date|image|select|fk|m2m|bool */
const ADMIN_MODELS = {
  "social-links": {
    label: "Ijtimoiy tarmoqlar", endpoint: "/admin/social-links/",
    fields: [
      { name: "platform", label: "Platforma", type: "select", options: [
        ["threads","Threads"],["instagram","Instagram"],["telegram","Telegram"],["github","GitHub"],
        ["linkedin","LinkedIn"],["facebook","Facebook"],["twitter","X / Twitter"],["youtube","YouTube"],["other","Boshqa"]] },
      { name: "url", label: "Havola", type: "url" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["platform", "url", "order"],
  },
  services: {
    label: "Xizmatlar (What I Do)", endpoint: "/admin/services/",
    fields: [
      { name: "icon", label: "Ikonka", type: "select", options: [
        ["brain","AI / Miya"],["code","Kod"],["laptop-code","Noutbuk"],["palette","Dizayn"],["rocket","Raketa"],["device-mobile","Telefon"]] },
      { name: "title", label: "Sarlavha", type: "text" },
      { name: "description", label: "Tavsif", type: "textarea" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["title", "icon", "order"],
  },
  "inside-world": {
    label: "Inside World kartalari", endpoint: "/admin/inside-world/",
    fields: [
      { name: "icon", label: "Ikonka (masalan: layers, brain, bolt)", type: "text" },
      { name: "title", label: "Sarlavha", type: "text" },
      { name: "card_type", label: "Turi", type: "select", options: [["text","Matn"],["list","Ro'yxat"]] },
      { name: "body_text", label: "Matn (turi=Matn bo'lsa)", type: "textarea" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["title", "card_type", "order"],
  },
  "inside-world-items": {
    label: "Inside World qatorlari", endpoint: "/admin/inside-world-items/",
    fields: [
      { name: "card", label: "Karta", type: "fk", related: "inside-world", display: "title" },
      { name: "emoji", label: "Emoji", type: "text" },
      { name: "bold_part", label: "Qalin qism", type: "text" },
      { name: "rest_text", label: "Qolgan matn", type: "text" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["bold_part", "rest_text", "order"],
  },
  skills: {
    label: "Skill guruhlari", endpoint: "/admin/skills/",
    fields: [
      { name: "label", label: "Nomi", type: "text" },
      { name: "items", label: "Texnologiyalar (vergul bilan)", type: "text" },
      { name: "level_percent", label: "Foiz (0-100)", type: "number" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["label", "items", "level_percent", "order"],
  },
  journey: {
    label: "My Journey", endpoint: "/admin/journey/",
    fields: [
      { name: "title", label: "Sarlavha", type: "text" },
      { name: "year", label: "Yil", type: "text" },
      { name: "description", label: "Tavsif", type: "textarea" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["title", "year", "order"],
  },
  "portfolio-categories": {
    label: "Portfolio kategoriyalari", endpoint: "/admin/portfolio-categories/",
    fields: [
      { name: "name", label: "Nomi", type: "text" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["name", "slug", "order"],
  },
  tags: {
    label: "Teglar", endpoint: "/admin/tags/",
    fields: [{ name: "name", label: "Nomi", type: "text" }],
    columns: ["name", "slug"],
  },
  portfolio: {
    label: "Portfolio loyihalari", endpoint: "/admin/portfolio/",
    fields: [
      { name: "title", label: "Nomi", type: "text" },
      { name: "category", label: "Kategoriya", type: "fk", related: "portfolio-categories", display: "name" },
      { name: "cover_image", label: "Muqova rasm", type: "image" },
      { name: "short_description", label: "Qisqa tavsif", type: "text" },
      { name: "description", label: "To'liq tavsif", type: "textarea" },
      { name: "project_url", label: "Live havola", type: "url" },
      { name: "github_url", label: "GitHub havola", type: "url" },
      { name: "tags", label: "Teglar", type: "m2m", related: "tags", display: "name" },
      { name: "is_published", label: "Chop etilgan", type: "bool" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["title", "category", "is_published", "order"],
  },
  "portfolio-gallery": {
    label: "Loyiha galereyasi", endpoint: "/admin/portfolio-gallery/",
    fields: [
      { name: "project", label: "Loyiha", type: "fk", related: "portfolio", display: "title" },
      { name: "image", label: "Rasm", type: "image" },
      { name: "order", label: "Tartib", type: "number" },
    ],
    columns: ["project", "order"],
  },
  thread: {
    label: "Thread postlari", endpoint: "/admin/thread/",
    fields: [
      { name: "title", label: "Sarlavha", type: "text" },
      { name: "cover_image", label: "Muqova rasm", type: "image" },
      { name: "excerpt", label: "Qisqa matn", type: "textarea" },
      { name: "body", label: "To'liq matn", type: "textarea" },
      { name: "read_minutes", label: "O'qish vaqti (min)", type: "number" },
      { name: "tags", label: "Teglar", type: "m2m", related: "tags", display: "name" },
      { name: "is_published", label: "Chop etilgan", type: "bool" },
      { name: "published_at", label: "Chop etilgan sana", type: "datetime" },
    ],
    columns: ["title", "is_published", "published_at"],
  },
  comments: {
    label: "Izohlar (tasdiqlash)", endpoint: "/admin/comments/",
    fields: [
      { name: "status", label: "Holat", type: "select", options: [["pending","Kutilmoqda"],["approved","Tasdiqlangan"],["rejected","Rad etilgan"]] },
    ],
    columns: ["name", "post", "status", "created_at"],
    readOnlyColumns: ["name", "message", "post", "created_at"],
  },
  "contact-messages": {
    label: "Kontakt xabarlari", endpoint: "/admin/contact-messages/",
    fields: [
      { name: "is_read", label: "O'qildi", type: "bool" },
    ],
    columns: ["name", "email", "is_read", "created_at"],
    readOnlyColumns: ["name", "email", "message", "created_at"],
  },
};

const SINGLETONS = {
  profile: {
    label: "Profil", endpoint: "/admin/profile/",
    fields: [
      { name: "full_name", label: "To'liq ism", type: "text" },
      { name: "display_name", label: "Sidebar'dagi nom", type: "text" },
      { name: "title", label: "Kasb (badge)", type: "text" },
      { name: "avatar", label: "Rasm", type: "image" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "birthday", label: "Tug'ilgan kun", type: "date" },
      { name: "location", label: "Manzil", type: "text" },
      { name: "about_intro", label: "About Me — 1-matn", type: "textarea" },
      { name: "about_extra", label: "About Me — 2-matn", type: "textarea" },
    ],
  },
  "site-settings": {
    label: "Site sozlamalari", endpoint: "/admin/site-settings/",
    fields: [
      { name: "site_name", label: "Sayt nomi", type: "text" },
      { name: "favicon", label: "Favicon", type: "image" },
      { name: "meta_description", label: "Meta tavsif", type: "text" },
      { name: "meta_keywords", label: "Meta kalit so'zlar", type: "text" },
      { name: "background_image", label: "Fon rasmi", type: "image" },
      { name: "accent_color", label: "Asosiy rang (hex)", type: "text" },
      { name: "telegram_bot_token", label: "Telegram bot token", type: "text" },
      { name: "telegram_chat_id", label: "Telegram chat ID", type: "text" },
    ],
  },
};

/* ---------------- Render helpers ---------------- */
function esc2(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

function adminShellHtml(bodyHtml, username) {
  const navItems = [
    ...Object.entries(SINGLETONS).map(([key, cfg]) => `<a href="#" data-key="${key}" data-singleton="1">${esc2(cfg.label)}</a>`),
    ...Object.entries(ADMIN_MODELS).map(([key, cfg]) => `<a href="#" data-key="${key}">${esc2(cfg.label)}</a>`),
  ].join("");

  return `
    <div class="admin-wrap">
      <aside class="admin-sidebar">
        <div class="admin-brand">Boshqaruv paneli</div>
        <div class="admin-user">${esc2(username)}</div>
        <nav class="admin-nav" id="admin-nav">${navItems}</nav>
        <div class="admin-sidebar-footer">
          <a href="/" class="admin-link-muted">&larr; Saytga qaytish</a>
          <button class="admin-btn-logout" id="admin-logout">Chiqish</button>
        </div>
      </aside>
      <main class="admin-content" id="admin-content">${bodyHtml}</main>
    </div>
  `;
}

function loginScreenHtml(errorMsg) {
  return `
    <div class="admin-login-wrap">
      <form class="admin-login-card" id="admin-login-form">
        <h1 class="admin-login-title">Admin panel</h1>
        <p class="admin-login-sub">Hanzo-Dev boshqaruv paneliga kirish</p>
        ${errorMsg ? `<div class="alert alert-error">${esc2(errorMsg)}</div>` : ""}
        <input class="form-input" type="text" name="username" placeholder="Login" required autofocus>
        <input class="form-input" type="password" name="password" placeholder="Parol" required style="margin-top:14px">
        <button class="btn-send" type="submit" style="width:100%; justify-content:center; margin-top:22px;">Kirish</button>
      </form>
    </div>
  `;
}

/* ---------------- App bootstrap ---------------- */
async function mountAdminApp() {
  const root = document.getElementById("app-root");
  const token = getToken();

  if (!token) {
    root.innerHTML = loginScreenHtml();
    bindLoginForm();
    return;
  }

  // /api/auth/me/ orqali tokenni tekshiramiz
  try {
    const res = await fetch(`${API_BASE}/auth/me/`, { headers: { Authorization: `Token ${token}` } });
    if (!res.ok) throw new Error("unauthorized");
    const me = await res.json();
    root.innerHTML = adminShellHtml(`<p class="loading-text">Bo'limni tanlang.</p>`, me.username);
    bindAdminNav();
    document.getElementById("admin-logout").addEventListener("click", async () => {
      try { await adminFetch("/auth/logout/", { method: "POST" }); } catch (_) {}
      clearToken();
      navigateTo("/admin");
    });
  } catch (e) {
    clearToken();
    root.innerHTML = loginScreenHtml("Sessiya muddati tugagan, qayta kiring.");
    bindLoginForm();
  }
}
window.AdminApp = { mount: mountAdminApp };

function bindLoginForm() {
  const form = document.getElementById("admin-login-form");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        document.getElementById("app-root").innerHTML = loginScreenHtml(body.detail || "Xatolik.");
        bindLoginForm();
        return;
      }
      setToken(body.token);
      mountAdminApp();
    } catch (e) {
      document.getElementById("app-root").innerHTML = loginScreenHtml("Server bilan bog'lanib bo'lmadi.");
      bindLoginForm();
    }
  });
}

function bindAdminNav() {
  document.getElementById("admin-nav").addEventListener("click", (ev) => {
    const a = ev.target.closest("a[data-key]");
    if (!a) return;
    ev.preventDefault();
    document.querySelectorAll("#admin-nav a").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
    const key = a.dataset.key;
    if (a.dataset.singleton) openSingleton(key); else openList(key, 1);
  });
}

/* ---------------- Singleton form (Profile / SiteSettings) ---------------- */
async function openSingleton(key) {
  const cfg = SINGLETONS[key];
  const contentEl2 = document.getElementById("admin-content");
  contentEl2.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const obj = await adminFetch(cfg.endpoint);
    contentEl2.innerHTML = `
      <h2 class="admin-title">${esc2(cfg.label)}</h2>
      <form class="admin-form" id="admin-singleton-form"></form>
    `;
    const form = document.getElementById("admin-singleton-form");
    form.innerHTML = await buildFieldsHtml(cfg.fields, obj);
    form.innerHTML += `<div id="admin-form-alert"></div><button class="btn-send" type="submit">Saqlash</button>`;
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      await submitForm(cfg, form, obj, cfg.endpoint, "PATCH", () => openSingleton(key));
    });
  } catch (e) {
    contentEl2.innerHTML = `<p class="loading-text">Yuklab bo'lmadi.</p>`;
  }
}

/* ---------------- List view ---------------- */
async function openList(key) {
  const cfg = ADMIN_MODELS[key];
  const contentEl2 = document.getElementById("admin-content");
  contentEl2.innerHTML = `<p class="loading-text">Yuklanmoqda...</p>`;
  try {
    const items = await adminFetch(cfg.endpoint);
    const cols = cfg.columns;
    const rows = items.map(it => `
      <tr>
        ${cols.map(c => `<td>${esc2(formatCell(it[c]))}</td>`).join("")}
        <td class="admin-row-actions">
          <button class="admin-btn-sm" data-edit="${it.id}">Tahrirlash</button>
          <button class="admin-btn-sm admin-btn-danger" data-del="${it.id}">O'chirish</button>
        </td>
      </tr>`).join("");

    contentEl2.innerHTML = `
      <div class="admin-list-head">
        <h2 class="admin-title">${esc2(cfg.label)}</h2>
        ${cfg.readOnlyColumns ? "" : `<button class="btn-send" id="admin-add-btn">+ Yangi qo'shish</button>`}
      </div>
      <div id="admin-form-holder"></div>
      <table class="admin-table">
        <thead><tr>${cols.map(c => `<th>${esc2(c)}</th>`).join("")}<th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="${cols.length + 1}" class="loading-text">Bo'sh</td></tr>`}</tbody>
      </table>
    `;

    if (!cfg.readOnlyColumns) {
      document.getElementById("admin-add-btn").addEventListener("click", () => openForm(key, null));
    }
    contentEl2.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => openForm(key, items.find(i => String(i.id) === btn.dataset.edit)));
    });
    contentEl2.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Rostdan ham o'chirilsinmi?")) return;
        await adminFetch(`${cfg.endpoint}${btn.dataset.del}/`, { method: "DELETE" });
        openList(key);
      });
    });
  } catch (e) {
    contentEl2.innerHTML = `<p class="loading-text">Yuklab bo'lmadi.</p>`;
  }
}

function formatCell(v) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "boolean") return v ? "Ha" : "Yo'q";
  if (Array.isArray(v)) return v.length;
  if (typeof v === "object") return v.name || v.title || v.id;
  return String(v).slice(0, 60);
}

/* ---------------- Add/Edit form ---------------- */
async function openForm(key, obj) {
  const cfg = ADMIN_MODELS[key];
  const holder = document.getElementById("admin-form-holder");
  holder.innerHTML = `<p class="loading-text">Forma tayyorlanmoqda...</p>`;
  const fieldsHtml = await buildFieldsHtml(cfg.fields, obj || {});
  holder.innerHTML = `
    <form class="admin-form admin-form-inline" id="admin-item-form">
      <h3>${obj ? "Tahrirlash" : "Yangi qo'shish"}</h3>
      ${fieldsHtml}
      <div id="admin-form-alert"></div>
      <div class="admin-form-actions">
        <button class="btn-send" type="submit">Saqlash</button>
        <button class="admin-btn-sm" type="button" id="admin-form-cancel">Bekor qilish</button>
      </div>
    </form>
  `;
  document.getElementById("admin-form-cancel").addEventListener("click", () => { holder.innerHTML = ""; });

  const form = document.getElementById("admin-item-form");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const url = obj ? `${cfg.endpoint}${obj.id}/` : cfg.endpoint;
    const method = obj ? "PATCH" : "POST";
    await submitForm(cfg, form, obj || {}, url, method, () => { holder.innerHTML = ""; openList(key); });
  });
}

/* ---------------- Field builders ---------------- */
async function buildFieldsHtml(fields, obj) {
  const parts = [];
  for (const f of fields) {
    const val = obj[f.name];
    parts.push(await buildOneField(f, val));
  }
  return parts.join("");
}

async function buildOneField(f, val) {
  const idAttr = `data-field="${f.name}" data-type="${f.type}"`;
  if (f.type === "textarea") {
    return `<label class="admin-field"><span>${esc2(f.label)}</span><textarea ${idAttr} rows="4">${esc2(val || "")}</textarea></label>`;
  }
  if (f.type === "bool") {
    return `<label class="admin-field admin-field-checkbox"><input type="checkbox" ${idAttr} ${val ? "checked" : ""}><span>${esc2(f.label)}</span></label>`;
  }
  if (f.type === "select") {
    return `<label class="admin-field"><span>${esc2(f.label)}</span>
      <select ${idAttr}>${f.options.map(([v, l]) => `<option value="${esc2(v)}" ${val === v ? "selected" : ""}>${esc2(l)}</option>`).join("")}</select>
    </label>`;
  }
  if (f.type === "image") {
    const preview = val && typeof val === "string" ? `<img src="${val}" class="admin-image-preview">` : "";
    return `<label class="admin-field">
      <span>${esc2(f.label)}</span>
      ${preview}
      <input type="file" accept="image/*" ${idAttr}>
    </label>`;
  }
  if (f.type === "fk" || f.type === "m2m") {
    const relCfg = ADMIN_MODELS[f.related] || SINGLETONS[f.related];
    let options = [];
    try { options = await adminFetch(relCfg.endpoint); } catch (_) { options = []; }
    const currentVal = f.type === "fk" ? (val && val.id !== undefined ? val.id : val) : (Array.isArray(val) ? val.map(x => (x && x.id !== undefined ? x.id : x)) : []);
    const multiple = f.type === "m2m" ? "multiple" : "";
    return `<label class="admin-field">
      <span>${esc2(f.label)}</span>
      <select ${idAttr} ${multiple}>
        ${f.type === "fk" ? `<option value="">—</option>` : ""}
        ${options.map(o => `<option value="${o.id}" ${
          f.type === "fk" ? (String(currentVal) === String(o.id) ? "selected" : "") : (currentVal.map(String).includes(String(o.id)) ? "selected" : "")
        }>${esc2(o[f.display] || o.id)}</option>`).join("")}
      </select>
    </label>`;
  }
  const inputType = { text: "text", email: "email", url: "url", number: "number", date: "date", datetime: "datetime-local" }[f.type] || "text";
  const safeVal = f.type === "datetime" && val ? String(val).slice(0, 16) : (val ?? "");
  return `<label class="admin-field"><span>${esc2(f.label)}</span><input type="${inputType}" ${idAttr} value="${esc2(safeVal)}"></label>`;
}

/* ---------------- Submit ---------------- */
async function submitForm(cfg, form, existingObj, url, method, onSuccess) {
  const alertBox = form.querySelector("#admin-form-alert");
  const fieldEls = form.querySelectorAll("[data-field]");
  let hasFile = false;
  fieldEls.forEach(el => { if (el.dataset.type === "image" && el.files && el.files.length) hasFile = true; });

  try {
    if (hasFile) {
      const fd = new FormData();
      fieldEls.forEach(el => {
        const name = el.dataset.field, type = el.dataset.type;
        if (type === "image") { if (el.files.length) fd.append(name, el.files[0]); }
        else if (type === "bool") fd.append(name, el.checked);
        else if (el.multiple) Array.from(el.selectedOptions).forEach(o => fd.append(name, o.value));
        else fd.append(name, el.value);
      });
      await adminFetch(url, { method, body: fd, isFormData: true });
    } else {
      const payload = {};
      fieldEls.forEach(el => {
        const name = el.dataset.field, type = el.dataset.type;
        if (type === "image") return; // fayl tanlanmagan — o'zgartirilmaydi
        if (type === "bool") payload[name] = el.checked;
        else if (type === "number") payload[name] = el.value === "" ? null : Number(el.value);
        else if (el.multiple) payload[name] = Array.from(el.selectedOptions).map(o => o.value);
        else if (type === "fk") payload[name] = el.value === "" ? null : el.value;
        else payload[name] = el.value;
      });
      await adminFetch(url, { method, body: payload });
    }
    onSuccess();
  } catch (e) {
    const msg = e.body ? Object.entries(e.body).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") : "Xatolik yuz berdi.";
    alertBox.innerHTML = `<div class="alert alert-error">${esc2(msg)}</div>`;
  }
}
