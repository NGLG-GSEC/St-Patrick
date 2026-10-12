/* Site language support: English (source), French, Greek, Spanish and Brazilian Portuguese.
 * The English text in index.html is the source of truth. Translations live in i18n-data.js,
 * keyed by the exact English string, so anything without a translation simply stays English. */
(function () {
  const LANGS = [
    { code: "en", short: "EN", name: "English", html: "en" },
    { code: "fr", short: "FR", name: "Français", html: "fr" },
    { code: "el", short: "EL", name: "Ελληνικά", html: "el" },
    { code: "es", short: "ES", name: "Español", html: "es" },
    { code: "pt", short: "PT", name: "Português (Brasil)", html: "pt-BR" },
  ];
  const STORE = "mosp-lang";
  const DICT = window.SITE_I18N || {};
  const MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    el: ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου", "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  };

  const flag = (inner) => `<svg viewBox="0 0 60 40" width="28" height="19" aria-hidden="true" focusable="false">${inner}</svg>`;
  const FLAGS = {
    en: flag('<rect width="60" height="40" fill="#012169"/><path d="M0,0 60,40M60,0 0,40" stroke="#fff" stroke-width="7"/><path d="M0,0 60,40M60,0 0,40" stroke="#C8102E" stroke-width="2.4"/><path d="M30,0V40M0,20H60" stroke="#fff" stroke-width="12"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/>'),
    fr: flag('<rect width="20" height="40" fill="#0055A4"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#EF4135"/>'),
    el: flag('<rect width="60" height="40" fill="#0D5EAF"/>' + [1, 3, 5, 7].map((i) => `<rect y="${(i * 40) / 9}" width="60" height="${40 / 9}" fill="#fff"/>`).join("") + '<rect width="22.2" height="22.2" fill="#0D5EAF"/><rect x="8.9" width="4.4" height="22.2" fill="#fff"/><rect y="8.9" width="22.2" height="4.4" fill="#fff"/>'),
    es: flag('<rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/>'),
    pt: flag('<rect width="60" height="40" fill="#009C3B"/><path d="M30,4 56,20 30,36 4,20z" fill="#FFDF00"/><circle cx="30" cy="20" r="9" fill="#002776"/><path d="M21.5,18.5Q30,15 38.5,21.5" stroke="#fff" stroke-width="1.7" fill="none"/>'),
  };

  let lang = "en";
  const listeners = [];
  const units = [];

  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const isSkippable = (s) => /^[0-9IVX\s.\-]+$/.test(s) || s === "Quis Separabit";
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "SVG", "NOSCRIPT", "CANVAS", "TEXTAREA"]);
  const SKIP_IDS = new Set(["lodge-grid", "officer-list", "commanders-list", "grand-cross-list", "news-list", "gallery-grid", "toggle-officers", "import-json"]);
  const ATTRS = ["alt", "placeholder", "aria-label"];

  function tr(en) {
    if (lang === "en") return en;
    const entry = DICT[lang] && DICT[lang][en];
    return entry === undefined ? en : entry;
  }

  function collect(el) {
    if (!(el instanceof Element) || SKIP_TAGS.has(el.tagName.toUpperCase()) || SKIP_IDS.has(el.id)) return;
    if (el.hasAttribute("data-path-info") || el.hasAttribute("data-path-steps") || el.hasAttribute("data-path-stage") || el.hasAttribute("data-lang-switch")) return;
    ATTRS.forEach((a) => {
      const v = el.getAttribute(a);
      if (v && v.trim() && !isSkippable(norm(v))) units.push({ el, attr: a, key: norm(v), orig: v });
    });
    const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (direct) {
      if (el.querySelector("input,textarea,select")) {
        Array.from(el.childNodes).forEach((n) => {
          if (n.nodeType === 3 && n.textContent.trim()) {
            const span = document.createElement("span");
            span.textContent = n.textContent;
            el.replaceChild(span, n);
          }
        });
      } else {
        const key = norm(el.innerHTML);
        if (!isSkippable(key)) units.push({ el, key, orig: el.innerHTML });
        return;
      }
    }
    Array.from(el.children).forEach(collect);
  }

  function apply() {
    units.forEach((u) => {
      const text = lang === "en" ? null : DICT[lang] && DICT[lang][u.key];
      const value = text === undefined || text === null ? u.orig : text;
      if (u.attr) u.el.setAttribute(u.attr, value);
      else if (u.el.innerHTML !== value) u.el.innerHTML = value;
    });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", lang === "en" ? meta.dataset.en : tr(meta.dataset.en));
    document.title = lang === "en" ? document.documentElement.dataset.titleEn : tr(document.documentElement.dataset.titleEn);
    document.documentElement.lang = LANGS.find((l) => l.code === lang).html;
  }

  function date(text) {
    const m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(String(text || "").trim());
    if (!m || lang === "en") return text;
    const i = MONTHS.en.indexOf(m[2]);
    if (i < 0) return text;
    const d = Number(m[1]);
    const month = MONTHS[lang][i];
    if (lang === "fr") return `${d === 1 ? "1er" : d} ${month} ${m[3]}`;
    if (lang === "es" || lang === "pt") return `${d} de ${month} de ${m[3]}`;
    return `${d} ${month} ${m[3]}`;
  }

  function knight(name) {
    const s = String(name || "");
    return s.startsWith("Sir Knight ") && lang !== "en" ? `${tr("Sir Knight")} ${s.slice(11)}` : s;
  }

  function setLang(code, persist = true) {
    if (!LANGS.some((l) => l.code === code)) code = "en";
    lang = code;
    if (persist) {
      try { localStorage.setItem(STORE, code); } catch { /* storage unavailable */ }
    }
    apply();
    renderSwitch();
    listeners.forEach((fn) => fn(lang));
  }

  /* Language switch, top right of the header */
  let switchEl;
  function buildSwitch() {
    switchEl = document.createElement("div");
    switchEl.className = "lang-switch";
    switchEl.setAttribute("data-lang-switch", "");
    switchEl.innerHTML =
      '<button type="button" class="lang-current" aria-haspopup="listbox" aria-expanded="false"><span class="lang-flag"></span><span class="lang-code"></span><span class="lang-caret" aria-hidden="true"></span></button>' +
      '<ul class="lang-menu" role="listbox" hidden></ul>';
    const header = document.querySelector(".site-header");
    header.appendChild(switchEl);
    const button = switchEl.querySelector(".lang-current");
    const menu = switchEl.querySelector(".lang-menu");
    LANGS.forEach((l) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.innerHTML = `<button type="button" lang="${l.html}" data-lang="${l.code}">${FLAGS[l.code]}<span>${l.name}</span></button>`;
      menu.appendChild(li);
    });
    const close = () => { menu.hidden = true; button.setAttribute("aria-expanded", "false"); };
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open) menu.querySelector("[aria-current=true]")?.focus();
    });
    menu.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (!b) return;
      setLang(b.dataset.lang);
      close();
      button.focus();
    });
    document.addEventListener("click", (e) => { if (!switchEl.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { close(); button.focus(); } });
  }

  function renderSwitch() {
    const cur = LANGS.find((l) => l.code === lang);
    const label = { en: "Language", fr: "Langue", el: "Γλώσσα", es: "Idioma", pt: "Idioma" }[lang];
    const button = switchEl.querySelector(".lang-current");
    button.querySelector(".lang-flag").innerHTML = FLAGS[lang];
    button.querySelector(".lang-code").textContent = cur.short;
    button.setAttribute("aria-label", `${label}: ${cur.name}`);
    switchEl.querySelectorAll("[data-lang]").forEach((b) => {
      b.setAttribute("aria-current", String(b.dataset.lang === lang));
      b.parentElement.setAttribute("aria-selected", String(b.dataset.lang === lang));
    });
  }

  function initialLang() {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q && LANGS.some((l) => l.code === q)) return q;
    } catch { /* ignore */ }
    try {
      const s = localStorage.getItem(STORE);
      if (s && LANGS.some((l) => l.code === s)) return s;
    } catch { /* ignore */ }
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return LANGS.some((l) => l.code === nav) ? nav : "en";
  }

  function init() {
    document.documentElement.dataset.titleEn = document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.dataset.en = meta.getAttribute("content");
    collect(document.body);
    buildSwitch();
    window.I18N = {
      get lang() { return lang; },
      tr, date, knight, setLang, langs: LANGS,
      units: () => units.map((u) => u.key),
      onChange: (fn) => listeners.push(fn),
    };
    const start = initialLang();
    if (start === "en") { renderSwitch(); } else { setLang(start, false); }
  }

  // The script sits at the end of <body>, so the markup above it is already parsed.
  init();
})();
