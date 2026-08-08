import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const legacy = [
  {
    slug: "government-support-after-plan",
    oldPath: "/og-image.png",
    image: "/images/insights/government-support-after-plan.jpg",
    alt: "지원사업 결과물을 장기 운영 자산으로 정리하는 인수인계 작업 공간",
  },
  {
    slug: "enterprise-entity-basics",
    oldPath: "/og-image.png",
    image: "/images/insights/enterprise-entity-basics.jpg",
    alt: "기업 건물과 공식 정보를 연결한 Entity 구조",
  },
  {
    slug: "marketing-consulting-first-priority",
    oldPath: "/assets/ceo-photo.jpg",
    image: "/images/insights/marketing-consulting-first-priority.jpg",
    alt: "마케팅 채널을 진단하고 우선순위를 정하는 컨설팅 과정",
  },
];

const dataPath = path.join(root, "data", "insights.ts");
let data = fs.readFileSync(dataPath, "utf8");
for (const item of legacy) {
  const entryPattern = new RegExp(`(slug: "${item.slug}"[\\s\\S]*?coverImage:) "[^"]+",(?:\\n\\s*coverAlt: "[^"]+",)?`);
  data = data.replace(entryPattern, `$1 "${item.image}",\n    coverAlt: "${item.alt}",`);
}
fs.writeFileSync(dataPath, data, "utf8");

const hubPath = path.join(root, "insights.html");
let hub = fs.readFileSync(hubPath, "utf8");
hub = hub.replace(
  /<div class="ih-cover ih-cover-government">[\s\S]*?<\/div>/,
  `<img src="/images/insights/government-support-after-plan.jpg" alt="지원사업 결과물을 장기 운영 자산으로 정리하는 인수인계 작업 공간" width="1200" height="675" loading="lazy" decoding="async" />`,
);
hub = hub.replace(
  /<div class="ih-cover ih-cover-entity">[\s\S]*?<\/div>/,
  `<img src="/images/insights/enterprise-entity-basics.jpg" alt="기업 건물과 공식 정보를 연결한 Entity 구조" width="1200" height="675" loading="lazy" decoding="async" />`,
);
hub = hub.replace(
  /<img src="\/assets\/ceo-photo\.jpg" alt="[^"]*" \/>/,
  `<img src="/images/insights/marketing-consulting-first-priority.jpg" alt="마케팅 채널을 진단하고 우선순위를 정하는 컨설팅 과정" width="1200" height="675" loading="lazy" decoding="async" />`,
);
fs.writeFileSync(hubPath, hub, "utf8");

for (const item of legacy) {
  const pagePath = path.join(root, "insights", `${item.slug}.html`);
  let page = fs.readFileSync(pagePath, "utf8");
  page = page.replaceAll(`https://geosangmarketing.com${item.oldPath}`, `https://geosangmarketing.com${item.image}`);
  page = page.replace(
    /<div class="ia-cover ia-cover-graphic">[\s\S]*?<\/div>|<img class="ia-cover"[^>]+>/,
    `<img class="ia-cover" src="${item.image}" alt="${item.alt}" width="1200" height="675" loading="eager" decoding="async" />`,
  );
  fs.writeFileSync(pagePath, page, "utf8");
}

console.log(`Applied ${legacy.length} legacy insight cover replacements.`);
