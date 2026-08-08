import hashlib
import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
COVER_DIR = ROOT / "images" / "insights"
HUB = (ROOT / "insights.html").read_text(encoding="utf-8")

cards = re.findall(r'<article class="ih-card"[\s\S]*?</article>', HUB)
assert len(cards) == 22, f"Expected 22 insight cards, found {len(cards)}"

card_covers = []
for card in cards:
    image = re.search(r'<img\s+[^>]*src="([^"]+)"[^>]*>', card)
    assert image, "Every insight card must have an image"
    tag = image.group(0)
    source = image.group(1)
    alt = re.search(r'alt="([^"]+)"', tag)
    assert alt and alt.group(1).strip(), f"Missing alt text: {source}"
    if source.startswith("/images/insights/"):
        assert 'width="1200"' in tag and 'height="675"' in tag, f"Missing intrinsic dimensions: {source}"
        assert 'loading="lazy"' in tag, f"Missing lazy loading: {source}"
    assert (ROOT / source.lstrip("/")).is_file(), f"Missing card image: {source}"
    card_covers.append(source)

assert len(card_covers) == len(set(card_covers)), "Insight cards must not reuse thumbnail paths"

hashes = {}
largest = ("", 0)
for image_path in sorted(COVER_DIR.glob("*.jpg")):
    with Image.open(image_path) as image:
        assert image.size == (1200, 675), f"Wrong dimensions: {image_path.name} {image.size}"
    size = image_path.stat().st_size
    assert size <= 250_000, f"Image too large: {image_path.name} {size} bytes"
    largest = max(largest, (image_path.name, size), key=lambda item: item[1])
    digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
    assert digest not in hashes, f"Duplicate image content: {image_path.name} and {hashes[digest]}"
    hashes[digest] = image_path.name

initial_slugs = [
    "ai-search-website-importance",
    "aeo-geo-small-business-guide",
    "why-ai-cannot-explain-your-business",
    "what-is-entity-ai-search",
    "naver-smartplace-management",
    "local-store-before-ads-checklist",
    "google-business-profile-local-store",
    "online-sales-product-page-problem",
    "online-store-before-ads-checklist",
    "consulting-contract-price-comparison",
    "consulting-business-website-faq",
    "government-support-marketing-budget",
    "hope-return-package-marketing-assets",
    "marketing-priority-consulting",
    "marketing-priority-order",
]

for slug in initial_slugs:
    relative = f"/images/insights/{slug}.jpg"
    absolute = f"https://geosangmarketing.com{relative}"
    page = (ROOT / "insights" / f"{slug}.html").read_text(encoding="utf-8")
    assert relative in page, f"Detail cover missing: {slug}"
    assert f'<meta property="og:image" content="{absolute}"' in page, f"OG image missing: {slug}"
    assert re.search(r'<img class="ia-cover"[^>]+alt="[^"]+"[^>]+width="1200"[^>]+height="675"', page), f"Accessible detail cover missing: {slug}"

print(json.dumps({
    "cards": len(cards),
    "uniqueCardCovers": len(set(card_covers)),
    "optimizedImages": len(hashes),
    "initialDetailPages": len(initial_slugs),
    "largestOptimizedImage": {"name": largest[0], "bytes": largest[1]},
    "status": "PASS",
}, ensure_ascii=False, indent=2))
