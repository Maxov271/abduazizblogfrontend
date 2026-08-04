/* Barcha backend (Django REST API) bilan aloqa shu faylda.
   API bir xil domenda ishlaydi deb hisoblanadi ("/api"). Agar frontend
   boshqa domenda joylashtirilsa, quyidagi API_BASE'ni to'liq manzilga
   o'zgartiring, masalan: "https://api.hanzodev.uz/api" */
const API_BASE = "/api";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error("API xatosi");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

const Api = {
  siteSettings: () => apiGet("/site-settings/"),
  profile: () => apiGet("/profile/"),
  socialLinks: () => apiGet("/social-links/"),
  services: () => apiGet("/services/"),
  insideWorld: () => apiGet("/inside-world/"),
  skills: () => apiGet("/skills/"),
  journey: () => apiGet("/journey/"),
  portfolioCategories: () => apiGet("/portfolio-categories/"),
  portfolioList: (category) => apiGet(`/portfolio/${category && category !== "all" ? `?category=${encodeURIComponent(category)}` : ""}`),
  portfolioDetail: (slug) => apiGet(`/portfolio/${encodeURIComponent(slug)}/`),
  threadList: () => apiGet("/thread/"),
  threadDetail: (slug) => apiGet(`/thread/${encodeURIComponent(slug)}/`),
  threadComments: (slug) => apiGet(`/thread/${encodeURIComponent(slug)}/comments/`),
  postComment: (slug, data) => apiPost(`/thread/${encodeURIComponent(slug)}/comments/create/`, data),
  sendContact: (data) => apiPost("/contact/", data),
};
