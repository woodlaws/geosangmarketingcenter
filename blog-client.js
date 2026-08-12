(function () {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(".blog-card"));
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const search = document.getElementById("blogSearch");
  const empty = document.getElementById("blogNoResults");
  let category = "전체";

  function update() {
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const categoryMatch = category === "전체" || card.dataset.category === category;
      const searchMatch = !query || (card.dataset.search || "").includes(query);
      const show = categoryMatch && searchMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  buttons.forEach((button) => button.addEventListener("click", () => {
    category = button.dataset.filter;
    buttons.forEach((item) => item.classList.toggle("is-active", item === button));
    update();
  }));
  search?.addEventListener("input", update);
})();
