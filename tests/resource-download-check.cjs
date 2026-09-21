const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
const target = `${base}/support/resources/one-thing-summary-worksheet`;
const artifacts = path.resolve("artifacts", "resource-download");
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");

function verifyDownloadedFile(filePath, extension) {
  const bytes = fs.readFileSync(filePath);
  if (!bytes.length) throw new Error(`${extension} file is empty`);
  if (extension === "pdf") {
    if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("PDF header is invalid");
    if (!bytes.subarray(Math.max(0, bytes.length - 2048)).toString().includes("%%EOF")) throw new Error("PDF trailer is invalid");
  }
  if (extension === "pptx" && bytes.subarray(0, 2).toString() !== "PK") throw new Error("PPTX ZIP header is invalid");
  return bytes.length;
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!response || !response.ok()) throw new Error(`Page failed: ${response && response.status()}`);
  await page.getByRole("button", { name: "무료 자료 받기" }).waitFor({ state: "visible", timeout: 20000 });
  await page.getByRole("button", { name: "무료 자료 받기" }).click();

  const honeypot = page.locator('[name="website_hidden"]');
  const honeypotBox = await honeypot.boundingBox();
  if (honeypotBox && honeypotBox.x + honeypotBox.width > 0 && honeypotBox.y + honeypotBox.height > 0) {
    throw new Error("Honeypot overlaps the visitor viewport");
  }
  if (await honeypot.inputValue()) throw new Error("Honeypot was prefilled");

  await page.locator('[name="name"]').fill("Codex 다운로드 검수");
  await page.locator('[name="email"]').fill(`codex-resource-${stamp}@example.com`);
  await page.locator('[name="company"]').fill("거상마케팅센터 QA");
  await page.locator('[name="privacyAgree"]').check();

  // A honeypot response must never reveal the success/download state.
  await honeypot.evaluate((element) => { element.value = "spam-filled"; });
  await page.getByRole("button", { name: "신청하고 자료 받기" }).click();
  await page.locator("#leadStatus").getByText("신청이 완료되지 않았습니다", { exact: false }).waitFor({ state: "visible" });
  if (!(await page.locator("#downloadResult").isHidden())) throw new Error("Ignored request exposed download result");

  await honeypot.evaluate((element) => { element.value = ""; });
  await page.getByRole("button", { name: "신청하고 자료 받기" }).click();
  await page.locator("#downloadResult").getByText("신청이 완료되었습니다", { exact: false }).waitFor({ state: "visible", timeout: 20000 });

  const pdfButton = page.getByRole("button", { name: /\.pdf 다운로드$/i });
  const pptxButton = page.getByRole("button", { name: /\.pptx 다운로드$/i });
  await pdfButton.waitFor({ state: "visible" });
  await pptxButton.waitFor({ state: "visible" });

  // A server-side expiry/error must remain visible after the form is hidden.
  const downloadPattern = "**/functions/v1/board-api/downloads";
  const expiryHandler = async (route) => route.fulfill({
    status: 403,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({ ok: false, error: "다운로드 시간이 만료되었습니다. 자료를 다시 신청해 주세요." }),
  });
  await page.route(downloadPattern, expiryHandler);
  await pdfButton.click();
  await page.locator("#downloadStatus").getByText("다운로드 실패: 다운로드 시간이 만료되었습니다", { exact: false }).waitFor({ state: "visible" });
  await page.unroute(downloadPattern, expiryHandler);
  errors.length = 0;

  const downloaded = [];
  for (const [extension, button] of [["pdf", pdfButton], ["pptx", pptxButton]]) {
    const downloadPromise = page.waitForEvent("download", { timeout: 120000 });
    await button.click();
    const download = await downloadPromise;
    const destination = path.join(artifacts, `one-thing-${stamp}.${extension}`);
    await download.saveAs(destination);
    downloaded.push({ extension, destination, bytes: verifyDownloadedFile(destination, extension) });
  }

  await page.screenshot({ path: path.join(artifacts, `success-${stamp}.png`), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) throw new Error("Mobile page has horizontal overflow");
  if (errors.length) throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
  console.log(JSON.stringify({ ok: true, target, stamp, downloaded, overflow, errors }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
