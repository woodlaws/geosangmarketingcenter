(function () {
  var filters = document.querySelectorAll('[data-insight-filter]');
  var cards = document.querySelectorAll('[data-insight-card]');
  var empty = document.getElementById('insightsEmpty');
  var count = document.getElementById('insightsCount');
  if (!filters.length || !cards.length) return;

  function applyFilter(category) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = category === '전체' || card.getAttribute('data-category') === category;
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach(function (button) {
      var active = button.getAttribute('data-insight-filter') === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = String(visible);
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(button.getAttribute('data-insight-filter'));
    });
  });
})();
