// Prototype behaviour: nav dropdowns, mobile menu, showcase tabs (sliding pill, blurred
// crossfade, sheen), the copy-prompt chip, the agents marquee, and writing filters.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

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

  // ---- Showcase tabs: one pill springs between tabs; panels crossfade through a
  // short blur; a sheen crosses the arriving card. Arrow keys move the selection.
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const tablist = tabs[0]?.parentElement;
  const ind = tablist?.querySelector(".tab-ind");
  const selected = () => tabs.find((t) => t.getAttribute("aria-selected") === "true");
  const place = (tab, animate) => {
    if (!ind || !tab) return;
    ind.classList.toggle("no-anim", !animate);
    ind.style.width = `${tab.offsetWidth}px`;
    ind.style.height = `${tab.offsetHeight}px`;
    ind.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
  };
  if (ind) {
    tablist.classList.add("has-ind");
    place(selected(), false);
    addEventListener("resize", () => place(selected(), false));
    document.fonts?.ready.then(() => place(selected(), false));
  }
  const SPRING =
    "linear(0, 0.1812 9.1%, 0.4669 18.2%, 0.6943 27.3%, 0.8403 36.4%, 0.9233 45.5%, 0.9664 54.5%, 0.9869 63.6%, 0.9958 72.7%, 0.9992 81.8%, 1)";
  const arrive = CSS.supports("transition-timing-function", SPRING) ? SPRING : "cubic-bezier(0.22, 1, 0.36, 1)";
  const sheen = (panel) => {
    const card = panel?.querySelector(".focus");
    if (!card || reduce.matches) return;
    card.classList.remove("sheen");
    void card.offsetWidth; // restart the animation
    card.classList.add("sheen");
  };
  const select = (tab, focus) => {
    const prev = selected();
    if (focus) tab.focus();
    if (prev === tab) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    place(tab, !reduce.matches);
    const out = prev && document.getElementById(prev.getAttribute("aria-controls"));
    const inn = document.getElementById(tab.getAttribute("aria-controls"));
    if (!inn) return;
    inn.hidden = false;
    if (reduce.matches || !inn.animate) {
      if (out) out.hidden = true;
      return;
    }
    inn.getAnimations().forEach((a) => a.cancel());
    inn.animate(
      [
        { opacity: 0, transform: "translateY(14px)", filter: "blur(6px)" },
        { opacity: 1, transform: "none", filter: "blur(0)" },
      ],
      { duration: 520, delay: 40, easing: arrive, fill: "backwards" },
    );
    sheen(inn);
    if (out) {
      out.getAnimations().forEach((a) => a.cancel());
      const leave = out.animate(
        [
          { opacity: 1, transform: "none", filter: "blur(0)" },
          { opacity: 0, transform: "translateY(-10px)", filter: "blur(4px)" },
        ],
        { duration: 220, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "forwards" },
      );
      leave.finished
        .then(() => {
          const owner = tabs.find((t) => t.getAttribute("aria-controls") === out.id);
          if (owner?.getAttribute("aria-selected") !== "true") out.hidden = true;
          leave.cancel();
        })
        .catch(() => {}); // cancelled because the panel was selected again
    }
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
  if (tabs.length) {
    addEventListener("load", () =>
      setTimeout(() => sheen(document.getElementById(selected()?.getAttribute("aria-controls"))), 300),
    );
  }

  // ---- Copy prompt: the chip shows a tick, and a live region says what happened.
  const PROMPT =
    "Read https://mubin-attar.vercel.app/llms.txt and the pages it links to. Then tell me whether Mubin Attar fits a Forward Deployed Engineer role on my team, and cite the pages you used.";
  const status = document.getElementById("prompt-status");
  const statusText = status?.textContent || "";
  document.querySelectorAll("[data-copy-prompt]").forEach((btn) => {
    const chip = btn.closest(".prompt-chip");
    const label = btn.textContent;
    let timer;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      let ok = true;
      try {
        await navigator.clipboard.writeText(PROMPT);
      } catch {
        ok = false;
      }
      if (chip) chip.classList.toggle("copied", ok);
      else btn.textContent = ok ? "Copied" : "Copy failed";
      if (status) status.textContent = ok ? "Prompt copied. Paste it into your AI." : "Copy failed. Your browser blocked the clipboard.";
      clearTimeout(timer);
      timer = setTimeout(() => {
        chip?.classList.remove("copied");
        if (!chip) btn.textContent = label;
        if (status) status.textContent = statusText;
      }, 2200);
    });
  });

  // ---- Agents marquee: double each row so sliding by half its width loops
  // seamlessly. Reduced motion keeps the rows still and centred.
  const rows = document.querySelector(".chiprows");
  if (rows && !reduce.matches) {
    rows.querySelectorAll(".chiprow").forEach((row) => {
      [...row.children].forEach((chip) => {
        const copy = chip.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        row.appendChild(copy);
      });
    });
    rows.classList.add("marquee");
  }

  // ---- Writing filters
  const filters = [...document.querySelectorAll("[data-filter]")];
  const filterStatus = document.getElementById("filter-status");
  filters.forEach((f) =>
    f.addEventListener("click", () => {
      filters.forEach((x) => x.setAttribute("aria-pressed", String(x === f)));
      const kind = f.dataset.filter;
      let shown = 0;
      document.querySelectorAll("[data-kind]").forEach((el) => {
        el.hidden = kind !== "all" && el.dataset.kind !== kind;
        if (!el.hidden) shown++;
      });
      if (filterStatus) filterStatus.textContent = `${shown} ${shown === 1 ? "piece" : "pieces"} shown`;
    }),
  );
})();
