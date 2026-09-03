const test = require("node:test");
const assert = require("node:assert/strict");

delete process.env.NOTION_TOKEN;
delete process.env.NOTION_PORTFOLIO_DATA_SOURCE_ID;

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

test("missing Notion configuration returns all 21 fallback cards", async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const res = response();
    await handler({ method: "GET" }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, "fallback");
    assert.equal(res.body.count, 21);
    assert.equal(res.body.items.length, 21);
    assert.equal(res.body.items.filter((item) => item.exception).length, 1);
    assert.equal(res.body.items.some((item) => item.status === "보관"), false);
    assert.deepEqual(res.body.items.map((item) => item.sort), [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  } finally {
    console.error = originalError;
  }
});

