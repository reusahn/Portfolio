"use strict";
(function () {
  const catalog = document.getElementById("project-catalog");
  if (!catalog) return;
  const search = document.getElementById("work-search");
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(catalog.querySelectorAll("[data-project]"));
  const groups = Array.from(catalog.querySelectorAll("[data-catalog-group]"));
  const count = document.getElementById("result-count");
  const empty = document.getElementById("no-results");
  let selected = "all";

  function update() {
    const terms = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const inGroup = selected === "all" || card.dataset.group === selected;
      const matches = terms.every(term => card.dataset.search.includes(term));
      card.hidden = !(inGroup && matches);
      if (!card.hidden) visible++;
    }
    for (const group of groups) group.hidden = !Array.from(group.querySelectorAll("[data-project]")).some(card => !card.hidden);
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.filter === selected));
    count.textContent = visible + (visible === 1 ? " work" : " works") + (visible < cards.length ? " / " + cards.length + " total" : "");
    empty.hidden = visible !== 0;
  }

  for (const button of buttons) button.addEventListener("click", function () { selected = button.dataset.filter; update(); });
  search.addEventListener("input", update);
  document.getElementById("clear-filters").addEventListener("click", function () { selected = "all"; search.value = ""; update(); });
  update();
})();
