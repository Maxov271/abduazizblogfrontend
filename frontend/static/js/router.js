/* /admin bilan boshlangan yo'l -> Admin panel; qolgani -> ochiq sayt (About/Resume/...).
   Netlify/production'da statik host "/*" so'rovlarini index.html'ga qaytarishi kerak
   (frontend/_redirects fayliga qarang), shunda brauzer manzil satrida /admin qolib,
   JS shu yerda uni aniqlab admin panelni ko'rsatadi. */

function decideAndMountApp() {
  const isAdmin = location.pathname.replace(/\/+$/, "") .match(/^\/admin(\/.*)?$/);
  if (isAdmin) {
    window.__activeApp = "admin";
    window.AdminApp.mount();
  } else {
    window.__activeApp = "public";
    window.PublicApp.mount();
  }
}

window.addEventListener("popstate", decideAndMountApp);
window.addEventListener("DOMContentLoaded", decideAndMountApp);

/* Ichki navigatsiya uchun: pathname'ni almashtirib qayta routing qilish
   (masalan "Admin panel" havolasi yoki "Saytga qaytish" tugmasi uchun). */
function navigateTo(path) {
  history.pushState({}, "", path);
  decideAndMountApp();
}
window.navigateTo = navigateTo;
