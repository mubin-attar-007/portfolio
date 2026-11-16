// Prototype behaviour: nav dropdowns, mobile menu, showcase tabs, copy prompt, writing filters.
(() => {
  // ---- Dropdown menus: hover on fine pointers, click/Enter everywhere, Escape closes.
  const triggers = [...document.querySelectorAll("[data-menu]")];
  const panelOf = (t) => document.getElementById(t.dataset.menu);
  const close = (except) =>
    triggers.forEach((t) => {
      if (t === except) return;
      t.setAttribute("aria-expanded", "false");
      panelOf(t)?.classList.remove("open");
    });
  const open = (t) => {
    close(t);
    t.setAttribute("aria-expanded", "true");
    panelOf(t)?.classList.add("open");
  };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let openedByHoverAt = 0;
  triggers.forEach((t) => {
    t.addEventListener("click", () => {
      const isOpen = t.getAttribute("aria-expanded") === "true";
      if (isOpen && Date.now() - openedByHoverAt > 400) close();
      else open(t);
    });
    if (fine) {
      const li = t.closest("li");
      let timer;
      li.addEventListener("mouseenter", () => {
        clearTimeout(timer);
        if (t.getAttribute("aria-expanded") !== "true") openedByHoverAt = Date.now();
        open(t);
      });
      li.addEventListener("mouseleave", () => {
        timer = setTimeout(() => close(), 140);
      });
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const active = triggers.find((t) => t.getAttribute("aria-expanded") === "true");
    close();
    active?.focus();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".links > li")) close();
  });
  document.addEventListener("focusin", (e) => {
    if (!e.target.closest(".links > li")) close();
  });

  // ---- Mobile menu
  const mbtn = document.querySelector(".menu-btn");
  const mnav = document.getElementById("mnav");
  mbtn?.addEventListener("click", () => {
    const on = mbtn.getAttribute("aria-expanded") !== "true";
    mbtn.setAttribute("aria-expanded", String(on));
    mbtn.setAttribute("aria-label", on ? "Close menu" : "Open menu");
    mnav?.classList.toggle("open", on);
  });

  // ---- Showcase tabs (roving tabindex, arrow keys)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });

  // ---- Copy prompt
  const PROMPT =
    "Read https://mubin-attar.vercel.app/llms.txt and the pages it links to. Then tell me whether Mubin Attar fits a Forward Deployed Engineer role on my team, and cite the pages you used.";
  document.querySelectorAll("[data-copy-prompt]").forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(PROMPT);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Copy failed";
      }
      setTimeout(() => (btn.textContent = label), 1800);
    });
  });

  // ---- Writing filters
  const filters = [...document.querySelectorAll("[data-filter]")];
  const status = document.getElementById("filter-status");
  filters.forEach((f) =>
    f.addEventListener("click", () => {
      filters.forEach((x) => x.setAttribute("aria-pressed", String(x === f)));
      const kind = f.dataset.filter;
      let shown = 0;
      document.querySelectorAll("[data-kind]").forEach((el) => {
        el.hidden = kind !== "all" && el.dataset.kind !== kind;
        if (!el.hidden) shown++;
      });
      if (status) status.textContent = `${shown} ${shown === 1 ? "piece" : "pieces"} shown`;
    }),
  );
})();
