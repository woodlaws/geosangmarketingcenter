import fs from "node:fs";
import path from "node:path";

for (const root of ["support", "admin"]) {
  const queue = [root];
  while (queue.length) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(file);
      else if (entry.name.endsWith(".html")) {
        let html = fs.readFileSync(file, "utf8");
        if (!html.includes('rel="icon"')) html = html.replace("</title>", '</title><link rel="icon" href="/assets/favicon.svg">');
        fs.writeFileSync(file, html, "utf8");
      }
    }
  }
}
