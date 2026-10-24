const GK = {};
const CPUN = { mira: "Mira", theo: "Theo", juno: "Juno", pip: "Pip", ava: "Ava", leo: "Leo", max: "Max", sam: "Sam", zoe: "Zoe", noor: "Noor", aj: "AJ" };
const CPUIDS = Object.keys(CPUN).filter((x) => x !== "aj");
const clone = (o) => JSON.parse(JSON.stringify(o));
const MY = () => "me";
const SEATC = ["#e8513f", "#4a90e2", "#8fcf6a", "#f3c53d"];
const AVC = {};
function avFor(l, size = 44) {
  const k = l.join(",") + ":" + size;
  return AVC[k] || (AVC[k] = avatarCanvas(lookFrom(l), size));
}
const Sess = {
  m: {},
  timers: {},
  get(k) {
    return this.m[k];
  },
  mySeat(k) {
    const s = this.m[k];
    return s ? s.seats.findIndex((x) => x.u === MY()) : -1;
  },
  create(k, n, saved) {
    const d = GK[k];
    const ids = shuffle(CPUIDS.slice());
    if (k === "c4") ids.splice(1, 0, "aj");
    const seats = [{ u: MY(), n: Save.d.name, l: lookArr(LOOK) }];
    for (let i = 1; i < n; i++) {
      const id = ids[i];
      seats.push({ u: null, n: CPUN[id], l: lookArr(NPC[id]) });
    }
    this.m[k] = { host: MY(), q: 1, seats, st: saved || d.init(n) };
    Save.d.stats.played[k] = (Save.d.stats.played[k] || 0) + (saved ? 0 : 1);
    this.after(k);
    return this.m[k];
  },
  restart(k) {
    const s = this.m[k];
    if (!s) return;
    s.st = GK[k].init(s.seats.length);
    s.q++;
    Save.d.stats.played[k] = (Save.d.stats.played[k] || 0) + 1;
    this.after(k);
  },
  after(k) {
    const s = this.m[k];
    if (!s) return;
    if (s.host === MY()) {
      this.persist(k);
      this.cpuTick(k);
    }
    this.render(k);
  },
  persist(k) {
    const s = this.m[k];
    if (!s || s.host !== MY()) return;
    if (GK[k].over(s.st)) {
      delete Save.d.games[k];
    } else {
      Save.d.games[k] = { n: s.seats.length, st: s.st };
    }
    Save.put();
  },
  move(k, mv) {
    const s = this.m[k];
    if (!s) return false;
    const seat = this.mySeat(k);
    if (seat < 0) return false;
    return this.apply(k, seat, mv);
  },
  apply(k, seat, mv) {
    const s = this.m[k], d = GK[k];
    if (!s) return false;
    const ns = d.apply(s.st, seat, mv);
    if (!ns) return false;
    const wasOver = d.over(s.st);
    s.st = ns;
    s.q++;
    if (!wasOver && d.over(ns)) {
      const w = d.winner ? d.winner(ns) : -1;
      if (w >= 0 && s.seats[w] && s.seats[w].u === MY()) {
        Save.d.stats.won[k] = (Save.d.stats.won[k] || 0) + 1;
        sfx.win();
      }
    }
    this.after(k);
    return true;
  },
  cpuTick(k) {
    const s = this.m[k];
    clearTimeout(this.timers[k]);
    if (!s || s.host !== MY()) return;
    const d = GK[k];
    if (d.over(s.st)) return;
    const t = d.turn(s.st);
    if (!s.seats[t] || s.seats[t].u !== null) return;
    this.timers[k] = setTimeout(() => {
      const s2 = this.m[k];
      if (!s2 || s2.host !== MY()) return;
      const t2 = d.turn(s2.st);
      if (!s2.seats[t2] || s2.seats[t2].u !== null) return;
      const mv = d.cpu(s2.st, t2);
      if (mv) this.apply(k, t2, mv);
    }, typeof d.delay === "function" ? d.delay(s.st) : d.delay || 850);
  },
  render(k) {
    if (G.cur === k && GK[k] && GK[k].render) GK[k].render();
  }
};
function seatsHTML(k) {
  const s = Sess.get(k);
  if (!s) return "";
  const t = GK[k].over(s.st) ? -1 : GK[k].turn(s.st);
  return '<div class="seats">' + s.seats.map((x, i) => {
    const me = x.u === MY();
    return `<div class="seat${i === t ? " on" : ""}" data-seat="${i}"><span class="mark" style="width:14px;height:14px;border-radius:50%;background:${SEATC[i]};border:2px solid #4a3328;flex:none"></span><span data-av="${i}"></span><span>${escapeHTML(me ? "You" : x.n)}<small>${x.u === null ? "computer" : me ? "on this device" : "friend"}</small></span></div>`;
  }).join("") + "</div>";
}
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function mountAvatars(root, k) {
  const s = Sess.get(k);
  if (!s) return;
  root.querySelectorAll("[data-av]").forEach((e) => {
    const i = +e.dataset.av;
    const c = avatarCanvas(lookFrom(s.seats[i].l), 40);
    e.replaceWith(c);
  });
}
function lobbyHTML(k) {
  const d = GK[k], sv = Save.d.games[k];
  let h = `<div class="startbox"><h3>${d.name}</h3><p>${d.blurb || ""}</p>`;
  h += '<div class="row" style="justify-content:center;flex-wrap:wrap;gap:8px">';
  for (let n = d.min; n <= d.max; n++) h += `<button class="btn ${n === d.min ? "solid" : ""}" data-a="new" data-n="${n}" type="button">${n === 1 ? "Solo" : n + " players"}</button>`;
  h += "</div>";
  if (sv) h += `<button class="btn sky" data-a="resume" type="button">Continue my saved game</button>`;
  h += "</div>";
  return h;
}
function tableHandlers(k, root) {
  root.onclick = (e) => {
    const t = e.target.closest("[data-a]");
    if (!t) return;
    const a = t.dataset.a;
    if (a === "new") {
      Sess.create(k, +t.dataset.n);
      sfx.click();
    } else if (a === "resume") {
      const sv = Save.d.games[k];
      if (sv) Sess.create(k, sv.n, sv.st);
    } else if (a === "again") {
      Sess.restart(k);
    } else if (GK[k].click) GK[k].click(t, e);
  };
}
function wireSheet(k, sheetId, tblId, newId) {
  const root = $(tblId);
  tableHandlers(k, root);
  $(newId).addEventListener("click", () => {
    const s = Sess.get(k);
    if (!s) {
      toast("Pick a table size first");
      return;
    }
    Sess.restart(k);
  });
}
function stdRender(k, tblId, bodyFn) {
  const root = $(tblId), s = Sess.get(k);
  if (!s) {
    root.innerHTML = lobbyHTML(k);
    return;
  }
  const d = GK[k];
  root.innerHTML = seatsHTML(k) + bodyFn(s);
  mountAvatars(root, k);
}
const banner = (k, s) => {
  const d = GK[k], w = d.over(s.st) ? d.winner(s.st) : -1;
  if (!d.over(s.st)) {
    const t = d.turn(s.st), me = Sess.mySeat(k);
    return t === me ? "<b>Your turn</b>" : escapeHTML(s.seats[t].n) + (s.seats[t].u === null ? " is thinking\u2026" : "'s turn");
  }
  if (w < 0) return "<b>A draw.</b>";
  return "<b>" + (s.seats[w].u === MY() ? "You win!" : escapeHTML(s.seats[w].n) + " wins") + "</b>";
};
const TL = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const tttWin = (b) => {
  for (const l of TL) if (b[l[0]] !== "." && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return l;
  return null;
};
function tttBest(b, me) {
  const w = tttWin(b);
  if (w) return [b[w[0]] === me ? 1 : -1, -1];
  if (!b.includes(".")) return [0, -1];
  let bs = -2, bm = [];
  const other = me === "x" ? "o" : "x";
  for (let i = 0; i < 9; i++) if (b[i] === ".") {
    const nb = b.slice(0, i) + me + b.slice(i + 1);
    const w2 = tttWin(nb);
    let sc;
    if (w2) sc = 1;
    else if (!nb.includes(".")) sc = 0;
    else sc = -tttBest(nb, other)[0];
    if (sc > bs) {
      bs = sc;
      bm = [i];
    } else if (sc === bs) bm.push(i);
  }
  return [bs, pick(bm)];
}
GK.ttt = {
  name: "Tic-Tac-Toe",
  min: 2,
  max: 2,
  blurb: "Three in a row wins. Quick and friendly.",
  delay: 650,
  init: () => ({ b: ".........", t: 0, w: -1, wc: null }),
  turn: (st) => st.t,
  over: (st) => st.w >= 0,
  winner: (st) => st.w === 2 ? -1 : st.w,
  apply(st, seat, mv) {
    if (st.w >= 0 || st.t !== seat || !mv) return null;
    const c = mv.c | 0;
    if (c < 0 || c > 8 || st.b[c] !== ".") return null;
    const b = st.b.slice(0, c) + (seat ? "o" : "x") + st.b.slice(c + 1), wl = tttWin(b);
    return { b, t: 1 - seat, w: wl ? seat : b.includes(".") ? -1 : 2, wc: wl };
  },
  cpu(st, seat) {
    const me = seat ? "o" : "x";
    if (Math.random() < 0.22) {
      const e = [];
      for (let i = 0; i < 9; i++) if (st.b[i] === ".") e.push(i);
      return { c: pick(e) };
    }
    return { c: tttBest(st.b, me)[1] };
  },
  render() {
    stdRender("ttt", "tbl-ttt", (s) => {
      const st = s.st, me = Sess.mySeat("ttt");
      let h = `<div class="banner">${banner("ttt", s)}</div><div class="ttt">`;
      for (let i = 0; i < 9; i++) {
        const v = st.b[i], w = st.wc && st.wc.includes(i);
        h += `<button type="button" class="${v === "x" ? "x" : v === "o" ? "o" : ""}${w ? " win" : ""}" data-a="cell" data-c="${i}" ${v !== "." || st.w >= 0 ? "disabled" : ""} aria-label="Square ${i + 1}">${v === "x" ? "\u2715" : v === "o" ? "\u25CB" : ""}</button>`;
      }
      h += "</div>";
      if (st.w >= 0) h += '<button class="btn solid" data-a="again" type="button">Play again</button>';
      return h;
    });
  },
  click(t) {
    if (t.dataset.a === "cell") {
      if (Sess.move("ttt", { c: +t.dataset.c })) sfx.pop();
    }
  }
};
const C4R = 6, C4C = 7;
const c42d = (s) => {
  const b = [];
  for (let r = 0; r < C4R; r++) {
    const row = [];
    for (let c = 0; c < C4C; c++) {
      const ch = s[r * C4C + c];
      row.push(ch === "x" ? 1 : ch === "o" ? 2 : 0);
    }
    b.push(row);
  }
  return b;
};
const c4Drop = (bd, c) => {
  for (let r = C4R - 1; r >= 0; r--) if (!bd[r][c]) return r;
  return -1;
};
function c4Check(bd, r, c, p) {
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const cells = [[r, c]];
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < C4R && cc >= 0 && cc < C4C && bd[rr][cc] === p) {
        cells.push([rr, cc]);
        rr += dr * s;
        cc += dc * s;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}
function c4Eval(bd, p) {
  let s = 0;
  const o = 3 - p;
  for (let r = 0; r < C4R; r++) if (bd[r][3] === p) s += 3;
  else if (bd[r][3] === o) s -= 3;
  const w4 = (r, c, dr, dc) => {
    let a = 0, e = 0, x = 0;
    for (let i = 0; i < 4; i++) {
      const v = bd[r + dr * i][c + dc * i];
      if (v === p) a++;
      else if (v === o) x++;
      else e++;
    }
    if (a === 3 && e === 1) s += 5;
    else if (a === 2 && e === 2) s += 2;
    if (x === 3 && e === 1) s -= 6;
    else if (x === 2 && e === 2) s -= 1;
  };
  for (let r = 0; r < C4R; r++) for (let c = 0; c < C4C; c++) {
    if (c + 3 < C4C) w4(r, c, 0, 1);
    if (r + 3 < C4R) w4(r, c, 1, 0);
    if (r + 3 < C4R && c + 3 < C4C) w4(r, c, 1, 1);
    if (r + 3 < C4R && c - 3 >= 0) w4(r, c, 1, -1);
  }
  return s;
}
function c4Search(bd, d, a, be, p) {
  const cols = [3, 2, 4, 1, 5, 0, 6].filter((c) => !bd[0][c]);
  if (!cols.length) return 0;
  if (d === 0) return c4Eval(bd, p);
  let best = -Infinity;
  for (const c of cols) {
    const r = c4Drop(bd, c);
    bd[r][c] = p;
    const v = c4Check(bd, r, c, p) ? 1e6 + d : -c4Search(bd, d - 1, -be, -a, 3 - p);
    bd[r][c] = 0;
    if (v > best) best = v;
    if (best > a) a = best;
    if (a >= be) break;
  }
  return best;
}
GK.c4 = {
  name: "Connect 4",
  min: 2,
  max: 2,
  blurb: "Drop discs and line up four.",
  delay: 700,
  init: () => ({ b: ".".repeat(42), t: 0, w: -1, wc: null, l: -1 }),
  turn: (st) => st.t,
  over: (st) => st.w >= 0,
  winner: (st) => st.w === 2 ? -1 : st.w,
  apply(st, seat, mv) {
    if (st.w >= 0 || st.t !== seat || !mv) return null;
    const c = mv.c | 0;
    if (c < 0 || c > 6) return null;
    const bd = c42d(st.b), r = c4Drop(bd, c);
    if (r < 0) return null;
    const p = seat + 1;
    bd[r][c] = p;
    const wc = c4Check(bd, r, c, p);
    const arr = st.b.split("");
    arr[r * 7 + c] = seat ? "o" : "x";
    const b = arr.join("");
    return { b, t: 1 - seat, w: wc ? seat : b.includes(".") ? -1 : 2, wc: wc ? wc.map((a) => a[0] * 7 + a[1]) : null, l: r * 7 + c };
  },
  cpu(st, seat) {
    const bd = c42d(st.b), p = seat + 1;
    let best = -Infinity, pk = [];
    for (const c of [3, 2, 4, 1, 5, 0, 6]) {
      if (bd[0][c]) continue;
      const r = c4Drop(bd, c);
      bd[r][c] = p;
      const v = c4Check(bd, r, c, p) ? 1e6 : -c4Search(bd, 4, -Infinity, Infinity, 3 - p);
      bd[r][c] = 0;
      if (v > best) {
        best = v;
        pk = [c];
      } else if (v === best) pk.push(c);
    }
    return { c: pick(pk) };
  },
  render() {
    stdRender("c4", "tbl-c4", (s) => {
      const st = s.st;
      let h = `<div class="banner">${banner("c4", s)}</div><div class="c4wrap"><div class="c4board">`;
      for (let c = 0; c < 7; c++) {
        h += `<div class="c4col" data-a="col" data-c="${c}" role="button" aria-label="Drop in column ${c + 1}">`;
        for (let r = 0; r < 6; r++) {
          const i = r * 7 + c, v = st.b[i];
          h += `<div class="c4cell">${v !== "." ? `<div class="disc p${v === "x" ? 1 : 2} ${st.l === i ? "" : "old"} ${st.wc && st.wc.includes(i) ? "win" : ""}"></div>` : ""}</div>`;
        }
        h += "</div>";
      }
      h += "</div></div>";
      if (st.w >= 0) h += '<button class="btn solid" data-a="again" type="button">Play again</button>';
      return h;
    });
  },
  click(t) {
    if (t.dataset.a === "col") {
      if (Sess.move("c4", { c: +t.dataset.c })) sfx.pop();
    }
  }
};
const MSQ = [
  ["start", "START"],
  ["p", 0, "Daisy Lane", 60],
  ["p", 0, "Poppy Street", 60],
  ["sur", "Surprise"],
  ["st", "Tunnel Station", 150],
  ["p", 1, "Plum Road", 100],
  ["p", 1, "Cherry Close", 120],
  ["rest", "Rest Stop"],
  ["p", 2, "Marigold Mews", 140],
  ["p", 2, "Tulip Terrace", 160],
  ["sur", "Surprise"],
  ["p", 3, "Bakery Row", 180],
  ["p", 3, "Pie Place", 200],
  ["st", "Harbour Station", 150],
  ["pic", "Picnic"],
  ["p", 4, "Maple Walk", 220],
  ["p", 4, "Acorn Alley", 240],
  ["sur", "Surprise"],
  ["p", 5, "Sunny Square", 260],
  ["p", 5, "Rainbow Road", 280],
  ["st", "Hilltop Station", 150],
  ["pud", "Puddle"],
  ["p", 6, "Starlight Way", 300],
  ["p", 6, "Moon Mews", 320],
  ["sur", "Surprise"],
  ["p", 7, "Castle Court", 350],
  ["p", 7, "Crown Corner", 400],
  ["st", "Central Station", 150]
];
const MGC = ["#a8754f", "#8ec9f2", "#f58fb1", "#f7a23b", "#e8513f", "#f3c53d", "#8fcf6a", "#4a90e2"];
const mName = (i) => MSQ[i][0] === "p" ? MSQ[i][2] : MSQ[i][1];
const price = (i) => MSQ[i][0] === "p" ? MSQ[i][3] : MSQ[i][0] === "st" ? 150 : 0;
const buyable = (i) => MSQ[i][0] === "p" || MSQ[i][0] === "st";
function cellRC(i) {
  if (i === 0) return [7, 7];
  if (i < 7) return [7 - i, 7];
  if (i === 7) return [0, 7];
  if (i < 14) return [0, 7 - (i - 7)];
  if (i === 14) return [0, 0];
  if (i < 21) return [i - 14, 0];
  if (i === 21) return [7, 0];
  return [7, i - 21];
}
function mRent(o, i) {
  if (MSQ[i][0] === "st") {
    let n = 0;
    for (let j = 0; j < 28; j++) if (MSQ[j][0] === "st" && o[j] !== "-" && o[j] === o[i]) n++;
    return 25 * n;
  }
  const g = MSQ[i][1], set = [];
  for (let j = 0; j < 28; j++) if (MSQ[j][0] === "p" && MSQ[j][1] === g) set.push(j);
  const all = set.every((j) => o[j] === o[i]);
  return Math.round(MSQ[i][3] / 10) * (all ? 2 : 1);
}
const mWorth = (s, p) => {
  let w = s.p[p][1];
  for (let i = 0; i < 28; i++) if (s.o[i] === String(p)) w += price(i);
  return w;
};
const SURP = [["A birthday cake! +$100", 100], ["You found a coin. +$30", 30], ["Dropped your ice cream. -$40", -40], ["Bought a kite. -$60", -60], ["Lemonade stand profit. +$70", 70], ["Muddy boots to clean. -$30", -30]];
function mNext(s) {
  const n = s.p.length;
  let alive = 0, last = -1;
  for (let i = 0; i < n; i++) if (!s.out[i]) {
    alive++;
    last = i;
  }
  if (alive <= 1) {
    s.w = last;
    s.ph = "over";
    s.m += ` ${"Everyone else went broke."}`;
    return;
  }
  let top = -1, tw = 0;
  for (let i = 0; i < n; i++) if (!s.out[i]) {
    const w = mWorth(s, i);
    if (w >= 3e3 && w > tw) {
      tw = w;
      top = i;
    }
  }
  if (top >= 0) {
    s.w = top;
    s.ph = "over";
    s.m += " Net worth hit $3,000!";
    return;
  }
  let t = s.t;
  do {
    t = (t + 1) % n;
  } while (s.out[t]);
  s.t = t;
  s.ph = "roll";
}
function mBroke(s, p, to) {
  if (s.p[p][1] >= 0) return;
  const debt = -s.p[p][1];
  if (to >= 0) s.p[to][1] += Math.max(0, s.p[p][1] + debt) + 0;
  s.out[p] = 1;
  for (let i = 0; i < 28; i++) if (s.o[i] === String(p)) s.o = s.o.slice(0, i) + "-" + s.o.slice(i + 1);
  s.p[p][1] = 0;
  s.m += ` ${"Out of money!"}`;
}
GK.mono = {
  name: "Property Parade",
  min: 2,
  max: 4,
  blurb: "Roll, buy streets and collect rent. First to $3,000 net worth wins.",
  init(n) {
    return { p: Array.from({ length: n }, () => [0, 1500]), o: "-".repeat(28), t: 0, ph: "roll", d: [1, 1], m: "Roll the dice to start.", w: -1, out: Array(n).fill(0), q: 0 };
  },
  turn: (st) => st.t,
  over: (st) => st.w >= 0 || st.ph === "over",
  winner: (st) => st.w,
  apply(st, seat, mv) {
    if (this.over(st) || st.t !== seat || !mv) return null;
    const s = clone(st), me = seat;
    let msg = "";
    if (mv.a === "roll" && s.ph === "roll") {
      const d1 = 1 + rnd(6), d2 = 1 + rnd(6);
      s.d = [d1, d2];
      const old = s.p[me][0], np = (old + d1 + d2) % 28;
      s.p[me][0] = np;
      msg = `Rolled ${d1 + d2}.`;
      s.q = (s.q | 0) + 1;
      s.lm = { s: me, f: old, t: np, d: [d1, d2], id: s.q };
      s.la = "roll";
      if (np < old) {
        s.p[me][1] += 200;
        msg += " Passed START: +$200.";
      }
      const sq = MSQ[np];
      if (buyable(np)) {
        const o = s.o[np];
        if (o === "-") {
          if (s.p[me][1] >= price(np)) {
            s.ph = "buy";
            s.m = msg + ` ${mName(np)} costs $${price(np)}.`;
            return s;
          }
          msg += ` Can't afford ${mName(np)}.`;
        } else if (+o !== me) {
          const r = mRent(s.o, np);
          s.p[me][1] -= r;
          s.p[+o][1] += r;
          msg += ` Paid $${r} rent to player ${+o + 1}.`;
          mBroke(s, me, +o);
        } else msg += " Your own street.";
      } else if (sq[0] === "sur") {
        const c = pick(SURP);
        s.p[me][1] += c[1];
        msg += " " + c[0];
        mBroke(s, me, -1);
      } else if (sq[0] === "pic") {
        s.p[me][1] += 50;
        msg += " Picnic! +$50.";
      } else if (sq[0] === "pud") {
        s.p[me][1] -= 50;
        msg += " Splash! -$50.";
        mBroke(s, me, -1);
      }
      s.m = msg;
      mNext(s);
      return s;
    }
    if (mv.a === "buy" && s.ph === "buy") {
      s.la = "buy";
      const i = s.p[me][0];
      s.p[me][1] -= price(i);
      s.o = s.o.slice(0, i) + me + s.o.slice(i + 1);
      s.m = `Bought ${mName(i)}.`;
      mNext(s);
      return s;
    }
    if (mv.a === "skip" && s.ph === "buy") {
      s.la = "skip";
      s.m = "Passed on it.";
      mNext(s);
      return s;
    }
    return null;
  },
  cpu(st, seat) {
    if (st.ph === "roll") return { a: "roll" };
    const i = st.p[seat][0];
    const c = st.p[seat][1] - price(i);
    return { a: c >= 120 || Math.random() < 0.35 ? "buy" : "skip" };
  }
};
const Uno = (() => {
  const COL = ["red", "yellow", "green", "blue"], NAMES = ["You", "Mira", "Theo", "Juno"];
  let deck, disc, hands, cur, dir, color, over, msg, drew, picking, timer, started = false;
  const el = $("unoBoard");
  const top = () => disc[disc.length - 1];
  const live = () => G.cur === "uno";
  function build() {
    deck = [];
    for (const c of COL) {
      deck.push({ c, v: "0" });
      for (let r = 0; r < 2; r++) {
        for (let v = 1; v <= 9; v++) deck.push({ c, v: String(v) });
        for (const v of ["skip", "rev", "+2"]) deck.push({ c, v });
      }
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ c: "wild", v: "wild" });
      deck.push({ c: "wild", v: "+4" });
    }
    shuffle(deck);
  }
  function start() {
    clearTimeout(timer);
    build();
    hands = [[], [], [], []];
    for (let r = 0; r < 7; r++) for (let p = 0; p < 4; p++) hands[p].push(deck.pop());
    let c;
    do {
      c = deck.pop();
      if (!/^\d$/.test(c.v)) {
        deck.unshift(c);
        c = null;
      }
    } while (!c);
    disc = [c];
    color = c.c;
    cur = 0;
    dir = 1;
    over = false;
    drew = false;
    picking = null;
    msg = "Your turn. Play a card or draw.";
    Save.d.stats.played.uno = (Save.d.stats.played.uno || 0) + 1;
    render();
    tick();
  }
  function draw(p, n) {
    const got = [];
    for (let i = 0; i < n; i++) {
      if (!deck.length) {
        const t = disc.pop();
        deck = shuffle(disc.splice(0));
        disc.push(t);
      }
      if (!deck.length) break;
      const c = deck.pop();
      hands[p].push(c);
      got.push(c);
    }
    return got;
  }
  const ok = (c) => c.c === "wild" || c.c === color || c.v === top().v;
  const adv = (n) => {
    cur = ((cur + dir * n) % 4 + 4) % 4;
  };
  const desc = (c) => c.c === "wild" ? c.v === "+4" ? "Wild +4" : "Wild" : `${c.c} ${c.v === "rev" ? "reverse" : c.v}`;
  function play(p, i, chosen) {
    const c = hands[p].splice(i, 1)[0];
    disc.push(c);
    color = c.c === "wild" ? chosen : c.c;
    drew = false;
    picking = null;
    let m = `${NAMES[p]} played ${desc(c)}${c.c === "wild" ? " and chose " + color : ""}.`;
    if (hands[p].length === 0) {
      over = true;
      msg = p === 0 ? "You win the round. Nicely played." : `${NAMES[p]} wins the round.`;
      if (p === 0) {
        Save.d.stats.won.uno = (Save.d.stats.won.uno || 0) + 1;
        sfx.win();
      }
      Save.put();
      render();
      return;
    }
    if (hands[p].length === 1) m += ` ${NAMES[p]} says UNO!`;
    if (c.v === "rev") dir *= -1;
    adv(1);
    if (c.v === "skip") {
      m += ` ${NAMES[cur]} is skipped.`;
      adv(1);
    } else if (c.v === "+2" || c.v === "+4") {
      const n = c.v === "+2" ? 2 : 4;
      draw(cur, n);
      m += ` ${NAMES[cur]} draws ${n} and is skipped.`;
      adv(1);
    }
    msg = m;
    render();
    tick();
  }
  function tick() {
    clearTimeout(timer);
    if (over || cur === 0 || !live()) return;
    timer = setTimeout(cpu, 900);
  }
  function cpu() {
    if (over || cur === 0 || !live()) return;
    const p = cur, h = hands[p];
    let idx = [];
    h.forEach((c, i2) => {
      if (ok(c)) idx.push(i2);
    });
    if (!idx.length) {
      const got = draw(p, 1);
      if (got.length && ok(got[0])) idx = [h.length - 1];
      else {
        msg = `${NAMES[p]} drew a card and passed.`;
        adv(1);
        render();
        tick();
        return;
      }
    }
    const nw = idx.filter((i2) => h[i2].c !== "wild");
    const i = nw.length ? nw[rnd(nw.length)] : idx[0];
    let chosen = null;
    if (h[i].c === "wild") {
      const cnt = { red: 0, yellow: 0, green: 0, blue: 0 };
      h.forEach((c, j) => {
        if (j !== i && c.c !== "wild") cnt[c.c]++;
      });
      chosen = COL.slice().sort((a, b) => cnt[b] - cnt[a])[0];
    }
    play(p, i, chosen);
  }
  const sym = (c) => ({ "+2": "+2", "+4": "+4", skip: "\u2298", rev: "\u21C4", wild: "\u2726" })[c.v] || c.v;
  const cardHTML = (c, x = "", a = "") => `<div class="ucard ${c.c} ${x}" ${a}><i>${sym(c)}</i><b>${sym(c)}</b><u>${sym(c)}</u></div>`;
  function render() {
    if (!hands) {
      el.innerHTML = "";
      return;
    }
    let h = '<div class="uno-opps">';
    for (let p = 1; p < 4; p++) h += `<div class="opp ${cur === p && !over ? "on" : ""}"><b>${NAMES[p]}</b><span>${hands[p].length} card${hands[p].length === 1 ? "" : "s"}</span></div>`;
    h += '</div><div class="uno-mid">';
    h += `<div class="pile"><div class="ucard back" data-act="draw" role="button" aria-label="Draw a card"></div></div>`;
    h += `<div class="pile">${cardHTML({ ...top(), c: top().c === "wild" ? color : top().c }, "")}</div>`;
    h += `<div><div><span class="dot" style="background:var(--c-${color})"></span>Colour: ${color}</div><div style="color:var(--soft);font-size:15px;margin-top:4px">${dir > 0 ? "Play goes clockwise" : "Play goes counter-clockwise"}</div></div></div>`;
    h += `<div class="uno-msg">${msg}</div><div class="uno-hand">`;
    hands[0].forEach((c, i) => {
      const can = cur === 0 && !over && ok(c);
      h += cardHTML(c, can ? "can" : cur === 0 && !over ? "dim" : "", `data-act="card" data-i="${i}" role="button"`);
    });
    h += '</div><div class="uno-actions">';
    if (drew && cur === 0 && !over) h += '<button class="btn" data-act="pass" type="button">Pass</button>';
    if (over) h += '<button class="btn solid" data-act="again" type="button">Deal again</button>';
    h += "</div>";
    if (picking !== null) h += '<div class="picker"><div><p>Choose a colour</p>' + COL.map((c) => `<button class="pick ${c}" data-act="color" data-c="${c}" type="button" aria-label="${c}"></button>`).join("") + "</div></div>";
    el.innerHTML = h;
  }
  el.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t || over && t.dataset.act !== "again") return;
    const a = t.dataset.act;
    if (a === "again") {
      start();
      return;
    }
    if (cur !== 0 || picking !== null && a !== "color") return;
    if (a === "card") {
      const i = +t.dataset.i, c = hands[0][i];
      if (!ok(c)) {
        msg = "That card does not match. Try another, or draw.";
        render();
        return;
      }
      if (c.c === "wild") {
        picking = i;
        render();
        return;
      }
      play(0, i);
    } else if (a === "color") {
      play(0, picking, t.dataset.c);
    } else if (a === "draw") {
      if (drew) {
        msg = "You already drew. Play a card or pass.";
        render();
        return;
      }
      const got = draw(0, 1);
      drew = true;
      if (got.length && ok(got[0])) {
        msg = `You drew ${desc(got[0])}. Play it, play another card, or pass.`;
        render();
      } else {
        msg = "You drew a card with no match. Turn passes.";
        render();
        adv(1);
        setTimeout(() => {
          render();
          tick();
        }, 900);
      }
    } else if (a === "pass") {
      drew = false;
      msg = "You passed.";
      adv(1);
      render();
      tick();
    }
  });
  $("unoNew").addEventListener("click", start);
  el.style.setProperty("--c-red", "#d23a3a");
  el.style.setProperty("--c-yellow", "#e6b422");
  el.style.setProperty("--c-green", "#2d9a55");
  el.style.setProperty("--c-blue", "#2c63c8");
  return { open() {
    if (!started) {
      started = true;
      start();
    } else {
      render();
      tick();
    }
  } };
})();
