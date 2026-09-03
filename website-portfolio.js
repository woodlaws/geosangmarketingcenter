(function () {
  var grid = document.querySelector("[data-portfolio-grid]");
  var controls = document.querySelector("[data-portfolio-filters]");
  var empty = document.querySelector("[data-portfolio-empty]");
  var fallback = Array.isArray(window.PORTFOLIO_FALLBACK) ? window.PORTFOLIO_FALLBACK : [];
  var categoryOrder = ["자사 브랜드", "교육", "의료", "전문 서비스", "식음료", "농수산", "숙박·공간", "출판·콘텐츠", "여행", "커뮤니티"];
  var activeFilter = "전체";
  var items = [];
  if (!grid || !controls || !fallback.length) return;

  function formatDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
    return match ? Number(match[1]) + ". " + Number(match[2]) + ". " + Number(match[3]) + "." : "";
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createCard(item) {
    var linked = Boolean(item.liveUrl);
    var card = createElement(linked ? "a" : "article", "wp-portfolio-card");
    card.dataset.category = item.category || "기타";
    card.dataset.status = item.status || "";
    if (linked) {
      card.href = item.liveUrl;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.setAttribute("aria-label", item.name + " 홈페이지 새 탭에서 보기");
    }

    var media = createElement("div", "wp-portfolio-media");
    if (item.status === "작업중") media.appendChild(createElement("span", "wp-work-badge", "작업중"));
    var image = document.createElement("img");
    image.src = item.thumbnail || "/assets/images/website-production/geosang-marketing-center.png";
    image.width = 1600;
    image.height = 900;
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.alt = item.name + " " + item.category + " 홈페이지 썸네일";
    image.addEventListener("error", function () {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = "true";
      image.src = "/assets/images/website-production/geosang-marketing-center.png";
    });
    media.appendChild(image);

    var body = createElement("div", "wp-portfolio-body");
    var meta = createElement("div", "wp-portfolio-meta");
    meta.appendChild(createElement("span", "wp-category-badge", item.category || "기타"));
    meta.appendChild(createElement("span", "wp-status-badge " + (item.status === "작업중" ? "is-working" : "is-live"), item.status || "상태 미정"));
    body.appendChild(meta);
    body.appendChild(createElement("h3", "", item.name));
    body.appendChild(createElement("p", "", item.description || item.name + " 홈페이지 제작 사례입니다."));
    if (item.productionDate) {
      var time = createElement("time", "", formatDate(item.productionDate));
      time.dateTime = item.productionDate;
      body.appendChild(time);
    }
    var action = createElement("span", "wp-portfolio-link" + (linked ? "" : " is-disabled"), linked ? "실제 사이트 보기" : "사이트 준비 중");
    if (!linked) action.setAttribute("aria-disabled", "true");
    body.appendChild(action);
    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  function applyFilter() {
    var visible = 0;
    Array.prototype.forEach.call(grid.querySelectorAll(".wp-portfolio-card"), function (card) {
      var show = activeFilter === "전체" || card.dataset.category === activeFilter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    Array.prototype.forEach.call(controls.querySelectorAll("button"), function (button) {
      var active = button.dataset.portfolioFilter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (empty) empty.hidden = visible !== 0;
  }

  function renderFilters() {
    var counts = items.reduce(function (result, item) {
      result[item.category] = (result[item.category] || 0) + 1;
      return result;
    }, {});
    var categories = categoryOrder.filter(function (category) { return counts[category]; });
    if (activeFilter !== "전체" && !counts[activeFilter]) activeFilter = "전체";
    controls.replaceChildren();
    ["전체"].concat(categories).forEach(function (category) {
      var count = category === "전체" ? items.length : counts[category];
      var button = createElement("button", category === activeFilter ? "is-active" : "");
      button.type = "button";
      button.dataset.portfolioFilter = category;
      button.setAttribute("aria-pressed", String(category === activeFilter));
      button.appendChild(document.createTextNode(category + " "));
      button.appendChild(createElement("small", "", String(count)));
      controls.appendChild(button);
    });
  }

  function render(nextItems) {
    items = nextItems
      .filter(function (item) { return item && item.name && (item.status === "운영중" || item.status === "작업중"); })
      .sort(function (a, b) { return Number(a.sort) - Number(b.sort) || a.name.localeCompare(b.name, "ko"); });
    grid.replaceChildren();
    items.forEach(function (item) { grid.appendChild(createCard(item)); });
    grid.setAttribute("aria-busy", "false");
    renderFilters();
    applyFilter();
  }

  controls.addEventListener("click", function (event) {
    var button = event.target.closest("[data-portfolio-filter]");
    if (!button) return;
    activeFilter = button.dataset.portfolioFilter || "전체";
    applyFilter();
  });

  render(fallback);
  fetch("/api/portfolio", { headers: { Accept: "application/json" } })
    .then(function (response) {
      if (!response.ok) throw new Error("Portfolio API unavailable");
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) throw new Error("Portfolio API returned no items");
      render(data.items);
    })
    .catch(function () {
      grid.setAttribute("aria-busy", "false");
    });
}());
