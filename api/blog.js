const SITE_URL = "https://geosangmarketing.com";
const NOTION_VERSION = "2026-03-11";
const CACHE_SECONDS = 300;
const memoryCache = new Map();

const CATEGORIES = [
  "스마트플레이스", "AEO·GEO", "AI 검색 최적화", "블로그 마케팅",
  "체험단 마케팅", "식당 마케팅", "병원·치과 마케팅", "소상공인 마케팅", "마케팅 사례",
];

const SERVICE_LINKS = {
  "스마트플레이스 최적화": "/services/smartplace",
  "블로그 마케팅": "/services/content-sns",
  "체험단 마케팅": "/services/content-sns",
  "식당 마케팅": "/marketing-types/local-store",
  "치과 마케팅": "/marketing-types/local-store",
  "홈페이지 진단": "/services/website-diagnosis",
  "AEO·GEO 컨설팅": "/services/aeo-geo",
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function absoluteUrl(value = "") {
  if (!value) return "";
  try { return new URL(value, SITE_URL).toString(); } catch { return ""; }
}

function safeExternalUrl(value = "") {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch { return ""; }
}

function richText(property) {
  const values = property?.title || property?.rich_text || [];
  return values.map((item) => item.plain_text || "").join("").trim();
}

function selectValues(property) {
  if (property?.select?.name) return [property.select.name];
  if (Array.isArray(property?.multi_select)) return property.multi_select.map((item) => item.name).filter(Boolean);
  const text = richText(property);
  return text ? text.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function fileUrl(property) {
  const file = property?.files?.[0];
  return file?.file?.url || file?.external?.url || "";
}

function mapPost(page) {
  const p = page.properties || {};
  const services = selectValues(p["관련 서비스"]);
  const rawCta = p["CTA 링크"]?.url || richText(p["CTA 링크"]);
  const ctaLink = rawCta && (rawCta.startsWith("/") || rawCta.startsWith(SITE_URL)) ? rawCta : "/contact?type=consulting&source=blog";
  const slug = richText(p["Slug"]);
  const editorialCovers = {
    "why-homepage-is-center-of-ai-search-marketing": "/images/blog/ai-search-homepage-center.png",
    "why-local-business-needs-homepage-ai-search": "/images/blog/ai-search-local-business-homepage.webp",
    "how-to-write-website-content-cited-by-ai-search": "/images/blog/ai-search-cited-content/cover.webp",
    "aeo-geo-website-diagnostic-checklist-20": "/images/blog/aeo-geo-checklist-20/cover.webp",
    "why-website-not-showing-in-search-7-reasons": "/images/blog/website-search-7-reasons.svg",
  };
  return {
    id: page.id,
    title: richText(p["제목"]),
    slug,
    category: selectValues(p["카테고리"])[0] || "마케팅 인사이트",
    question: richText(p["핵심 질문"]),
    excerpt: richText(p["요약"]),
    image: fileUrl(p["대표 이미지"]) || editorialCovers[slug] || "",
    publishedAt: p["작성일"]?.date?.start || "",
    modifiedAt: page.last_edited_time || "",
    seoTitle: richText(p["SEO 제목"]),
    seoDescription: richText(p["SEO 설명"]),
    keywords: selectValues(p["키워드"]),
    services,
    ctaLabel: richText(p["CTA 문구"]) || "마케팅 상담 요청하기",
    ctaLink,
  };
}

async function notionRequest(path, options = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function cached(key, loader) {
  const found = memoryCache.get(key);
  if (found && found.expires > Date.now()) return found.value;
  const value = await loader();
  memoryCache.set(key, { value, expires: Date.now() + CACHE_SECONDS * 1000 });
  return value;
}

async function fetchPosts() {
  return cached("published-posts", async () => {
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
    if (!databaseId) throw new Error("NOTION_BLOG_DATABASE_ID is not configured");
    const database = await notionRequest(`/databases/${databaseId}`);
    const dataSourceId = database.data_sources?.[0]?.id;
    if (!dataSourceId) throw new Error("The Notion database has no readable data source");
    const results = [];
    let cursor;
    do {
      const data = await notionRequest(`/data_sources/${dataSourceId}/query`, {
        method: "POST",
        body: JSON.stringify({
          filter: { property: "공개 여부", checkbox: { equals: true } },
          sorts: [{ property: "작성일", direction: "descending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      });
      results.push(...data.results);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    return results.map(mapPost).filter((post) => post.title && post.slug && post.publishedAt);
  });
}

async function fetchBlocks(blockId) {
  return cached(`blocks:${blockId}`, async () => {
    const blocks = [];
    let cursor;
    do {
      const suffix = `?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`;
      const data = await notionRequest(`/blocks/${blockId}/children${suffix}`);
      blocks.push(...data.results);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    return blocks;
  });
}

function blockText(block) {
  const type = block.type;
  const rich = block[type]?.rich_text || [];
  return rich.map((item) => {
    let value = escapeHtml(item.plain_text || "");
    const href = safeExternalUrl(item.href);
    if (href) value = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    if (item.annotations?.bold) value = `<strong>${value}</strong>`;
    if (item.annotations?.italic) value = `<em>${value}</em>`;
    if (item.annotations?.code) value = `<code>${value}</code>`;
    return value;
  }).join("");
}

function renderBlocks(blocks) {
  const output = [];
  let listType = "";
  for (const block of blocks) {
    const type = block.type;
    const isList = type === "bulleted_list_item" || type === "numbered_list_item";
    const nextList = type === "numbered_list_item" ? "ol" : isList ? "ul" : "";
    if (listType && listType !== nextList) { output.push(`</${listType}>`); listType = ""; }
    if (isList) {
      if (!listType) { listType = nextList; output.push(`<${listType}>`); }
      output.push(`<li>${blockText(block)}</li>`);
      continue;
    }
    if (type === "paragraph") output.push(`<p>${blockText(block)}</p>`);
    else if (type === "heading_2") output.push(`<h2>${blockText(block)}</h2>`);
    else if (type === "heading_3") output.push(`<h3>${blockText(block)}</h3>`);
    else if (type === "quote") output.push(`<blockquote>${blockText(block)}</blockquote>`);
    else if (type === "image") {
      const image = block.image?.file?.url || block.image?.external?.url;
      const caption = (block.image?.caption || []).map((item) => item.plain_text).join("");
      const safeImage = safeExternalUrl(image);
      if (safeImage) output.push(`<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(caption || "블로그 본문 이미지")}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`);
    }
  }
  if (listType) output.push(`</${listType}>`);
  return output.join("\n");
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(parsed);
}

function layout({ title, description, canonical, image, body, schemas = [], type = "website", keywords = [] }) {
  const ogImage = absoluteUrl(image) || `${SITE_URL}/og-image.png`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8" /><meta name="naver-site-verification" content="2c7ee16c39e1aef5cabb4e7532b2b9642809f782" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" />${keywords.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />` : ""}<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="${escapeHtml(type)}" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" /><meta property="og:url" content="${escapeHtml(canonical)}" /><meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="/assets/favicon.svg" /><link rel="stylesheet" href="/style.css?v=34" /><link rel="stylesheet" href="/blog.css?v=1" />
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`).join("")}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E79QT0R9Z3"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-E79QT0R9Z3');</script></head>
<body class="blog-page"><header class="site-header"><div class="container header-inner"><a href="/" class="brand"><img src="/assets/logo-mark.png" class="brand-logo" alt="거상마케팅센터 로고" /><span class="brand-text"><span class="brand-name">거상마케팅센터</span><span class="brand-sub">SMARTPLACE · AEO · GEO</span></span></a><nav class="nav" aria-label="주요 메뉴"><a href="/about">센터 소개</a><a href="/services">서비스</a><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/insights">인사이트</a><a href="/blog" class="active">블로그</a><a href="/contact" class="btn-nav">상담문의</a></nav><button class="nav-toggle" id="navToggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div><nav class="nav-mobile" id="navMobile"><a href="/about">센터 소개</a><a href="/services">서비스</a><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/insights">인사이트</a><a href="/blog">마케팅 블로그</a><a href="/contact" class="btn-nav">상담문의</a></nav></header>${body}<footer class="site-footer"><div class="container footer-copy">© 2026 거상마케팅센터. All rights reserved. · <a href="/blog">마케팅 블로그</a> · <a href="/contact">상담문의</a></div></footer><script src="/script.js?v=31"></script></body></html>`;
}

function card(post) {
  const image = post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" />` : `<div class="blog-card-placeholder" aria-hidden="true"><span>GEOSANG</span><b>MARKETING INSIGHT</b></div>`;
  return `<article class="blog-card" data-category="${escapeHtml(post.category)}" data-search="${escapeHtml(`${post.title} ${post.question} ${post.excerpt} ${post.keywords.join(" ")}`.toLowerCase())}"><a href="/blog/${encodeURIComponent(post.slug)}" class="blog-card-link">${image}<div class="blog-card-body"><span class="blog-category">${escapeHtml(post.category)}</span><h2>${escapeHtml(post.title)}</h2>${post.question ? `<strong class="blog-question">${escapeHtml(post.question)}</strong>` : ""}<p>${escapeHtml(post.excerpt)}</p><div class="blog-keywords">${post.keywords.slice(0, 4).map((keyword) => `<i>#${escapeHtml(keyword)}</i>`).join("")}</div><footer><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time><b>자세히 보기 →</b></footer></div></a></article>`;
}

function listPage(posts, notice = "") {
  const empty = `<div class="blog-empty"><span>CONTENT UPDATE</span><h2>마케팅 인사이트를 준비하고 있습니다</h2><p>거상마케팅센터의 스마트플레이스, AEO·GEO, 블로그 마케팅 인사이트가 곧 업데이트됩니다.</p><a href="/contact" class="btn-primary">상담 문의하기</a></div>`;
  const body = `<main><section class="blog-hero"><div class="container"><span>GEOSANG MARKETING BLOG</span><h1>마케팅 블로그</h1><p>스마트플레이스, AEO·GEO, 블로그 마케팅, 체험단 마케팅까지.<br />거상마케팅센터가 현장에서 쌓은 마케팅 인사이트를 정리합니다.</p></div></section><div class="blog-breadcrumb"><div class="container"><a href="/">홈</a><span>›</span><b>마케팅 블로그</b></div></div>
${notice ? `<div class="container blog-notice" role="status">${escapeHtml(notice)}</div>` : ""}
<section class="blog-section blog-list-section"><div class="container"><div class="blog-section-head"><span>LATEST INSIGHTS</span><h2>최신 글</h2><p>관심 있는 주제를 선택하거나 검색해 보세요.</p></div><div class="blog-tools"><div class="blog-filters" role="group" aria-label="카테고리 필터"><button type="button" class="is-active" data-filter="전체">전체</button>${CATEGORIES.map((category) => `<button type="button" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div><label class="blog-search"><span class="sr-only">블로그 검색</span><input type="search" id="blogSearch" placeholder="제목·질문·키워드 검색" /></label></div>${posts.length ? `<div class="blog-grid" id="blogGrid">${posts.map(card).join("")}</div><div class="blog-no-results" id="blogNoResults" hidden>검색 조건에 맞는 글이 없습니다.</div>` : empty}</div></section>
<section class="blog-cta"><div class="container"><div><span>FREE MARKETING DIAGNOSIS</span><h2>우리 사업에 맞는 마케팅 우선순위가 궁금하신가요?</h2><p>현재 온라인 노출과 콘텐츠 구조를 확인하고 먼저 해야 할 일을 정리해드립니다.</p></div><div><a href="/contact?type=consulting&source=blog-footer" class="btn-primary">무료 진단 신청하기</a><a href="https://pf.kakao.com/_hxlxaQG/chat" class="btn-kakao" target="_blank" rel="noopener noreferrer">카카오톡 상담하기</a></div></div></section></main><script src="/blog-client.js?v=1"></script>`;
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "마케팅 블로그", item: `${SITE_URL}/blog` }] };
  const collection = { "@context": "https://schema.org", "@type": "CollectionPage", name: "거상마케팅센터 마케팅 블로그", url: `${SITE_URL}/blog`, mainEntity: { "@type": "ItemList", itemListElement: posts.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`, name: post.title })) } };
  return layout({ title: "마케팅 블로그 | 거상마케팅센터", description: "스마트플레이스, AEO·GEO, AI 검색 최적화, 블로그 마케팅, 체험단 마케팅, 식당 마케팅 인사이트를 전하는 거상마케팅센터 공식 블로그입니다.", canonical: `${SITE_URL}/blog`, body, schemas: [collection, breadcrumb] });
}

function detailPage(post, blocks) {
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const description = post.seoDescription || post.excerpt;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, datePublished: post.publishedAt, dateModified: post.modifiedAt || post.publishedAt, author: { "@type": "Organization", name: "거상마케팅센터" }, publisher: { "@type": "Organization", name: "거상마케팅센터", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo-mark.png` } }, image: absoluteUrl(post.image) || `${SITE_URL}/og-image.png`, mainEntityOfPage: canonical };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "마케팅 블로그", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: post.title, item: canonical }] };
  const serviceLinks = post.services.map((service) => `<a href="${escapeHtml(SERVICE_LINKS[service] || "/services")}">${escapeHtml(service)} →</a>`).join("");
  const body = `<main><div class="blog-breadcrumb"><div class="container"><a href="/">홈</a><span>›</span><a href="/blog">마케팅 블로그</a><span>›</span><b>${escapeHtml(post.title)}</b></div></div><article><header class="blog-post-head"><div class="container"><span class="blog-category">${escapeHtml(post.category)}</span><h1>${escapeHtml(post.title)}</h1>${post.question ? `<p class="blog-post-question"><small>핵심 질문</small>${escapeHtml(post.question)}</p>` : ""}<div class="blog-post-meta"><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time>${post.keywords.map((keyword) => `<i>#${escapeHtml(keyword)}</i>`).join("")}</div></div></header>${post.image ? `<div class="container"><img class="blog-post-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" /></div>` : ""}<div class="container blog-post-layout"><div><section class="blog-answer"><small>한 문장 결론</small><strong>${escapeHtml(post.excerpt || post.question)}</strong></section><section class="blog-content">${renderBlocks(blocks) || `<p>본문을 준비하고 있습니다.</p>`}</section></div><aside class="blog-service-cta"><small>RELATED SERVICE</small><h2>${escapeHtml(post.ctaLabel)}</h2><p>${escapeHtml(post.excerpt)}</p><div>${serviceLinks}</div><a href="${escapeHtml(post.ctaLink)}" class="btn-primary">${escapeHtml(post.ctaLabel)}</a></aside></div></article><div class="blog-back"><a href="/blog">← 블로그 목록 보기</a></div></main>`;
  return layout({ title: post.seoTitle || `${post.title} | 거상마케팅센터`, description, canonical, image: post.image, body, schemas: [schema, breadcrumb], type: "article", keywords: post.keywords });
}

function notFoundPage() {
  return layout({ title: "블로그 글을 찾을 수 없습니다 | 거상마케팅센터", description: "요청한 블로그 글을 찾을 수 없습니다.", canonical: `${SITE_URL}/blog`, body: `<main><section class="blog-section"><div class="container">${`<div class="blog-empty"><h1>글을 찾을 수 없습니다</h1><p>주소를 확인하거나 블로그 목록에서 다른 글을 살펴보세요.</p><a href="/blog" class="btn-primary">블로그 목록 보기</a></div>`}</div></section></main>` });
}

function rss(posts) {
  const items = posts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${SITE_URL}/blog/${encodeURIComponent(post.slug)}</link><description>${escapeHtml(post.excerpt)}</description><category>${escapeHtml(post.category)}</category><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><guid isPermaLink="true">${SITE_URL}/blog/${encodeURIComponent(post.slug)}</guid></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>거상마케팅센터 마케팅 블로그</title><link>${SITE_URL}/blog</link><description>스마트플레이스, AEO·GEO와 업종별 마케팅 인사이트</description><language>ko-KR</language><atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;
}

module.exports = async function handler(req, res) {
  const mode = String(req.query.mode || "list");
  const slug = String(req.query.slug || "").trim();
  res.setHeader("Cache-Control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`);
  try {
    const posts = await fetchPosts();
    if (mode === "rss") {
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(200).send(rss(posts));
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (mode === "detail") {
      const post = posts.find((item) => item.slug === slug);
      if (!post) return res.status(404).send(notFoundPage());
      const blocks = await fetchBlocks(post.id);
      return res.status(200).send(detailPage(post, blocks));
    }
    return res.status(200).send(listPage(posts));
  } catch (error) {
    console.error("[notion-blog]", error.message);
    if (mode === "rss") {
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(200).send(rss([]));
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (mode === "detail") return res.status(404).send(notFoundPage());
    return res.status(200).send(listPage([]));
  }
};
