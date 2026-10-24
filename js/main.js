function updateFloorUI() {
  $("floorTag").innerHTML = "<b>" + (S.floor === 6 ? "\u2302" : S.floor) + '</b><span class="fname">' + FL[S.floor] + "</span>";
}
G.onFloor = function(f) {
  updateFloorUI();
  S.me.bed = 0;
};
(() => {
  const cols = ["#f58fb1", "#f7a23b", "#5cc6c0", "#8ec9f2", "#9b7be8", "#e8513f", "#8fcf6a"];
  for (const id of ["logo", "logo2"]) {
    const h = $(id), tx = "Up & About";
    h.setAttribute("aria-label", tx);
    h.textContent = "";
    [...tx].forEach((ch, i) => {
      const sp = document.createElement("span");
      if (ch === " ") {
        sp.className = "sp";
        sp.innerHTML = "&nbsp;";
      } else {
        sp.textContent = ch;
        sp.style.background = cols[i % cols.length];
        sp.style.transform = "rotate(" + (i * 7 % 5 - 2) + "deg)";
      }
      h.appendChild(sp);
    });
  }
})();
if (window.matchMedia && matchMedia("(pointer:coarse)").matches || "ontouchstart" in window) document.body.classList.add("touch");
G.open = function(k) {
  if (S.el || G.cur || S.scene !== "walk") return;
  const m = S.me;
  S.target = null;
  m.walk = false;
  m.dance = false;
  S.dancePin = false;
  G.cur = k;
  if (k === "snakes" || k === "mono") {
    S.scene = "game";
    m.sit = 0;
    m.face = "s";
    G.refreshHud();
  } else {
    m.sit = 1;
    const t = (ROOMS[S.floor].tables || []).find((t2) => t2.g === k);
    if (t) {
      m.x = t.sx;
      m.y = t.sy;
      m.face = "n";
    }
    S.scene = "sheet";
    $("sheet-" + k).hidden = false;
    if (k === "uno") Uno.open();
    else GK[k].render();
  }
  sfx.click(3);
};
G.stand = function() {
  const k = G.cur;
  if (!k) return;
  const sh = $("sheet-" + k);
  if (sh) sh.hidden = true;
  setHud("");
  G.cur = null;
  S.scene = "walk";
  S.me.sit = null;
  $("scene").focus();
};
document.querySelectorAll("[data-stand]").forEach((b) => b.addEventListener("click", () => G.stand()));
wireSheet("ttt", "sheet-ttt", "tbl-ttt", "tttNew");
wireSheet("c4", "sheet-c4", "tbl-c4", "c4New");
let draft = { ...DEFAULT_LOOK }, crFirst = false;
function openCreator(first) {
  crFirst = first;
  draft = { ...LOOK };
  $("crOpts").innerHTML = '<div class="field"><label for="crName">Your name</label><input id="crName" type="text" maxlength="12" autocomplete="off" placeholder="What should we call you?"></div><div id="crDyn"></div>';
  $("crName").value = Save.d.name || "";
  $("crNote").textContent = "Saved on this device, so your character is waiting next time.";
  crDyn();
  $("creator").hidden = false;
}
function crDyn() {
  const d = draft;
  const sw = (k, arr) => `<div class="swatches">${arr.map((c, i) => `<button class="sw" type="button" data-k="${k}" data-v="${i}" style="background:${c}" aria-label="${k} colour ${i + 1}" aria-pressed="${d[k] === i}"></button>`).join("")}</div>`;
  const op = (k, arr) => `<div class="swatches">${arr.map((n, i) => `<button class="opt" type="button" data-k="${k}" data-v="${i}" aria-pressed="${d[k] === i}">${n}</button>`).join("")}</div>`;
  const f = (t, body) => `<div class="field"><span class="lab">${t}</span>${body}</div>`;
  let h = f("Skin", sw("skin", SKINS)) + f("Head covering", op("hijab", ["No hijab", "Hijab"]));
  if (d.hijab) h += f("Hijab colour", sw("hj", PAL)) + f("Hijab pattern", op("hjp", HJN));
  else h += f("Hair style", op("hs", HAIRN)) + f("Hair colour", sw("hc", HAIRC));
  h += f("Outfit", op("cut", ["Dress", "Trousers"])) + f("Pattern", op("of", OUTN)) + f("Outfit colour", sw("oc", PAL));
  if (d.cut === 1) h += f("Trousers colour", sw("pc", PAL));
  h += f("Shoes", sw("sh", SHOES));
  $("crDyn").innerHTML = h;
}
$("crOpts").addEventListener("click", (e) => {
  const b = e.target.closest("[data-k]");
  if (!b) return;
  draft[b.dataset.k] = +b.dataset.v;
  sfx.click(1);
  crDyn();
});
$("crRandom").addEventListener("click", () => {
  draft = { skin: rnd(8), hs: rnd(10), hc: rnd(10), hijab: draft.hijab, hj: rnd(10), hjp: rnd(3), of: rnd(5), oc: rnd(10), sh: rnd(5), cut: rnd(2), pc: rnd(10) };
  sfx.pop();
  crDyn();
});
$("crDone").addEventListener("click", () => {
  const name = cleanName($("crName").value, "");
  if (!name) {
    $("crNote").textContent = "Please type a name first.";
    $("crName").focus();
    return;
  }
  Save.d.name = name;
  LOOK = lookFrom(lookArr(draft));
  Save.d.look = { ...LOOK };
  Save.put();
  $("creator").hidden = true;
  if (!started) begin();
});
function drawPreview() {
  const c = $("prevCv");
  if (!c || $("creator").hidden) return;
  const g = c.getContext("2d");
  withCtx(g, 1, () => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, 340, 480);
    const gr = ctx.createLinearGradient(0, 0, 0, 480);
    gr.addColorStop(0, "#bfe8f6");
    gr.addColorStop(1, "#fde7c8");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 340, 480);
    ctx.fillStyle = dotsP("#fbd3dc", "#fffaf0", 34, 5);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, 340, 480);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f0cf9c";
    ctx.fillRect(0, 400, 340, 80);
    ctx.fillStyle = "rgba(74,51,40,.2)";
    ctx.fillRect(0, 400, 340, 6);
    person(170, 440 + Math.sin(S.t * 2) * 1.5, { look: draft, sc: 4.6, face: "s", name: null, bob: Math.sin(S.t * 2) * 1 });
  });
}
function drawIntroAv() {
  const c = $("introAv");
  if (!c || $("intro").hidden) return;
  const g = c.getContext("2d");
  withCtx(g, 1, () => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, 300, 300);
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 146, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#bfe8f6";
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#f58fb1";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 230, 300, 70);
    ctx.globalAlpha = 1;
    person(150, 418 + Math.sin(S.t * 2) * 2, { look: LOOK, sc: 6.1, face: "s", name: null, arms: false });
    ctx.restore();
    ctx.beginPath();
    ctx.arc(150, 150, 146, 0, TAU);
    outline(3);
  });
}
$("btnMe").addEventListener("click", () => {
  if (!started || S.el) return;
  openCreator(false);
});
const modalOpen = () => !$("intro").hidden || !$("creator").hidden || !$("music").hidden;
function closeModals() {
  if (!$("creator").hidden && !crFirst) {
    $("creator").hidden = true;
  }
  if (!$("music").hidden) $("music").hidden = true;
}
addEventListener("keydown", (e) => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "Escape") {
    if (modalOpen()) closeModals();
    else if (G.cur) G.stand();
    else if (S.me.bed) toggleBed();
    return;
  }
  if (modalOpen() || !started) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
  if (G.cur) {
    if (S.scene === "game" && (k === "e" || k === "Enter" || k === " ") && !e.repeat) G.boardRoll();
    return;
  }
  if (S.el) {
    if (/^[1-5]$/.test(k)) {
      pickFloor(+k);
    } else if (k === "6" || k === "r") {
      pickFloor(6);
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(k)) {
      S.keys[k] = true;
    } else if ((k === "e" || k === "Enter" || k === " ") && !e.repeat) {
      if (S.el.ph === "cab") {
        if (nearCabDoor()) leaveCab();
        else toast("Walk up to the doors to step out, or tap a floor button", 2400);
      }
    }
    return;
  }
  S.keys[k] = true;
  if ((k === "e" || k === "Enter") && !e.repeat) useNear();
  if (k === "l" && S.floor === 6 && !e.repeat) toggleLight();
  if (k === " " && S.floor === 5 && !e.repeat && !S.me.walk) S.dancePin = false;
  if (k === "r" && !e.repeat) goRoom();
});
addEventListener("keyup", (e) => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  S.keys[k] = false;
});
addEventListener("blur", () => {
  S.keys = {};
  S.dancing = false;
});
document.querySelectorAll("#pad [data-k]").forEach((b) => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    try {
      b.setPointerCapture(e.pointerId);
    } catch (_) {
    }
    getAC();
    S.keys[k] = true;
  });
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, () => {
    S.keys[k] = false;
  });
});
$("actBtn").addEventListener("click", () => {
  getAC();
  if (S.el) {
    leaveCab();
    return;
  }
  if (S.scene === "game") {
    G.boardRoll();
    return;
  }
  if (G.cur) return;
  useNear();
});
const altBtn = $("altBtn");
altBtn.addEventListener("click", () => {
  getAC();
  S.dancePin = !S.dancePin;
  sfx.click(2);
});
function allSpots() {
  const r = ROOMS[S.floor];
  if (!r) return [];
  const list = (r.spots || []).slice();
  for (const n of r.npcs || []) if (n.line) list.push({ x: n.x, y: n.y + 30, r: 70, label: "chat with " + n.name, key: "n-" + n.id, hit: [n.x - 26, n.y - 70, 52, 84], fn: () => say(n.name, n.line, n.x, n.y - 70) });
  list.push({ x: DOORX, y: 178, r: 80, label: "ride the elevator", key: "el", hit: [404, 20, 152, 120], fn: () => startBoard() });
  return list;
}
cv.addEventListener("pointerdown", (e) => {
  if (!started || modalOpen()) return;
  cv.focus();
  getAC();
  const w = worldXY(e);
  if (S.el) {
    if (S.el.ph === "cab" && S.cab) {
      const L = cabLimits();
      if (w.x > CAB.dx - 20 && w.x < CAB.dx + CAB.dw + 20 && w.y > CAB.dy && w.y < 430) S.cabT = { x: clamp(w.x, CAB.dx + 20, CAB.dx + CAB.dw - 20), y: L.y0 - 10, act: leaveCab };
      else if (w.y >= 400) S.cabT = { x: clamp(w.x, L.x0, L.x1), y: clamp(w.y, L.y0, L.y1) };
      sfx.click(1);
    }
    return;
  }
  if (S.scene === "game") {
    const g = G[G.cur];
    g && g.click && g.click(w.x, w.y);
    return;
  }
  if (S.scene !== "walk") return;
  const m = S.me;
  if (S.fade) return;
  if (m.bed) {
    const inR = (r) => w.x >= r[0] && w.x <= r[0] + r[2] && w.y >= r[1] && w.y <= r[1] + r[3];
    if (inR([548, 140, 76, 120]) || inR([326, 52, 60, 70])) {
      toggleLight();
      return;
    }
    toggleBed();
    return;
  }
  if (S.floor === 5 && Math.abs(w.x - m.x) < 30 && w.y > m.y - 84 && w.y < m.y + 14) {
    S.dancePin = !S.dancePin;
    S.target = null;
    sfx.click(2);
    return;
  }
  let pickd = null;
  for (const s of allSpots()) {
    if (s.hit && w.x >= s.hit[0] && w.x <= s.hit[0] + s.hit[2] && w.y >= s.hit[1] && w.y <= s.hit[1] + s.hit[3]) {
      pickd = s;
      break;
    }
  }
  if (!pickd) for (const s of allSpots()) {
    if (Math.hypot(w.x - s.x, w.y - s.y) < 40) {
      pickd = s;
      break;
    }
  }
  if (pickd) {
    S.target = { x: pickd.x, y: pickd.y, act: pickd.fn };
    sfx.click(1);
    return;
  }
  S.target = { x: clamp(w.x, BOUNDS.x0, BOUNDS.x1), y: clamp(w.y, BOUNDS.y0, BOUNDS.y1) };
});
let started = false, lastT = performance.now();
function update(dt) {
  S.t += dt;
  if (started) {
    if (S.scene === "walk" && !S.el) stepMe(dt);
    stepEl(dt);
    S.near = nearSpot();
    const m = S.me;
    if (m.walk || S.floor !== 5) S.dancePin = false;
    m.dance = !m.walk && !m.sit && !m.bed && !S.el && S.scene === "walk" && !!(S.keys[" "] || S.dancing || S.dancePin);
    if (S.fade && !S.fade.done && S.t - S.fade.t0 >= S.fade.dur / 2) {
      S.fade.done = true;
      S.fade.fn();
    }
    if (S.fade && S.t - S.fade.t0 >= S.fade.dur) S.fade = null;
    S.e = G.music.energy(S.t);
    G.boardsUpdate(dt);
    S.light = Save.d.lights !== false;
    $("altBtn").hidden = !(S.floor === 5 && S.scene === "walk" && !S.el);
    $("altBtn").textContent = S.dancePin ? "STOP" : "DANCE";
    const near = S.near;
    $("actBtn").textContent = S.el ? "OUT" : S.scene === "game" ? "ROLL" : m.bed ? "UP" : "USE";
  }
}
function drawPrompt() {
  if (!started || modalOpen() || S.fade) return;
  const touch0 = document.body.classList.contains("touch");
  if (S.el) {
    if (S.el.ph !== "cab" || !S.cab) return;
    promptPill(nearCabDoor() ? touch0 ? "Tap OUT to step out" : "Press E to step out" : touch0 ? "Walk to the doors to step out, or tap a floor" : "Walk to the doors to step out, or press a floor button");
    return;
  }
  if (S.scene !== "walk") return;
  const m = S.me, touch = touch0;
  let t = null, key = touch ? "USE" : "E";
  if (m.bed) t = "get up";
  else if (S.near) t = S.near.label;
  else if (S.floor === 5 && !m.walk) {
    t = touch ? "dance, or tap your character" : "dance, or click your character";
    key = touch ? "DANCE" : "SPACE";
  } else if (S.floor === 1 && S.t < 40 && !m.walk) t = "ride the elevator: walk into its doors";
  if (!t) return;
  const verb = (m.bed ? "Press E to " : touch ? key === "DANCE" ? "Tap DANCE to " : "Tap USE to " : key === "SPACE" ? "Press SPACE to " : "Press E to ") + t + (m.bed && !touch ? "  \xB7  L for the light" : "");
  promptPill(verb);
}
function promptPill(verb) {
  ctx.save();
  ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  ctx.font = N(400, 18);
  const w = Math.min(V.cw - 16, ctx.measureText(verb).width + 36), x = V.cw / 2, y = V.ch - 28;
  ctx.shadowColor = "rgba(74,51,40,.3)";
  ctx.shadowOffsetY = 3;
  rr(x - w / 2, y - 18, w, 36, 18);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  rr(x - w / 2, y - 18, w, 36, 18);
  outline(1.4);
  txt(verb, x, y + 1, N(400, 18), INK);
  ctx.restore();
}
function drawOverlays() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (S.flash != null) {
    const q = (S.t - S.flash) / 0.5;
    if (q >= 1) S.flash = null;
    else {
      ctx.fillStyle = `rgba(255,248,225,${(1 - q) * 0.92})`;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
  }
  if (S.fade) {
    const q = (S.t - S.fade.t0) / S.fade.dur, a = clamp(q < 0.5 ? q * 2 : 2 - q * 2, 0, 1);
    ctx.fillStyle = `rgba(253,238,221,${a})`;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
  ctx.restore();
}
function draw() {
  resize();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (started) {
    drawWorld();
    drawPrompt();
    drawOverlays();
  } else {
    setWorldTransform();
    ctx.fillStyle = "#fdeedd";
    ctx.fillRect(0, 0, W, H);
  }
  drawPreview();
  drawIntroAv();
}
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1e3);
  lastT = now;
  try {
    update(dt);
    draw();
  } catch (err) {
    if (!frame.err) {
      frame.err = 1;
      console.error(err);
    }
  }
  requestAnimationFrame(frame);
}
function begin() {
  started = true;
  $("intro").hidden = true;
  const m = S.me;
  m.x = DOORX;
  m.y = 240;
  m.face = "s";
  S.floor = 1;
  S.light = Save.d.lights !== false;
  Save.d.visits = (Save.d.visits || 0) + 1;
  Save.put();
  updateFloorUI();
  resize();
  camTo(m.x, m.y - 40, true);
  $("scene").focus();
  sfx.ding();
  toast("Welcome, " + Save.d.name + "! The elevator is at the back, or say hi at the front desk.", 3800);
}
(function boot() {
  const has = Save.load();
  LOOK = lookFrom(lookArr(Save.d.look));
  S.light = Save.d.lights !== false;
  if (has) {
    $("introMsg").textContent = "Welcome back, " + Save.d.name + ". Your character and progress are saved on this device.";
    $("introPlay").textContent = "Play";
    $("introLook").hidden = false;
  } else {
    $("introPlay").textContent = "Make my character";
  }
  $("introPlay").addEventListener("click", () => {
    getAC();
    if (has || Save.d.name) begin();
    else openCreator(true);
  });
  $("introLook").addEventListener("click", () => {
    getAC();
    openCreator(false);
    crFirst = false;
  });
  new ResizeObserver(resize).observe($("frame"));
  addEventListener("resize", resize);
  addEventListener("orientationchange", () => setTimeout(resize, 200));
  try {
    document.fonts.load("700 20px Gaegu");
    document.fonts.load('400 16px "Patrick Hand"');
  } catch (e) {
  }
  $("musicVol").value = Save.d.vol ?? 0.8;
  $("musicVol").dispatchEvent(new Event("input"));
  requestAnimationFrame(frame);
})();
