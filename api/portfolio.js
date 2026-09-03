const fallbackItems = require("../data/portfolio-fallback.js");

const NOTION_VERSION = "2026-03-11";
const CACHE_SECONDS = 1800;
const PUBLIC_STATUSES = new Set(["운영중", "작업중"]);
const tiktokException = fallbackItems.find((item) => item.exception);

let memoryCache;

function richText(property) {
  const items = property?.title || property?.rich_text || [];
  return items.map((item) => item.plain_text || item.text?.content || "").join("").trim();
}

function selectValue(property) {
  return property?.select?.name || property?.status?.name || "";
}

function safeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function firstFileUrl(property) {
  const first = property?.files?.[0];
  return safeUrl(first?.file?.url || first?.external?.url || "");
}

function mapPage(page) {
  const properties = page.properties || {};
  const sort = properties["정렬"]?.number;
  return {
    id: page.id,
    name: richText(properties["사이트명"]),
    description: richText(properties["대표설명"]),
    liveUrl: safeUrl(properties["라이브 URL"]?.url),
    category: selectValue(properties["카테고리"]) || "기타",
    status: selectValue(properties["상태"]),
    sort: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER,
    productionDate: properties["제작일"]?.date?.start || "",
    thumbnail: safeUrl(properties["썸네일"]?.url) || firstFileUrl(properties["카드 이미지"]) || "/assets/images/website-production/geosang-marketing-center.png",
  };
}

async function notionQuery(dataSourceId, body) {
  const response = await fetch(`https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Notion portfolio query failed (${response.status})`);
  return response.json();
}

async function loadFromNotion() {
  if (memoryCache && memoryCache.expires > Date.now()) return memoryCache.items;
  if (!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is not configured");
  const dataSourceId = process.env.NOTION_PORTFOLIO_DATA_SOURCE_ID;
  if (!dataSourceId) throw new Error("NOTION_PORTFOLIO_DATA_SOURCE_ID is not configured");

  const pages = [];
  let cursor;
  do {
    const data = await notionQuery(dataSourceId, {
      filter: { or: [
        { property: "상태", select: { equals: "운영중" } },
        { property: "상태", select: { equals: "작업중" } },
      ] },
      sorts: [{ property: "정렬", direction: "ascending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  const items = pages
    .map(mapPage)
    .filter((item) => item.name && PUBLIC_STATUSES.has(item.status));
  if (tiktokException && !items.some((item) => item.name === tiktokException.name)) items.push(tiktokException);
  items.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "ko"));
  memoryCache = { items, expires: Date.now() + CACHE_SECONDS * 1000 };
  return items;
}

function sendJson(res, items, source) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=3600`);
  return res.status(200).json({ items, count: items.length, source });
}

module.exports = async function handler(req, res) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    return sendJson(res, await loadFromNotion(), "notion");
  } catch (error) {
    console.error("[notion-portfolio]", error instanceof Error ? error.message : "Unknown error");
    return sendJson(res, fallbackItems, "fallback");
  }
};
