const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NOTION_TOKEN = "test-token";
process.env.NOTION_BLOG_DATABASE_ID = "test-database";

const page = {
  id: "page-1",
  last_edited_time: "2026-08-12T01:00:00.000Z",
  properties: {
    "제목": { title: [{ plain_text: "노션 블로그 테스트 글" }] },
    "Slug": { rich_text: [{ plain_text: "notion-blog-test" }] },
    "카테고리": { select: { name: "스마트플레이스" } },
    "핵심 질문": { rich_text: [{ plain_text: "무엇부터 점검해야 할까요?" }] },
    "요약": { rich_text: [{ plain_text: "공개 글의 목록과 상세 렌더링을 검증합니다." }] },
    "대표 이미지": { files: [{ external: { url: "https://images.example.com/cover.jpg" } }] },
    "작성일": { date: { start: "2026-08-12" } },
    "추천 여부": { checkbox: true },
    "SEO 제목": { rich_text: [{ plain_text: "노션 블로그 테스트 SEO" }] },
    "SEO 설명": { rich_text: [{ plain_text: "노션 CMS SEO 설명입니다." }] },
    "키워드": { multi_select: [{ name: "노션CMS" }] },
    "관련 서비스": { multi_select: [{ name: "스마트플레이스 최적화" }] },
    "CTA 문구": { rich_text: [{ plain_text: "스마트플레이스 상담하기" }] },
    "CTA 링크": { url: "/contact?type=smartplace" },
  },
};

global.fetch = async (url) => ({
  ok: true,
  json: async () => url.includes("/databases/")
    ? { data_sources: [{ id: "test-data-source" }] }
    : url.includes("/data_sources/")
      ? { results: [page], has_more: false }
      : { results: [{ type: "heading_2", heading_2: { rich_text: [{ plain_text: "점검 항목" }] } }, { type: "paragraph", paragraph: { rich_text: [{ plain_text: "본문 문단입니다." }] } }], has_more: false },
});

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

test("Notion CMS list, detail and RSS render public posts", async () => {
  const list = response();
  await handler({ query: { mode: "list" } }, list);
  assert.equal(list.statusCode, 200);
  assert.match(list.body, /노션 블로그 테스트 글/);
  assert.match(list.body, /\/blog\/notion-blog-test/);
  assert.match(list.body, /CollectionPage/);
  assert.doesNotMatch(list.body, /추천 글|blog-featured|FEATURED/);

  const detail = response();
  await handler({ query: { mode: "detail", slug: "notion-blog-test" } }, detail);
  assert.equal(detail.statusCode, 200);
  assert.match(detail.body, /BlogPosting/);
  assert.match(detail.body, /점검 항목/);
  assert.match(detail.body, /스마트플레이스 상담하기/);
  assert.doesNotMatch(detail.body, /RELATED POSTS|같은 주제의 글|blog-related/);

  const rss = response();
  await handler({ query: { mode: "rss" } }, rss);
  assert.equal(rss.statusCode, 200);
  assert.equal(rss.headers["Content-Type"], "application/rss+xml; charset=utf-8");
  assert.match(rss.body, /<rss version="2.0"/);
  assert.match(rss.body, /https:\/\/geosangmarketing.com\/blog\/notion-blog-test/);
});
