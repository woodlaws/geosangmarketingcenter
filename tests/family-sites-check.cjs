const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8788";
const output = process.env.ARTIFACT_DIR || path.resolve("artifacts", "family-sites");
const expected = [
  { id: "geosang-marketing-center", href: "https://geosangmarketing.com/", target: null },
  { id: "geosang-government-support", href: "https://geosang-support.vercel.app/", target: "_blank" },
  { id: "geosang-tour", href: "https://geosangtour.vercel.app/", target: "_blank" },
  { id: "geosang-school", href: "https://www.geosangschool.co.kr/", target: "_blank" },
  { id: "ai-marketing-school", href: "https://www.aimarketing.school/", target: "_blank" },
  { id: "ai-homepage-school", href: "https://aihomepage-school.vercel.app/", target: "_blank" },
  { id: "ai-book-club", href: "https://aibookclub.vercel.app/", target: "_blank" },
];

function watchErrors(page) {
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    if (!/google-analytics|googletagmanager/.test(request.url())) errors.push(`REQUEST_FAILED ${request.url()}`);
  });
  return errors;
}

async function assertLinks(panel) {
  const links = panel.locator(".family-site-link");
  if (await links.count() !== expected.length) throw new Error(`Expected ${expected.length} family links`);
  for (const site of expected) {
    const link = panel.locator(`[data-family-site-id="${site.id}"]`);
    const rawHref = await link.getAttribute("href");
    const absoluteHref = new URL(rawHref, base).href;
    const expectedHref = site.id === "geosang-marketing-center" ? new URL("/", base).href : site.href;
    if (absoluteHref !== expectedHref) throw new Error(`${site.id} href mismatch: ${absoluteHref}`);
    if (await link.getAttribute("target") !== site.target) throw new Error(`${site.id} target mismatch`);
    if (site.target === "_blank" && await link.getAttribute("rel") !== "noopener noreferrer") throw new Error(`${site.id} rel mismatch`);
  }
  const current = panel.locator('.family-site-link.is-current[data-family-site-id="geosang-marketing-center"]');
  if (await current.getByText("현재 사이트", { exact: true }).count() !== 1) throw new Error("Current-site marker missing");
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const desktopErrors = watchErrors(desktop);
  await desktop.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const headerTrigger = desktop.locator(".family-sites--header .family-sites-trigger");
  await headerTrigger.waitFor({ state: "visible", timeout: 10000 });
  const headerHeight = await desktop.locator(".header-inner").evaluate((element) => element.getBoundingClientRect().height);
  if (Math.round(headerHeight) !== 88) throw new Error(`Header height changed: ${headerHeight}`);
  await headerTrigger.focus();
  await desktop.keyboard.press("Enter");
  if (await headerTrigger.getAttribute("aria-expanded") !== "true") throw new Error("Header menu did not open by keyboard");
  const headerPanel = desktop.locator(".family-sites-panel--header");
  await assertLinks(headerPanel);
  await desktop.screenshot({ path: path.join(output, "family-sites-pc-header-open.png"), fullPage: false });
  await desktop.keyboard.press("Escape");
  if (await headerTrigger.getAttribute("aria-expanded") !== "false") throw new Error("Header menu did not close with Escape");
  await headerTrigger.click();
  await desktop.locator(".hero").click({ position: { x: 20, y: 200 } });
  if (await headerTrigger.getAttribute("aria-expanded") !== "false") throw new Error("Header menu did not close on outside click");

  await desktop.locator("footer.site-footer").scrollIntoViewIfNeeded();
  const footerTrigger = desktop.locator(".family-sites--footer .family-sites-trigger");
  await footerTrigger.click();
  const footerPanel = desktop.locator(".family-sites-panel--footer");
  await assertLinks(footerPanel);
  const footerBox = await footerTrigger.boundingBox();
  const footerPanelBox = await footerPanel.boundingBox();
  if (!footerBox || !footerPanelBox || footerPanelBox.y + footerPanelBox.height > footerBox.y + 2) throw new Error("Footer panel did not open upward");
  await desktop.screenshot({ path: path.join(output, "family-sites-pc-footer-open.png"), fullPage: false });
  if (await desktop.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) throw new Error("Desktop horizontal overflow");
  if (desktopErrors.length) throw new Error(`Desktop errors: ${JSON.stringify(desktopErrors)}`);
  await desktop.close();

  const tablet = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  const tabletErrors = watchErrors(tablet);
  await tablet.goto(`${base}/services/smartplace`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await tablet.locator(".family-sites-mobile-trigger").waitFor({ state: "attached", timeout: 10000 });
  if (await tablet.locator(".site-header .nav").isVisible()) throw new Error("Desktop nav should collapse at 1024px");
  if (!(await tablet.locator("#navToggle").isVisible())) throw new Error("Hamburger missing at 1024px");
  if (tabletErrors.length) throw new Error(`Tablet errors: ${JSON.stringify(tabletErrors)}`);
  await tablet.close();

  for (const width of [390, 360]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 } });
    const mobileErrors = watchErrors(mobile);
    await mobile.goto(`${base}/about`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await mobile.locator("#navToggle").click();
    const mobileTrigger = mobile.locator(".family-sites-mobile-trigger");
    await mobileTrigger.waitFor({ state: "visible", timeout: 10000 });
    await mobileTrigger.click();
    if (await mobileTrigger.getAttribute("aria-expanded") !== "true") throw new Error(`Mobile accordion failed at ${width}px`);
    await assertLinks(mobile.locator(".family-sites-mobile-panel"));
    if (await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) throw new Error(`Mobile horizontal overflow at ${width}px`);
    if (width === 390) await mobile.screenshot({ path: path.join(output, "family-sites-mobile-open.png"), fullPage: false });
    await mobile.keyboard.press("Escape");
    if (await mobileTrigger.getAttribute("aria-expanded") !== "false") throw new Error(`Mobile accordion did not close with Escape at ${width}px`);
    if (mobileErrors.length) throw new Error(`Mobile ${width}px errors: ${JSON.stringify(mobileErrors)}`);
    await mobile.close();
  }

  await browser.close();
  console.log(JSON.stringify({ ok: true, base, output, widths: [1440, 1024, 390, 360], pages: ["/", "/services/smartplace", "/about"] }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
