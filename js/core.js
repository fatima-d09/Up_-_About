"use strict";
const $ = (id) => document.getElementById(id);
const W = 960, H = 540, TAU = Math.PI * 2;
const rnd = (n) => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[rnd(a.length)];
const cv = $("scene");
let ctx = cv.getContext("2d");
let SK = 1;
function withCtx(c, k, fn) {
  const o = ctx, ok = SK;
  ctx = c;
  SK = k;
  try {
    fn();
  } finally {
    ctx = o;
    SK = ok;
  }
}
const V = { cw: 960, ch: 540, dpr: 1, z: 1, zb: 1, zm: 1, zt: 1, cx: 0, cy: 0, vw: 960, vh: 540 };
function resize() {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const w = Math.max(160, r.width), h = Math.max(120, r.height);
  const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  if (cv.width !== pw || cv.height !== ph) {
    cv.width = pw;
    cv.height = ph;
  }
  V.cw = w;
  V.ch = h;
  V.dpr = dpr;
  V.zb = Math.max(w / W, h / H);
  applyZoom();
}
function applyZoom() {
  V.z = V.zb * V.zm;
  V.vw = V.cw / V.z;
  V.vh = V.ch / V.z;
}
function stepZoom() {
  if (Math.abs(V.zt - V.zm) > 2e-3) {
    V.zm += (V.zt - V.zm) * 0.14;
    applyZoom();
  } else if (V.zm !== V.zt) {
    V.zm = V.zt;
    applyZoom();
  }
}
function fitZoom(bw, bh, reserve = 0) {
  const vw0 = V.cw / V.zb, vh0 = V.ch / V.zb;
  return clamp(Math.min((vh0 - reserve) / (bh + 30), vw0 / (bw + 30)), 1, 1.75);
}
function camTo(tx, ty, snap, ext = 0) {
  const a = clamp(tx - V.vw / 2, 0, Math.max(0, W - V.vw)), b = clamp(ty - V.vh / 2, 0, Math.max(0, H - V.vh) + ext);
  if (snap) {
    V.cx = a;
    V.cy = b;
  } else {
    V.cx = lerp(V.cx, a, 0.14);
    V.cy = lerp(V.cy, b, 0.14);
  }
  V.cx = clamp(V.cx, 0, Math.max(0, W - V.vw));
  V.cy = clamp(V.cy, 0, Math.max(0, H - V.vh) + ext);
}
function worldXY(e) {
  const r = cv.getBoundingClientRect();
  return { x: V.cx + (e.clientX - r.left) / V.z, y: V.cy + (e.clientY - r.top) / V.z };
}
function setWorldTransform() {
  const k = V.dpr * V.z;
  ctx.setTransform(k, 0, 0, k, -V.cx * k, -V.cy * k);
  SK = k;
}
function cleanName(s, fb = "Friend") {
  s = String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f-\u009f­​-‏‪-‮⁠-⁤﻿-]/g, "").replace(/\s+/g, " ").trim().slice(0, 12);
  return s || fb;
}
const SKINS = ["#f7d9bf", "#f2c4a0", "#e0a982", "#c98a62", "#a66a43", "#8a5636", "#6d4430", "#4a2e20"];
const HAIRC = ["#1d130e", "#4a3328", "#7a4a2a", "#c0502a", "#e07a2f", "#f0cf63", "#f58fb1", "#5cc6c0", "#9b7be8", "#cfcfd6"];
const HAIRS = ["puffs", "pigtails", "bun", "curly", "bob", "spiky", "braids", "afro", "quiff", "buzz"];
const HAIRN = ["Puffs", "Pigtails", "Bun", "Curly", "Bob", "Spiky", "Braids", "Afro", "Quiff", "Buzz cut"];
const PAL = ["#e8513f", "#f7a23b", "#f3c53d", "#8fcf6a", "#5cc6c0", "#4a90e2", "#9b7be8", "#f58fb1", "#fffdf6", "#4a3328"];
const OUTFITS = ["flower", "dots", "stripes", "plain", "gingham"];
const OUTN = ["Flowers", "Dots", "Stripes", "Plain", "Gingham"];
const HJP = ["plain", "dots", "flower"];
const HJN = ["Plain", "Dots", "Flowers"];
const SHOES = ["#e8513f", "#4a3328", "#4a90e2", "#fffdf6", "#f3c53d"];
const LOOKMAX = [8, 10, 10, 2, 10, 3, 5, 10, 5, 2, 10];
const DEFAULT_LOOK = { skin: 5, hs: 0, hc: 0, hijab: 0, hj: 5, hjp: 0, of: 0, oc: 2, sh: 0, cut: 0, pc: 5 };
const LOOKKEYS = ["skin", "hs", "hc", "hijab", "hj", "hjp", "of", "oc", "sh", "cut", "pc"];
const lookArr = (l) => LOOKKEYS.map((k) => l[k] | 0);
function lookFrom(a) {
  const l = { ...DEFAULT_LOOK };
  if (Array.isArray(a)) LOOKKEYS.forEach((k, i) => {
    const v = Number(a[i]);
    if (Number.isInteger(v) && v >= 0 && v < LOOKMAX[i]) l[k] = v;
  });
  return l;
}
const Save = {
  key: "upabout.v1",
  d: null,
  def() {
    return { v: 1, name: "", look: { ...DEFAULT_LOOK }, stats: { played: {}, won: {} }, lights: true, vol: 0.8, games: {}, visits: 0, seen: {} };
  },
  load() {
    let d = null;
    try {
      d = JSON.parse(localStorage.getItem(this.key) || "null");
    } catch (e) {
    }
    const s = this.def();
    if (d && typeof d === "object") {
      Object.assign(s, d);
      s.look = lookFrom(lookArr(Object.assign({}, DEFAULT_LOOK, d.look || {})));
      s.stats = Object.assign({ played: {}, won: {} }, d.stats || {});
      s.games = d.games && typeof d.games === "object" ? d.games : {};
      s.seen = d.seen || {};
    }
    this.d = s;
    return !!(d && d.name);
  },
  put() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.d));
    } catch (e) {
    }
  }
};
Save.d = Save.def();
let AC = null;
const getAC = () => {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
  } catch (e) {
  }
  return AC;
};
function tone(f, dur = 0.25, type = "sine", vol = 0.15, when = 0, slide = 0) {
  try {
    const a = getAC();
    if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + when;
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + dur);
    g.gain.setValueAtTime(1e-4, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch (e) {
  }
}
const sfx = {
  ding() {
    tone(880, 1, "sine", 0.16);
    tone(1320, 0.9, "sine", 0.07, 0.02);
  },
  click(i = 0) {
    tone(520 + i * 70, 0.09, "square", 0.05);
  },
  door() {
    tone(180, 0.5, "sawtooth", 0.04, 0, -90);
  },
  hum() {
    tone(70, 0.9, "triangle", 0.05);
  },
  dice() {
    for (let i = 0; i < 5; i++) tone(260 + rnd(200), 0.05, "square", 0.04, i * 0.07);
  },
  pop() {
    tone(420, 0.12, "sine", 0.1, 0, 200);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, "triangle", 0.12, i * 0.12));
  },
  boop() {
    tone(200, 0.2, "sine", 0.1, 0, -60);
  }
};
const INK = "#4a3328", LINE = "#2b1d16";
const rr = (x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};
const txt = (s, x, y, font, color, align = "center") => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
};
const F = (w, s) => `${w} ${s}px Gaegu, 'Patrick Hand', cursive`;
const N = (w, s) => `${w} ${s}px 'Patrick Hand', Gaegu, cursive`;
const PAT = {};
const PS = 3;
function mkPat(key, size, paint) {
  if (PAT[key]) return PAT[key];
  const c = document.createElement("canvas");
  c.width = c.height = size * PS;
  const g = c.getContext("2d");
  g.scale(PS, PS);
  paint(g, size);
  const p = ctx.createPattern(c, "repeat");
  try {
    p.setTransform(new DOMMatrix().scale(1 / PS));
  } catch (e) {
  }
  return PAT[key] = p;
}
const dotsP = (bg, fg, s = 26, r = 4) => mkPat("d" + bg + fg + s + r, s, (g, s2) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, s2, s2);
  g.fillStyle = fg;
  for (const [x, y] of [[0, 0], [s2, 0], [0, s2], [s2, s2], [s2 / 2, s2 / 2]]) {
    g.beginPath();
    g.arc(x, y, r, 0, 6.3);
    g.fill();
  }
});
const stripeP = (a, b, w = 22) => mkPat("s" + a + b + w, w * 2, (g, s) => {
  g.fillStyle = a;
  g.fillRect(0, 0, s, s);
  g.fillStyle = b;
  g.fillRect(0, 0, w, s);
});
const ginghamP = (a, b, s = 36) => mkPat("g" + a + b + s, s, (g, s2) => {
  g.fillStyle = a;
  g.fillRect(0, 0, s2, s2);
  g.globalAlpha = 0.4;
  g.fillStyle = b;
  g.fillRect(0, 0, s2 / 2, s2);
  g.fillRect(0, 0, s2, s2 / 2);
});
const flowerP = (bg, petal, mid) => mkPat("f" + bg + petal + mid, 60, (g, s) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, s, s);
  for (const [cx, cy] of [[30, 30], [0, 0], [60, 0], [0, 60], [60, 60]]) {
    g.fillStyle = petal;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.2566;
      g.beginPath();
      g.arc(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5, 4.4, 0, 6.3);
      g.fill();
    }
    g.fillStyle = mid;
    g.beginPath();
    g.arc(cx, cy, 3.2, 0, 6.3);
    g.fill();
  }
});
const blossomP = (bg, petal, mid, s = 14) => mkPat("bl" + bg + petal + mid + s, s, (g, s2) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, s2, s2);
  for (const [cx, cy] of [[s2 * 0.25, s2 * 0.25], [s2 * 0.75, s2 * 0.75]]) {
    g.fillStyle = petal;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.2566;
      g.beginPath();
      g.arc(cx + Math.cos(a) * 2.4, cy + Math.sin(a) * 2.4, 1.8, 0, 6.3);
      g.fill();
    }
    g.fillStyle = mid;
    g.beginPath();
    g.arc(cx, cy, 1.3, 0, 6.3);
    g.fill();
  }
});
const lumOf = (c) => {
  const n = parseInt(c.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
};
const bloomOn = (bg) => lumOf(bg) > 0.6 ? ["#e8513f", "#fffdf6"] : ["#fffdf6", "#f3c53d"];
const starP = (bg, fg) => mkPat("t" + bg + fg, 48, (g, s) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, s, s);
  g.fillStyle = fg;
  for (const [x, y, r] of [[12, 14, 3], [36, 34, 2.2], [40, 8, 1.6], [6, 40, 1.6]]) {
    g.beginPath();
    g.moveTo(x, y - r * 2);
    g.quadraticCurveTo(x, y, x + r * 2, y);
    g.quadraticCurveTo(x, y, x, y + r * 2);
    g.quadraticCurveTo(x, y, x - r * 2, y);
    g.quadraticCurveTo(x, y, x, y - r * 2);
    g.fill();
  }
});
const ringP = (bg, ring) => mkPat("r" + bg + ring, 56, (g, s) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, s, s);
  for (const [cx, cy] of [[28, 28], [0, 0], [56, 0], [0, 56], [56, 56]]) {
    g.fillStyle = ring;
    for (let i = 0; i < 12; i++) {
      const a = i * 0.5236;
      g.beginPath();
      g.arc(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, 3.6, 0, 6.3);
      g.fill();
    }
    g.beginPath();
    g.arc(cx, cy, 10, 0, 6.3);
    g.fill();
    g.fillStyle = "#2b1d16";
    g.beginPath();
    g.arc(cx, cy, 5.4, 0, 6.3);
    g.fill();
    g.fillStyle = "rgba(255,255,255,.55)";
    g.beginPath();
    g.arc(cx - 1.5, cy - 1.5, 1.4, 0, 6.3);
    g.fill();
  }
});
const scribbleP = (base, hi, lo) => mkPat("b" + base + hi + lo, 90, (g, s) => {
  g.fillStyle = base;
  g.fillRect(0, 0, s, s);
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = i % 2 ? hi : lo;
    g.globalAlpha = 0.35;
    g.lineWidth = 2 + Math.random() * 3;
    const x = Math.random() * s, y = Math.random() * s;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 8 + Math.random() * 16, y + (Math.random() - 0.5) * 5);
    g.stroke();
  }
});
const woodP = (base, line) => mkPat("w" + base + line, 48, (g, s) => {
  g.fillStyle = base;
  g.fillRect(0, 0, s, s);
  g.fillStyle = line;
  g.fillRect(0, 0, s, 2);
  g.fillRect(0, s / 2, s, 2);
  g.fillRect(10, 0, 2, s / 2);
  g.fillRect(34, s / 2, 2, s / 2);
});
let NOISE = null;
function getNoise() {
  if (NOISE) return NOISE;
  const c = document.createElement("canvas");
  c.width = c.height = 200;
  const g = c.getContext("2d");
  for (let i = 0; i < 1100; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.4)" : "rgba(120,80,50,.16)";
    g.fillRect(Math.random() * 200, Math.random() * 200, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
  }
  const p = ctx.createPattern(c, "repeat");
  try {
    p.setTransform(new DOMMatrix().scale(0.5));
  } catch (e) {
  }
  return NOISE = p;
}
function cast(fn) {
  ctx.save();
  ctx.shadowColor = "rgba(74,51,40,.32)";
  ctx.shadowOffsetX = 2 * SK;
  ctx.shadowOffsetY = 3 * SK;
  ctx.shadowBlur = 0;
  fn();
  ctx.restore();
}
const outline = (w = 1.6) => {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = w;
  ctx.lineJoin = "round";
  ctx.stroke();
};
function paper(x, y, w, h, r, fill) {
  cast(() => {
    rr(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  });
  rr(x, y, w, h, r);
  outline();
}
function blob(cx, cy, rx, ry, fill, line = true) {
  cast(() => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.3);
    ctx.fillStyle = fill;
    ctx.fill();
  });
  if (line) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.3);
    outline();
  }
}
function stitch(x, y, w, h, r, col = "rgba(255,255,255,.9)") {
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.6;
  rr(x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 3));
  ctx.stroke();
  ctx.restore();
}
function labelTag(text, cx, cy, w, h, fill, rot, font, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  paper(-w / 2, -h / 2, w, h, 14, fill);
  stitch(-w / 2, -h / 2, w, h, 14);
  if (text) txt(text, 0, 3, font, color);
  ctx.restore();
}
function bunting(cols, y = 6, sag = 14, count = 22) {
  ctx.save();
  ctx.strokeStyle = "rgba(74,51,40,.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.quadraticCurveTo(W / 2, y + sag * 2, W, y);
  ctx.stroke();
  const p = (t) => [2 * (1 - t) * t * (W / 2) + t * t * W, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag * 2) + t * t * y];
  for (let i = 0; i < count; i++) {
    const a = p((i + 0.15) / count), b = p((i + 0.85) / count), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 22];
    cast(() => {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(m[0], m[1]);
      ctx.closePath();
      ctx.fillStyle = cols[i % cols.length];
      ctx.fill();
    });
  }
  ctx.restore();
}
function wallpaper(pat) {
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, 120);
  ctx.fillStyle = "#fffdf6";
  ctx.fillRect(0, 118, W, 14);
  ctx.strokeStyle = "rgba(43,29,22,.55)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 118);
  ctx.lineTo(W, 118);
  ctx.moveTo(0, 132);
  ctx.lineTo(W, 132);
  ctx.stroke();
  const g = ctx.createLinearGradient(0, 0, 0, 26);
  g.addColorStop(0, "rgba(43,29,22,.25)");
  g.addColorStop(1, "rgba(43,29,22,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 26);
}
function floorFill(pat) {
  ctx.fillStyle = pat;
  ctx.fillRect(0, 133, W, H - 133);
  const g = ctx.createLinearGradient(0, 133, 0, 155);
  g.addColorStop(0, "rgba(43,29,22,.3)");
  g.addColorStop(1, "rgba(43,29,22,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 133, W, 22);
}
function wrapText(s, n) {
  const out = [];
  let line = "";
  for (const w of s.split(" ")) {
    if ((line + " " + w).trim().length > n) {
      out.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}
function bubble(text, cx, by) {
  ctx.font = N(400, 16);
  const L = wrapText(text, 32), w = Math.max(...L.map((l) => ctx.measureText(l).width)) + 30, h = L.length * 20 + 16;
  cast(() => {
    rr(cx - w / 2, by - h, w, h, 16);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });
  rr(cx - w / 2, by - h, w, h, 16);
  outline();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(cx - 8, by - 1);
  ctx.lineTo(cx + 8, by - 1);
  ctx.lineTo(cx - 2, by + 11);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 8, by);
  ctx.lineTo(cx - 2, by + 11);
  ctx.lineTo(cx + 8, by);
  ctx.stroke();
  L.forEach((l, i) => txt(l, cx, by - h + 17 + i * 20, N(400, 16), INK));
}
function wob(cx, cy, rx, ry, seed = 1, n = 30) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * TAU, k = 1 + 0.03 * Math.sin(a * 3 + seed) + 0.018 * Math.sin(a * 5 + seed * 2.3), x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function inked(fill, w = 1.6) {
  ctx.fillStyle = fill;
  ctx.fill();
  outline(w);
}
function limb(x1, y1, x2, y2, col, w = 3.2) {
  ctx.lineCap = "round";
  ctx.strokeStyle = LINE;
  ctx.lineWidth = w + 2.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function hand(x, y, skin) {
  ctx.beginPath();
  ctx.arc(x, y, 2.8, 0, 6.3);
  inked(skin, 1.2);
}
function chair(x, y, c) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (const dx of [-13, 13]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y + 4);
    ctx.lineTo(x + dx * 1.2, y + 24);
    ctx.stroke();
  }
  cast(() => {
    rr(x - 18, y - 22, 36, 28, 12);
    ctx.fillStyle = "#fffdf6";
    ctx.fill();
  });
  rr(x - 18, y - 22, 36, 28, 12);
  outline();
  rr(x - 13, y - 18, 26, 20, 9);
  ctx.fillStyle = c;
  ctx.fill();
}
function chairBack(x, y) {
  ctx.fillStyle = "#fffdf6";
  rr(x - 20, y + 4, 40, 14, 6);
  ctx.fill();
  outline(1.6);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.4;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 5.5, y + 6);
    ctx.lineTo(x + i * 5.5, y + 16);
    ctx.stroke();
  }
}
function plant(x, y) {
  blob(x + 20, y + 44, 22, 6, "rgba(74,51,40,.18)", false);
  const leaves = [["#4fa84f", -1, -3], ["#6cc06a", 1, -3], ["#3f9444", -0.5, -12], ["#7fd27a", 0.6, -12], ["#58b658", 0, -18]];
  for (const [c, dx, dy] of leaves) {
    ctx.save();
    ctx.translate(x + 20 + dx * 8, y + 8 + dy);
    ctx.rotate(dx * 0.5);
    blob(0, 0, 6.5, 14, c);
    ctx.restore();
  }
  cast(() => {
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 20);
    ctx.lineTo(x + 33, y + 20);
    ctx.lineTo(x + 29, y + 44);
    ctx.lineTo(x + 11, y + 44);
    ctx.closePath();
    ctx.fillStyle = "#e0894e";
    ctx.fill();
  });
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 20);
  ctx.lineTo(x + 33, y + 20);
  ctx.lineTo(x + 29, y + 44);
  ctx.lineTo(x + 11, y + 44);
  ctx.closePath();
  outline();
  rr(x + 5, y + 18, 30, 6, 3);
  ctx.fillStyle = "#f0a86e";
  ctx.fill();
  outline(1.3);
}
function cat(x, y, sleeping) {
  blob(x, y, 26, 13, "#f7a23b");
  blob(x - 20, y - 4, 10, 9, "#f7a23b");
  ctx.fillStyle = "#f7a23b";
  ctx.beginPath();
  ctx.moveTo(x - 27, y - 9);
  ctx.lineTo(x - 24, y - 17);
  ctx.lineTo(x - 19, y - 11);
  ctx.moveTo(x - 17, y - 11);
  ctx.lineTo(x - 13, y - 17);
  ctx.lineTo(x - 11, y - 9);
  ctx.fill();
  outline(1.3);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x + 16, y + 2, 13, 3.4, 5.6);
  ctx.stroke();
  ctx.strokeStyle = "#f7a23b";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(x - 23, y - 4, 2, 0, 3.1);
  ctx.arc(x - 16, y - 4, 2, 0, 3.1);
  ctx.stroke();
  txt("z", x - 6, y - 24 + Math.sin(S.t * 2) * 2, F(700, 16), "#8a6a58");
}
const CHEEK = (i) => i < 3 ? "rgba(226,120,92,.5)" : i < 5 ? "rgba(170,80,50,.45)" : "rgba(120,50,35,.55)";
const TIGHTS = ["#5cc6c0", "#e8513f", "#fff3e0", "#f58fb1", "#f3c53d"];
const LOOKC = {};
function lookOpts(l) {
  const k = lookArr(l).join(",");
  if (LOOKC[k]) return LOOKC[k];
  const oc = PAL[l.oc];
  let dress;
  switch (OUTFITS[l.of]) {
    case "flower": {
      const [pt, md] = bloomOn(oc);
      dress = blossomP(oc, pt, md);
      break;
    }
    case "dots":
      dress = dotsP(oc, "#fffdf6", 18, 3);
      break;
    case "stripes":
      dress = stripeP(oc, "#fffdf6", 7);
      break;
    case "gingham":
      dress = ginghamP(oc, "#fffdf6", 18);
      break;
    default:
      dress = oc;
  }
  const hc = PAL[l.hj];
  let hp;
  switch (HJP[l.hjp]) {
    case "dots":
      hp = dotsP(hc, "#fffdf6", 16, 2.4);
      break;
    case "flower": {
      const [pt, md] = bloomOn(hc);
      hp = blossomP(hc, pt, md);
      break;
    }
    default:
      hp = hc;
  }
  return LOOKC[k] = { skin: SKINS[l.skin], cheek: CHEEK(l.skin), hair: HAIRC[l.hc], style: HAIRS[l.hs], dress, hijab: !!l.hijab, hjCol: hp, shoe: SHOES[l.sh], tights: TIGHTS[l.sh], boy: l.cut === 1, pants: PAL[l.pc] };
}
const NPC = {
  reception: { ...DEFAULT_LOOK, skin: 4, hs: 2, hc: 0, of: 0, oc: 1, sh: 1, hijab: 0 },
  poppy: { ...DEFAULT_LOOK, skin: 2, hs: 3, hc: 5, of: 1, oc: 7, sh: 0 },
  mira: { ...DEFAULT_LOOK, skin: 3, hs: 1, hc: 2, of: 3, oc: 5, sh: 2 },
  theo: { ...DEFAULT_LOOK, skin: 6, hs: 5, hc: 0, of: 2, oc: 3, sh: 1, cut: 1, pc: 9 },
  juno: { ...DEFAULT_LOOK, skin: 1, hs: 3, hc: 1, of: 0, oc: 2, sh: 3 },
  pip: { ...DEFAULT_LOOK, skin: 2, hs: 0, hc: 3, of: 4, oc: 4, sh: 4, cut: 1, pc: 5 },
  ava: { ...DEFAULT_LOOK, skin: 1, hs: 1, hc: 1, of: 1, oc: 0 },
  leo: { ...DEFAULT_LOOK, skin: 5, hs: 5, hc: 0, of: 3, oc: 4, cut: 1, pc: 6 },
  zoe: { ...DEFAULT_LOOK, skin: 0, hs: 2, hc: 4, of: 0, oc: 2, hijab: 0 },
  max: { ...DEFAULT_LOOK, skin: 7, hs: 5, hc: 0, of: 2, oc: 6, cut: 1, pc: 9 },
  ivy: { ...DEFAULT_LOOK, skin: 5, hs: 0, hc: 0, of: 4, oc: 3 },
  sam: { ...DEFAULT_LOOK, skin: 2, hs: 4, hc: 3, of: 1, oc: 1 },
  noor: { ...DEFAULT_LOOK, skin: 3, hijab: 1, hj: 4, hjp: 1, of: 3, oc: 7, sh: 3 },
  aj: { ...DEFAULT_LOOK, skin: 6, hs: 8, hc: 0, of: 2, oc: 3, sh: 1, cut: 1, pc: 5 }
};
let LOOK = { ...DEFAULT_LOOK };
function drawHead(P, hy, face, seed, o) {
  const wear = P.hijab, hair = P.hair, style = P.style;
  if (!wear) {
    if (style === "puffs") {
      for (const s of [-1, 1]) {
        wob(s * 12, hy - 10, 8.5, 8.5, seed + s);
        inked(hair);
      }
    } else if (style === "pigtails") {
      for (const s of [-1, 1]) {
        wob(s * 16, hy + 3, 5.5, 7, seed + s);
        inked(hair);
      }
    } else if (style === "bob") {
      wob(0, hy + 1.5, 16.8, 17, seed);
      inked(hair);
    } else if (style === "bun") {
      wob(0, hy - 16, 6.5, 6.5, seed);
      inked(hair);
    } else if (style === "curly") {
      for (let i = 0; i < 9; i++) {
        const a = i * 0.698;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 13, hy + Math.sin(a) * 13, 5.6, 0, 6.3);
        inked(hair, 1.3);
      }
    } else if (style === "braids") {
      for (const s of [-1, 1]) {
        for (let j = 0; j < 4; j++) {
          wob(s * 14, hy + 6 + j * 6.5, 4, 4.4, seed + j);
          inked(hair, 1.3);
        }
      }
    } else if (style === "afro") {
      wob(0, hy - 5, 21.5, 20.5, seed);
      inked(hair);
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(-15.5, hy + 2);
    ctx.bezierCurveTo(-18, hy - 21, 18, hy - 21, 15.5, hy + 2);
    ctx.bezierCurveTo(17, hy + 12, 16, hy + 19, 14.5, hy + 24);
    ctx.quadraticCurveTo(0, hy + 32, -14.5, hy + 24);
    ctx.bezierCurveTo(-16, hy + 19, -17, hy + 12, -15.5, hy + 2);
    ctx.closePath();
    inked(P.hjCol, 1.6);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-11, hy + 20);
    ctx.quadraticCurveTo(-4, hy + 25, 2, hy + 27);
    ctx.moveTo(11, hy + 19);
    ctx.quadraticCurveTo(5, hy + 25, 0, hy + 28);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  wob(0, hy + (wear ? 1.5 : 0), wear ? 11.4 : 14, wear ? 12.8 : 15.5, seed + 3);
  inked(P.skin);
  ctx.fillStyle = P.cheek;
  ctx.beginPath();
  ctx.arc(-8, hy + 6, wear ? 3.6 : 4.4, 0, 6.3);
  ctx.arc(8, hy + 6, wear ? 3.6 : 4.4, 0, 6.3);
  ctx.fill();
  if (face === "n") {
    if (wear) {
      wob(0, hy - 1, 12.6, 13, seed + 5);
      inked(P.hjCol);
    } else {
      wob(0, hy, 14.7, 16, seed + 5);
      inked(hair);
    }
  } else {
    if (wear) {
      ctx.beginPath();
      ctx.ellipse(0, hy + 1.5, 13.4, 14.6, 0, Math.PI * 1.04, Math.PI * 1.96);
      ctx.ellipse(0, hy + 2.5, 10.6, 11.6, 0, Math.PI * 1.96, Math.PI * 1.04, true);
      ctx.closePath();
      inked(P.hjCol, 1.5);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, hy + 2.5, 10.6, 11.6, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    } else {
      const tall = style === "bob";
      if (style === "buzz") {
        ctx.beginPath();
        ctx.ellipse(0, hy - 4.5, 14.3, 7.4, 0, Math.PI, 0);
        ctx.closePath();
        inked(hair, 1.4);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, hy - (tall ? 5 : style === "afro" ? 8 : 7), style === "afro" ? 15.6 : 14.7, tall ? 11 : style === "afro" ? 10.5 : 9.2, 0, Math.PI, 0);
        ctx.closePath();
        inked(hair, 1.5);
      }
      if (style === "quiff") {
        ctx.beginPath();
        ctx.moveTo(-14, hy - 8);
        ctx.bezierCurveTo(-17, hy - 25, 7, hy - 31, 17, hy - 13);
        ctx.bezierCurveTo(8, hy - 19, -4, hy - 14, -14, hy - 8);
        ctx.closePath();
        inked(hair, 1.5);
      }
      if (style === "spiky") {
        for (const sx of [-9, -3, 3, 9]) {
          ctx.beginPath();
          ctx.moveTo(sx - 4, hy - 9);
          ctx.lineTo(sx, hy - 19);
          ctx.lineTo(sx + 4, hy - 9);
          inked(hair, 1.3);
        }
      }
      if (tall) {
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-9, hy - 12);
        ctx.lineTo(7, hy - 3);
        ctx.moveTo(-3, hy - 14);
        ctx.lineTo(10, hy - 5);
        ctx.stroke();
      }
    }
    const dx = face === "l" ? -3 : face === "r" ? 3 : 0, px = face === "l" ? -2.4 : face === "r" ? 2.4 : 1.4, py = face === "s" ? -0.4 : 0;
    for (const e of [-1, 1]) {
      const ex = e * 6 + dx, ey = hy - 0.5;
      if (o && o.sleep) {
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(ex, ey - 1.5, 4.2, 0.18 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(ex, ey, 5.1, 3.7, e * 0.12, 0, 6.3);
      inked("#fff", 1.3);
      ctx.fillStyle = "#14100d";
      ctx.beginPath();
      ctx.arc(ex + px, ey + py, 2.3, 0, 6.3);
      ctx.fill();
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ex - 5.4, ey - 1);
      ctx.quadraticCurveTo(ex, ey - 5.2, ex + 5.4, ey - 1.2);
      ctx.stroke();
    }
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(dx - 2.8, hy + 6);
    ctx.quadraticCurveTo(dx - 1.4, hy + 9.4, dx, hy + 6.6);
    ctx.quadraticCurveTo(dx + 1.4, hy + 9.4, dx + 2.8, hy + 6);
    ctx.moveTo(dx - 2.4, hy + 11);
    ctx.quadraticCurveTo(dx, hy + 13, dx + 2.4, hy + 11);
    ctx.stroke();
  }
  if (!wear && style === "puffs") {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * 12, hy - 5.5, 2.6, 0, 6.3);
      inked("#f7a23b", 1.1);
    }
  }
  if (!wear && style === "pigtails") {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * 13, hy - 1, 2.4, 0, 6.3);
      inked("#e8513f", 1.1);
    }
  }
  if (o && o.crown) {
    const cy = hy - (wear ? 18 : 20);
    ctx.beginPath();
    ctx.moveTo(-8, cy + 7);
    ctx.lineTo(-8, cy);
    ctx.lineTo(-4, cy + 4);
    ctx.lineTo(0, cy - 3);
    ctx.lineTo(4, cy + 4);
    ctx.lineTo(8, cy);
    ctx.lineTo(8, cy + 7);
    ctx.closePath();
    inked("#f3c53d", 1.3);
  }
}
function person(x, y, o = {}) {
  const t = S.t, seated = !!o.seated, face = o.face || "s", bob = o.bob || 0, sw = o.walk ? Math.sin(t * 14) : 0, sc = o.sc || 1.3;
  const P = Object.assign({}, o.look ? lookOpts(o.look) : lookOpts(NPC.reception), o);
  if (o.team) {
    P.dress = o.team;
  }
  const seed = (o.name || "x").length * 1.7 + (o.seed || 0);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.fillStyle = "rgba(74,51,40,.22)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 5, 0, 0, 6.3);
  ctx.fill();
  if (!seated) {
    const lc = P.boy ? P.pants : P.tights;
    limb(-4, -13, -4 - sw * 2.5, -3, lc, 2.8);
    limb(4, -13, 4 + sw * 2.5, -3, lc, 2.8);
    for (const sx of [-4 - sw * 2.5, 4 + sw * 2.5]) {
      ctx.beginPath();
      ctx.ellipse(sx, -1.5, 5.5, 3, 0, 0, 6.3);
      inked(P.shoe, 1.2);
    }
  }
  let hl, hr;
  if (o.arms) {
    hl = [-18, -50 + bob + Math.sin(t * 9) * 3];
    hr = [18, -50 + bob + Math.cos(t * 9) * 3];
  } else {
    hl = [-12.5, -14 + bob + sw * 3];
    hr = [12.5, -14 + bob - sw * 3];
  }
  limb(-8, -27 + bob, hl[0], hl[1], P.skin, 2.8);
  limb(8, -27 + bob, hr[0], hr[1], P.skin, 2.8);
  hand(hl[0], hl[1], P.skin);
  hand(hr[0], hr[1], P.skin);
  const body = () => {
    ctx.beginPath();
    if (P.boy) {
      ctx.moveTo(-8, -31 + bob);
      ctx.lineTo(8, -31 + bob);
      ctx.lineTo(9, -12);
      ctx.lineTo(-9, -12);
    } else {
      ctx.moveTo(-8, -31 + bob);
      ctx.lineTo(8, -31 + bob);
      ctx.lineTo(13.5, -11);
      ctx.quadraticCurveTo(0, -8, -13.5, -11);
    }
    ctx.closePath();
  };
  cast(() => {
    body();
    ctx.fillStyle = P.dress;
    ctx.fill();
  });
  body();
  outline(1.5);
  if (P.boy && seated === false) {
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(9, -12);
    ctx.lineTo(9, -9);
    ctx.lineTo(-9, -9);
    ctx.closePath();
    inked(P.pants, 1.2);
  }
  if (!P.hijab) {
    ctx.beginPath();
    ctx.moveTo(-4.5, -31 + bob);
    ctx.lineTo(0, -26 + bob);
    ctx.lineTo(4.5, -31 + bob);
    ctx.closePath();
    inked("#fffdf6", 1.2);
  }
  drawHead(P, -43 + bob, face, seed, o);
  if (o.name) {
    ctx.font = N(400, 13);
    const w = ctx.measureText(o.name).width + 16;
    cast(() => {
      rr(-w / 2, 8, w, 17, 8.5);
      ctx.fillStyle = "#fff";
      ctx.fill();
    });
    rr(-w / 2, 8, w, 17, 8.5);
    outline(1.1);
    txt(o.name, 0, 16.5, N(400, 13), INK);
  }
  ctx.restore();
}
function avatarCanvas(look, size = 44) {
  const c = document.createElement("canvas");
  const d = 2;
  c.width = size * d;
  c.height = size * d;
  c.style.width = size + "px";
  c.style.height = size + "px";
  paintAvatar(c, look, size);
  return c;
}
function paintAvatar(c, look, size) {
  const g = c.getContext("2d"), d = c.width / size;
  g.setTransform(d, 0, 0, d, 0, 0);
  g.clearRect(0, 0, size, size);
  withCtx(g, d, () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#bfe8f6";
    ctx.fillRect(0, 0, size, size);
    const k = size / 300;
    person(size / 2, 418 * k, { look, sc: 6.1 * k, face: "s", name: null, arms: false });
    ctx.restore();
  });
}
