const test = require("node:test");
const assert = require("node:assert/strict");
const fallback = require("../data/portfolio-fallback.js");

process.env.NOTION_TOKEN = "test-token";
process.env.NOTION_PORTFOLIO_DATA_SOURCE_ID = "test-data-source";

function notionPage(item) {
  return {
    id: `notion-${item.id}`,
    properties: {
      "사이트명": { title: [{ plain_text: item.name }] },
      "대표설명": { rich_text: [{ plain_text: item.description }] },
      "라이브 URL": { url: item.liveUrl },
      "카테고리": { select: { name: item.category } },
      "상태": { select: { name: item.status } },
      "정렬": { number: item.sort },
      "제작일": { date: { start: item.productionDate } },
      "썸네일": { url: item.thumbnail },
      "카드 이미지": { files: [] },
      "GitHub": { url: "https://github.com/private/reference" },
    },
  };
}

const notionItems = fallback.filter((item) => !item.exception).map(notionPage);
notionItems.push(notionPage({ id: "archived", name: "보관 사이트", description: "숨김", liveUrl: "https://archive.example.com", category: "교육", status: "보관", sort: 7, productionDate: "2026-01-01", thumbnail: "" }));
let requestBody;
global.fetch = async (url, options) => {
  assert.match(url, /\/data_sources\/test-data-source\/query$/);
  requestBody = JSON.parse(options.body);
  return { ok: true, json: async () => ({ results: notionItems, has_more: false }) };
};

const handler = require("../api/portfolio.js");

function response() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test("portfolio API returns 20 public Notion items plus the TikTok exception", async () => {
  const res = response();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "notion");
  assert.equal(res.body.count, 21);
  assert.equal(res.body.items.length, 21);
  assert.equal(res.body.items[0].name, "거상스쿨");
  assert.equal(res.body.items[9].name, "틱톡커머스 랩");
  assert.equal(res.body.items.at(-1).name, "시드니픽");
  assert.equal(res.body.items.filter((item) => item.status === "작업중").length, 3);
  assert.equal(res.body.items.some((item) => item.name === "보관 사이트"), false);
  assert.deepEqual(requestBody.sorts, [{ property: "정렬", direction: "ascending" }]);
  assert.match(JSON.stringify(requestBody.filter), /운영중/);
  assert.match(JSON.stringify(requestBody.filter), /작업중/);
  assert.match(res.headers["Cache-Control"], /s-maxage=1800/);
});

