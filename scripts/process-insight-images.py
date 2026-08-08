from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path(r"C:\Users\Administrator\.codex\generated_images\019fc730-2599-7ff3-b834-6fe9f6766eec")
OUTPUT = ROOT / "images" / "insights"
OUTPUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "ai-search-website-importance": GENERATED / "exec-92ca7d14-aa63-4f7f-9c42-7944a31d36e5.png",
    "aeo-geo-small-business-guide": GENERATED / "exec-55738a22-e8d8-4ee1-8510-4cdac2199af7.png",
    "why-ai-cannot-explain-your-business": GENERATED / "exec-0a8ff3b2-c6e0-45c1-ab4d-08e50557bedf.png",
    "what-is-entity-ai-search": GENERATED / "exec-74b0e5eb-7671-442e-8ab9-db1254d29f05.png",
    "naver-smartplace-management": GENERATED / "exec-ad8a8416-2f91-4f2f-bdd8-2e317882dc04.png",
    "local-store-before-ads-checklist": GENERATED / "exec-b959bed7-d8a2-4ec9-8b5f-964892cd9436.png",
    "google-business-profile-local-store": GENERATED / "exec-708def0c-3d41-4f96-a384-f7d46ecca451.png",
    "online-sales-product-page-problem": GENERATED / "exec-7c24fc8e-53bb-42fe-8c2b-afe460cd8803.png",
    "online-store-before-ads-checklist": GENERATED / "exec-b0e33c13-18aa-454f-8e09-57e8bd275db4.png",
    "consulting-contract-price-comparison": GENERATED / "exec-435d450d-5e39-4bca-9f17-15b8ae731666.png",
    "consulting-business-website-faq": GENERATED / "exec-63bfc11a-5d94-418a-9947-a9b7dd0bd7f0.png",
    "government-support-marketing-budget": GENERATED / "exec-77c1f66f-e174-4a0e-97b9-75eb98d188cf.png",
    "hope-return-package-marketing-assets": GENERATED / "exec-4ccc2718-b28d-4f57-be91-fffd423db5c7.png",
    "marketing-priority-order": GENERATED / "exec-54c63f97-e19d-4e04-aa8a-fabe015bd915.png",
    "enterprise-entity-basics": GENERATED / "exec-58a3b139-e624-481d-bbd3-b1e553f4e5cc.png",
    "marketing-consulting-first-priority": GENERATED / "exec-3a0e142f-1579-4222-b7ef-bf414c29e79b.png",
    "government-support-after-plan": GENERATED / "exec-03594ad4-479c-41fa-a478-b21dc3e28dc6.png",
}


def save_cover(source: Path, slug: str) -> None:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, (1200, 675), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        image.save(OUTPUT / f"{slug}.jpg", "JPEG", quality=86, optimize=True, progressive=True)


for slug, source in SOURCES.items():
    save_cover(source, slug)

# Use the repository's real CEO portrait. Keep the face and upper body inside the 16:9 crop.
with Image.open(ROOT / "assets" / "ceo-photo.jpg") as portrait:
    portrait = ImageOps.exif_transpose(portrait).convert("RGB")
    width, height = portrait.size
    crop_height = round(width * 9 / 16)
    top = min(max(round(height * 0.08), 0), height - crop_height)
    portrait = portrait.crop((0, top, width, top + crop_height))
    portrait = portrait.resize((1200, 675), Image.Resampling.LANCZOS)
    portrait.save(OUTPUT / "marketing-priority-consulting.jpg", "JPEG", quality=88, optimize=True, progressive=True)

print(f"Wrote {len(SOURCES) + 1} optimized insight covers to {OUTPUT}")
