const FL = [null, "Lobby", "Game Lounge", "Card Room", "Board Hall", "Disco", "My Room"];
const FSUB = [null, "Say hi at the desk", "Connect 4, Tic-Tac-Toe", "Uno", "Snakes & Ladders, Property Parade", "Lights, music, dancing", "Your cosy corner"];
const G = {};
const S = {
  e: { bass: 0.3, mid: 0.3, high: 0.3 },
  t: 0,
  floor: 1,
  me: { x: 100, y: 190, face: "s", walk: false, dance: false, sit: null, bed: 0 },
  keys: {},
  target: null,
  dopen: {},
  el: null,
  say: null,
  near: null,
  light: true,
  toastT: 0,
  scene: "walk",
  cdo: 1,
  shake: 0,
  disp: 1,
  cab: null,
  cabT: null
};
const BOUNDS = { x0: 36, x1: 924, y0: 152, y1: 516 };
const DOORX = 480;
const ROOMS = {};
let toastTimer = 0;
function toast(msg, ms = 2200) {
  const e = $("toast");
  e.textContent = msg;
  e.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove("show"), ms);
}
function say(who, text, x, y, ms = 3200) {
  S.say = { who, text, x, y, until: S.t + ms / 1e3 };
}
function localHour() {
  if (typeof window.__hour === "number") return window.__hour;
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}
const SKYK = [[0, "#0b1230", "#1b2a5a"], [4.5, "#141d46", "#2b3a74"], [5.8, "#4a447f", "#f2a38a"], [7.2, "#7db8ec", "#ffe1b8"], [10, "#6fb8f0", "#cfeaff"], [15, "#74b6ee", "#dff1ff"], [17.5, "#6aa0e0", "#ffc98a"], [19, "#6b4f9a", "#f58a6a"], [20.6, "#1f2760", "#4a4a8a"], [24, "#0b1230", "#1b2a5a"]];
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16));
const mixc = (a, b, t) => {
  const A = hx(a), B = hx(b);
  return "rgb(" + A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",") + ")";
};
function skyColors(h) {
  let i = 0;
  while (i < SKYK.length - 2 && h >= SKYK[i + 1][0]) i++;
  const a = SKYK[i], b = SKYK[i + 1], t = clamp((h - a[0]) / (b[0] - a[0]), 0, 1);
  const night = h < 5.2 || h > 20.8 ? 1 : h < 6.6 ? 1 - (h - 5.2) / 1.4 : h > 19.4 ? (h - 19.4) / 1.4 : 0;
  return { top: mixc(a[1], b[1], t), bot: mixc(a[2], b[2], t), night };
}
const STARS = Array.from({ length: 40 }, (_, i) => [i * 53.7 % 100 / 100, i * 29.3 % 100 / 100, 1 + i % 3 * 0.5]);
function drawSky(x, y, w, h, hour) {
  const c = skyColors(hour);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, c.top);
  g.addColorStop(1, c.bot);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  if (c.night > 0) {
    ctx.globalAlpha = c.night;
    ctx.fillStyle = "#fffdf0";
    for (const [a, b, r] of STARS) {
      const tw = 0.6 + 0.4 * Math.sin(S.t * 2 + a * 40);
      ctx.globalAlpha = c.night * tw;
      ctx.beginPath();
      ctx.arc(x + a * w, y + b * h * 0.8, r, 0, 6.3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const sunT = (hour - 6) / 12.5, moonH = hour >= 18.5 ? hour - 18.5 : hour + 5.5, moonT = moonH / 11.5;
  if (sunT >= 0 && sunT <= 1) {
    const sx = x + w * (0.1 + 0.8 * sunT), sy = y + h * (0.9 - 0.75 * Math.sin(sunT * Math.PI));
    ctx.fillStyle = "rgba(255,230,140,.35)";
    ctx.beginPath();
    ctx.arc(sx, sy, w * 0.2, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = "#ffd44a";
    ctx.beginPath();
    ctx.arc(sx, sy, w * 0.11, 0, 6.3);
    ctx.fill();
  }
  if (moonT >= 0 && moonT <= 1 && (hour >= 18.5 || hour < 6)) {
    const mx = x + w * (0.12 + 0.76 * moonT), my = y + h * (0.85 - 0.65 * Math.sin(moonT * Math.PI));
    ctx.fillStyle = "#fff8d8";
    ctx.beginPath();
    ctx.arc(mx, my, w * 0.1, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = c.top;
    ctx.beginPath();
    ctx.arc(mx + w * 0.05, my - w * 0.02, w * 0.085, 0, 6.3);
    ctx.fill();
  }
  ctx.fillStyle = c.night > 0.5 ? "rgba(120,130,190,.45)" : "rgba(255,255,255,.85)";
  for (let i = 0; i < 3; i++) {
    const cx = x + (S.t * 6 + i * w * 0.42) % (w + 80) - 40, cy = y + h * (0.25 + i * 0.2);
    for (const [dx, r] of [[0, 10], [11, 13], [24, 9]]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy, r, 0, 6.3);
      ctx.fill();
    }
  }
  ctx.fillStyle = c.night > 0.5 ? "#101a3c" : "#7ea0c8";
  for (let i = 0; i < 7; i++) {
    const bw = w / 7, bh = h * (0.14 + i * 37 % 5 * 0.03);
    ctx.fillRect(x + i * bw, y + h - bh, bw - 3, bh);
  }
  if (c.night > 0.4) {
    ctx.fillStyle = "#ffe08a";
    for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) if ((i * 3 + j) % 2 === 0) ctx.fillRect(x + i * (w / 7) + 6 + j * 8, y + h - 14 - j * 6, 3, 3);
  }
  ctx.restore();
}
function hourLabel(h) {
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  const ap = hh >= 12 ? "pm" : "am";
  return (hh + 11) % 12 + 1 + ":" + String(mm).padStart(2, "0") + " " + ap;
}
const FC = { 1: "#f58fb1", 2: "#8fcf6a", 3: "#f3c53d", 4: "#e8513f", 5: "#9b7be8", 6: "#5cc6c0" };
function elevatorDoor() {
  const open = S.dopen[S.floor] || 0;
  cast(() => {
    rr(404, 50, 152, 86, [44, 44, 0, 0]);
    ctx.fillStyle = "#f3c53d";
    ctx.fill();
  });
  rr(404, 50, 152, 86, [44, 44, 0, 0]);
  outline();
  rr(414, 62, 132, 74, [36, 36, 0, 0]);
  ctx.fillStyle = "#3a8f8a";
  ctx.fill();
  outline(1.3);
  if (open > 0.02) {
    ctx.save();
    rr(414, 62, 132, 74, [36, 36, 0, 0]);
    ctx.clip();
    const g = ctx.createLinearGradient(0, 62, 0, 136);
    g.addColorStop(0, "#f6dc94");
    g.addColorStop(1, "#d8a064");
    ctx.fillStyle = g;
    ctx.fillRect(414, 62, 132, 74);
    ctx.fillStyle = "rgba(255,246,200,.6)";
    ctx.fillRect(468, 70, 24, 66);
    ctx.restore();
  }
  ctx.save();
  rr(414, 62, 132, 74, [36, 36, 0, 0]);
  ctx.clip();
  const sl = open * 56;
  for (const [x, rad, dx] of [[418, [30, 0, 0, 0], -sl], [482, [0, 30, 0, 0], sl]]) {
    rr(x + dx, 66, 60, 70, rad);
    ctx.fillStyle = "#5cc6c0";
    ctx.fill();
    ctx.fillStyle = dotsP("rgba(0,0,0,0)", "rgba(255,255,255,.55)", 16, 2.2);
    ctx.fill();
    outline(1.3);
    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.arc((dx < 0 ? 472 : 488) + dx, 104, 3.5, 0, 6.3);
    ctx.fill();
  }
  ctx.restore();
  cast(() => {
    ctx.beginPath();
    ctx.arc(480, 36, 21, 0, 6.3);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(480, 36, 21, 0, 6.3);
  outline();
  txt(S.floor === 6 ? "R" : String(S.floor), 480, 38, F(700, 28), FC[S.floor]);
  paper(572, 84, 22, 40, 8, "#d9b24d");
  ctx.beginPath();
  ctx.arc(583, 96, 5, 0, 6.3);
  inked(open > 0.05 ? "#ffd24a" : "#fffdf6", 1.2);
  ctx.beginPath();
  ctx.arc(583, 112, 5, 0, 6.3);
  inked("#fffdf6", 1.2);
  if (open > 0.05) {
    ctx.fillStyle = "rgba(255,214,74,.45)";
    ctx.beginPath();
    ctx.arc(583, 96, 11, 0, 6.3);
    ctx.fill();
  }
}
function tableOval(x, y, rx, ry, fill) {
  blob(x, y + 10, rx, ry, "rgba(74,51,40,.2)", false);
  cast(() => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, 6.3);
    ctx.fillStyle = fill;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 6.3);
  outline();
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, rx - 6, ry - 5, 0, 0, 6.3);
  ctx.stroke();
  ctx.restore();
}
function sofa(x, y, w, fill) {
  cast(() => {
    rr(x, y, w, 44, 16);
    ctx.fillStyle = fill;
    ctx.fill();
  });
  rr(x, y, w, 44, 16);
  outline();
  rr(x + 8, y + 18, w - 16, 22, 10);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fill();
  for (const dx of [0, w - 14]) {
    rr(x + dx, y + 6, 14, 48, 7);
    ctx.fillStyle = fill;
    ctx.fill();
    outline(1.4);
  }
}
function lamp(x, y, on) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x, y + 54);
  ctx.stroke();
  blob(x, y + 56, 12, 4, "#8a6a58", false);
  if (on) {
    ctx.fillStyle = "rgba(255,224,130,.35)";
    ctx.beginPath();
    ctx.arc(x, y + 10, 38, 0, 6.3);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 18);
  ctx.lineTo(x + 16, y + 18);
  ctx.lineTo(x + 10, y - 6);
  ctx.lineTo(x - 10, y - 6);
  ctx.closePath();
  inked(on ? "#ffe9a8" : "#c9b99a");
}
function rug(x, y, w, h, a, b) {
  cast(() => {
    rr(x, y, w, h, 22);
    ctx.fillStyle = a;
    ctx.fill();
  });
  rr(x, y, w, h, 22);
  outline();
  rr(x + 10, y + 10, w - 20, h - 20, 14);
  ctx.fillStyle = b;
  ctx.fill();
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.6;
  rr(x + 14, y + 14, w - 28, h - 28, 12);
  ctx.stroke();
  ctx.restore();
}
function frameArt(x, y, w, h, kind) {
  cast(() => {
    rr(x, y, w, h, 8);
    ctx.fillStyle = "#fffdf6";
    ctx.fill();
  });
  rr(x, y, w, h, 8);
  outline();
  ctx.save();
  rr(x + 6, y + 6, w - 12, h - 12, 5);
  ctx.clip();
  if (kind === 0) {
    ctx.fillStyle = "#8ec9f2";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#8fcf6a";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.4, y + h, w * 0.6, h * 0.4, 0, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.arc(x + w * 0.75, y + h * 0.3, h * 0.16, 0, 6.3);
    ctx.fill();
  } else if (kind === 1) {
    ctx.fillStyle = "#f58fb1";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#fffdf6";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x + w / 2 + Math.cos(i * 1.256) * h * 0.2, y + h / 2 + Math.sin(i * 1.256) * h * 0.2, h * 0.12, 0, 6.3);
      ctx.fill();
    }
    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, h * 0.1, 0, 6.3);
    ctx.fill();
  } else {
    ctx.fillStyle = "#5cc6c0";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#f7a23b";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h * 0.8);
    ctx.lineTo(x + w * 0.5, y + h * 0.2);
    ctx.lineTo(x + w * 0.8, y + h * 0.8);
    ctx.fill();
  }
  ctx.restore();
}
function stool(x, y, c) {
  blob(x, y + 14, 13, 5, "rgba(74,51,40,.2)", false);
  rr(x - 12, y - 4, 24, 16, 8);
  ctx.fillStyle = c;
  ctx.fill();
  outline(1.5);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 10);
  ctx.lineTo(x - 10, y + 22);
  ctx.moveTo(x + 8, y + 10);
  ctx.lineTo(x + 10, y + 22);
  ctx.stroke();
}
const R = ROOMS;
function toggleLight() {
  S.light = !S.light;
  Save.d.lights = S.light;
  Save.put();
  sfx.click(2);
  toast(S.light ? "Lights on" : "Lights off");
}
function toggleBed() {
  const m = S.me;
  if (m.bed) {
    m.bed = 0;
    m.x = 700;
    m.y = 352;
    m.face = "s";
    toast("Good morning!");
    return;
  }
  m.bed = 1;
  m.dance = false;
  S.dancePin = false;
  m.x = 700;
  m.y = 240;
  m.target = null;
  S.target = null;
  toast("Tucked in. Sweet dreams. Press E or tap to get up.", 3200);
  sfx.pop();
}
function fadeTo(fn, dur = 0.5) {
  if (S.fade) return;
  S.fade = { t0: S.t, dur, fn, done: false };
}
function changeFloor(f, x, y) {
  S.me.bed = 0;
  S.target = null;
  S.floor = f;
  S.dopen[f] = 0;
  S.me.x = x;
  S.me.y = y;
  S.me.face = "s";
  S.me.walk = false;
  S.me.sit = null;
  camTo(x, y - 40, true);
  updateFloorUI();
  if (G.onFloor) G.onFloor(f);
}
function goRoom() {
  if (S.el || S.fade) return;
  if (S.floor === 6) {
    toast("You are already home");
    return;
  }
  if (S.floor === 1) {
    fadeTo(() => changeFloor(6, 84, 196));
    toast("Down the little stairs to My Room\u2026", 1600);
    return;
  }
  goViaElevator(6);
}
function goLobbyDoor() {
  if (S.el || S.fade) return;
  fadeTo(() => changeFloor(1, 896, 206));
  toast("Back up to the lobby\u2026", 1500);
}
function blocked(x, y, fl) {
  const r = ROOMS[fl];
  if (!r) return false;
  const a = x - 10, b = x + 10, c = y - 6, d = y + 4;
  for (const [rx, ry, rw, rh] of r.solids || []) {
    if (a < rx + rw && b > rx && c < ry + rh && d > ry) return true;
  }
  return false;
}
function stepMe(dt) {
  const m = S.me, k = S.keys;
  if (m.bed || m.sit || S.fade) {
    m.walk = false;
    return;
  }
  let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0), dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
  const manual = dx || dy;
  if (manual) {
    S.target = null;
    S.autoPick = null;
    S.dancePin = false;
  } else if (S.target) {
    const tx = S.target.x - m.x, ty = S.target.y - m.y, d = Math.hypot(tx, ty);
    if (d < 8) {
      const a = S.target.act;
      S.target = null;
      if (a) a();
    } else {
      dx = tx / d;
      dy = ty / d;
    }
  }
  m.walk = !!(dx || dy);
  if (!m.walk) {
    S.stuck = 0;
    return;
  }
  const l = Math.hypot(dx, dy) || 1;
  dx /= l;
  dy /= l;
  const ox = m.x, oy = m.y;
  const nx = clamp(m.x + dx * 190 * dt, BOUNDS.x0, BOUNDS.x1);
  if (!blocked(nx, m.y, S.floor)) m.x = nx;
  else if (S.target && Math.abs(dx) > 0.3) {
    const sy = S.target.y > m.y + 4 ? 1 : S.target.y < m.y - 4 ? -1 : m.y < 330 ? 1 : -1, t2 = clamp(m.y + sy * 190 * dt, BOUNDS.y0, BOUNDS.y1);
    if (!blocked(m.x, t2, S.floor)) {
      m.y = t2;
    }
  }
  const ny = m.y + dy * 190 * dt;
  if (ny < BOUNDS.y0 && Math.abs(m.x - DOORX) < 58 && dy < 0) {
    m.y = BOUNDS.y0;
    startBoard();
    return;
  }
  if (ny < BOUNDS.y0 && dy < 0) {
    const dr = (ROOMS[S.floor].doorUp || []).find((d) => m.x > d.x0 && m.x < d.x1);
    if (dr) {
      m.y = BOUNDS.y0;
      dr.fn();
      return;
    }
  }
  const cy = clamp(ny, BOUNDS.y0, BOUNDS.y1);
  if (!blocked(m.x, cy, S.floor)) m.y = cy;
  else if (S.target && Math.abs(dy) > 0.3) {
    const sx = S.target.x > m.x + 4 ? 1 : S.target.x < m.x - 4 ? -1 : m.x < 480 ? 1 : -1, t2 = clamp(m.x + sx * 190 * dt, BOUNDS.x0, BOUNDS.x1);
    if (!blocked(t2, m.y, S.floor)) m.x = t2;
  }
  if (Math.abs(dx) > Math.abs(dy) * 0.6) m.face = dx < 0 ? "l" : "r";
  else m.face = dy < 0 ? "n" : "s";
  if (S.target) {
    if (Math.hypot(m.x - ox, m.y - oy) < 0.4) {
      S.stuck = (S.stuck || 0) + dt;
      if (S.stuck > 0.5) {
        S.target = null;
        S.stuck = 0;
        m.walk = false;
      }
    } else S.stuck = 0;
  }
}
function nearSpot() {
  if (S.el || S.scene !== "walk") return null;
  const m = S.me;
  let best = null, bd = 1e9;
  for (const s of allSpots()) {
    let d = Math.hypot(s.x - m.x, s.y - m.y);
    const ar = s.area;
    if (ar && m.x >= ar[0] && m.x <= ar[0] + ar[2] && m.y >= ar[1] && m.y <= ar[1] + ar[3]) d = Math.min(d, s.r * 0.5);
    if (d < s.r && d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}
function useNear() {
  const m = S.me;
  if (m.bed) {
    toggleBed();
    return;
  }
  if (m.sit) {
    G.stand && G.stand();
    return;
  }
  const s = S.near;
  if (s) {
    sfx.click();
    s.fn();
  }
}
const CAB = { dx: 340, dy: 118, dw: 280, dh: 300 };
const lvOf = (f) => f === 6 ? 0 : f;
function startBoard() {
  if (S.el || S.scene !== "walk" || S.fade) return;
  S.target = null;
  S.me.walk = false;
  S.me.dance = false;
  S.dancePin = false;
  S.el = { ph: "enter", t0: S.t, from: S.floor, to: S.floor, lit: 0 };
  sfx.door();
}
function pickFloor(f) {
  const e = S.el;
  if (!e || e.ph !== "cab") return;
  if (f === e.from) {
    leaveCab();
    return;
  }
  e.to = f;
  e.lit = f;
  e.ph = "closing";
  e.t0 = S.t;
  e.snd = 0;
  sfx.click(f);
  buildCab();
}
function leaveCab() {
  const e = S.el;
  if (!e || e.ph !== "cab") return;
  e.to = e.from;
  e.ph = "open";
  e.t0 = S.t;
  e.same = 1;
  sfx.door();
  buildCab();
}
function goViaElevator(f) {
  if (S.el || S.fade) return;
  if (S.scene !== "walk" && G.stand) G.stand();
  S.me.bed = 0;
  S.autoPick = f;
  S.target = { x: DOORX, y: BOUNDS.y0 + 2, act: startBoard };
  toast("Heading to the elevator\u2026", 1600);
}
function showCab(on) {
  $("cabpanel").hidden = !on;
}
let cpRefs = null;
function buildCab() {
  const p = $("cabpanel"), e = S.el;
  if (!e) {
    p.innerHTML = "";
    cpRefs = null;
    return;
  }
  const can = e.ph === "cab";
  let h = '<div class="cp-screen"><b id="cpNum">' + (S.disp === 6 ? "R" : S.disp) + '</b><span id="cpArr"></span></div>';
  for (const f of [5, 4, 3, 2, 1, 6]) {
    const lit = e.lit === f;
    h += `<button class="cbtn${lit ? " lit" : ""}${f === e.from && can ? " here" : ""}" style="--c:${FC[f]}" data-f="${f}" type="button" ${can ? "" : "disabled"} aria-label="Floor ${f === 6 ? "My Room" : f}, ${FL[f]}"><span class="k">${f === 6 ? "\u2302" : f}</span><span class="l">${FL[f]}</span></button>`;
  }
  h += `<button class="cbtn out" type="button" ${can ? "" : "disabled"} aria-label="Open the doors and step out"><span class="k">\u25C0\u25B6</span><span class="l">Step out</span></button>`;
  p.innerHTML = h;
  cpRefs = { num: $("cpNum"), arr: $("cpArr") };
  p.querySelectorAll(".cbtn").forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("out")) {
      leaveCab();
      return;
    }
    pickFloor(+b.dataset.f);
  }));
}
function stepEl(dt) {
  const e = S.el;
  if (!e) return;
  const ph = S.t - e.t0, m = S.me;
  if (e.ph === "enter") {
    S.dopen[S.floor] = clamp(ph / 0.4, 0, 1);
    m.y = lerp(BOUNDS.y0, 122, clamp((ph - 0.22) / 0.45, 0, 1));
    m.x = lerp(m.x, DOORX, 0.25);
    m.face = "n";
    m.walk = ph > 0.22 && ph < 0.7;
    if (ph > 0.78) {
      e.ph = "cab";
      e.t0 = S.t;
      S.cdo = 1;
      S.cab = { x: 480, y: 446, face: "n", walk: false };
      S.cabT = null;
      S.disp = S.floor;
      m.walk = false;
      S.flash = S.t;
      buildCab();
      showCab(true);
    }
  } else if (e.ph === "cab") {
    S.cdo = 1;
    if (S.autoPick && ph > 0.45) {
      const f = S.autoPick;
      S.autoPick = null;
      pickFloor(f);
    }
  } else if (e.ph === "closing") {
    S.cdo = clamp(1 - ph / 0.5, 0, 1);
    if (S.cdo <= 0) {
      e.ph = "ride";
      e.t0 = S.t;
      e.dur = clamp(Math.abs(lvOf(e.to) - lvOf(e.from)) * 0.32 + 0.45, 0.8, 2);
      sfx.hum();
      buildCab();
    }
  } else if (e.ph === "ride") {
    S.shake = 1;
    const k = clamp(ph / e.dur, 0, 1), L = Math.round(lerp(lvOf(e.from), lvOf(e.to), k));
    S.disp = L === 0 ? 6 : L;
    if (Math.floor(ph * 4) !== Math.floor((ph - dt) * 4)) tone(110 + Math.random() * 30, 0.1, "triangle", 0.03);
    if (ph >= e.dur) {
      e.ph = "open";
      e.t0 = S.t;
      S.shake = 0;
      S.disp = e.to;
      sfx.ding();
      S.floor = e.to;
      S.dopen[S.floor] = 0;
      S.me.x = DOORX;
      S.me.y = 124;
      updateFloorUI();
      if (G.onFloor) G.onFloor(S.floor);
      e.from = e.to;
      e.lit = 0;
      buildCab();
    }
  } else if (e.ph === "open") {
    S.cdo = clamp(ph / 0.5, 0, 1);
    if (ph > 0.62) {
      e.ph = "exit";
      e.t0 = S.t;
      S.flash = S.t;
      S.dopen[S.floor] = 1;
      m.x = DOORX;
      m.y = 124;
      m.face = "s";
      m.walk = true;
      showCab(false);
      camTo(m.x, m.y - 40, true);
    }
  } else if (e.ph === "exit") {
    const q = clamp(ph / 0.55, 0, 1);
    S.dopen[S.floor] = 1;
    m.y = lerp(124, 180, q);
    m.x = DOORX;
    m.face = "s";
    m.walk = q < 1;
    if (ph > 0.62) {
      S.el = null;
      m.walk = false;
      m.y = 180;
    }
  }
  if (S.el && e.ph !== "enter" && e.ph !== "exit") stepCab(dt);
  if (cpRefs && S.el) {
    cpRefs.num.textContent = S.disp === 6 ? "R" : S.disp;
    cpRefs.arr.textContent = e.ph === "ride" ? lvOf(e.to) > lvOf(e.from) ? "\u25B2" : "\u25BC" : "";
  }
}
function doorView(x, y, w, h) {
  const fl = S.floor, r = ROOMS[fl];
  if (!r) return;
  const vw = 470, s = w / vw, od = S.dopen[fl];
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-245, -36);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, W, H);
  S.dopen[fl] = 1;
  try {
    drawFloorScene(fl, false);
  } finally {
    S.dopen[fl] = od;
  }
  ctx.restore();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "rgba(43,29,22,.38)");
  g.addColorStop(0.14, "rgba(43,29,22,0)");
  g.addColorStop(0.86, "rgba(43,29,22,0)");
  g.addColorStop(1, "rgba(43,29,22,.38)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}
const cabWallP = () => mkPat("cabwall", 150, (g, s) => {
  g.fillStyle = "#ea3b55";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "rgba(255,241,216,.92)";
  for (const [x, y, r] of [[22, 24, 7], [100, 56, 5], [62, 112, 8], [132, 134, 4], [12, 90, 4], [120, 14, 3]]) {
    g.beginPath();
    g.arc(x, y, r, 0, 6.3);
    g.fill();
  }
  g.fillStyle = "#f9c846";
  for (const [x, y, r] of [[72, 30, 6], [126, 96, 5], [30, 132, 5]]) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.45 : r;
      g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
    }
    g.closePath();
    g.fill();
  }
  g.strokeStyle = "rgba(255,241,216,.75)";
  g.lineWidth = 3;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(84, 86);
  g.quadraticCurveTo(94, 72, 104, 86);
  g.quadraticCurveTo(114, 100, 124, 86);
  g.stroke();
});
function tape(x, y, rot, w = 36) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(249,200,70,.82)";
  ctx.fillRect(-w / 2, -8, w, 16);
  ctx.strokeStyle = "rgba(74,51,40,.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -8, w, 16);
  ctx.restore();
}
function tornTop(x0, x1, y, col) {
  ctx.beginPath();
  ctx.moveTo(x0, y + 80);
  for (let x = x0; x <= x1; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.21) * 3 + Math.sin(x * 0.07) * 2.5);
  ctx.lineTo(x1, y + 80);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}
function drawCab() {
  const e = S.el, { dx, dy, dw, dh } = CAB, t = S.t, c = S.cab;
  const sh = S.shake ? Math.sin(t * 60) * 1.4 : 0;
  ctx.save();
  ctx.translate(sh, Math.cos(t * 47) * (S.shake ? 1 : 0));
  ctx.fillStyle = cabWallP();
  ctx.fillRect(-600, -400, 2160, 830);
  tornTop(-600, 1560, 306, "#fff1d8");
  ctx.save();
  ctx.beginPath();
  ctx.rect(-600, 300, 2160, 120);
  ctx.clip();
  ctx.fillStyle = dotsP("rgba(0,0,0,0)", "#f7a8b8", 34, 5);
  ctx.fillRect(-600, 300, 2160, 120);
  ctx.restore();
  ctx.fillStyle = woodP("#c0803f", "rgba(74,51,40,.38)");
  ctx.fillRect(-600, 418, 2160, 400);
  ctx.fillStyle = "rgba(74,51,40,.1)";
  for (let i = 0; i < 14; i++) {
    const gx = i * 173 % 1100 - 100, gy = 430 + i * 61 % 90;
    ctx.fillRect(gx, gy, 38, 2.4);
    ctx.fillRect(gx + 240, gy + 16, 26, 2);
  }
  const fg = ctx.createLinearGradient(0, 418, 0, 470);
  fg.addColorStop(0, "rgba(43,29,22,.34)");
  fg.addColorStop(1, "rgba(43,29,22,0)");
  ctx.fillStyle = fg;
  ctx.fillRect(-600, 418, 2160, 52);
  ctx.fillStyle = "#fffdf6";
  ctx.fillRect(-600, 408, 2160, 12);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-600, 408);
  ctx.lineTo(1560, 408);
  ctx.moveTo(-600, 420);
  ctx.lineTo(1560, 420);
  ctx.stroke();
  bunting(["#f9c846", "#fff1d8", "#f58a24", "#5cc6c0", "#f58fb1"], 8, 10, 18);
  for (const [x, w] of [[24, 276], [660, 276]]) {
    cast(() => {
      rr(x, 330, w, 12, 6);
      ctx.fillStyle = "#c0803f";
      ctx.fill();
    });
    rr(x, 330, w, 12, 6);
    outline(1.5);
    for (const sx of [x + 14, x + w - 14]) {
      ctx.fillStyle = "#c0803f";
      ctx.fillRect(sx - 3, 340, 6, 14);
      ctx.strokeRect(sx - 3, 340, 6, 14);
    }
  }
  ctx.save();
  ctx.translate(120, 200);
  ctx.rotate(-0.05);
  frameArt(-6, -40, 84, 64, 1);
  tape(36, -40, 0.2);
  ctx.restore();
  ctx.save();
  ctx.translate(232, 176);
  ctx.rotate(0.06);
  frameArt(0, 0, 56, 44, 0);
  tape(28, -2, -0.25, 28);
  ctx.restore();
  ctx.save();
  ctx.translate(86, 250);
  ctx.rotate(-0.03);
  paper(0, 0, 170, 68, 6, "#fffdf6");
  tape(85, -4, 0.05);
  txt("Floors", 85, 13, F(700, 20), "#ea3b55");
  [5, 4, 3, 2, 1].forEach((n, i) => {
    const px = 14 + i % 3 * 54, py = 34 + Math.floor(i / 3) * 20;
    ctx.fillStyle = FC[n];
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, 6.3);
    ctx.fill();
    outline(1);
    txt(n, px, py + 0.5, F(700, 11), "#fff");
  });
  ctx.restore();
  ctx.save();
  ctx.translate(720, 196);
  ctx.rotate(0.05);
  paper(0, 0, 150, 64, 10, "#f9c846");
  tape(75, -4, -0.06);
  txt("Hold on tight!", 75, 24, F(700, 22), INK);
  txt("\u273F \u273F \u273F", 75, 46, F(700, 15), "#ea3b55");
  ctx.restore();
  cast(() => {
    rr(dx - 20, dy - 20, dw + 40, dh + 20, [78, 78, 6, 6]);
    ctx.fillStyle = "#fff1d8";
    ctx.fill();
  });
  rr(dx - 20, dy - 20, dw + 40, dh + 20, [78, 78, 6, 6]);
  outline(2);
  rr(dx - 8, dy - 8, dw + 16, dh + 8, [68, 68, 3, 3]);
  ctx.strokeStyle = "#f58a24";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#2b1d16";
  ctx.fillRect(dx, dy, dw, dh);
  if (S.cdo > 0.01) doorView(dx, dy, dw, dh);
  const pw = dw / 2, slide = S.cdo * (pw * 0.8);
  for (const sd of [0, 1]) {
    const px = sd ? dx + pw + slide : dx - slide;
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    rr(px, dy, pw, dh, 3);
    ctx.fillStyle = "#f58a24";
    ctx.fill();
    ctx.fillStyle = "rgba(120,50,0,.09)";
    for (let yy = dy + 4; yy < dy + dh; yy += 9) ctx.fillRect(px, yy, pw, 3);
    rr(px + 14, dy + 130, pw - 28, dh - 150, 8);
    ctx.fillStyle = "#e07312";
    ctx.fill();
    outline(1.3);
    const ex = sd ? px + 34 : px + pw - 34, ey = dy + 70;
    ctx.beginPath();
    ctx.arc(ex, ey, 24, 0, 6.3);
    inked("#fffdf6", 2);
    const cxp = c ? clamp((c.x - ex) / 26, -1, 1) : 0, cyp = c ? clamp((c.y - ey) / 70, 0, 1) : 0.5;
    ctx.beginPath();
    ctx.arc(ex + cxp * 9, ey + cyp * 9, 9, 0, 6.3);
    ctx.fillStyle = "#2b1d16";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ex + cxp * 9 - 3, ey + cyp * 9 - 3, 2.6, 0, 6.3);
    ctx.fill();
    tape(sd ? px + pw - 30 : px + 30, dy + 20, sd ? 0.5 : -0.5, 30);
    ctx.fillStyle = "#fff1d8";
    ctx.beginPath();
    ctx.arc(sd ? px + 16 : px + pw - 16, dy + dh * 0.62, 6, 0, 6.3);
    inked("#fff1d8", 1.3);
    rr(px, dy, pw, dh, 3);
    outline(1.8);
    ctx.restore();
  }
  rr(dx, dy, dw, dh, 4);
  outline(1.8);
  ctx.save();
  ctx.translate(480, 58);
  ctx.rotate(Math.sin(t * 1.2) * 0.012);
  paper(-56, -34, 112, 68, 16, "#fff1d8");
  txt(S.disp === 6 ? "R" : String(S.disp), 0, 2, F(700, 56), "#ea3b55");
  ctx.restore();
  if (e && e.ph === "ride") {
    const up = lvOf(e.to) > lvOf(e.from), a = up ? -1 : 1, by = 58 + Math.sin(t * 8) * 2;
    ctx.fillStyle = "#f58a24";
    ctx.beginPath();
    ctx.moveTo(556, by + a * -14);
    ctx.lineTo(574, by + a * 10);
    ctx.lineTo(538, by + a * 10);
    ctx.closePath();
    inked("#f58a24", 1.6);
  }
  const mx = 480, my = 470;
  blob(mx, my + 8, 150, 32, "#f9c846");
  ctx.beginPath();
  ctx.ellipse(mx, my + 8, 126, 24, 0, 0, 6.3);
  ctx.fillStyle = dotsP("#fffdf6", "#ea3b55", 18, 3);
  ctx.fill();
  if (e && c) person(c.x, c.y, { look: LOOK, sc: 1.7, face: c.face, name: Save.d.name, walk: c.walk, arms: false });
  ctx.restore();
}
function cabLimits() {
  const p = $("cabpanel"), x0 = V.cx + 38;
  let x1 = V.cx + V.vw - 38;
  if (!p.hidden) {
    const r = p.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    if (r.width > 0) x1 = Math.min(x1, V.cx + (r.left - cr.left) / V.z - 26);
  }
  return { x0, x1: Math.max(x0 + 60, Math.min(x1, 900)), y0: 440, y1: 514 };
}
const nearCabDoor = () => {
  const c = S.cab;
  return !!c && c.y <= 452 && c.x > CAB.dx - 10 && c.x < CAB.dx + CAB.dw + 10;
};
function stepCab(dt) {
  const c = S.cab, e = S.el;
  if (!c || !e) return;
  if (e.ph === "open") {
    c.x = lerp(c.x, 480, 0.18);
    c.y = lerp(c.y, 438, 0.18);
    c.face = "n";
    c.walk = true;
    return;
  }
  const k = S.keys, L = cabLimits();
  let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0), dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
  if (dx || dy) S.cabT = null;
  else if (S.cabT) {
    const tx = S.cabT.x - c.x, ty = S.cabT.y - c.y, d = Math.hypot(tx, ty);
    if (d < 8) {
      const a = S.cabT.act;
      S.cabT = null;
      if (a) a();
    } else {
      dx = tx / d;
      dy = ty / d;
    }
  }
  c.walk = !!(dx || dy);
  if (!c.walk) return;
  const l = Math.hypot(dx, dy) || 1;
  dx /= l;
  dy /= l;
  const wantUp = dy < 0 && c.y <= L.y0 + 1;
  c.x = clamp(c.x + dx * 175 * dt, L.x0, L.x1);
  c.y = clamp(c.y + dy * 175 * dt, L.y0 - (e.ph === "cab" && c.x > CAB.dx && c.x < CAB.dx + CAB.dw ? 10 : 0), L.y1);
  if (Math.abs(dx) > Math.abs(dy) * 0.6) c.face = dx < 0 ? "l" : "r";
  else c.face = dy < 0 ? "n" : "s";
  if (wantUp && e.ph === "cab" && c.x > CAB.dx && c.x < CAB.dx + CAB.dw) {
    c.walk = false;
    leaveCab();
  }
}
G.worldEnts = (fl) => fl === 4 ? [].concat(G.snakes && G.snakes.ents ? G.snakes.ents() : [], G.mono && G.mono.ents ? G.mono.ents() : []) : [];
function drawFloorScene(fl, withMe) {
  const r = ROOMS[fl];
  r.bg();
  const ents = [];
  for (const n of r.npcs || []) ents.push({ y: n.y, draw: () => {
    const ex = n.dance !== void 0 ? { arms: Math.sin(S.t * 4 + n.dance * 2) > 0.2, bob: -Math.abs(Math.sin(S.t * 8 + n.dance)) * (2 + S.e.bass * 7) } : { bob: Math.sin(S.t * 2 + n.x) * 0.8 };
    person(n.x, n.y, Object.assign({ sc: n.sc || 1.3, face: n.face || "s", walk: false }, n.opts || { look: NPC[n.look] }, { name: n.name }, ex));
  } });
  if (withMe) {
    const hideMe = S.scene === "game" && G.cur && G[G.cur] && G[G.cur].hidesMe && G[G.cur].hidesMe();
    if (!hideMe) ents.push({ y: S.me.bed ? S.me.y + 400 : S.me.y, draw: meDraw });
  }
  if (G.worldEnts) for (const en of G.worldEnts(fl)) ents.push(en);
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) e.draw();
  if (r.fg) r.fg();
}
function meDraw() {
  const m = S.me;
  if (m.bed) {
    drawSleeper(LOOK, Save.d.name);
    return;
  }
  person(m.x, m.y, { look: LOOK, sc: 1.3, face: m.face, name: Save.d.name, walk: m.walk, arms: m.dance, bob: m.dance ? -Math.abs(Math.sin(S.t * 7)) * 7 : 0, seated: !!m.sit, crown: !!m.crown });
  if (S.floor === 5 && !m.dance && !m.walk && S.scene === "walk" && !S.el) {
    const bp = Math.sin(S.t * 4) * 3;
    ctx.save();
    ctx.font = N(400, 15);
    const w = ctx.measureText("click me to dance!").width + 22;
    cast(() => {
      rr(m.x - w / 2, m.y - 110 + bp, w, 24, 12);
      ctx.fillStyle = "#fff";
      ctx.fill();
    });
    rr(m.x - w / 2, m.y - 110 + bp, w, 24, 12);
    outline(1.2);
    txt("click me to dance!", m.x, m.y - 98 + bp, N(400, 15), INK);
    ctx.restore();
  }
}
function drawSleeper(look, name) {
  const P = lookOpts(look), br = Math.sin(S.t * 1.6);
  ctx.save();
  ctx.translate(BEDHEAD.x, BEDHEAD.y);
  ctx.rotate(-0.1);
  ctx.scale(1.55, 1.55);
  drawHead(P, 0, "s", 3, { sleep: true });
  ctx.restore();
  bedCovers(true, br);
  txt("z", BEDHEAD.x + 46, BEDHEAD.y - 40 + Math.sin(S.t * 2) * 3, F(700, 20), "#8a6a58");
  txt("z", BEDHEAD.x + 62, BEDHEAD.y - 58 + Math.sin(S.t * 2 + 1) * 3, F(700, 26), "#8a6a58");
  txt("Z", BEDHEAD.x + 80, BEDHEAD.y - 80 + Math.sin(S.t * 2 + 2) * 3, F(700, 32), "#8a6a58");
  if (name) txt(name, BEDHEAD.x + 60, BEDHEAD.y + 88, N(400, 14), "#fff");
}
function gameCam() {
  return G.cur && G[G.cur] && G[G.cur].cam ? G[G.cur].cam() : null;
}
function drawWorld() {
  const e = S.el;
  if (e && e.ph !== "enter" && e.ph !== "exit") {
    V.zt = 1;
    V.zm = 1;
    applyZoom();
    camTo(W / 2, H / 2, true);
    setWorldTransform();
    drawCab();
    return;
  }
  if (S.scene === "game") {
    const gc = gameCam();
    if (gc) {
      const hh = $("hudbar").hidden ? 0 : $("hudbar").offsetHeight / V.z;
      V.zt = fitZoom(gc.w, gc.h, hh + 8);
      V.ext = hh;
      camTo(gc.x, gc.y + hh / 2, false, hh);
    }
  } else {
    V.zt = 1;
    V.ext = 0;
    camTo(S.me.x, S.me.y - 40, false);
  }
  stepZoom();
  setWorldTransform();
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(-400, -400, W + 800, H + 800);
  const m = S.me;
  const near = Math.hypot(m.x - DOORX, m.y - 150) < 120;
  if (!(e && (e.ph === "enter" || e.ph === "exit"))) S.dopen[S.floor] = lerp(S.dopen[S.floor] || 0, near ? 1 : 0, 0.1);
  drawFloorScene(S.floor, true);
  if (S.say && S.say.until > S.t) bubble(S.say.text, S.say.x, S.say.y);
  if (S.near && !S.el) {
    const s = S.near;
    ctx.save();
    txt("\u25BC", s.x, s.y - 8 + Math.sin(S.t * 5) * 3, F(700, 22), "#e8513f");
    ctx.restore();
  }
  if (S.target) {
    ctx.save();
    ctx.strokeStyle = "rgba(232,81,63,.8)";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(S.target.x, S.target.y, 10 + Math.sin(S.t * 8) * 2, 0, 6.3);
    ctx.stroke();
    ctx.restore();
  }
}
