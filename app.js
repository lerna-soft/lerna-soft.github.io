/* =========================================================
   Lerna · site bootstrap
   - i18n loader (data-i18n, data-i18n-html, data-i18n-attr)
   - lang switcher (ES / EN), persists in localStorage
   - mobile menu toggle
   - smooth scroll for anchors
   - footer year
   ========================================================= */

(function () {
  "use strict";

  /* ------------------ i18n ------------------ */
  const SUPPORTED = ["es", "en"];
  const DEFAULT_LANG = "es";
  const STORAGE_KEY = "lerna.lang";

  function resolveLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : DEFAULT_LANG;
  }

  function deepGet(obj, path) {
    return path.split(".").reduce(function (acc, k) {
      return acc != null ? acc[k] : undefined;
    }, obj);
  }

  async function loadDict(lang) {
    const res = await fetch("i18n/" + lang + ".json", { cache: "no-cache" });
    if (!res.ok) throw new Error("i18n load failed: " + lang);
    return res.json();
  }

  function applyDict(dict, root) {
    const scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = deepGet(dict, key);
      if (typeof val === "string") el.textContent = val;
    });

    scope.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-html");
      const val = deepGet(dict, key);
      if (typeof val === "string") el.innerHTML = val;
    });

    // format: "attr:key|attr2:key2"
    scope.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      const spec = el.getAttribute("data-i18n-attr");
      spec.split("|").forEach(function (pair) {
        const parts = pair.split(":");
        if (parts.length !== 2) return;
        const attr = parts[0].trim();
        const key = parts[1].trim();
        const val = deepGet(dict, key);
        if (typeof val === "string") el.setAttribute(attr, val);
      });
    });
  }

  async function setLang(lang, persist) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      const dict = await loadDict(lang);
      applyDict(dict);
      document.documentElement.setAttribute("lang", lang);
      if (persist) localStorage.setItem(STORAGE_KEY, lang);
      document.querySelectorAll(".lang-btn").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
        btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang);
      });
    } catch (err) {
      console.error(err);
    }
  }

  function wireLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const lang = btn.getAttribute("data-lang");
        setLang(lang, true);
      });
    });
  }

  /* ------------------ mobile menu ------------------ */
  function wireMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const topbar = document.querySelector(".topbar");
    if (!toggle || !topbar) return;
    toggle.addEventListener("click", function () {
      const open = topbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    topbar.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        topbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------ smooth scroll ------------------ */
  function wireSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        const id = a.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();

        // On mobile portrait the sticky topbar (80px) overlaps the top of
        // the destination section when using scrollIntoView({block:"start"})
        // — Chrome mobile does not always honor scroll-padding-top here.
        // Compute the offset manually so the section's top lands flush
        // against the topbar bottom edge. Desktop keeps the original
        // behavior (sections have enough top padding that overlap is not
        // noticeable).
        if (window.innerWidth <= 700) {
          const topbar = document.querySelector(".topbar");
          const offset = topbar ? topbar.offsetHeight : 80;
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ------------------ contact form (local stub) ------------------ */
  function wireForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const note = form.querySelector(".form-note");
      if (note) note.hidden = false;
      form.reset();
    });
  }

  /* ------------------ year ------------------ */
  function wireYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ------------------ reveal on scroll ------------------ */
  function wireReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in-view"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------ distinct accordion (mobile only, but the
     handler runs everywhere — desktop CSS uses display:contents so the
     toggled data-open attribute has no visual effect there) ------ */
  function wireDistinct() {
    const toggles = document.querySelectorAll(".td-card-toggle");
    if (!toggles.length) return;
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const card = btn.closest(".td-card");
        if (!card) return;
        const isOpen = card.getAttribute("data-open") === "true";
        card.setAttribute("data-open", isOpen ? "false" : "true");
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  /* ------------------ boot ------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    wireYear();
    wireMenu();
    wireSmoothScroll();
    wireForm();
    wireLangButtons();
    wireReveal();
    wireDistinct();
    setLang(resolveLang(), false);
  });
})();
