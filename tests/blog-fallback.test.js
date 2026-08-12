const test = require("node:test");
const assert = require("node:assert/strict");

delete process.env.NOTION_TOKEN;
delete process.env.NOTION_BLOG_DATABASE_ID;

const handler = require("../api/blog.js");

function response() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(value) { this.body = value; return this; },
  };
}

test("missing Notion configuration degrades safely", async () => {
  const list = response();
  await handler({ query: { mode: "list" } }, list);
  assert.equal(list.statusCode, 200);
  assert.match(list.body, /마케팅 인사이트를 준비하고 있습니다/);

  const detail = response();
  await handler({ query: { mode: "detail", slug: "missing" } }, detail);
  assert.equal(detail.statusCode, 404);
  assert.match(detail.body, /글을 찾을 수 없습니다/);

  const rss = response();
  await handler({ query: { mode: "rss" } }, rss);
  assert.equal(rss.statusCode, 200);
  assert.equal(rss.headers["Content-Type"], "application/rss+xml; charset=utf-8");
  assert.match(rss.body, /<rss version="2.0"/);
});
