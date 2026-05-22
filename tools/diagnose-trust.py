"""Diagnose the spacing between topbar and 'Confían en nosotros' after clicking EXPLORAR."""
from playwright.sync_api import sync_playwright
import os

VIEWPORTS = [
    ("desktop-1920", 1920, 1080),
    ("laptop-1440",  1440,  900),
    ("laptop-1366",  1366,  768),
    ("tablet-768",    768, 1024),
    ("mobile-375",    375,  667),
]

URL = "http://127.0.0.1:8765/index.html"
OUT = "/home/henry/projects/lerna-admin.github.io/tools/screenshots"
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        page.goto(URL, wait_until="networkidle")

        # Snapshot of hero
        page.screenshot(path=f"{OUT}/01-hero-{name}.png")

        # Measure positions (before scroll)
        page.evaluate("window.scrollTo(0,0)")
        page.wait_for_timeout(200)
        explorer_before = page.evaluate("""() => {
            const el = document.querySelector('a.hero-scroll');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {top: r.top, bottom: r.bottom, height: r.height, display: cs.display};
        }""")

        page.evaluate("location.hash = '#trust'")
        page.wait_for_timeout(800)
        m = page.evaluate("""() => {
            const topbar = document.querySelector('.topbar');
            const trust  = document.querySelector('#trust');
            const title  = document.querySelector('.td-trust-title');
            const r = el => el ? el.getBoundingClientRect() : null;
            return {
                topbar: r(topbar),
                trust:  r(trust),
                title:  r(title),
                scrollY: window.scrollY,
                vh: window.innerHeight,
            };
        }""")

        # Snapshot after scroll
        page.screenshot(path=f"{OUT}/02-after-explorar-{name}.png")

        topbar_bottom = m['topbar']['bottom']
        title_top     = m['title']['top']
        gap = title_top - topbar_bottom

        print(f"\n=== {name} ({w}x{h}) ===")
        if explorer_before:
            visible = explorer_before['bottom'] <= h and explorer_before['top'] >= 0 and explorer_before['display'] != 'none'
            print(f"  EXPLORAR.top/bot = {explorer_before['top']:.0f}/{explorer_before['bottom']:.0f}px  (viewport h={h})  {'✅ visible' if visible else '⚠️ OUT OF VIEWPORT or hidden'}")
        print(f"  topbar.bottom    = {topbar_bottom:.0f}px")
        print(f"  trust.top        = {m['trust']['top']:.0f}px")
        print(f"  title.top        = {title_top:.0f}px")
        print(f"  GAP topbar→title = {gap:.0f}px   {'⚠️ TOO MUCH' if gap > 30 else '✅ OK'}")
        print(f"  scrollY          = {m['scrollY']:.0f}")

        ctx.close()
    browser.close()
print("\nScreenshots saved to", OUT)
