const { chromium } = require("playwright");
const fs = require("node:fs");

(async () => {
  const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const checks = [
    { name: "home-navigation-desktop", url: base+"/", width: 1440, height: 900, expect: "고객지원" },
    { name: "contact-mobile", url: base+"/contact.html?type=consulting&source=support-test", width: 390, height: 844, expect: "무료 진단 · 상담 신청" },
    { name: "support-desktop", url: base+"/support/", width: 1440, height: 1000, expect: "마케팅에 필요한 정보와" },
    { name: "notices-mobile", url: base+"/support/notices/", width: 390, height: 844, expect: "거상마케팅센터 고객지원 이용 안내" },
    { name: "faq-tablet", url: base+"/support/faq/", width: 768, height: 1024, expect: "마케팅 대행 비용은 어떻게 결정되나요?" },
    { name: "resources-mobile", url: base+"/support/resources/", width: 360, height: 800, expect: "발행된 자료가 없거나" },
    { name: "notice-detail", url: base+"/support/notices/support-guide", width: 1440, height: 1000, expect: "거상마케팅센터 고객지원 이용 안내" },
    { name: "admin-login-mobile", url: base+"/admin/login.html", width: 390, height: 844, expect: "게시판 관리자 로그인" },
  ];
  fs.mkdirSync("artifacts/support", { recursive: true });
  let failed = false;
  for (const check of checks) {
    const page = await browser.newPage({ viewport: { width: check.width, height: check.height } });
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => { if (!request.url().includes("google-analytics.com")) errors.push(`REQUEST_FAILED ${request.url()} ${request.failure()?.errorText || ""}`); });
    page.on("response", (res) => { if (res.status() >= 400) errors.push(`HTTP_${res.status()} ${res.url()}`); });
    const response = await page.goto(check.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.getByText(check.expect, { exact: false }).first().waitFor({ state: "visible", timeout: 20000 });
    const text = await page.locator("body").innerText();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    await page.screenshot({ path: `artifacts/support/${check.name}.png`, fullPage: true });
    const ok = response && response.ok() && text.includes(check.expect) && !overflow && errors.length === 0;
    console.log(`${ok ? "PASS" : "FAIL"} ${check.name} status=${response && response.status()} overflow=${overflow} errors=${errors.length}`);
    if (!ok) {
      failed = true;
      console.log(JSON.stringify({ expected: check.expect, errors, excerpt: text.slice(0, 500) }, null, 2));
    }
    await page.close();
  }
  await browser.close();
  if (failed) process.exit(1);
})();
