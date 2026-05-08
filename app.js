const CONFIG = {
  email: "hello@lernagroup.com",
  calendlyUrl: "https://calendly.com/henry-lernagroup/30min",
  githubUrl: "https://github.com/Lerna-Group",
  timezoneLabel: "America/Bogota"
};

const CASES = [
  {
    id: "case-01",
    title: "Wekall",
    area: "web",
    summary: "Plataforma web (sitio público).",
    tags: ["Web", "Producto"],
    links: { live: "https://wekall.co", repo: "" }
  },
  {
    id: "case-02",
    title: "Wekall Admin",
    area: "data",
    summary: "Panel administrativo para operación interna.",
    tags: ["Dashboard", "Admin", "Data"],
    links: { live: "https://admin.wekall.co", repo: "" }
  },
  {
    id: "case-03",
    title: "Campus CCC",
    area: "web",
    summary: "Sitio/plataforma educativa (publicado).",
    tags: ["Web", "Educación"],
    links: { live: "https://campus.ccc.org.co/", repo: "" }
  },
  {
    id: "case-04",
    title: "MicroImpulso",
    area: "web",
    summary: "Sitio público de la marca (publicado).",
    tags: ["Web", "Marketing"],
    links: { live: "https://microimpulso.co", repo: "" }
  },
  {
    id: "case-05",
    title: "MicroImpulso App",
    area: "automation",
    summary: "Aplicación web para operación/usuarios (publicada).",
    tags: ["App", "Operación"],
    links: { live: "https://app.microimpulso.co", repo: "" }
  }
];

function $(sel) { return document.querySelector(sel); }
function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

function setLinks() {
  $("#btnEmail").href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Hola Lerna Group")}`;
  $("#ctaEmail").href = $("#btnEmail").href;
  $("#btnBook").href = CONFIG.calendlyUrl;
  $("#ctaBook").href = CONFIG.calendlyUrl;
  $("#ghLink").href = CONFIG.githubUrl;
  $("#ghLink").textContent = CONFIG.githubUrl.replace(/^https?:\/\//, "");
  $("#emailLabel").textContent = CONFIG.email;
  $("#tz").textContent = CONFIG.timezoneLabel;
  $("#year").textContent = new Date().getFullYear();
}

function renderCards(items) {
  const root = $("#cards");
  root.innerHTML = items.map((c, idx) => {
    const badge = String(idx + 1).padStart(2, "0");
    const tags = c.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    const live = c.links?.live ? `<a href="${escapeHtml(c.links.live)}" class="muted" rel="noreferrer">Ver</a>` : "";
    const repo = c.links?.repo ? `<a href="${escapeHtml(c.links.repo)}" rel="noreferrer">Repo</a>` : "";
    return `
      <article class="card" data-area="${escapeHtml(c.area)}">
        <div class="card-top">
          <span class="badge">CASE ${badge}</span>
        </div>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.summary)}</p>
        <div class="tags">${tags}</div>
        <div class="card-actions">${live}${repo}</div>
      </article>
    `;
  }).join("");
}

function bindFilters() {
  const segButtons = [...document.querySelectorAll("[data-filter]")];
  const search = $("#q");
  let active = "all";

  const apply = () => {
    const q = String(search.value || "").trim().toLowerCase();
    const next = CASES.filter((c) => {
      const areaOk = active === "all" || c.area === active;
      if (!areaOk) return false;
      if (!q) return true;
      const hay = [c.title, c.summary, ...(c.tags || [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
    renderCards(next);
  };

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      segButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      active = btn.dataset.filter || "all";
      apply();
    });
  });

  search.addEventListener("input", apply);
  apply();
}

setLinks();
bindFilters();
