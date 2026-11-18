// Shared page chrome for the prototype: icons, the floating nav with its dropdowns, and the footer.
// Pages mark slots with <div id="site-nav"></div> / <div id="site-footer"></div> and icons with <i data-icon="name">.
(() => {
  const P = {
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8"/><path d="M17.3 14.7c1.7.7 2.8 2.3 3.2 4.8"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2.5 19h19"/>',
    chat: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5z"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h18"/>',
    file: '<path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    folderSearch: '<path d="M20 11V8.5A1.5 1.5 0 0 0 18.5 7H12l-2-2.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H11"/><circle cx="16.5" cy="16" r="3"/><path d="M20.5 20l-1.8-1.8"/>',
    nfc: '<path d="M6.5 8.5a5 5 0 0 1 0 7"/><path d="M10 6a9 9 0 0 1 0 12"/><path d="M13.5 3.5a13 13 0 0 1 0 17"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6"/><path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
    chart: '<path d="M4 19.5h16"/><path d="M5.5 15l4-4.5 3 3 6.5-7.5"/>',
    trophy: '<path d="M8 4h8v5.5a4 4 0 0 1-8 0z"/><path d="M8 6.5H5.5a2.5 2.5 0 0 0 2.6 3.5"/><path d="M16 6.5h2.5a2.5 2.5 0 0 1-2.6 3.5"/><path d="M12 13.5v3.5M9 20h6M10 17h4"/>',
    messages: '<path d="M4 5.5h12v8H8.5L4 17z"/><path d="M16 9h4v8l-3.5-2.5H11v-1"/>',
    sparkle: '<path d="M12 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    rss: '<path d="M5 5a14 14 0 0 1 14 14"/><path d="M5 11a8 8 0 0 1 8 8"/><circle cx="6" cy="18" r="1" fill="currentColor"/>',
    code: '<path d="M9 7.5L4.5 12 9 16.5M15 7.5l4.5 4.5-4.5 4.5"/>',
    pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    shield: '<path d="M12 3l7 3v5.2c0 4.4-2.9 7.9-7 9.8-4.1-1.9-7-5.4-7-9.8V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    bars: '<path d="M5 20v-6M10 20V9M15 20v-9M20 20V5"/>',
    cpu: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    cap: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-4.5"/><path d="M21.5 9.5v5"/>',
    building: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10.5 20.5v-3h3v3"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/>',
    list: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3.5h6v1"/><path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4"/>',
    gauge: '<path d="M4.5 16a7.5 7.5 0 1 1 15 0"/><path d="M12 16l3.5-4.5"/><path d="M4.5 19.5h15"/>',
  };
  const icon = (name, cls = "ico", sw = 1.6) =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;

  const page = document.body.dataset.page || "";
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const chev = '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const rich = (href, ic, title, desc) =>
    `<li><a href="${href}"><span class="tile">${icon(ic)}</span><span><b>${title}</b><small>${desc}</small></span></a></li>`;
  const item = (href, ic, label, p) => `<li><a href="${href}"${cur(p)}>${icon(ic)}${label}</a></li>`;

  const workMenu = `
    <div class="rich"><p class="menu-label">Field work</p><ul>
      ${rich("index.html#field", "folderSearch", "Records triage", "Finds the records a case needs, without documents leaving the PC")}
      ${rich("index.html#field", "nfc", "NFC room rounds", "Care staff record each round with a tap at the door")}
    </ul></div>
    <div class="rich"><p class="menu-label">Public systems</p><ul>
      ${rich("index.html#public", "database", "DBWhisper", "Plain-English questions, validated SQL")}
      ${rich("index.html#public", "chart", "TradePulse", "Backtests that can only read closed bars")}
      ${rich("index.html#public", "trophy", "CrownWager", "NBA picks graded against final scores")}
      ${rich("index.html#public", "messages", "LLM Studio", "Multi-user chat, six model providers")}
    </ul></div>
    <p class="menu-foot"><a class="caret" href="index.html#public">All case studies</a></p>`;
  const aboutMenu = `
    <p class="menu-label">About me</p><ul>
      ${item("about.html", "users", "About", "about")}
      ${item("writing.html", "file", "Writing", "writing")}
      ${item("hire.html", "briefcase", "Hire me", "hire")}
      ${item("contact.html", "chat", "Contact", "contact")}
    </ul>`;

  const nav = `
  <a class="skip" href="#main">Skip to content</a>
  <div class="navwrap">
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="index.html"><span class="mono-mark" aria-hidden="true">MA</span>Mubin Attar</a>
      <ul class="links">
        <li><button class="nav-trigger" type="button" aria-expanded="false" aria-controls="m-work" data-menu="m-work">Work ${chev}</button>
          <div class="menu wide" id="m-work">${workMenu}</div></li>
        <li><a class="nav-link" href="index.html#public">Evals</a></li>
        <li><a class="nav-link" href="writing.html"${cur("writing")}>Writing</a></li>
        <li><button class="nav-trigger" type="button" aria-expanded="false" aria-controls="m-about" data-menu="m-about">About ${chev}</button>
          <div class="menu" id="m-about">${aboutMenu}</div></li>
        <li><a class="nav-link" href="index.html#agent">Ask AI</a></li>
      </ul>
      <div class="navright">
        <a href="#">Résumé</a><span class="div" aria-hidden="true"></span><a href="hire.html"${cur("hire")}>Hire me</a>
      </div>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Open menu"><span></span><span></span></button>
      <div class="mnav" id="mnav">
        <p class="menu-label">Work</p>
        <a href="index.html#field">${icon("folderSearch")}Field work</a>
        <a href="index.html#public">${icon("database")}Public systems</a>
        <a href="index.html#public">${icon("bars")}Evals</a>
        <p class="menu-label">About me</p>
        <a href="about.html">${icon("users")}About</a>
        <a href="writing.html">${icon("file")}Writing</a>
        <a href="hire.html">${icon("briefcase")}Hire me</a>
        <a href="contact.html">${icon("chat")}Contact</a>
        <a href="index.html#agent">${icon("sparkle")}Ask AI</a>
      </div>
    </nav>
  </div>`;

  const col = (title, links) =>
    `<div><h2>${title}</h2><ul>${links.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>`;
  const footer = `
  <footer class="footer">
    <div class="wrap">
      <div class="fgrid">
        <div class="fbrand"><a class="brand" href="index.html"><span class="mono-mark" aria-hidden="true">MA</span>Mubin Attar</a>
          <p>Applied AI Engineer. I ship AI and software inside the customer's rules.</p></div>
        ${col("Work", [["Field work", "index.html#field"], ["Public systems", "index.html#public"], ["Evaluations", "index.html#public"], ["Case studies", "index.html#public"]])}
        ${col("Writing", [["Essays", "writing.html"], ["Guides", "writing.html"], ["Notes", "writing.html"], ["RSS feed", "#"]])}
        ${col("About", [["About", "about.html"], ["Hire me", "hire.html"], ["Contact", "contact.html"], ["Résumé", "#"]])}
        ${col("Elsewhere", [["GitHub", "https://github.com/mubin-attar-007"], ["LinkedIn", "https://www.linkedin.com/in/mubin-attar-53223716a"], ["Hugging Face", "https://huggingface.co/heisenbergblue"]])}
        ${col("Site", [["Now", "#"], ["Uses", "#"], ["Trust", "#"], ["Privacy", "#"], ["llms.txt", "#"]])}
      </div>
      <div class="fbase"><span>© 2026 Mubin Attar · Ahmedabad, India</span><nav aria-label="Contact"><a href="mailto:sk.mubinattar@gmail.com">Email</a><a href="https://github.com/mubin-attar-007">GitHub</a><a href="https://www.linkedin.com/in/mubin-attar-53223716a">LinkedIn</a></nav></div>
    </div>
  </footer>
  <span class="proto-pill">Prototype · drafts for review</span>
  <a class="ask-bubble" href="index.html#agent" aria-label="Ask my AI assistant">${icon("sparkle")}<span class="txt">Ask AI</span></a>`;

  const navSlot = document.getElementById("site-nav");
  if (navSlot) navSlot.outerHTML = nav;
  const footSlot = document.getElementById("site-footer");
  if (footSlot) footSlot.outerHTML = footer;
  document.querySelectorAll("i[data-icon]").forEach((el) => {
    el.outerHTML = icon(el.dataset.icon, el.dataset.cls || "ico", el.dataset.sw || 1.6);
  });
})();
