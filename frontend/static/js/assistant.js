/* AI yordamchi vidjeti (ochiq sayt). Backend: /api/assistant/chat/ va /api/assistant/nudges/.
   Gemini kaliti faqat serverda — bu fayl hech qanday kalit bilan ishlamaydi.
   PublicApp.mount() har safar .ug-shell yaratilganda UgAssistant.mount(shell, settings) ni chaqiradi. */
(function () {
  "use strict";

  const MAX_LEN = 600;
  const STORE_KEY = "ug-ai";
  const GREETING = "Salom! 👋 Men Umarov Group AI yordamchisiman. Xizmatlar, portfolio, narxlar yoki buyurtma haqida so'rang — kerak bo'lsa Abduazizga ulab qo'yaman.";
  const QUICK = ["Qanday xizmatlar bor?", "Sayt buyurtma qilmoqchiman", "Portfolio ko'rsating", "Abduaziz bilan bog'lanish"];
  const ERROR_TEXT = "Aloqa uzildi. Iltimos, birozdan keyin qayta urinib ko'ring yoki «Aloqa» sahifasidan xabar qoldiring.";

  let current = null; // faol nusxa — qayta mount qilinganda avvalgisi tozalanadi

  function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* Xavfsiz "markdown-lite": avval escape, keyin **qalin**, ro'yxat va http(s) havolalar */
  function fmt(text) {
    let h = esc(text);
    h = h.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/(^|\n)\s*[-•]\s+/g, "$1• ");
    h = h.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return h.replace(/\n/g, "<br>");
  }

  function load() { try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
  function save(state) { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function newSid() {
    const a = new Uint8Array(12);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.floor(Math.random() * 256); });
    return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  const ICON = {
    spark: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" opacity=".7"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  function mount(shell, settings) {
    if (current) current.destroy();
    if (!shell || (settings && settings.assistant_enabled === false)) { current = null; return; }
    current = createWidget(shell, settings || {});
  }

  function createWidget(shell, settings) {
    const store = load();
    if (!store.sid) store.sid = newSid();
    const msgs = Array.isArray(store.msgs) ? store.msgs : [];
    let seen = new Set(Array.isArray(store.seen) ? store.seen : []);
    let open = false, sending = false, blockedUntil = 0, nudges = [], timers = [], destroyed = false;

    const num = (v, def, min) => Math.max(min, Number(v) || def);
    const firstDelay = num(settings.assistant_nudge_first_delay, 15, 3) * 1000;
    const visibleFor = num(settings.assistant_nudge_visible_seconds, 9, 3) * 1000;
    const interval = num(settings.assistant_nudge_interval, 45, 10) * 1000;

    const root = document.createElement("div");
    root.className = "ug-ai";
    root.innerHTML = `
      <div class="ug-ai-nudge" id="ug-ai-nudge" role="status" aria-live="polite" hidden>
        <button type="button" class="ug-ai-nudge-x" aria-label="Yopish">${ICON.close}</button>
        <button type="button" class="ug-ai-nudge-text"></button>
      </div>
      <section class="ug-ai-panel" id="ug-ai-panel" role="dialog" aria-label="AI yordamchi" aria-modal="false" hidden>
        <header class="ug-ai-head">
          <span class="ug-ai-avatar">${ICON.spark}</span>
          <div class="ug-ai-title"><b>Umarov AI yordamchi</b><span><i></i>Onlayn · tez javob beradi</span></div>
          <button type="button" class="ug-ai-x" aria-label="Chatni yopish">${ICON.close}</button>
        </header>
        <div class="ug-ai-msgs" id="ug-ai-msgs" aria-live="polite"></div>
        <div class="ug-ai-quick" id="ug-ai-quick"></div>
        <form class="ug-ai-form" id="ug-ai-form" autocomplete="off">
          <textarea id="ug-ai-input" rows="1" maxlength="${MAX_LEN}" placeholder="Savolingizni yozing..." aria-label="Xabar"></textarea>
          <button type="submit" class="ug-ai-send" aria-label="Yuborish">${ICON.send}</button>
        </form>
        <p class="ug-ai-note">AI xato qilishi mumkin. Buyurtma bo'yicha xabaringiz Abduazizga yetkaziladi.</p>
      </section>
      <button type="button" class="ug-ai-fab" id="ug-ai-fab" aria-label="AI yordamchini ochish" aria-expanded="false" aria-controls="ug-ai-panel">
        <span class="ug-ai-fab-ring"></span><span class="ug-ai-fab-ico">${ICON.spark}</span>
      </button>`;
    shell.appendChild(root);

    const $ = (id) => root.querySelector("#" + id);
    const panel = $("ug-ai-panel"), fab = $("ug-ai-fab"), list = $("ug-ai-msgs"), quick = $("ug-ai-quick");
    const form = $("ug-ai-form"), input = $("ug-ai-input"), nudgeEl = $("ug-ai-nudge");
    const nudgeText = nudgeEl.querySelector(".ug-ai-nudge-text");

    function onKey(ev) { if (ev.key === "Escape" && open) { setOpen(false); fab.focus(); } }
    function persist() { save({ sid: store.sid, msgs: msgs.slice(-30), seen: Array.from(seen).slice(-60) }); }
    function destroy() {
      destroyed = true;
      timers.forEach(clearTimeout);
      document.removeEventListener("keydown", onKey);
      root.remove();
    }
    function later(fn, ms) {
      const t = setTimeout(() => {
        if (destroyed) return;
        if (!root.isConnected) { destroy(); return; }   // admin'ga o'tilganda qobiq olib tashlanadi
        fn();
      }, ms);
      timers.push(t);
      return t;
    }

    /* ---------- Xabarlar ---------- */
    function bubble(m, animate) {
      const el = document.createElement("div");
      el.className = "ug-ai-msg ug-ai-" + (m.role === "user" ? "user" : "bot") + (m.kind === "warning" || m.kind === "blocked" ? " ug-ai-warn" : "") + (animate ? " ug-ai-in" : "");
      el.innerHTML = `<div class="ug-ai-bubble">${fmt(m.text)}</div>`;
      return el;
    }
    function scrollDown() { list.scrollTo({ top: list.scrollHeight, behavior: "smooth" }); }
    function renderAll() {
      list.innerHTML = "";
      if (!msgs.length) msgs.push({ role: "bot", text: GREETING });
      msgs.forEach((m) => list.appendChild(bubble(m, false)));
      renderQuick();
      list.scrollTop = list.scrollHeight;
    }
    function renderQuick() {
      const onlyGreeting = msgs.length === 1 && msgs[0].role === "bot";
      quick.innerHTML = onlyGreeting ? QUICK.map((q) => `<button type="button" class="ug-ai-chip">${esc(q)}</button>`).join("") : "";
      quick.hidden = !onlyGreeting;
    }
    function push(m) {
      msgs.push(m); persist();
      list.appendChild(bubble(m, true));
      renderQuick();
      scrollDown();
    }
    function typing(on) {
      const old = list.querySelector(".ug-ai-typing");
      if (old) old.remove();
      if (!on) return;
      const el = document.createElement("div");
      el.className = "ug-ai-msg ug-ai-bot ug-ai-typing ug-ai-in";
      el.innerHTML = '<div class="ug-ai-bubble"><span></span><span></span><span></span></div>';
      list.appendChild(el);
      scrollDown();
    }
    function setBusy(b) {
      sending = b;
      const locked = b || Date.now() < blockedUntil;
      input.disabled = locked;
      form.querySelector(".ug-ai-send").disabled = locked;
    }

    async function send(text) {
      text = String(text || "").trim().slice(0, MAX_LEN);
      if (!text || sending || Date.now() < blockedUntil) return;
      input.value = ""; autosize();
      const history = msgs.filter((m) => m.kind !== "warning" && m.kind !== "blocked").slice(-10)
        .map((m) => ({ role: m.role === "user" ? "user" : "bot", text: m.text }));
      push({ role: "user", text });
      setBusy(true); typing(true);
      const started = Date.now();
      let res;
      try {
        res = await Api.assistantChat({ session_id: store.sid, message: text, history, page: location.hash || "#/" });
      } catch (e) {
        res = (e && e.body && e.body.reply) ? e.body : { kind: "unavailable", reply: ERROR_TEXT };
      }
      const wait = Math.max(0, 650 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      if (destroyed) return;
      typing(false);
      push({ role: "bot", text: res.reply || ERROR_TEXT, kind: res.kind });
      if (res.kind === "blocked") {
        blockedUntil = Date.now() + (Number(res.retry_after) || 900) * 1000;
        input.placeholder = "Chat vaqtincha yopilgan...";
        later(() => { blockedUntil = 0; input.placeholder = "Savolingizni yozing..."; setBusy(false); }, (Number(res.retry_after) || 900) * 1000);
      }
      setBusy(false);
      if (open && !input.disabled) input.focus();
    }

    function autosize() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; }

    /* ---------- Panel ochish/yopish ---------- */
    function setOpen(v) {
      open = v;
      panel.hidden = false;
      requestAnimationFrame(() => root.classList.toggle("ug-ai-open", v));
      fab.setAttribute("aria-expanded", String(v));
      fab.setAttribute("aria-label", v ? "AI yordamchini yopish" : "AI yordamchini ochish");
      if (v) {
        hideNudge();
        setTimeout(() => { if (!input.disabled) input.focus(); }, 250);
      } else {
        setTimeout(() => { if (!open) panel.hidden = true; }, 320);
      }
    }

    /* ---------- Bildirishnomalar (tasodifiy, takrorlanmaydi) ---------- */
    function nextNudge() {
      if (!nudges.length) return null;
      let pool = nudges.filter((t) => !seen.has(t));
      if (!pool.length) {
        const last = Array.from(seen).pop();
        seen = new Set(last ? [last] : []);
        pool = nudges.filter((t) => !seen.has(t));
        if (!pool.length) pool = nudges.slice();
      }
      const t = pool[Math.floor(Math.random() * pool.length)];
      seen.add(t); persist();
      return t;
    }
    let hideTimer = null;
    function hideNudge() {
      clearTimeout(hideTimer);
      if (nudgeEl.hidden) return;
      nudgeEl.classList.remove("ug-ai-nudge-in");
      nudgeEl.classList.add("ug-ai-nudge-out");
      setTimeout(() => { nudgeEl.hidden = true; nudgeEl.classList.remove("ug-ai-nudge-out"); }, 320);
    }
    function showNudge() {
      const t = nextNudge();
      if (!t) return;
      nudgeText.textContent = t;
      nudgeEl.hidden = false;
      nudgeEl.classList.remove("ug-ai-nudge-out");
      void nudgeEl.offsetWidth;
      nudgeEl.classList.add("ug-ai-nudge-in");
      hideTimer = later(() => { hideNudge(); scheduleNext(); }, visibleFor);
    }
    function scheduleNext(first) {
      const chatted = msgs.some((m) => m.role === "user");
      const base = first ? firstDelay : interval * (chatted ? 3 : 1);
      later(() => {
        if (open || document.hidden || sending) { scheduleNext(); return; }
        showNudge();
      }, base);
    }

    /* ---------- Hodisalar ---------- */
    fab.addEventListener("click", () => setOpen(!open));
    root.querySelector(".ug-ai-x").addEventListener("click", () => { setOpen(false); fab.focus(); });
    nudgeText.addEventListener("click", () => setOpen(true));
    nudgeEl.querySelector(".ug-ai-nudge-x").addEventListener("click", () => { hideNudge(); clearTimeout(hideTimer); scheduleNext(); });
    quick.addEventListener("click", (ev) => { const b = ev.target.closest(".ug-ai-chip"); if (b) send(b.textContent); });
    form.addEventListener("submit", (ev) => { ev.preventDefault(); send(input.value); });
    input.addEventListener("input", autosize);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); send(input.value); }
    });
    document.addEventListener("keydown", onKey);

    renderAll();
    persist();
    Api.assistantNudges().then((list_) => {
      nudges = (Array.isArray(list_) ? list_ : []).map((t) => String(t).trim()).filter(Boolean);
      if (nudges.length) scheduleNext(true);
    }).catch(() => { /* bildirishnomalarsiz ham chat ishlayveradi */ });

    return { destroy: destroy };
  }

  window.UgAssistant = { mount: mount };
})();
