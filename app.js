const CONFIG = {
  email: "admin@lernagroup.dev",
  bookUrl: "https://github.com/lerna-admin",
  orgUrl: "https://github.com/lerna-admin"
};

const PROJECTS = [
  {
    tags: ["Media", "Catalog", "Playback", "Evaluation"],
    title: "Media Evaluation Platform",
    support: "Static and full product variants for content discovery, playback control, evaluation workflows and metadata operations.",
    image: "assets/project-fintech.svg"
  },
  {
    tags: ["Finance", "Budgeting", "Mobile", "Platform Split"],
    title: "BudgetApp ecosystem",
    support: "Product coordination across backend, frontend, mobile and operating repositories for a finance application.",
    image: "assets/project-solar.svg"
  },
  {
    tags: ["ERP", "Operations", "Inventory", "Commerce"],
    title: "Jewelry business systems",
    support: "Separate product lines for ERP, online store and company-level digital transformation under Lerna Group.",
    image: "assets/project-ags-erp.svg"
  }
];

const PEOPLE = [
  {
    name: "Product engineering",
    role: "Frontend, backend and UX delivery",
    avatar: "assets/av-kurian.svg",
    quote: "We move from requirement to working product with code, interface and operating criteria aligned from the start."
  },
  {
    name: "Systems thinking",
    role: "Products connected to real operations",
    avatar: "assets/av-thurga.svg",
    quote: "We design platforms that support business workflows instead of creating isolated screens with no operational depth."
  },
  {
    name: "Technical operations",
    role: "Infrastructure, release flow and continuity",
    avatar: "assets/av-ossama.svg",
    quote: "We do not stop at shipping UI. We also care about deployment, versioning, maintenance and system stability."
  }
];

function $(selector) { return document.querySelector(selector); }

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

async function copyEmail(button) {
  try {
    await navigator.clipboard.writeText(CONFIG.email);
    if (button) button.textContent = "Copied";
    window.setTimeout(() => { if (button) button.textContent = "Copy contact"; }, 1200);
  } catch {
    window.location.href = `mailto:${CONFIG.email}`;
  }
}

function renderProjects() {
  const root = $("#projectGrid");
  if (!root) return;
  root.innerHTML = PROJECTS.map((project) => {
    const tags = project.tags.map((tag) => `<span class="ptag">${escapeHtml(tag)}</span>`).join("");
    const support = project.support ? `<div class="psub">${escapeHtml(project.support)}</div>` : "";
    return `
      <article class="pcard">
        <div class="pmedia"><img src="${escapeHtml(project.image)}" alt="" /></div>
        <div class="pbody">
          <div class="ptags">${tags}</div>
          <div class="ptitle">${escapeHtml(project.title)}</div>
          ${support}
          <a class="pcta" href="${escapeHtml(CONFIG.orgUrl)}" target="_blank" rel="noreferrer">Open organization</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderTestimonials() {
  const root = $("#testimonialGrid");
  if (!root) return;
  root.innerHTML = PEOPLE.map((item) => `
    <article class="tcard">
      <div class="ttext">“${escapeHtml(item.quote)}”</div>
      <div class="tperson">
        <img class="tavatar" src="${escapeHtml(item.avatar)}" alt="" />
        <div>
          <div class="tname">${escapeHtml(item.name)}</div>
          <div class="trole">${escapeHtml(item.role)}</div>
        </div>
      </div>
    </article>
  `).join("");
}

function bindButtons() {
  const buttons = [$("#copyEmailA"), $("#copyEmailB"), $("#copyEmailC")].filter(Boolean);
  for (const button of buttons) button.addEventListener("click", () => copyEmail(button));

  const bookA = $("#bookCallA");
  const bookB = $("#bookCallB");
  if (bookA) bookA.href = "#projects";
  if (bookB) {
    bookB.href = CONFIG.orgUrl;
    bookB.target = "_blank";
    bookB.rel = "noreferrer";
  }

  const footLink = document.querySelector(".foot-link");
  const framer = document.querySelector(".framer");
  if (footLink) {
    footLink.href = CONFIG.orgUrl;
    footLink.target = "_blank";
    footLink.rel = "noreferrer";
  }
  if (framer) {
    framer.href = CONFIG.orgUrl;
    framer.target = "_blank";
    framer.rel = "noreferrer";
  }
  const footerEmail = $("#footerEmail");
  if (footerEmail) footerEmail.textContent = CONFIG.email;
}

function bindNavState() {
  const links = [...document.querySelectorAll(".s-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href") || ""))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = `#${visible.target.id}`;
    links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
  }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.3, 0.5, 0.75] });

  sections.forEach((section) => observer.observe(section));
}

renderProjects();
renderTestimonials();
bindButtons();
bindNavState();
