"""Walk every page, click each .section-scroll in order, verify target visible below topbar."""
from playwright.sync_api import sync_playwright
import os, json

PAGES = ["index.html", "services.html", "industries.html", "work.html", "about.html", "contact.html"]
BASE = "http://127.0.0.1:8765"
OUT = "/home/henry/projects/lerna-admin.github.io/tools/screenshots/chain"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    all_ok = True
    report = []
    for pg in PAGES:
        page.goto(f"{BASE}/{pg}", wait_until="networkidle")
        scrolls = page.evaluate("""() => Array.from(document.querySelectorAll('a.section-scroll')).map(a => ({
            href: a.getAttribute('href'),
            text: a.innerText.trim().split('\\n')[0],
        }))""")
        report.append(f"\n=== {pg} — {len(scrolls)} section-scroll buttons ===")
        for i, sc in enumerate(scrolls):
            target_id = sc['href'].lstrip('#')
            # Scroll to the section-scroll element, then click
            page.evaluate(f"document.querySelectorAll('a.section-scroll')[{i}].scrollIntoView({{block:'center'}})")
            page.wait_for_timeout(200)
            page.evaluate(f"document.querySelectorAll('a.section-scroll')[{i}].click()")
            page.wait_for_timeout(700)
            m = page.evaluate(f"""() => {{
                const target = document.getElementById('{target_id}');
                const topbar = document.querySelector('.topbar');
                if (!target) return null;
                const tr = target.getBoundingClientRect();
                const br = topbar.getBoundingClientRect();
                return {{ target_top: tr.top, topbar_bottom: br.bottom, target_id: '{target_id}' }};
            }}""")
            if not m:
                report.append(f"  ✗ [{sc['text']}] -> #{target_id}  TARGET NOT FOUND")
                all_ok = False
                continue
            gap = m['target_top'] - m['topbar_bottom']
            ok = 0 <= gap <= 50
            mark = '✅' if ok else '⚠️ '
            report.append(f"  {mark} [{sc['text'][:30]}] -> #{target_id}  gap={gap:.0f}px")
            if not ok: all_ok = False
            page.screenshot(path=f"{OUT}/{pg[:-5]}-scroll-{i}-{target_id}.png")
    print("\n".join(report))
    print("\n" + ("✅ ALL OK" if all_ok else "⚠️  SOME ISSUES"))
    browser.close()
