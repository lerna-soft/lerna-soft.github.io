const CONFIG = {
  email: "shravankumarps1995@gmail.com",
  bookUrl: "#"
};

const PROJECTS = [
  {
    tags: ["AI", "Generative", "Mobile SaaS", "SMB Tools"],
    title: "Launching Wizad.AI 0 to 1 : An AI-Powered design tool for SME's.",
    support: "5M+ Creatives, 300K+ Downloads, Top-3 in Design category"
  },
  {
    tags: ["E-Commerce", "B2B", "Enterprise", "Rebranding & Redesign"],
    title: "Designing a Scalable B2B-ready E-commerce Platform for Premium Furniture Brand in UAE - NavoErgnomics"
  },
  {
    tags: ["Enterprise", "ERP", "B2B", "Multi-role", "Operations"],
    title: "End-to-End Sales, Finance & Logistics ERP Workspace for AGS, UAE"
  },
  {
    tags: ["Fintech", "Multi-chain", "P2P", "Currency Exchange"],
    title: "Building Scalable Design System, Multi-Currency Wallet and Payments App for Global Daily Fintech"
  },
  {
    tags: ["B2B/B2C E-Commerce", "Solar Energy", "Conversion", "Rebranding"],
    title: "Reducing Buying Friction and Improving Conversion paths for AGS’s solar energy E-Commerce Website"
  },
  {
    tags: ["Credential Manager", "Security", "B2B SaaS", "Open-Source"],
    title: "Launching Osvauld 0 to 1 : Trustworthy Shared Credentials for Security-Conscious Teams"
  }
];

// NOTE: The spec asks to "use testimonial text + avatars from the source".
// Those assets are not provided here, so we keep quotes empty placeholders that you can fill in 1:1.
const PEOPLE = [
  { name: "Kurian Mathew", role: "Founder OwnerWise", avatar: "assets/av-kurian.svg", quote: "" },
  { name: "Thurga Devi", role: "MaskEX Global", avatar: "assets/av-thurga.svg", quote: "" },
  { name: "Ossama Zaour", role: "MaskEX Global", avatar: "assets/av-ossama.svg", quote: "" },
  { name: "Yuliia Bilyk", role: "Founder - NoDressCode", avatar: "assets/av-yuliia.svg", quote: "" },
  { name: "Abduljalil Chhada", role: "CEO - AGS International", avatar: "assets/av-abduljalil.svg", quote: "" },
  { name: "Jean Augustin", role: "MaskEX Global", avatar: "assets/av-jean.svg", quote: "" },
  { name: "Ayman Saath", role: "Government Relation Officer", avatar: "assets/av-ayman.svg", quote: "" },
  { name: "Sepideh Yazdi", role: "Founder of FigChallange Community", avatar: "assets/av-sepideh.svg", quote: "" },
  { name: "Mohamad Shihade", role: "Business Development Specialist - AGS International", avatar: "assets/av-mohamad.svg", quote: "" }
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
        <div class="pmedia"><img src="assets/project-ph.svg" alt="" /></div>
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
  const track = $("#testimonialTrack");
  if (!track) return;
  const cards = PEOPLE.map((p) => {
    const quote = p.quote ? escapeHtml(p.quote) : "Testimonial text (pending).";
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
  // Duplicate group for seamless marquee loop
  track.innerHTML = `<div class="tgroup">${cards}</div><div class="tgroup" aria-hidden="true">${cards}</div>`;
}

function bindButtons() {
  const btns = [$("#copyEmailA"), $("#copyEmailB"), $("#copyEmailC")].filter(Boolean);
  for (const btn of btns) btn.addEventListener("click", () => copyEmail(btn));

  const bookA = $("#bookCallA");
  const bookB = $("#bookCallB");
  if (bookA) bookA.href = CONFIG.bookUrl;
  if (bookB) bookB.href = CONFIG.bookUrl;
}

renderProjects();
renderTestimonials();
bindButtons();
