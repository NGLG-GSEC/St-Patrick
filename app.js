const defaultData = {
  lodges: [
    { year: "2026", name: "Limerick Lodge", jurisdiction: "Kentucky", status: "Chartered" },
    { year: "2025", name: "Downpatrick Lodge", jurisdiction: "Kansas", status: "Chartered" },
    { year: "2024", name: "Buru Lodge", jurisdiction: "Pacific North-West", status: "Chartered" },
    { year: "2024", name: "Florida Lodge T.I.", jurisdiction: "Florida", status: "Time Immemorial" },
    { year: "2024", name: "Lorica Lodge T.I.", jurisdiction: "Indiana", status: "Time Immemorial" },
    { year: "2024", name: "Eri Lodge T.I.", jurisdiction: "England", status: "Time Immemorial" },
    { year: "2024", name: "Eolas Lodge T.I.", jurisdiction: "Scotland", status: "Time Immemorial" }
  ],
  officers: [
    { office: "Grand Commander", name: "Sir Knight Paul Weldon Johnston", postnominal: "KGC" },
    { office: "Grand Chancellor", name: "Sir Knight Simon Edwin Polkinghorne", postnominal: "KGC" },
    { office: "Grand Prelate", name: "Sir Knight Russell Eugene Bridges", postnominal: "" },
    { office: "Grand Registrar", name: "Sir Knight Christian Amine", postnominal: "KGC" },
    { office: "Grand Senior Warden", name: "Sir Knight Christopher Francis Hatton", postnominal: "" },
    { office: "Grand Junior Warden", name: "Sir Knight John David Cashion", postnominal: "" },
    { office: "Grand Master of Ceremonies", name: "Sir Knight Michael Scott Doxsee", postnominal: "KGC" },
    { office: "Grand Senior Deacon", name: "Sir Knight Robert Dupel", postnominal: "KGC" },
    { office: "Grand Junior Deacon", name: "Sir Knight Jean-Philippe Dakhil", postnominal: "" },
    { office: "Grand Herald", name: "Sir Knight Joseph Walter McIntyre", postnominal: "" },
    { office: "Grand Herald", name: "Sir Knight Jason Critchlow Varner", postnominal: "KGC" },
    { office: "Grand Pursuivant", name: "Sir Knight Robert Joseph Currie", postnominal: "" },
    { office: "Grand Pursuivant", name: "Sir Knight Graham John Hancock", postnominal: "" },
    { office: "Grand Pursuivant", name: "Sir Knight Simon David Robinson", postnominal: "" },
    { office: "Grand Deacon", name: "Sir Knight Daniel James McMeeken", postnominal: "" },
    { office: "Grand Sentinel", name: "Sir Knight Paul Stephen Hollebone", postnominal: "" }
  ],
  commanders: [
    { years: "1936-1988", name: "Sir Knight John Raymond Shute II" },
    { years: "2006-2018", name: "Sir Knight David Lee Hargett Jr." },
    { years: "2018-2024", name: "Sir Knight Dolan Allen Surratt" },
    { years: "2024", name: "Sir Knight Paul Weldon Johnston" }
  ],
  grandCross: [
    { year: "1988", name: "Sir Knight John Raymond Shute II" },
    { year: "2006", name: "Sir Knight David Lee Hargett Jr." },
    { year: "2006", name: "Sir Knight Dolan Allen Surratt" },
    { year: "2011", name: "Sir Knight Paul Weldon Johnston" },
    { year: "2013", name: "Sir Knight Simon Edwin Polkinghorne" },
    { year: "2017", name: "Sir Knight Michael Scott Doxsee" },
    { year: "2024", name: "Sir Knight Christian Amine" },
    { year: "2024", name: "Sir Knight Robert Dupel" },
    { year: "2024", name: "Sir Knight Matthew Fletcher" },
    { year: "2024", name: "Sir Knight Pierre Michel Louis Meste" },
    { year: "2025", name: "Sir Knight Jason Ward Miller" },
    { year: "2026", name: "Sir Knight Jason Critchlow Varner" },
    { year: "2026", name: "Sir Knight Yves Penne" }
  ],
  news: [
    {
      title: "Limerick Lodge receives its Charter",
      date: "1 June 2026",
      category: "Charter",
      text: "The Grand Commander granted a Charter to Limerick Lodge within the State of Kentucky, empowering Sir Knight Gregory Alan Raque to form and constitute the Lodge."
    },
    {
      title: "Yves Pennes receives Knight Grand Cross",
      date: "17 April 2026",
      category: "Honour",
      text: "Sir Knight Yves Pennes received the honour of Knight Grand Cross in recognition of invaluable services rendered to Freemasonry in the Order."
    },
    {
      title: "Lorica Lodge recognised as Time Immemorial",
      date: "10 August 2024",
      category: "Recognition",
      text: "Lorica Lodge, formerly Council, received a Charter and Time Immemorial status in recognition of its past achievements."
    }
  ],
  gallery: [
    {
      title: "Saint Patrick iconography",
      src: "assets/saint-patrick-portrait.jpg",
      caption: "A visual anchor for the Order's Christian and Irish symbolic language."
    },
    {
      title: "Fraternal fellowship",
      src: "assets/order-brethren.jpg",
      caption: "Brethren pictured in formal dress, suitable for historical and news sections."
    },
    {
      title: "John Raymond Shute II",
      src: "assets/jray-plane-sepia-wide.jpg",
      caption: "Archival imagery connected with one of the listed Grand Commanders."
    }
  ]
};

const storageKey = "mosp-site-data";
let data = loadData();
let showAllOfficers = false;

function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const T = (text) => (window.I18N ? window.I18N.tr(text) : text);

function renderLodges(filter = "") {
  const grid = document.querySelector("#lodge-grid");
  const term = filter.trim().toLowerCase();
  const lodges = data.lodges.filter((item) => {
    const haystack = `${item.year} ${item.name} ${item.jurisdiction} ${item.status} ${T(item.name)} ${T(item.jurisdiction)} ${T(item.status || "")}`.toLowerCase();
    return haystack.includes(term);
  });

  grid.innerHTML = lodges
    .map(
      (item) => `
        <article class="lodge-card">
          <div>
            <span class="year">${escapeHtml(item.year)}</span>
            <h3>${escapeHtml(T(item.name))}</h3>
            <p>${escapeHtml(T(item.jurisdiction))}</p>
          </div>
          <span class="status">${escapeHtml(T(item.status || "Listed"))}</span>
        </article>
      `
    )
    .join("");
}

function renderOfficers() {
  const list = document.querySelector("#officer-list");
  const officers = showAllOfficers ? data.officers : data.officers.slice(0, 7);
  list.innerHTML = officers
    .map(
      (item) => `
      <div class="officer-row">
        <span>${escapeHtml(T(item.office))}</span>
        <strong>${escapeHtml(window.I18N.knight(item.name))}${item.postnominal ? `, ${escapeHtml(item.postnominal)}` : ""}</strong>
      </div>
    `
    )
    .join("");
  document.querySelector("#toggle-officers").textContent = T(showAllOfficers ? "Show fewer" : "Show all");
}

function renderCompactList(selector, items, keyLabel) {
  document.querySelector(selector).innerHTML = items
    .map(
      (item) => `
      <div>
        <span>${escapeHtml(item[keyLabel])}</span>
        <strong>${escapeHtml(window.I18N.knight(item.name))}</strong>
      </div>
    `
    )
    .join("");
}

function renderNews() {
  document.querySelector("#news-list").innerHTML = data.news
    .map(
      (item) => `
      <article class="news-card">
        <div class="news-meta">
          <span>${escapeHtml(window.I18N.date(item.date))}</span>
          <span>${escapeHtml(T(item.category || "Update"))}</span>
        </div>
        <h3>${escapeHtml(T(item.title))}</h3>
        <p>${escapeHtml(T(item.text))}</p>
      </article>
    `
    )
    .join("");
}

function renderGallery() {
  document.querySelector("#gallery-grid").innerHTML = data.gallery
    .map(
      (item) => `
      <article class="gallery-item">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(T(item.title))}" />
        <div>
          <strong>${escapeHtml(T(item.title))}</strong>
          <p>${escapeHtml(T(item.caption))}</p>
        </div>
      </article>
    `
    )
    .join("");
}

function renderAll() {
  renderLodges(document.querySelector("#lodge-search")?.value || "");
  renderOfficers();
  renderCompactList("#commanders-list", data.commanders, "years");
  renderCompactList("#grand-cross-list", data.grandCross, "year");
  renderNews();
  renderGallery();
}

function wireNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function wireBuilder() {
  document.querySelectorAll(".builder-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".builder-tab").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".builder-form").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-builder-panel="${button.dataset.builderTab}"]`).classList.add("active");
    });
  });

  document.querySelector('[data-builder-panel="news"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    data.news.unshift(Object.fromEntries(form.entries()));
    event.currentTarget.reset();
    saveData();
    renderAll();
  });

  document.querySelector('[data-builder-panel="lodges"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    data.lodges.unshift(Object.fromEntries(form.entries()));
    event.currentTarget.reset();
    saveData();
    renderAll();
  });

  document.querySelector('[data-builder-panel="officers"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    data.officers.push(Object.fromEntries(form.entries()));
    event.currentTarget.reset();
    saveData();
    showAllOfficers = true;
    renderAll();
  });

  document.querySelector('[data-builder-panel="gallery"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    data.gallery.unshift(Object.fromEntries(form.entries()));
    event.currentTarget.reset();
    saveData();
    renderAll();
  });

  document.querySelector("#export-json").addEventListener("click", () => {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(json);
    document.querySelector("#import-json").value = json;
  });

  document.querySelector("#import-data").addEventListener("click", () => {
    const raw = document.querySelector("#import-json").value;
    try {
      const imported = JSON.parse(raw);
      data = { ...structuredClone(defaultData), ...imported };
      saveData();
      renderAll();
      alert(T("Data imported."));
    } catch {
      alert(T("The JSON could not be read."));
    }
  });

  document.querySelector("#reset-data").addEventListener("click", () => {
    data = structuredClone(defaultData);
    saveData();
    renderAll();
  });
}

document.querySelector("#lodge-search").addEventListener("input", (event) => renderLodges(event.target.value));
document.querySelector("#toggle-officers").addEventListener("click", () => {
  showAllOfficers = !showAllOfficers;
  renderOfficers();
});

wireNavigation();
wireBuilder();
renderAll();
window.I18N.onChange(renderAll);
