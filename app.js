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

const TESTIMONIALS = [
  {
    quote: "Lerna Group entregó rápido y con claridad. El handoff fue limpio y el resultado se sintió 'listo para producción'.",
    name: "Cliente (placeholder)",
    role: "Founder"
  },
  {
    quote: "Excelente comunicación, priorización y criterio técnico. Se notó el foco en negocio y mantenibilidad.",
    name: "Cliente (placeholder)",
    role: "Operations"
  },
  {
    quote: "Pasamos de ideas sueltas a una entrega usable con milestones claros. Muy buena velocidad sin perder calidad.",
    name: "Cliente (placeholder)",
    role: "Product"
  },
  {
    quote: "Se integraron a nuestro flujo sin fricción. Resolución de bugs y mejoras con impacto visible.",
    name: "Cliente (placeholder)",
    role: "Engineering"
  }
];

function $(sel) { return document.querySelector(sel); }
function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

function setLinks() {
  const emailHref = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Hola Lerna Group")}`;
  $("#ctaEmail").href = emailHref;
  $("#btnBook").href = CONFIG.calendlyUrl;
  $("#btnBook2").href = CONFIG.calendlyUrl;
  $("#ctaBook").href = CONFIG.calendlyUrl;
  $("#ghLink").href = CONFIG.githubUrl;
  $("#ghLink").textContent = CONFIG.githubUrl.replace(/^https?:\/\//, "");
  $("#emailLabel").textContent = CONFIG.email;
  $("#tz").textContent = CONFIG.timezoneLabel;
  $("#year").textContent = new Date().getFullYear();
}

function renderFeatured(items) {
  const root = $("#featured");
  if (!root) return;
  root.innerHTML = items.map((c, idx) => {
    const badge = String(idx + 1).padStart(2, "0");
    const tags = (c.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    const live = c.links?.live ? `<a href="${escapeHtml(c.links.live)}" class="muted" rel="noreferrer">View</a>` : "";
    const repo = c.links?.repo ? `<a href="${escapeHtml(c.links.repo)}" rel="noreferrer">Repo</a>` : "";
    return `
      <article class="fcard" data-area="${escapeHtml(c.area)}">
        <div class="fhead">
          <span class="badge">PROJECT ${badge}</span>
          <span class="badge">${escapeHtml(String(c.area || "").toUpperCase())}</span>
        </div>
        <div class="fbody">
          <h3>${escapeHtml(c.title)}</h3>
          <p>${escapeHtml(c.summary)}</p>
          <div class="tags">${tags}</div>
        </div>
        <div class="factions">${live}${repo}</div>
      </article>
    `;
  }).join("");
}

function renderTestimonials(items) {
  const root = $("#quotes");
  if (!root) return;
  root.innerHTML = items.map((t) => {
    return `
      <article class="quote">
        <p>“${escapeHtml(t.quote)}”</p>
        <div class="who"><span class="who-dot" aria-hidden="true"></span><span>${escapeHtml(t.name)} · ${escapeHtml(t.role)}</span></div>
      </article>
    `;
  }).join("");
}

async function copyEmail() {
  const value = CONFIG.email;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "true");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      el.remove();
    }
  }
}

function bindCopyButtons() {
  const btnA = $("#btnCopyEmail");
  const btnB = $("#btnCopyEmail2");
  const onClick = async () => {
    const ok = await copyEmail();
    const label = ok ? "Copied" : "Copy failed";
    if (btnA) btnA.textContent = label;
    if (btnB) btnB.textContent = label;
    window.setTimeout(() => {
      if (btnA) btnA.textContent = "Copy e-mail";
      if (btnB) btnB.textContent = "Copy e-mail";
    }, 1200);
  };
  btnA?.addEventListener("click", onClick);
  btnB?.addEventListener("click", onClick);
}

setLinks();
bindCopyButtons();
renderFeatured(CASES);
renderTestimonials(TESTIMONIALS);
