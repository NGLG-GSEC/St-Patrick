import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ------------------------------------------------------------------ *
 * Content: the Allied Masonic Degrees path leading to the Order.
 * Sources: AMD France chart, King Athelstan Council No. 926 brochure,
 * the 2022 AMD France Charter and the Order's revised history (2024).
 * ------------------------------------------------------------------ */
const STATIONS = [
  {
    id: "lawrence", kind: "Administrative degree", title: "St Lawrence the Martyr",
    text: "Taken first. Lawrence, a deacon of Rome martyred in 258 AD on a gridiron, gave his life rather than betray his principles. The degree is believed to descend from operative ceremonies in Lancashire and serves as the Council's administrative grade.",
    lesson: "Fortitude, fidelity, integrity and humility.", jewel: "A gridiron in silver on an orange ribbon edged royal blue.",
  },
  {
    id: "constantinople", kind: "Chivalric degree", title: "Knight of Constantinople",
    text: "Introduced to England from Malta in 1865 by Major F. G. Irwin. It connects the Emperor Constantine with his subjects and teaches justice and equality among all ranks, with an entertaining ceremony and a serious close.",
    lesson: "Humility, justice and universal equality.", jewel: "A Maltese cross with crescent, in gold or gilt, on a green ribbon.",
  },
  {
    id: "tilers", kind: "Cryptic heritage", title: "Grand Tilers of Solomon",
    text: "Formerly titled Select Masons of the 27 and sharing an ancient source with the Select Master. Set in the secret vault beneath the Temple, it preserves older eighteenth-century workings and reflects on the danger of hasty judgment.",
    lesson: "Caution against hasty judgment.", jewel: "An inverted black triangle edged in gold, bearing the Hebrew 27, on a fiery red ribbon.",
  },
  {
    id: "babylon", kind: "Historical and scriptural degree", title: "Red Cross of Babylon",
    text: "Closely linked to the Royal Arch and the rebuilding of the Temple under Zerubbabel. It features the crossing of the river bridge and the debate from Esdras on the supreme power of Truth. It is a cognate of Knight Masonry, which the Order of Saint Patrick requires in certain jurisdictions.",
    lesson: "Magna est Veritas et Praevalebit: Great is Truth.", jewel: "A seven-pointed star with two crossed swords on a green circle.",
    link: "Knight Masonry is an obligatory qualification for the Order of Saint Patrick.",
  },
  {
    id: "priest", kind: "Sacerdotal order", title: "Grand High Priest",
    text: "Drawn from eighteenth-century German and French sources and founded on the Blessing of Abraham and the Consecration of Aaron. It is conferred on those who have presided as First Principal of a Royal Arch Chapter, and sets the candidate apart for high spiritual office.",
    lesson: "Consecration to high spiritual service.", jewel: "A mitre on an upright triangle, on a red ribbon.",
  },
  {
    id: "architect", kind: "Solomonic trilogy, part I", title: "Architect",
    text: "First of a trilogy that builds on the Master Mason degree. It joins Continental structure with English floorwork and catechisms on the tools of temple building and the trestle board.",
    lesson: "The craft of building, understood as moral work.", jewel: "A flaming star bearing the letter G within a gold triangle.",
  },
  {
    id: "grand-architect", kind: "Solomonic trilogy, part II", title: "Grand Architect",
    text: "The continuation of the architectural sequence, once attached to the Early Grand Rite of Scotland. It addresses an increasingly select body of craftsmen working on the Solomonic Temple.",
    lesson: "Precision and measure in the Great Work.", jewel: "A double triangle formed by the compasses and the level.",
  },
  {
    id: "superintendent", kind: "Solomonic trilogy, climax", title: "Superintendent",
    text: "The climax of the architectural series and the ne plus ultra of Solomonic architecture. It requires extensive preparation and properties to exemplify its lessons.",
    lesson: "Completion of the architectural journey.", jewel: "A gold triangle with a purple central orb.",
  },
  {
    id: "tyre", kind: "Tyrian craftsmanship", title: "Masters of Tyre",
    text: "Originated in North Carolina, USA. It highlights the Tyrian link to Freemasonry rather than Jerusalem alone, and teaches the paramount duty of the craftsman to his lodge and calling.",
    lesson: "Devotion to duty and craft integrity.", jewel: "The M-O-T jewel: a crowned triangle with three small stars.",
  },
  {
    id: "chair", kind: "Chair degree", title: "Installed Sovereign Master",
    text: "The ceremonial Chair degree conferred on the newly elected presiding officer of a Council. It relates part of the Solomonic legend concerning the Queen of Sheba and craftsmen.",
    lesson: "Leadership as service to the Council.", jewel: "The AMD emblem with a quadrant at the compass base, on a kelly green ribbon.",
  },
  {
    id: "eri", kind: "Order of merit", title: "Royal Order of the Red Branch of Eri",
    text: "Derived from the ancient Irish chivalric tradition and restored by Major F. G. Irwin. In France, every member of King Athelstan Council No. 926 qualifies as an Associate Member (Man-at-Arms). Ranks run from Esquire to Knight, Knight Commander and Knight Grand Cross.",
    lesson: "Merit and service within the Council.", jewel: "A white and gold cross bearing a red branch.",
    link: "The preferred qualification for invitation to the Order of Saint Patrick.",
  },
  {
    id: "patrick", kind: "Invitational Order", title: "The Masonic Order of Saint Patrick",
    text: "An Order of Knighthood recognising Freemasons distinguished by vision, leadership and devoted service. In France it is worked through the Grand Conseil des Grades Maconniques Allies en France under the Charter granted on 20 April 2022. It remains a separate Order with its own Grand Commander.",
    lesson: "Service, charity, Psalm 23 and moral courage. Salt and light; the shamrock as the unity of the Triune God.", jewel: "A shamrock with the Square and Compasses and the motto Quis Separabit.",
    link: "Admission is by invitation only.",
  },
];

const SATELLITE = {
  id: "jonah", kind: "Invitational Order", title: "The Ancient Monitor of Jonah",
  text: "A sister invitational Order of the Council (No. 926). It presents the story of Jonah in the King's Court at Nineveh as an allegory of duty, repentance and divine mercy: no Mason can evade entrusted responsibilities or limit compassion.",
  lesson: "Veritatis simplex oratio est: the language of truth is simple.", jewel: "A gold medallion; symbols include 3, 6 and 9 lights, the wind Eurus, sackcloth and the Great Fish.",
};

/* ------------------------------------------------------------------ *
 * UI wiring (works even when WebGL is unavailable)
 * ------------------------------------------------------------------ */
function boot(root) {
  const stage = root.querySelector("[data-path-stage]");
  const info = root.querySelector("[data-path-info]");
  const steps = root.querySelector("[data-path-steps]");
  const prev = root.querySelector("[data-path-prev]");
  const next = root.querySelector("[data-path-next]");
  const overview = root.querySelector("[data-path-overview]");
  let current = -1;
  let view = null;

  STATIONS.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s.title;
    b.dataset.index = String(i);
    b.addEventListener("click", () => select(i));
    li.appendChild(b);
    steps.appendChild(li);
  });

  function select(i, fromScene) {
    if (i === "jonah") return showInfo(SATELLITE, "Companion Order", "jonah");
    i = Math.max(0, Math.min(STATIONS.length - 1, i));
    current = i;
    showInfo(STATIONS[i], `Step ${i + 1} of ${STATIONS.length}`, i);
    steps.querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-current", b.dataset.index === String(i) ? "step" : "false"));
    if (view && !fromScene) view.focus(i);
    if (view && fromScene) view.focus(i);
  }

  function showInfo(s, label) {
    info.innerHTML = "";
    const add = (tag, cls, text) => {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      el.textContent = text;
      info.appendChild(el);
    };
    add("p", "path3d-step", `${label} · ${s.kind}`);
    add("h4", "", s.title);
    add("p", "", s.text);
    add("p", "path3d-lesson", `Lesson: ${s.lesson}`);
    add("p", "path3d-jewel", `Jewel: ${s.jewel}`);
    if (s.link) add("p", "path3d-link", s.link);
  }

  prev.addEventListener("click", () => select(current <= 0 ? STATIONS.length - 1 : current - 1));
  next.addEventListener("click", () => select(current >= STATIONS.length - 1 ? 0 : current + 1));
  overview.addEventListener("click", () => {
    current = -1;
    steps.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", "false"));
    if (view) view.overview();
  });

  select(0);
  current = 0;

  try {
    view = createScene(stage, {
      onPick: (i) => select(i, true),
      onSatellite: () => showInfo(SATELLITE, "Companion Order"),
    });
    root.classList.add("is-3d");
    view.focus(0);
  } catch (err) {
    root.classList.add("no-3d");
    console.warn("3D path unavailable:", err);
  }
}

/* ------------------------------------------------------------------ *
 * Materials and geometry helpers
 * ------------------------------------------------------------------ */
const ENV = 1.15;
const mat = (o) => new THREE.MeshPhysicalMaterial({ envMapIntensity: ENV, ...o });
const GOLD = () => mat({ color: 0xd9b24c, metalness: 1, roughness: 0.26, clearcoat: 0.5, clearcoatRoughness: 0.2 });
const SILVER = () => mat({ color: 0xf2f5fa, metalness: 0.85, roughness: 0.3, clearcoat: 0.4 });
const ENAMEL = (hex, extra = {}) => mat({ color: hex, metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, ...extra });
const GLOW = (hex, k = 1.6) => new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: k, roughness: 0.4 });

function extrude(shape, depth, bevel, material) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24,
  });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, material);
  return m;
}

function triShape(size, up = true) {
  const h = size * Math.sqrt(3) / 2;
  const s = new THREE.Shape();
  const k = up ? 1 : -1;
  s.moveTo(0, k * (2 * h) / 3);
  s.lineTo(-size / 2, -k * h / 3);
  s.lineTo(size / 2, -k * h / 3);
  s.closePath();
  return s;
}

function polyShape(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function starShape(n, outer, inner) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = Math.PI / 2 + (i * Math.PI) / n;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return polyShape(pts);
}

function maltese(R) {
  const pts = [];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const p = (ang, r) => [Math.cos(ang) * r, Math.sin(ang) * r];
    pts.push(p(a - Math.PI / 4, R * 0.28));
    pts.push(p(a - 0.26, R));
    pts.push(p(a, R * 0.8));
    pts.push(p(a + 0.26, R));
  }
  return polyShape(pts);
}

function plusShape(arm, w) {
  const a = arm, b = w / 2;
  return polyShape([[-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b], [-a, b], [-b, b]]);
}

function labelPlane(text, color, size = 0.7, font = "bold 170px serif") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = color;
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(0,0,0,.55)";
  g.shadowBlur = 8;
  g.fillText(text, 128, 138);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  return m;
}

function triangleJewel({ up = true, color, inner = 1.78, border = 2.3 }) {
  const g = new THREE.Group();
  const frame = extrude(triShape(border, up), 0.16, 0.045, GOLD());
  const face = extrude(triShape(inner, up), 0.1, 0.02, ENAMEL(color));
  face.position.z = 0.1;
  const back = face.clone();
  back.position.z = -0.1;
  g.add(frame, face, back);
  return g;
}

function addAt(group, obj, x = 0, y = 0, z = 0) {
  obj.position.set(x, y, z);
  group.add(obj);
  return obj;
}

/* ------------------------------------------------------------------ *
 * The twelve jewels (original geometry, inspired by the registered
 * jewel descriptions in the Council's guide)
 * ------------------------------------------------------------------ */
const JEWELS = {
  lawrence() {
    const g = new THREE.Group();
    const silver = SILVER();
    const railGeo = new THREE.BoxGeometry(1.7, 0.14, 0.16);
    addAt(g, new THREE.Mesh(railGeo, silver), 0, 0.85);
    addAt(g, new THREE.Mesh(railGeo, silver), 0, -0.85);
    for (let i = 0; i < 5; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 16), silver);
      addAt(g, bar, -0.68 + i * 0.34, 0, 0);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16), silver);
    addAt(g, stem, 0, 1.18);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 16, 32), silver);
    addAt(g, loop, 0, 1.55);
    g.scale.setScalar(1.05);
    return g;
  },
  constantinople() {
    const g = new THREE.Group();
    const cross = extrude(maltese(1.15), 0.16, 0.05, GOLD());
    g.add(cross);
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), GOLD());
    center.position.z = 0.14;
    g.add(center);
    const cres = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 16, 40, Math.PI * 1.35), GOLD());
    cres.rotation.z = Math.PI / 2 - (Math.PI * 1.35) / 2;
    addAt(g, cres, 0, 1.55);
    return g;
  },
  tilers() {
    const g = triangleJewel({ up: false, color: 0x08080a });
    const glyph = labelPlane("כז", "#e2bd57", 1.1, "bold 150px 'Times New Roman', serif");
    addAt(g, glyph, 0, 0.18, 0.2);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 12, 48), GOLD());
    addAt(g, ring, 0, 0.18, 0.17);
    return g;
  },
  babylon() {
    const g = new THREE.Group();
    const star = extrude(starShape(7, 1.3, 0.72), 0.15, 0.04, GOLD());
    g.add(star);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.12, 48), ENAMEL(0x0f5d34));
    disc.rotation.x = Math.PI / 2;
    addAt(g, disc, 0, 0, 0.13);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.04, 12, 48), GOLD());
    addAt(g, ring, 0, 0, 0.17);
    const silver = SILVER();
    [-1, 1].forEach((s) => {
      const sword = new THREE.Group();
      addAt(sword, new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.55, 0.04), silver), 0, 0.1, 0);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 4), silver);
      addAt(sword, tip, 0, 0.98, 0);
      addAt(sword, new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.07), GOLD()), 0, -0.4, 0);
      addAt(sword, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12), GOLD()), 0, -0.68, 0);
      sword.rotation.z = s * 0.62;
      sword.position.z = 0.24;
      g.add(sword);
    });
    return g;
  },
  priest() {
    const g = triangleJewel({ up: true, color: 0xa3151f });
    const mitre = extrude(polyShape([[-0.34, -0.42], [-0.38, 0.1], [-0.12, 0.42], [0, 0.62], [0.12, 0.42], [0.38, 0.1], [0.34, -0.42]]), 0.08, 0.025, GOLD());
    addAt(g, mitre, 0, -0.05, 0.22);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.06), GOLD());
    addAt(g, band, 0, -0.38, 0.26);
    return g;
  },
  architect() {
    const g = triangleJewel({ up: true, color: 0xb11a1f });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 24), GLOW(0xff7a1a, 2.2));
    addAt(g, flame, 0, 0.05, 0.26);
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 24), GLOW(0xffd86b, 2.6));
    addAt(g, core, 0, -0.1, 0.31);
    addAt(g, labelPlane("G", "#fff3c4", 0.6, "bold 180px Georgia, serif"), 0, -0.2, 0.36);
    return g;
  },
  "grand-architect"() {
    const g = triangleJewel({ up: true, color: 0x0e3fb0 });
    const hole = (size, up) => {
      const s = triShape(size, up);
      s.holes.push(new THREE.Path(triShape(size * 0.86, up).getPoints().reverse()));
      return s;
    };
    addAt(g, extrude(hole(1.35, true), 0.05, 0.015, GOLD()), 0, 0.02, 0.2);
    addAt(g, extrude(hole(1.35, false), 0.05, 0.015, GOLD()), 0, 0.02, 0.24);
    addAt(g, new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), GLOW(0xaecbff, 1.4)), 0, 0.02, 0.3);
    return g;
  },
  superintendent() {
    const g = new THREE.Group();
    const frame = extrude(triShape(2.3, true), 0.2, 0.05, GOLD());
    const face = extrude(triShape(1.7, true), 0.08, 0.02, mat({ color: 0xe8c45e, metalness: 1, roughness: 0.16, clearcoat: 0.8 }));
    face.position.z = 0.12;
    g.add(frame, face);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.46, 40, 28), new THREE.MeshStandardMaterial({ color: 0x7b2cff, emissive: 0x6a1fe0, emissiveIntensity: 1.9, roughness: 0.15 }));
    addAt(g, orb, 0, -0.1, 0.32);
    return g;
  },
  tyre() {
    const g = triangleJewel({ up: true, color: 0x3b1560 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.14, 24), GOLD());
    addAt(g, band, 0, 0.02, 0.28);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), ENAMEL(0xb3122a));
    addAt(g, dome, 0, 0.08, 0.28);
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 + Math.PI / 2;
      const star = extrude(starShape(5, 0.2, 0.09), 0.04, 0.012, GOLD());
      addAt(g, star, Math.cos(a) * 0.62, Math.sin(a) * 0.62 - 0.2, 0.22);
    }
    return g;
  },
  chair() {
    const g = triangleJewel({ up: false, color: 0x0c7a3f });
    const gold = GOLD();
    [-1, 1].forEach((s) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.25, 0.07), gold);
      leg.rotation.z = s * 0.34;
      addAt(g, leg, s * 0.22, 0.12, 0.24);
    });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 10, 32, Math.PI / 2), gold);
    arc.rotation.z = Math.PI * 0.25;
    addAt(g, arc, 0, -0.34, 0.25);
    addAt(g, new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), gold), 0, 0.72, 0.25);
    return g;
  },
  eri() {
    const g = new THREE.Group();
    addAt(g, extrude(plusShape(1.3, 0.62), 0.14, 0.04, GOLD()));
    addAt(g, extrude(plusShape(1.14, 0.46), 0.08, 0.02, ENAMEL(0xf4efe2, { roughness: 0.3 })), 0, 0, 0.1);
    const leaf = ENAMEL(0xb0202b);
    const stem = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 8, 32, Math.PI * 0.45), GOLD());
    stem.rotation.z = Math.PI * 0.77;
    addAt(g, stem, 0.5, -0.15, 0.24);
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const lf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), leaf);
      lf.scale.set(1, 1.9, 0.5);
      const ang = Math.PI * 0.78 + t * Math.PI * 0.42;
      const px = 0.5 + Math.cos(ang) * 0.7, py = -0.15 + Math.sin(ang) * 0.7;
      lf.rotation.z = ang - Math.PI / 2 + (i % 2 ? 0.7 : -0.7);
      addAt(g, lf, px, py, 0.28);
    }
    return g;
  },
  patrick() {
    const g = new THREE.Group();
    const gold = GOLD();
    const emerald = ENAMEL(0x0d8a4a);
    addAt(g, new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.1, 24, 80), gold));
    addAt(g, new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 16, 80), gold), 0, 0, 0.03);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 64), ENAMEL(0xd9cfae, { roughness: 0.4 }));
    disc.rotation.x = Math.PI / 2;
    addAt(g, disc, 0, 0, -0.03);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
      const lobe = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 40), emerald);
      lobe.rotation.x = Math.PI / 2;
      addAt(g, lobe, Math.cos(a) * 0.48, Math.sin(a) * 0.48 + 0.1, 0.1);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 10, 40), gold);
      addAt(g, rim, Math.cos(a) * 0.48, Math.sin(a) * 0.48 + 0.1, 0.19);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.7, 12), emerald);
    stem.rotation.z = 0.18;
    addAt(g, stem, 0.04, -0.62, 0.08);
    // Square and Compasses at the heart of the shamrock
    const sq = new THREE.Group();
    [-1, 1].forEach((s) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.05), gold);
      leg.rotation.z = s * 0.4;
      addAt(sq, leg, s * 0.11, 0.06, 0);
    });
    const sqr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.05), gold);
    sqr.rotation.z = Math.PI / 4;
    addAt(sq, sqr, 0, -0.06, 0.02);
    sq.position.set(0, 0.1, 0.3);
    g.add(sq);
    addAt(g, new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), GLOW(0xfff0b0, 2)), 0, 0.42, 0.3);
    const glow = new THREE.PointLight(0x35e08c, 1.1, 10, 1.8);
    glow.position.z = 1.2;
    g.add(glow);
    g.scale.setScalar(1.25);
    return g;
  },
  jonah() {
    const g = new THREE.Group();
    const gold = GOLD();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 56), gold);
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    addAt(g, new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.07, 16, 56), gold), 0, 0, 0.04);
    const sea = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 40), ENAMEL(0x7fc4e8, { roughness: 0.2 }));
    sea.rotation.x = Math.PI / 2;
    addAt(g, sea, 0, 0, 0.08);
    const fish = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), gold);
    fish.scale.set(1.7, 0.8, 0.6);
    addAt(g, fish, 0, -0.08, 0.16);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 3), gold);
    tail.rotation.z = -Math.PI / 2;
    addAt(g, tail, 0.42, -0.08, 0.16);
    return g;
  },
};

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */
function createScene(container, { onPick, onSatellite }) {
  const canvasProbe = document.createElement("canvas");
  if (!(canvasProbe.getContext("webgl2") || canvasProbe.getContext("webgl"))) throw new Error("WebGL unavailable");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-label", "Interactive 3D model of the Allied Masonic Degrees path");
  renderer.domElement.setAttribute("role", "img");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03120c);
  scene.fog = new THREE.FogExp2(0x03120c, 0.016);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(17, 9.5, 17);
  const headlight = new THREE.DirectionalLight(0xfff1d0, 1.1);
  headlight.position.set(0, 0.4, 1);
  headlight.target.position.set(0, 0, -1);
  camera.add(headlight, headlight.target);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 36;
  controls.maxPolarAngle = Math.PI * 0.56;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(0, 8, 0);
  camera.lookAt(controls.target);

  // Light
  scene.add(new THREE.HemisphereLight(0x9ad8b8, 0x0a1a12, 0.5));
  const key = new THREE.DirectionalLight(0xffe2a8, 1.6);
  key.position.set(10, 22, 8);
  scene.add(key);
  const apexLight = new THREE.PointLight(0x39e68f, 2.5, 40, 1.6);
  apexLight.position.set(0, 18.5, 0);
  scene.add(apexLight);

  // Mosaic pavement
  const tile = document.createElement("canvas");
  tile.width = tile.height = 256;
  const tg = tile.getContext("2d");
  tg.fillStyle = "#e9e2cd";
  tg.fillRect(0, 0, 256, 256);
  tg.fillStyle = "#0a0f0c";
  tg.fillRect(0, 0, 128, 128);
  tg.fillRect(128, 128, 128, 128);
  const floorTex = new THREE.CanvasTexture(tile);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(16, 16);
  floorTex.colorSpace = THREE.SRGBColorSpace;
  floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(34, 96),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.38, metalness: 0.25, envMapIntensity: 0.6 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.6;
  scene.add(floor);

  // Positions on a rising helix; the Order crowns the axis.
  const N = STATIONS.length;
  const R = 6.2;
  const pos = STATIONS.map((s, i) => {
    if (s.id === "patrick") return new THREE.Vector3(0, 19.2, 0);
    const a = i * 0.66 - 0.2;
    return new THREE.Vector3(Math.cos(a) * R, 0.2 + i * 1.62, Math.sin(a) * R);
  });

  // Ribbon of light along the path
  const curvePts = [new THREE.Vector3(R + 1.6, -1.4, 1.6), ...pos.slice(0, N - 1).map((p) => p.clone().add(new THREE.Vector3(0, -1.15, 0))), new THREE.Vector3(0, 17.2, 0)];
  const curve = new THREE.CatmullRomCurve3(curvePts, false, "catmullrom", 0.4);
  const ribbon = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 300, 0.07, 10, false),
    new THREE.MeshBasicMaterial({ color: 0xf1cd6a, transparent: true, opacity: 0.85 }),
  );
  scene.add(ribbon);
  const ribbonGlow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 300, 0.32, 10, false),
    new THREE.MeshBasicMaterial({ color: 0xf1cd6a, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  scene.add(ribbonGlow);

  // Stepping stones along the ribbon
  const stepMat = new THREE.MeshStandardMaterial({ color: 0xcfc6ac, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.7 });
  for (let i = 0; i < 46; i++) {
    const t = i / 45;
    const p = curve.getPoint(t);
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.7), stepMat);
    const tan = curve.getTangent(t);
    step.position.copy(p).add(new THREE.Vector3(0, -0.2, 0));
    step.rotation.y = Math.atan2(-tan.z, tan.x);
    scene.add(step);
  }

  // Central column of light and halos
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 24, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  column.position.y = 10.5;
  scene.add(column);
  const halos = [];
  [3.5, 8, 12.5, 16.5].forEach((y, i) => {
    const h = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.35, 0.025, 8, 100), new THREE.MeshBasicMaterial({ color: 0xf1cd6a, transparent: true, opacity: 0.55 }));
    h.rotation.x = Math.PI / 2;
    h.position.y = y;
    scene.add(h);
    halos.push(h);
  });

  // Two pillars at the threshold of the path
  const marble = new THREE.MeshStandardMaterial({ color: 0xe6dfcb, roughness: 0.35, metalness: 0.05, envMapIntensity: 0.9 });
  [-1, 1].forEach((dz) => {
    const col = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 5.2, 32), marble);
    shaft.position.y = 1;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.4, 32), marble);
    base.position.y = -1.4;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.45, 0.5, 32), marble);
    cap.position.y = 3.8;
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 20), GOLD());
    globe.position.y = 4.5;
    col.add(shaft, base, cap, globe);
    const pa = -0.2 - 0.62 + dz * 0.07;
    col.position.set(Math.cos(pa) * (R + 1.4), 0, Math.sin(pa) * (R + 1.4));
    scene.add(col);
  });

  // Motes
  const moteCount = 700;
  const moteGeo = new THREE.BufferGeometry();
  const mp = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 12;
    mp.set([Math.cos(a) * r, Math.random() * 24 - 1.5, Math.sin(a) * r], i * 3);
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xffe7a0, size: 0.07, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(motes);

  // Stations
  const stations = [];
  const hitTargets = [];
  STATIONS.forEach((s, i) => {
    const jewel = JEWELS[s.id]();
    const holder = new THREE.Group();
    holder.position.copy(pos[i]);
    const out = new THREE.Vector3(pos[i].x, 0, pos[i].z);
    if (out.lengthSq() < 0.01) out.set(1, 0, 0);
    out.normalize();
    holder.lookAt(pos[i].clone().add(out.clone().multiplyScalar(10)));
    holder.add(jewel);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: 0xf1cd6a, transparent: true, opacity: 0.0 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.55;
    holder.add(ring);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.index = i;
    holder.add(hit);
    hitTargets.push(hit);
    const label = labelPlane(String(i + 1), "#f1cd6a", 0.6, "600 150px Georgia, serif");
    label.position.set(0, -1.62, 0.2);
    label.scale.setScalar(0.9);
    holder.add(label);
    scene.add(holder);
    stations.push({ holder, jewel, ring, basePos: pos[i].clone(), phase: i * 0.7, baseScale: jewel.scale.x });
  });

  // Companion Order (Jonah) near the Red Branch of Eri
  const eri = stations.findIndex((_, i) => STATIONS[i].id === "eri");
  const jonah = JEWELS.jonah();
  const jonahHolder = new THREE.Group();
  const jp = pos[eri].clone();
  const jOut = new THREE.Vector3(jp.x, 0, jp.z).normalize();
  jp.add(jOut.clone().multiplyScalar(3.1)).add(new THREE.Vector3(0, 1.5, 0));
  jonahHolder.position.copy(jp);
  jonahHolder.lookAt(jp.clone().add(jOut.clone().multiplyScalar(10)));
  jonahHolder.scale.setScalar(0.8);
  jonahHolder.add(jonah);
  const jonahHit = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  jonahHit.userData.satellite = true;
  jonahHolder.add(jonahHit);
  hitTargets.push(jonahHit);
  scene.add(jonahHolder);

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.5, 0.88);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 520;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // Focus handling: the orbit target glides and swings round to face the jewel.
  const desiredTarget = new THREE.Vector3(0, 8, 0);
  const desiredSph = new THREE.Spherical(30, 1.25, Math.PI / 4);
  let desiredDist = camera.position.distanceTo(controls.target);
  let selected = 0;
  let idleSince = performance.now();
  let snapUntil = 0;

  function frontOf(p, dist, lift) {
    const out = new THREE.Vector3(p.x, 0, p.z);
    if (out.lengthSq() < 0.01) out.set(1, 0, 0);
    out.normalize().multiplyScalar(dist).setY(lift);
    return new THREE.Spherical().setFromVector3(out);
  }
  function focus(i) {
    selected = i;
    desiredTarget.copy(pos[i]);
    desiredDist = i === N - 1 ? 8.5 : 6.4;
    const sph = frontOf(pos[i], 1, 0.16);
    desiredSph.phi = sph.phi;
    desiredSph.theta = sph.theta;
    snapUntil = performance.now() + 3500;
    controls.autoRotate = false;
    idleSince = performance.now();
  }
  function overview() {
    selected = -1;
    desiredTarget.set(0, 8.5, 0);
    desiredDist = 31;
    desiredSph.phi = 1.32;
    desiredSph.theta = Math.PI / 4;
    snapUntil = performance.now() + 3500;
    idleSince = performance.now();
  }
  renderer.domElement.addEventListener("pointerdown", () => { controls.autoRotate = false; snapUntil = 0; idleSince = performance.now(); });

  // Picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hitTargets, false)[0];
    if (!hit) return;
    if (hit.object.userData.satellite) {
      desiredTarget.copy(jp);
      desiredDist = 5;
      onSatellite();
    } else {
      onPick(hit.object.userData.index);
    }
  });

  // Render loop (paused off-screen)
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 }).observe(container);
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const prevTarget = new THREE.Vector3();
  const sph = new THREE.Spherical();
  let lastFrame = performance.now();
  const offset = new THREE.Vector3();

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      stations.forEach((s, i) => {
        s.holder.position.y = s.basePos.y + Math.sin(t * 0.8 + s.phase) * 0.08;
        s.jewel.rotation.y = Math.sin(t * 0.55 + s.phase) * 0.35;
        s.jewel.rotation.x = Math.sin(t * 0.4 + s.phase * 1.3) * 0.06;
      });
      jonah.rotation.y = Math.sin(t * 0.6) * 0.4;
      halos.forEach((h, i) => { h.rotation.z = t * (0.15 + i * 0.05); h.position.y += Math.sin(t + i) * 0.0015; });
      motes.rotation.y = t * 0.012;
      const arr = moteGeo.attributes.position.array;
      for (let i = 0; i < moteCount; i++) {
        arr[i * 3 + 1] += 0.004 + (i % 5) * 0.0007;
        if (arr[i * 3 + 1] > 22.5) arr[i * 3 + 1] = -1.5;
      }
      moteGeo.attributes.position.needsUpdate = true;
      column.material.opacity = 0.17 + Math.sin(t * 1.3) * 0.04;
    }
    stations.forEach((s, i) => {
      const on = i === selected;
      s.ring.material.opacity += ((on ? 0.95 : 0.0) - s.ring.material.opacity) * 0.1;
      const k = on ? 1.0 + Math.sin(t * 2.4) * 0.03 : 1.0;
      s.jewel.scale.setScalar(THREE.MathUtils.lerp(s.jewel.scale.x, s.baseScale * (on ? 1.1 : 1.0) * k, 0.1));
    });

    // glide the target, distance and viewing angle (time based, so frame rate does not matter)
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;
    const k = 1 - Math.exp(-dt * 3.2);
    prevTarget.copy(controls.target);
    controls.target.lerp(desiredTarget, k);
    camera.position.add(tmp.copy(controls.target).sub(prevTarget));
    offset.copy(camera.position).sub(controls.target);
    sph.setFromVector3(offset);
    sph.radius += (desiredDist - sph.radius) * k;
    if (now < snapUntil) {
      let d = desiredSph.theta - sph.theta;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      sph.theta += d * k;
      sph.phi += (desiredSph.phi - sph.phi) * k;
    }
    offset.setFromSpherical(sph);
    camera.position.copy(controls.target).add(offset);

    if (!reduceMotion && !controls.autoRotate && performance.now() - idleSince > 20000 && selected === -1) controls.autoRotate = true;

    controls.update();
    composer.render();
  }
  frame();

  return { focus, overview };
}

const pathRoot = document.getElementById("path3d");
if (pathRoot) boot(pathRoot);
