import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "supabase"]);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(?:html|js)$/.test(entry.name)) files.push(fullPath);
  }
}

walk(root);
let changed = 0;
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const next = source.replace(
    /(<a href="\/blog"(?:\s+class="[^"]*")?>[^<]*블로그<\/a>)(\s*)(<a href="\/contact)/g,
    '$1$2<a href="/support">고객지원</a>$2$3',
  );
  if (next !== source) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
  }
}

console.log(`고객지원 메뉴 반영 파일: ${changed}`);
