function setHud(html) {
  const h = $("hudbar");
  h.innerHTML = html;
  h.hidden = !html;
  h.classList.add("low");
}
const seatChip = (s, i, on, sub) => `<span class="seat${on ? " on" : ""}" style="padding:2px 10px 2px 6px"><i style="width:14px;height:14px;border-radius:50%;background:${SEATC[i]};border:2px solid #4a3328;display:inline-block;flex:none"></i><span>${escapeHTML(s.u === MY() ? "You" : s.n)}${sub ? ` <small>${sub}</small>` : ""}</span></span>`;
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const dieHTML = (v, cls = "") => `<span class="pipd ${cls}" aria-label="Dice shows ${v}">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<i${(PIPS[v] || []).includes(i) ? ' class="on"' : ""}></i>`).join("")}</span>`;
const DI = { t: 99, dur: 0.95, vals: [1], x: 0, y: 0, seed: 0, shown: false, game: null };
function rollDice(game, vals, x, y) {
  DI.game = game;
  DI.vals = vals.slice();
  DI.x = x;
  DI.y = y;
  DI.t = 0;
  DI.shown = true;
  DI.seed = Math.floor(Math.random() * 50);
  sfx.dice();
}
const diceBusy = () => DI.t < DI.dur;
function drawDie(x, y, sz, v, rot, lift) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(74,51,40,.28)";
  ctx.beginPath();
  ctx.ellipse(0, sz * 0.5, sz * 0.52 * (1 - Math.min(lift, 40) * 6e-3), sz * 0.18, 0, 0, 6.3);
  ctx.fill();
  ctx.translate(0, -lift);
  ctx.rotate(rot);
  cast(() => {
    rr(-sz / 2, -sz / 2, sz, sz, sz * 0.22);
    ctx.fillStyle = "#fffdf6";
    ctx.fill();
  });
  rr(-sz / 2, -sz / 2, sz, sz, sz * 0.22);
  outline(1.6);
  const p = sz * 0.27;
  ctx.fillStyle = INK;
  for (const i of PIPS[v]) {
    ctx.beginPath();
    ctx.arc((i % 3 - 1) * p, ((i / 3 | 0) - 1) * p, sz * 0.085, 0, 6.3);
    ctx.fill();
  }
  ctx.restore();
}
function drawDiceWorld() {
  if (!DI.shown) return;
  const n = DI.vals.length, rolling = DI.t < DI.dur, k = clamp(DI.t / DI.dur, 0, 1);
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * 44;
    let v = DI.vals[i], rot = 0, lift = 0, dx = 0, dy = 0;
    if (rolling) {
      const f = Math.floor(DI.t * 13 + i * 3 + DI.seed);
      v = 1 + (f * 5 + i * 2 + DI.seed) % 6;
      const e = 1 - k;
      rot = e * (DI.t * 9 * (i ? 1 : -1)) + Math.sin(DI.t * 17 + i) * 0.25 * e;
      lift = Math.abs(Math.sin(k * Math.PI * 3.2)) * e * 44;
      dx = e * (i ? 30 : -30) * Math.cos(DI.t * 8 + i);
      dy = e * 12 * Math.sin(DI.t * 6 + i);
    }
    drawDie(DI.x + off + dx, DI.y + dy, 34, v, rot, lift);
  }
}
const mkAnim = (segs) => ({ segs, i: 0, t: 0 });
const animBusy = (a) => !!a && a.i < a.segs.length;
function stepAnim(a, dt) {
  if (!animBusy(a)) return false;
  a.t += dt;
  while (a.i < a.segs.length && a.t >= a.segs[a.i].dur) {
    const sg = a.segs[a.i];
    a.t -= sg.dur;
    if (sg.k === "hop") tone(280 + a.i % 14 * 22, 0.07, "square", 0.03);
    else if (sg.k === "climb") tone(560, 0.15, "triangle", 0.06, 0, 260);
    else if (sg.k === "slide") tone(520, 0.25, "sawtooth", 0.04, 0, -380);
    a.i++;
  }
  return !animBusy(a);
}
function animNow(a) {
  const sg = a.segs[a.i], k = clamp(a.t / sg.dur, 0, 1);
  if (sg.k === "hop") return { x: lerp(sg.a[0], sg.b[0], k), y: lerp(sg.a[1], sg.b[1], k), h: Math.sin(k * Math.PI) * (sg.h || 8), pose: "walk", rot: 0 };
  if (sg.k === "climb") return { x: lerp(sg.a[0], sg.b[0], k), y: lerp(sg.a[1], sg.b[1], k), h: 0, pose: "climb", rot: 0, sway: Math.sin(k * Math.PI * sg.dur * 2.2) };
  if (sg.k === "slide") {
    const pts = sg.pts, f = k * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), u = f - i;
    return { x: lerp(pts[i][0], pts[i + 1][0], u), y: lerp(pts[i][1], pts[i + 1][1], u), h: 0, pose: "slide", rot: k * Math.PI * 3 };
  }
  if (sg.k === "pause") return { x: sg.a[0], y: sg.a[1], h: 0, pose: "oops", rot: 0, sway: Math.sin(a.t * 38) };
  return { x: sg.a[0], y: sg.a[1], h: 0, pose: "idle", rot: 0 };
}
function drawToken(seatObj, i, pos, sc, me, win) {
  const look = lookFrom(seatObj.l), pose = pos.pose;
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 2, 15 * sc / 0.66, 5.5 * sc / 0.66, 0, 0, 6.3);
  ctx.fillStyle = SEATC[i];
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.save();
  ctx.translate(pos.x + (pos.sway && pose === "oops" ? pos.sway * 2.5 : 0), pos.y + 4 - (pos.h || 0));
  if (pos.rot) {
    ctx.translate(0, -22 * sc);
    ctx.rotate(pos.rot);
    ctx.translate(0, 22 * sc);
  }
  person(0, 0, { look, sc, face: pose === "climb" ? "n" : "s", team: SEATC[i], walk: pose === "walk" || pose === "climb", arms: pose === "climb" || pose === "slide" || !!win, bob: pose === "oops" ? -1.5 : 0, crown: !!win });
  ctx.restore();
  if (me) {
    txt("\u25BC", pos.x, pos.y - 52 * sc / 0.66 - 4 - (pos.h || 0) + Math.sin(S.t * 5) * 2, F(700, 16), SEATC[i]);
  }
}
const OFF = [[-10, -9], [10, -9], [-10, 8], [10, 8]];
function inworldHud(k, extra, sub) {
  const s = Sess.get(k), d = GK[k];
  if (!s) {
    let h2 = `<span class="msg"><b>${d.name}</b></span>`;
    for (let n = d.min; n <= d.max; n++) h2 += `<button class="btn ${n === d.min ? "solid " : ""}small" data-h="new" data-n="${n}" type="button">${n} players</button>`;
    if (Save.d.games[k]) h2 += '<button class="btn sky small" data-h="resume" type="button">Continue saved</button>';
    return h2 + '<button class="btn small" data-h="leave" type="button">Back</button>';
  }
  const t = d.over(s.st) ? -1 : d.turn(s.st);
  let h = s.seats.map((x, i) => seatChip(x, i, i === t, sub ? sub(i) : "")).join("");
  if (extra) h += extra;
  else h += `<span class="msg">${banner(k, s)}</span>`;
  h += '<button class="btn small" data-h="again" type="button">New game</button><button class="btn small" data-h="leave" type="button">Back</button>';
  return h;
}
$("hudbar").addEventListener("click", (e) => {
  const t = e.target.closest("[data-h]");
  if (!t) return;
  const a = t.dataset.h, k = G.cur;
  if (!k || !GK[k]) return;
  if (a === "new") {
    Sess.create(k, +t.dataset.n || 2);
    sfx.click();
  } else if (a === "resume") {
    const sv = Save.d.games[k];
    if (sv) Sess.create(k, sv.n, sv.st);
  } else if (a === "again") {
    const s = Sess.get(k);
    if (s) Sess.restart(k);
  } else if (a === "leave") G.stand();
  else if (a === "roll") G.boardRoll();
  else if (a === "mv") {
    Sess.move(k, { a: t.dataset.v });
    sfx.click(2);
  }
});
G.boardRoll = function() {
  const k = G.cur;
  if (k !== "snakes" && k !== "mono") return;
  const s = Sess.get(k);
  if (!s) return;
  const me = Sess.mySeat(k), d = GK[k];
  if (me < 0 || d.over(s.st) || d.turn(s.st) !== me || boardBusy(k)) return;
  if (k === "mono" && s.st.ph !== "roll") return;
  Sess.move(k, { a: "roll" });
};
const boardBusy = (k) => diceBusy() || (k === "snakes" ? Object.values(SLA).some(animBusy) : Object.values(MNA).some(animBusy));
const SL = { bx: 76, by: 152, cs: 34 };
const LADD = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };
const SNAK = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };
const slXY = (n) => {
  const i = n - 1, row = Math.floor(i / 10), col = row % 2 === 0 ? i % 10 : 9 - i % 10;
  return [SL.bx + col * SL.cs + SL.cs / 2, SL.by + (9 - row) * SL.cs + SL.cs / 2];
};
const slPad = (sd) => [SL.bx - 30 + sd * 14, SL.by + SL.cs * 10 + 24];
const SNC = ["#5cc6c0", "#8fcf6a", "#9b7be8", "#f58fb1"];
const SNPTS = {};
function snakePts(a) {
  if (SNPTS[a]) return SNPTS[a];
  const [x1, y1] = slXY(+a), [x2, y2] = slXY(SNAK[a]), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, w = Math.sin(t * Math.PI * 3) * 10 * (1 - t * 0.3);
    pts.push([x1 + dx * t + nx * w, y1 + dy * t + ny * w]);
  }
  return SNPTS[a] = pts;
}
GK.snakes = {
  name: "Snakes & Ladders",
  min: 2,
  max: 4,
  blurb: "Roll the dice. Climb ladders, slide down snakes.",
  delay(st) {
    const m = st.mv;
    if (!m) return 900;
    const hops = Math.max(0, m.l - m.f);
    return 900 + 950 + hops * 200 + (m.e > m.l ? 1700 : m.e < m.l ? 2300 : 0) + 500;
  },
  init: (n) => ({ p: Array(n).fill(0), t: 0, w: -1, d: 0, m: "Roll the dice!", mv: null, q: 0 }),
  turn: (st) => st.t,
  over: (st) => st.w >= 0,
  winner: (st) => st.w,
  apply(st, seat, mv) {
    if (st.w >= 0 || st.t !== seat || !mv || mv.a !== "roll") return null;
    const s = clone(st), d = 1 + rnd(6), from = s.p[seat];
    let np = from + d, end = np;
    s.d = d;
    s.q++;
    let msg = `Rolled ${d}.`;
    if (np > 100) {
      np = from;
      end = from;
      msg += " Need an exact roll to finish.";
    } else {
      if (LADD[np]) {
        end = LADD[np];
        msg += " A ladder! Up you climb.";
      } else if (SNAK[np]) {
        end = SNAK[np];
        msg += " A snake! Wheee, down you go.";
      }
    }
    s.p[seat] = end;
    s.mv = { s: seat, f: from, l: np > 100 ? from : np, e: end, id: s.q, d };
    s.m = msg;
    if (end === 100) {
      s.w = seat;
      s.m = "Home at 100!";
    } else if (d !== 6) s.t = (seat + 1) % s.p.length;
    else s.m += " A six: roll again!";
    return s;
  },
  cpu() {
    return { a: "roll" };
  },
  render() {
    G.refreshHud && G.refreshHud();
  }
};
const SLA = {}, SLS = { s: null, id: 0 };
function slSync(s) {
  if (SLS.s !== s) {
    SLS.s = s;
    SLS.id = s.st.mv ? s.st.mv.id : 0;
    for (const k in SLA) delete SLA[k];
    return;
  }
  const m = s.st.mv;
  if (!m) {
    SLS.id = 0;
    return;
  }
  if (m.id < SLS.id) {
    SLS.id = 0;
  }
  if (m.id === SLS.id) return;
  SLS.id = m.id;
  const segs = [], start = m.f === 0 ? slPad(m.s) : slXY(m.f);
  let cur = start;
  segs.push({ k: "wait", dur: 0.98, a: start });
  for (let c = m.f + 1; c <= m.l; c++) {
    const nx = slXY(c);
    segs.push({ k: "hop", a: cur, b: nx, dur: 0.2, h: 8 });
    cur = nx;
  }
  if (m.e !== m.l) {
    segs.push({ k: "pause", dur: 0.5, a: cur });
    if (m.e > m.l) {
      const to = slXY(m.e);
      segs.push({ k: "climb", a: cur, b: to, dur: clamp(Math.hypot(to[0] - cur[0], to[1] - cur[1]) / 70, 1.1, 2.6) });
      cur = to;
    } else {
      segs.push({ k: "slide", pts: snakePts(m.l), dur: 1.7 });
      cur = slXY(m.e);
    }
  }
  segs.push({ k: "wait", dur: 1e-4, a: cur });
  SLA[m.s] = mkAnim(segs);
  rollDice("snakes", [m.d || 1], SL.bx + SL.cs * 10 + 42, SL.by + SL.cs * 5);
  G.refreshHud && G.refreshHud();
}
G.snakes = {
  cam: () => ({ x: SL.bx + SL.cs * 5, y: SL.by + SL.cs * 5, w: SL.cs * 10 + 30, h: SL.cs * 10 + 10 }),
  spots() {
    return [{ x: SL.bx - 22, y: SL.by + SL.cs * 10 - 12, r: 70, label: "play Snakes & Ladders", key: "sl1", area: [SL.bx - 12, SL.by - 6, SL.cs * 10 + 24, SL.cs * 10 + 14], hit: [SL.bx - 40, SL.by, SL.cs * 10 + 40, SL.cs * 10], fn: () => G.open("snakes") }];
  },
  hidesMe: () => Sess.mySeat("snakes") >= 0,
  update(dt) {
    let fin = false;
    for (const k in SLA) if (stepAnim(SLA[k], dt)) fin = true;
    const wasD = diceBusy();
    if (DI.t < DI.dur + 1) DI.t += dt;
    if (fin || wasD && !diceBusy() && DI.game === "snakes") G.refreshHud && G.refreshHud();
  },
  drawWorld() {
    const bx = SL.bx, by = SL.by, cs = SL.cs, s = Sess.get("snakes");
    labelTag("", bx + cs * 5 - 20, 70, 250, 58, "#fffdf6", -0.02, F(700, 26), INK);
    txt("Snakes & Ladders", bx + cs * 5 - 20, 62, F(700, 26), INK);
    txt(s ? "a game is on, press E to roll" : "walk onto the board and press E", bx + cs * 5 - 20, 84, N(400, 13), "#8a6a58");
    cast(() => {
      rr(bx - 10, by - 10, cs * 10 + 20, cs * 10 + 20, 12);
      ctx.fillStyle = "#fffdf6";
      ctx.fill();
    });
    rr(bx - 10, by - 10, cs * 10 + 20, cs * 10 + 20, 12);
    outline();
    const cols = ["#f58fb1", "#f3c53d", "#5cc6c0", "#f7a23b", "#9b7be8"];
    for (let n = 1; n <= 100; n++) {
      const [cx, cy] = slXY(n);
      ctx.fillStyle = cols[(n * 3 + ((n - 1) / 10 | 0)) % 5];
      ctx.globalAlpha = 0.8;
      ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs);
      ctx.globalAlpha = 1;
      txt(String(n), cx - 8, cy - 9, N(400, 9), "rgba(74,51,40,.85)");
    }
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(bx, by, cs * 10, cs * 10);
    txt("START", bx - 26, by + cs * 10 + 6, F(700, 15), "#2d6a2d");
    txt("100", slXY(100)[0], slXY(100)[1] + 8, F(700, 17), "#e8513f");
    for (const a in LADD) {
      const [x1, y1] = slXY(+a), [x2, y2] = slXY(LADD[a]);
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * 5, ny = dx / L * 5;
      ctx.lineCap = "round";
      for (const sg of [-1, 1]) {
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x1 + nx * sg, y1 + ny * sg);
        ctx.lineTo(x2 + nx * sg, y2 + ny * sg);
        ctx.stroke();
        ctx.strokeStyle = "#d9a066";
        ctx.lineWidth = 3.6;
        ctx.stroke();
      }
      const rn = Math.floor(L / 12);
      for (let i = 1; i < rn; i++) {
        const t = i / rn;
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1 + dx * t - nx, y1 + dy * t - ny);
        ctx.lineTo(x1 + dx * t + nx, y1 + dy * t + ny);
        ctx.stroke();
        ctx.strokeStyle = "#e9b87a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    let si = 0;
    for (const a in SNAK) {
      const pts = snakePts(a), [x1, y1] = pts[0], col = SNC[si++ % 4];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const [lw, c] of [[10, LINE], [7.5, col]]) {
        ctx.strokeStyle = c;
        ctx.lineWidth = lw;
        ctx.beginPath();
        pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
      }
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.ellipse(x1, y1, 9, 7.5, 0, 0, 6.3);
      inked(col, 1.5);
      ctx.fillStyle = "#fff";
      for (const ex of [-3.5, 3.5]) {
        ctx.beginPath();
        ctx.arc(x1 + ex, y1 - 2, 2.4, 0, 6.3);
        ctx.fill();
      }
      ctx.fillStyle = "#14100d";
      for (const ex of [-3.5, 3.5]) {
        ctx.beginPath();
        ctx.arc(x1 + ex, y1 - 2, 1.1, 0, 6.3);
        ctx.fill();
      }
      ctx.strokeStyle = "#e8513f";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x1, y1 + 7);
      ctx.lineTo(x1, y1 + 13 + Math.sin(S.t * 6) * 2);
      ctx.stroke();
    }
  },
  ents() {
    const s = Sess.get("snakes");
    if (!s) return [];
    slSync(s);
    const out = [], me = Sess.mySeat("snakes");
    s.seats.forEach((x, i) => {
      const a = SLA[i], busy = animBusy(a);
      let pos;
      if (busy) pos = animNow(a);
      else {
        const n = s.st.p[i], xy = n === 0 ? slPad(i) : slXY(n);
        pos = { x: xy[0], y: xy[1], h: 0, pose: "idle", rot: 0 };
      }
      out.push({ y: pos.y + 6, draw: () => drawToken(x, i, pos, 0.7, i === me, s.st.w === i && !busy) });
    });
    if (DI.game === "snakes" && DI.shown) out.push({ y: 9999, draw: drawDiceWorld });
    return out;
  }
};
const MN = { bx: 500, by: 134, cs: 48 };
const mnXY = (i) => {
  const [c, r] = cellRC(i);
  return [MN.bx + c * MN.cs + MN.cs / 2, MN.by + r * MN.cs + MN.cs / 2];
};
const mnTok = (i, sq) => {
  const p = mnXY(sq), o = OFF[i % 4];
  return [p[0] + o[0], p[1] + o[1] + 6];
};
GK.mono.delay = (st) => {
  const m = st.lm;
  if (st.la !== "roll" || !m) return 850;
  const steps = (m.t - m.f + 28) % 28;
  return 950 + steps * 230 + 800;
};
GK.mono.render = () => {
  G.refreshHud && G.refreshHud();
};
const MNA = {}, MNS = { s: null, id: 0 };
function mnSync(s) {
  if (MNS.s !== s) {
    MNS.s = s;
    MNS.id = s.st.lm ? s.st.lm.id : 0;
    for (const k in MNA) delete MNA[k];
    return;
  }
  const m = s.st.lm;
  if (!m) {
    MNS.id = 0;
    return;
  }
  if (m.id < MNS.id) MNS.id = 0;
  if (m.id === MNS.id) return;
  MNS.id = m.id;
  const segs = [];
  let cur = mnTok(m.s, m.f);
  segs.push({ k: "wait", dur: 0.98, a: cur });
  const steps = (m.t - m.f + 28) % 28;
  for (let n = 1; n <= steps; n++) {
    const nx = mnTok(m.s, (m.f + n) % 28);
    segs.push({ k: "hop", a: cur, b: nx, dur: 0.22, h: 11 });
    cur = nx;
  }
  segs.push({ k: "wait", dur: 1e-4, a: cur });
  MNA[m.s] = mkAnim(segs);
  rollDice("mono", m.d, MN.bx + MN.cs * 4, MN.by + MN.cs * 4.6);
  G.refreshHud && G.refreshHud();
}
function sqIcon(q, x, y, cs) {
  ctx.save();
  ctx.translate(x + cs / 2, y + cs / 2);
  const k = cs / 48;
  ctx.scale(k, k);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = LINE;
  if (q[0] === "st") {
    rr(-14, -8, 28, 14, 5);
    inked("#e8513f", 1.2);
    rr(-14, -14, 10, 8, 2);
    inked("#fffdf6", 1.1);
    ctx.beginPath();
    ctx.arc(-8, 8, 3.6, 0, 6.3);
    ctx.arc(8, 8, 3.6, 0, 6.3);
    inked("#4a3328", 1);
  } else if (q[0] === "sur") {
    rr(-12, -6, 24, 18, 3);
    inked("#f58fb1", 1.2);
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(-2, -6, 4, 18);
    ctx.beginPath();
    ctx.ellipse(-5, -10, 5, 4, -0.5, 0, 6.3);
    ctx.ellipse(5, -10, 5, 4, 0.5, 0, 6.3);
    inked("#f3c53d", 1.1);
    txt("?", 0, 3, F(700, 14), INK);
  } else if (q[0] === "pic") {
    rr(-13, -4, 26, 16, 4);
    inked("#f7a23b", 1.2);
    ctx.beginPath();
    ctx.arc(0, -4, 12, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(-8, 2, 16, 4);
  } else if (q[0] === "pud") {
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 8, 0, 0, 6.3);
    inked("#8ec9f2", 1.2);
    ctx.beginPath();
    ctx.ellipse(-4, 3, 5, 2.4, 0, 0, 6.3);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fill();
  } else if (q[0] === "rest") {
    rr(-14, -2, 28, 9, 3);
    inked("#c98b52", 1.2);
    ctx.fillRect(-12, 7, 3, 6);
    ctx.fillRect(9, 7, 3, 6);
    rr(-14, -10, 28, 8, 3);
    inked("#e0894e", 1.1);
  } else if (q[0] === "start") {
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(2, -4);
    ctx.lineTo(2, -12);
    ctx.lineTo(16, 0);
    ctx.lineTo(2, 12);
    ctx.lineTo(2, 4);
    ctx.lineTo(-14, 4);
    ctx.closePath();
    inked("#8fcf6a", 1.3);
  }
  ctx.restore();
}
G.mono = {
  sel: -1,
  selT: 0,
  cam: () => ({ x: MN.bx + MN.cs * 4, y: MN.by + MN.cs * 4, w: MN.cs * 8 + 24, h: MN.cs * 8 + 18 }),
  spots() {
    return [{ x: MN.bx + MN.cs * 7.5, y: MN.by + MN.cs * 7.5, r: 72, label: "play Property Parade", key: "mn1", area: [MN.bx - 6, MN.by - 6, MN.cs * 8 + 12, MN.cs * 8 + 12], hit: [MN.bx, MN.by, MN.cs * 8, MN.cs * 8], fn: () => G.open("mono") }];
  },
  hidesMe: () => Sess.mySeat("mono") >= 0,
  update(dt) {
    let fin = false;
    for (const k in MNA) if (stepAnim(MNA[k], dt)) fin = true;
    if (this.selT > 0) this.selT -= dt;
    if (fin) G.refreshHud && G.refreshHud();
  },
  drawWorld() {
    const { bx, by, cs } = MN, s = Sess.get("mono"), st = s && s.st;
    cast(() => {
      rr(bx - 8, by - 8, cs * 8 + 16, cs * 8 + 16, 14);
      ctx.fillStyle = "#fffdf6";
      ctx.fill();
    });
    rr(bx - 8, by - 8, cs * 8 + 16, cs * 8 + 16, 14);
    outline();
    ctx.fillStyle = dotsP("#cdeccd", "#fffdf6", 24, 3.6);
    rr(bx + cs, by + cs, cs * 6, cs * 6, 6);
    ctx.fill();
    labelTag("Property Parade", bx + cs * 4, by + cs * 2.1, cs * 4.6, 50, "#f7a23b", -0.04, F(700, 30), "#fffdf6");
    labelTag("", bx + cs * 4, 70, 250, 58, "#fffdf6", 0.02, F(700, 26), INK);
    txt("Property Parade", bx + cs * 4, 62, F(700, 26), INK);
    txt(s ? "a game is on, press E to roll" : "walk onto the board and press E", bx + cs * 4, 84, N(400, 13), "#8a6a58");
    txt("roll \xB7 buy \xB7 collect rent", bx + cs * 4, by + cs * 3, N(400, 15), INK);
    txt("first to $3,000 net worth wins", bx + cs * 4, by + cs * 3.45, N(400, 12), "#8a6a58");
    for (let i = 0; i < 28; i++) {
      const [c, r] = cellRC(i), x = bx + c * cs, y = by + r * cs, q = MSQ[i];
      ctx.fillStyle = q[0] === "p" || q[0] === "st" ? "#fffdf6" : q[0] === "sur" ? "#bfe8e4" : q[0] === "start" ? "#cfeeb8" : q[0] === "pic" ? "#fbd3dc" : q[0] === "pud" ? "#bfdcf5" : "#fff4c9";
      ctx.fillRect(x, y, cs, cs);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
      const inner = r === 7 ? "t" : r === 0 ? "b" : c === 0 ? "r" : "l";
      if (q[0] === "p") {
        ctx.fillStyle = MGC[q[1]];
        const bw = 11;
        if (inner === "t") ctx.fillRect(x + 1, y + 1, cs - 2, bw);
        else if (inner === "b") ctx.fillRect(x + 1, y + cs - bw - 1, cs - 2, bw);
        else if (inner === "r") ctx.fillRect(x + cs - bw - 1, y + 1, bw, cs - 2);
        else ctx.fillRect(x + 1, y + 1, bw, cs - 2);
        ctx.strokeStyle = "rgba(43,29,22,.6)";
        ctx.lineWidth = 1;
        if (inner === "t") ctx.strokeRect(x + 1, y + 1, cs - 2, bw);
        else if (inner === "b") ctx.strokeRect(x + 1, y + cs - bw - 1, cs - 2, bw);
        else if (inner === "r") ctx.strokeRect(x + cs - bw - 1, y + 1, bw, cs - 2);
        else ctx.strokeRect(x + 1, y + 1, bw, cs - 2);
      }
      if (q[0] === "p" || q[0] === "st") {
        const lines = wrapText(mName(i), 9);
        const oy = q[0] === "p" ? inner === "t" ? 13 : inner === "b" ? -4 : 0 : 0;
        if (q[0] === "st") sqIcon(q, x, y - 8, cs);
        lines.forEach((l, li) => txt(l, x + cs / 2 + (q[0] === "p" && inner === "r" ? -4 : q[0] === "p" && inner === "l" ? 4 : 0), y + (q[0] === "st" ? cs * 0.7 : cs * 0.42) + oy + li * 9 - (lines.length - 1) * 3, N(400, 9), INK));
        if (q[0] === "p") txt("$" + price(i), x + cs / 2, y + cs - 6, N(400, 9), "#6d5217");
      } else {
        sqIcon(q, x, y - 4, cs);
        txt(q[0] === "start" ? "START" : mName(i), x + cs / 2, y + cs - 9, N(400, 9), INK);
        if (q[0] === "start") txt("+$200", x + cs / 2, y + 9, F(700, 11), "#2d6a2d");
      }
      if (st) {
        const o = st.o[i];
        if (o !== "-") {
          ctx.strokeStyle = SEATC[+o];
          ctx.lineWidth = 3.2;
          ctx.strokeRect(x + 3, y + 3, cs - 6, cs - 6);
          ctx.fillStyle = SEATC[+o];
          ctx.beginPath();
          ctx.arc(x + cs - 8, y + 8, 4.4, 0, 6.3);
          ctx.fill();
          ctx.strokeStyle = LINE;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (this.sel === i) {
        ctx.strokeStyle = "#e8513f";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
        ctx.setLineDash([]);
      }
    }
    if (st && !GK.mono.over(st)) {
      const t = st.t, pos = st.p[t][0], [c, r] = cellRC(pos);
      ctx.fillStyle = SEATC[t];
      ctx.globalAlpha = 0.18 + 0.1 * Math.sin(S.t * 5);
      ctx.fillRect(bx + c * cs, by + r * cs, cs, cs);
      ctx.globalAlpha = 1;
    }
    if (this.sel >= 0 && this.selT > 0 && s) {
      const i = this.sel, o = st.o[i], [c, r] = cellRC(i);
      const nm = mName(i);
      const info = buyable(i) ? `$${price(i)} \xB7 rent $${o === "-" ? Math.round(price(i) / 10) || 25 : mRent(st.o, i)} \xB7 ${o === "-" ? "for sale" : "owned by " + (s.seats[+o] ? s.seats[+o].n : "?")}` : "a special square";
      const cx = clamp(bx + c * cs + cs / 2, bx + 80, bx + cs * 8 - 80), cy = by + r * cs + (r < 4 ? cs + 34 : -14);
      ctx.font = N(400, 13);
      const w = Math.max(ctx.measureText(nm).width, ctx.measureText(info).width) + 24;
      cast(() => {
        rr(cx - w / 2, cy - 24, w, 44, 10);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });
      rr(cx - w / 2, cy - 24, w, 44, 10);
      outline(1.3);
      txt(nm, cx, cy - 9, F(700, 17), INK);
      txt(info, cx, cy + 9, N(400, 13), "#6d5217");
    }
  },
  click(wx, wy) {
    const { bx, by, cs } = MN, c = Math.floor((wx - bx) / cs), r = Math.floor((wy - by) / cs);
    if (c < 0 || c > 7 || r < 0 || r > 7) return;
    for (let i = 0; i < 28; i++) {
      const [cc, rr2] = cellRC(i);
      if (cc === c && rr2 === r) {
        this.sel = i;
        this.selT = 4;
        sfx.click(1);
        return;
      }
    }
  },
  ents() {
    const s = Sess.get("mono");
    if (!s) return [];
    mnSync(s);
    const out = [], me = Sess.mySeat("mono"), st = s.st;
    s.seats.forEach((x, i) => {
      if (st.out[i]) return;
      const a = MNA[i], busy = animBusy(a);
      let pos;
      if (busy) pos = animNow(a);
      else {
        const xy = mnTok(i, st.p[i][0]);
        pos = { x: xy[0], y: xy[1], h: 0, pose: "idle", rot: 0 };
      }
      out.push({ y: pos.y + 6, draw: () => drawToken(x, i, pos, 0.72, i === me, st.w === i && !busy) });
    });
    if (DI.game === "mono" && DI.shown) out.push({ y: 9999, draw: drawDiceWorld });
    return out;
  }
};
G.boardsUpdate = (dt) => {
  G.snakes.update(dt);
  G.mono.update(dt);
};
G.refreshHud = function() {
  const k = G.cur;
  if (k !== "snakes" && k !== "mono") return;
  const s = Sess.get(k);
  let extra = "", sub = null;
  if (s) {
    if (k === "snakes") slSync(s);
    else mnSync(s);
    const busy = boardBusy(k), st = s.st, me = Sess.mySeat(k), d = GK[k], myturn = me >= 0 && !d.over(st) && d.turn(st) === me;
    if (k === "snakes") {
      extra = `${busy && diceBusy() ? dieHTML(1 + Math.floor(S.t * 12) % 6, "roll") : st.d ? dieHTML(st.d) : ""}<span class="msg" style="font-size:17px">${busy ? "Rolling\u2026" : escapeHTML(st.m)}</span>${myturn && !busy ? '<button class="btn solid" data-h="roll" type="button">Roll (E)</button>' : ""}`;
    } else {
      sub = (i) => "$" + st.p[i][1];
      const dv = busy && diceBusy() ? `<span class="dicepair">${dieHTML(1 + Math.floor(S.t * 12) % 6, "roll")}${dieHTML(1 + Math.floor(S.t * 9) % 6, "roll")}</span>` : `<span class="dicepair">${dieHTML(st.d[0])}${dieHTML(st.d[1])}</span>`;
      let act = "";
      if (d.over(st)) act = "";
      else if (myturn && !busy) act = st.ph === "roll" ? '<button class="btn solid" data-h="roll" type="button">Roll (E)</button>' : `<button class="btn solid small" data-h="mv" data-v="buy" type="button">Buy $${price(st.p[me][0])}</button><button class="btn small" data-h="mv" data-v="skip" type="button">Skip</button>`;
      else if (!busy) act = `<span class="msg" style="font-size:16px">${banner("mono", s)}</span>`;
      extra = `${dv}<span class="msg" style="font-size:16px">${busy ? "Rolling\u2026" : escapeHTML(st.m)}</span>${act}`;
      if (d.over(st)) extra += `<span class="msg">${banner("mono", s)}</span>`;
    }
    if (busy) clearTimeout(G.hudT), G.hudT = setTimeout(() => {
      G.refreshHud && G.refreshHud();
    }, 350);
  }
  setHud(inworldHud(k, extra, sub));
};
