const CONFIG = {
  email: "shravankumarps1995@gmail.com",
  bookUrl: "#"
};

const PROJECTS = [
  {
    tags: ["AI", "Generative", "Mobile SaaS", "SMB Tools"],
    title: "Launching Wizad.AI 0 to 1 : An AI-Powered design tool for SME's.",
    support: "5M+ Creatives, 300K+ Downloads, Top-3 in Design category",
    image: "assets/project-wizad.svg"
  },
  {
    tags: ["E-Commerce", "B2B", "Enterprise", "Rebranding & Redesign"],
    title: "Designing a Scalable B2B-ready E-commerce Platform for Premium Furniture Brand in UAE - NavoErgnomics",
    image: "assets/project-navo.svg"
  },
  {
    tags: ["Enterprise", "ERP", "B2B", "Multi-role", "Operations"],
    title: "End-to-End Sales, Finance & Logistics ERP Workspace for AGS, UAE",
    image: "assets/project-ags-erp.svg"
  },
  {
    tags: ["Fintech", "Multi-chain", "P2P", "Currency Exchange"],
    title: "Building Scalable Design System, Multi-Currency Wallet and Payments App for Global Daily Fintech",
    image: "assets/project-fintech.svg"
  },
  {
    tags: ["B2B/B2C E-Commerce", "Solar Energy", "Conversion", "Rebranding"],
    title: "Reducing Buying Friction and Improving Conversion paths for AGS’s solar energy E-Commerce Website",
    image: "assets/project-solar.svg"
  },
  {
    tags: ["Credential Manager", "Security", "B2B SaaS", "Open-Source"],
    title: "Launching Osvauld 0 to 1 : Trustworthy Shared Credentials for Security-Conscious Teams",
    image: "assets/project-osvauld.svg"
  }
];

const PEOPLE = [
  { name: "Kurian Mathew", role: "Founder OwnerWise", avatar: "assets/av-kurian.svg", quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { name: "Thurga Devi", role: "MaskEX Global", avatar: "assets/av-thurga.svg", quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
  { name: "Ossama Zaour", role: "MaskEX Global", avatar: "assets/av-ossama.svg", quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  { name: "Yuliia Bilyk", role: "Founder - NoDressCode", avatar: "assets/av-yuliia.svg", quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { name: "Abduljalil Chhada", role: "CEO - AGS International", avatar: "assets/av-abduljalil.svg", quote: "Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet." },
  { name: "Jean Augustin", role: "MaskEX Global", avatar: "assets/av-jean.svg", quote: "Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa." },
  { name: "Ayman Saath", role: "Government Relation Officer", avatar: "assets/av-ayman.svg", quote: "Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra." },
  { name: "Sepideh Yazdi", role: "Founder of FigChallange Community", avatar: "assets/av-sepideh.svg", quote: "Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh." },
  { name: "Mohamad Shihade", role: "Business Development Specialist - AGS International", avatar: "assets/av-mohamad.svg", quote: "Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor." }
];

function $(sel) { return document.querySelector(sel); }

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

async function copyEmail(btn) {
  const value = CONFIG.email;
  try {
    await navigator.clipboard.writeText(value);
    if (btn) btn.textContent = "Copied";
    window.setTimeout(() => { if (btn) btn.textContent = "Copy e-mail"; }, 1200);
  } catch {
    // Ignore silently; spec does not mention error UI.
  }
}

function renderProjects() {
  const root = $("#projectGrid");
  if (!root) return;
  root.innerHTML = PROJECTS.map((p) => {
    const tags = p.tags.map((t) => `<span class="ptag">${escapeHtml(t)}</span>`).join("");
    const support = p.support ? `<div class="psub">${escapeHtml(p.support)}</div>` : "";
    return `
      <article class="pcard">
        <div class="pmedia"><img src="${escapeHtml(p.image)}" alt="" /></div>
        <div class="pbody">
          <div class="ptags">${tags}</div>
          <div class="ptitle">${escapeHtml(p.title)}</div>
          ${support}
          <a class="pcta" href="#" rel="noreferrer">Read Case Study</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderTestimonials() {
  const root = $("#testimonialGrid");
  if (!root) return;
  root.innerHTML = PEOPLE.map((p) => {
    const quote = escapeHtml(p.quote || "");
    return `
      <article class="tcard">
        <div class="ttext">“${quote}”</div>
        <div class="tperson">
          <img class="tavatar" src="${escapeHtml(p.avatar)}" alt="" />
          <div>
            <div class="tname">${escapeHtml(p.name)}</div>
            <div class="trole">${escapeHtml(p.role)}</div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function bindButtons() {
  const btns = [$("#copyEmailA"), $("#copyEmailB"), $("#copyEmailC")].filter(Boolean);
  for (const btn of btns) btn.addEventListener("click", () => copyEmail(btn));

  const bookA = $("#bookCallA");
  const bookB = $("#bookCallB");
  if (bookA) bookA.href = CONFIG.bookUrl;
  if (bookB) bookB.href = CONFIG.bookUrl;
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
