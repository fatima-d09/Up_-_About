let sayI = 0;
const SAYS = () => {
  const n = Save.d.name || "friend";
  return [
    `Hello ${n}! Welcome to Up & About. Games are on floors 2, 3 and 4.`,
    "Floor 2 is the Game Lounge: Connect 4 and Tic-Tac-Toe.",
    "Floor 3 is the Card Room: a round of Uno with Mira, Theo and Juno.",
    "Floor 4 is the Board Hall: life-size Snakes & Ladders and Property Parade. You are the piece!",
    "Floor 5 is the disco. Bring your dancing shoes!",
    "Fancy a quiet moment? Your own cosy room is down the little stairs, through the yellow door.",
    `Want a game, ${n}? Walk up to a table, or step onto a board and press E.`,
    "Just walk into the elevator and press a button. Easy peasy."
  ];
};
function talkReception() {
  say("Reception", SAYS()[sayI++ % SAYS().length], 200, 120, 4800);
}
const floorsSign = () => {
  ctx.save();
  ctx.translate(760, 68);
  ctx.rotate(0.025);
  paper(-112, -44, 224, 88, 12, "#fff");
  [5, 4, 3, 2, 1].forEach((n, i) => {
    const y = -30 + i * 15;
    ctx.fillStyle = FC[n];
    ctx.beginPath();
    ctx.arc(-92, y, 5, 0, 6.3);
    ctx.fill();
    txt(String(n), -78, y, F(700, 17), INK, "left");
    txt(FL[n], -56, y, N(400, 16), INK, "left");
  });
  ctx.fillStyle = "#e8513f";
  ctx.beginPath();
  ctx.arc(-100, -38, 4, 0, 6.3);
  ctx.arc(100, -38, 4, 0, 6.3);
  ctx.fill();
  ctx.restore();
};
const plants = () => {
  plant(40, 455);
  plant(876, 455);
};
R[1] = {
  name: "Lobby",
  bg() {
    wallpaper(dotsP("#bfe8e4", "#fffdf6", 34, 6));
    labelTag("Lobby", 190, 64, 220, 62, "#f58fb1", -0.03, F(700, 54), "#fff");
    floorsSign();
    floorFill(scribbleP("#d8452e", "#f0714a", "#b5321f"));
    [[175, 138, "#f3c53d"], [155, 121, "#fff7e8"], [133, 103, "#5cc6c0"], [111, 85, "#fff7e8"], [88, 66, "#f58fb1"]].forEach(([rx, ry, c], i) => {
      i === 0 ? blob(480, 340, rx, ry, c) : (ctx.beginPath(), ctx.ellipse(480, 340, rx, ry, 0, 0, 6.3), ctx.fillStyle = c, ctx.fill());
    });
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "rgba(43,29,22,.7)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(480, 340, 165, 129, 0, 0, 6.3);
    ctx.stroke();
    ctx.restore();
    elevatorDoor();
    person(195, 176, { dress: flowerP("#fffdf6", "#e8513f", "#f3c53d"), hair: "#1d130e", style: "bun", skin: "#a66a43", cheek: "rgba(170,80,50,.45)", shoe: "#4a3328", tights: "#f7a23b", name: "Reception" });
    paper(70, 185, 250, 56, 14, "#d99a5b");
    rr(70, 185, 250, 22, [14, 14, 0, 0]);
    ctx.fillStyle = "#efbd88";
    ctx.fill();
    outline();
    ctx.fillStyle = "#c4814a";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(94 + i * 30, 226, 5, 0, 6.3);
      ctx.fill();
    }
    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.arc(150, 185, 9, Math.PI, 0);
    ctx.fill();
    outline(1.3);
    rr(240, 176, 40, 10, 3);
    ctx.fillStyle = "#fff";
    ctx.fill();
    outline(1.3);
    rr(244, 168, 34, 10, 3);
    ctx.fillStyle = "#8ec9f2";
    ctx.fill();
    outline(1.3);
    paper(98, 172, 14, 16, 4, "#5cc6c0");
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      const a = i * 1.2566;
      ctx.beginPath();
      ctx.arc(105 + Math.cos(a) * 5, 166 + Math.sin(a) * 5, 3.2, 0, 6.3);
      ctx.fill();
    }
    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.arc(105, 166, 2.8, 0, 6.3);
    ctx.fill();
    paper(620, 418, 220, 46, 20, "#5cc6c0");
    blob(626, 448, 16, 28, "#4fb4ae");
    blob(834, 448, 16, 28, "#4fb4ae");
    paper(640, 440, 86, 38, 16, "#8fe0da");
    paper(734, 440, 86, 38, 16, "#8fe0da");
    ctx.fillStyle = dotsP("rgba(0,0,0,0)", "rgba(255,255,255,.6)", 16, 2);
    rr(640, 440, 86, 38, 16);
    ctx.fill();
    rr(734, 440, 86, 38, 16);
    ctx.fill();
    blob(730, 386, 44, 18, "#f3c53d");
    blob(722, 380, 8, 5, "#fff");
    blob(742, 382, 5, 3, "#f58fb1");
    plant(40, 455);
    plant(876, 455);
    cast(() => {
      rr(868, 52, 60, 84, [28, 28, 0, 0]);
      ctx.fillStyle = "#f3c53d";
      ctx.fill();
    });
    rr(868, 52, 60, 84, [28, 28, 0, 0]);
    outline();
    rr(876, 62, 44, 74, [22, 22, 0, 0]);
    ctx.fillStyle = "#fff4c9";
    ctx.fill();
    outline(1.2);
    ctx.beginPath();
    ctx.arc(912, 102, 3.4, 0, 6.3);
    inked("#e8513f", 1.1);
    labelTag("My Room \u2193", 898, 152, 112, 26, "#fffdf6", 0, F(700, 18), INK);
    ctx.beginPath();
    ctx.moveTo(886, 92);
    ctx.lineTo(898, 80);
    ctx.lineTo(910, 92);
    ctx.lineTo(906, 92);
    ctx.lineTo(906, 106);
    ctx.lineTo(890, 106);
    ctx.lineTo(890, 92);
    ctx.closePath();
    inked("#f58fb1", 1.1);
  },
  solids: [[70, 185, 250, 56], [30, 150, 40, 95], [40, 455, 44, 40], [876, 455, 44, 40], [620, 432, 220, 48], [690, 368, 80, 34]],
  doorUp: [{ x0: 866, x1: 930, fn: () => goRoom() }],
  spots: [
    { x: 195, y: 272, r: 85, label: "talk to reception", key: "desk", hit: [70, 150, 250, 100], fn: talkReception },
    { x: 898, y: 206, r: 62, label: "go down the stairs to My Room", key: "room", hit: [868, 52, 60, 120], fn: () => goRoom() }
  ],
  npcs: []
};
R[2] = {
  name: "Game Lounge",
  tables: [{ g: "c4", sx: 330, sy: 444 }, { g: "ttt", sx: 690, sy: 444 }],
  bg() {
    wallpaper(ringP("#3b5ea8", "#f6f0d8"));
    labelTag("Game Lounge", 250, 62, 290, 62, "#e8513f", 0.02, F(700, 44), "#fff");
    blob(740, 64, 24, 24, "#e8513f");
    blob(796, 60, 24, 24, "#f3c53d");
    blob(852, 64, 24, 24, "#e8513f");
    floorFill(scribbleP("#bfe0f2", "#ffffff", "#8ec9f2"));
    elevatorDoor();
    ctx.save();
    ctx.translate(-150, 0);
    paper(370, 296, 220, 78, 20, "#e8513f");
    rr(370, 296, 220, 24, [20, 20, 0, 0]);
    ctx.fillStyle = "#ff7a66";
    ctx.fill();
    outline();
    paper(420, 224, 120, 92, 16, "#3c8fe8");
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const k = (r * 6 + c) % 5;
      ctx.fillStyle = r > 1 && k === 0 ? "#e8513f" : r > 1 && k === 2 ? "#f3c53d" : "#fffaf0";
      ctx.beginPath();
      ctx.arc(442 + c * 15.6, 249 + r * 15.5, 6, 0, 6.3);
      ctx.fill();
      outline(1);
    }
    person(480, 300, { look: NPC.aj, face: "s", seated: true, name: "AJ" });
    paper(370, 322, 220, 52, 16, "#e8513f");
    chair(480, 410, "#3c8fe8");
    ctx.restore();
    labelTag("Connect 4", 330, 208, 150, 30, "#fffdf6", -0.02, F(700, 22), INK);
    paper(580, 296, 220, 78, 20, "#8fcf6a");
    rr(580, 296, 220, 24, [20, 20, 0, 0]);
    ctx.fillStyle = "#a9e08a";
    ctx.fill();
    outline();
    paper(640, 226, 100, 92, 14, "#fffaf0");
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const d of [-16, 16]) {
      ctx.beginPath();
      ctx.moveTo(690 + d, 236);
      ctx.lineTo(690 + d, 308);
      ctx.moveTo(654, 272 + d);
      ctx.lineTo(726, 272 + d);
      ctx.stroke();
    }
    txt("\u2715", 658, 254, F(700, 26), "#e8513f");
    txt("\u25CB", 690, 272, F(700, 26), "#4a90e2");
    txt("\u2715", 722, 290, F(700, 26), "#e8513f");
    person(690, 300, { look: NPC.pip, boy: true, pants: "#4a6fb0", face: "s", seated: true, name: "Pip" });
    paper(580, 322, 220, 52, 16, "#8fcf6a");
    chair(690, 410, "#5cc6c0");
    labelTag("Tic-Tac-Toe", 690, 208, 160, 30, "#fffdf6", 0.02, F(700, 22), INK);
    plants();
  },
  solids: [[220, 300, 220, 72], [580, 300, 220, 72], [40, 455, 44, 40], [876, 455, 44, 40]],
  spots: [
    { x: 330, y: 446, r: 80, label: "sit down and play Connect 4", key: "g-c4", hit: [220, 210, 220, 170], fn: () => G.open("c4") },
    { x: 690, y: 446, r: 80, label: "sit down and play Tic-Tac-Toe", key: "g-ttt", hit: [580, 210, 220, 170], fn: () => G.open("ttt") }
  ],
  npcs: []
};
R[3] = {
  name: "Card Room",
  tables: [{ g: "uno", sx: 480, sy: 462 }],
  bg() {
    wallpaper(flowerP("#f6c9a8", "#fff", "#e8513f"));
    labelTag("", 250, 62, 230, 66, "#fff", -0.02, F(700, 50), "#fff");
    ["#e8513f", "#f3c53d", "#5fbf5a"].forEach((c, i) => txt("UNO"[i], 190 + i * 60, 64, F(700, 58), c));
    labelTag("Card Room", 730, 62, 200, 52, "#e8513f", 0.03, F(700, 32), "#fff");
    floorFill(scribbleP("#d8537a", "#f27a9a", "#b53a5e"));
    elevatorDoor();
    const npc = [[330, 350, "#4a90e2", "Mira", "#6a3c22", "pigtails", "#c98a62"], [630, 350, "#5fbf5a", "Theo", "#1d130e", "spiky", "#6d4430"], [480, 282, "#f3c53d", "Juno", "#2b1d16", "curly", "#d9a07a"]];
    for (const [x, y] of npc) chair(x, y + 30, "#f58fb1");
    blob(480, 348, 140, 62, "#c98b52");
    ctx.beginPath();
    ctx.ellipse(480, 338, 126, 52, 0, 0, 6.3);
    ctx.fillStyle = "#6cc08a";
    ctx.fill();
    outline(1.3);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(480, 338, 118, 45, 0, 0, 6.3);
    ctx.stroke();
    ctx.restore();
    for (const [x, y, c, n, h, st, sk] of npc) person(x, y + 14, { dress: c, hair: h, style: st, skin: sk, boy: n === "Theo", face: x < 400 ? "r" : x > 560 ? "l" : "s", seated: true, name: n });
    const cols = ["#e8513f", "#f3c53d", "#5fbf5a", "#4a90e2"];
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(446 + i * 22, 346 + i % 2 * 4);
      ctx.rotate((i - 1.5) * 0.18);
      rr(-10, -14, 20, 28, 3);
      ctx.fillStyle = "#fff";
      ctx.fill();
      outline(1.2);
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, 6.3);
      ctx.fill();
      ctx.restore();
    }
    chair(480, 420, "#f58fb1");
    plants();
  },
  solids: [[350, 312, 260, 60], [40, 455, 44, 40], [876, 455, 44, 40]],
  spots: [{ x: 480, y: 462, r: 90, label: "sit down and play Uno", key: "g-uno", hit: [340, 230, 280, 160], fn: () => G.open("uno") }],
  npcs: []
};
R[4] = {
  name: "Board Hall",
  bg() {
    wallpaper(starP("#bde8c6", "#fffdf6"));
    floorFill(scribbleP("#bfe8a0", "#d4f2b0", "#a5d37e"));
    bunting(["#8fcf6a", "#f3c53d", "#f58fb1", "#5cc6c0"], 4, 12);
    elevatorDoor();
    labelTag("Board Hall", 96, 26, 160, 34, "#5cc6c0", -0.02, F(700, 24), "#fff");
    G.snakes && G.snakes.drawWorld();
    G.mono && G.mono.drawWorld();
  },
  solids: [],
  get spots() {
    const a = G.snakes && G.snakes.spots ? G.snakes.spots() : [], b = G.mono && G.mono.spots ? G.mono.spots() : [];
    return a.concat(b);
  },
  npcs: []
};
R[5] = {
  name: "Disco",
  bg() {
    const e = S.e, t = S.t;
    wallpaper(starP("#2a1a4d", "#ffd86b"));
    bunting(["#ff8fc2", "#ffd86b", "#7de3d8", "#a98bff", "#ffa05c"], 6, 14);
    labelTag("Dance Floor", 668, 64, 210, 58, `hsl(${t * 60 % 360},85%,62%)`, -0.02, F(700, 40), "#fff");
    const cols = 16, rows = 6, tw = 60, th = (H - 133) / rows;
    ctx.fillStyle = "#1a1030";
    ctx.fillRect(0, 133, W, H - 133);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wave = 0.5 + 0.5 * Math.sin(t * 4 + i * 0.7 + j * 1.1), hue = (i * 18 + j * 34 + t * 45) % 360, l = 16 + (e.bass * 36 + e.mid * 10) * wave;
      rr(i * tw + 3, 133 + j * th + 3, tw - 6, th - 6, 10);
      ctx.fillStyle = `hsl(${hue},85%,${l}%)`;
      ctx.fill();
    }
    elevatorDoor();
    paper(50, 155, 190, 44, 14, "#6b4aa8");
    rr(50, 155, 190, 16, [14, 14, 0, 0]);
    ctx.fillStyle = "#8466c4";
    ctx.fill();
    for (const x of [90, 200]) {
      ctx.fillStyle = "#1a1030";
      ctx.beginPath();
      ctx.arc(x, 183, 14, 0, 6.3);
      ctx.fill();
      ctx.strokeStyle = `hsl(${t * 100 % 360},100%,65%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, 183, 11, t * (x / 50), t * (x / 50) + 4);
      ctx.stroke();
    }
    for (const x of [250, 880]) {
      paper(x, 150, 40, 52, 10, "#4a2f7a");
      for (const cy of [170, 190]) {
        ctx.fillStyle = "#2a1a4d";
        ctx.beginPath();
        ctx.arc(x + 20, cy, 8 + e.bass * 5, 0, 6.3);
        ctx.fill();
        ctx.strokeStyle = "#a98bff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    person(145, 150, { dress: "#ff4fa3", hair: "#ffd23a", style: "curly", skin: "#e0a982", face: "s", arms: Math.sin(t * 3) > 0, bob: Math.sin(t * 10) * 2, name: "DJ Poppy" });
  },
  fg() {
    const e = S.e, t = S.t, bx = 740, by = 170;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 8; k++) {
      const a = t * 0.55 + k * Math.PI / 4, w = 0.1 + e.mid * 0.05, len = 620;
      const g = ctx.createRadialGradient(bx, by, 10, bx, by, len);
      const hue = (k * 45 + t * 40) % 360;
      g.addColorStop(0, `hsla(${hue},100%,65%,${0.3 + e.bass * 0.35})`);
      g.addColorStop(1, `hsla(${hue},100%,60%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.arc(bx, by, len, a - w, a + w);
      ctx.closePath();
      ctx.fill();
    }
    for (let n = 0; n < 46; n++) {
      const x = (n * 97 + t * (20 + n % 5 * 9)) % W, y = 140 + (n * 53 + Math.sin(t + n) * 20) % 380, al = 0.25 + 0.75 * Math.abs(Math.sin(t * 5 + n));
      ctx.fillStyle = `rgba(255,255,255,${al * (0.5 + e.high * 0.6)})`;
      ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillRect(x - 4, y, 9, 1);
      ctx.fillRect(x, y - 4, 1, 9);
    }
    ctx.restore();
    ctx.strokeStyle = "#d8d0e8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx, by - 30);
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, 30, 0, 6.3);
    ctx.clip();
    ctx.fillStyle = "#d4d6e4";
    ctx.fillRect(bx - 30, by - 30, 60, 60);
    for (let gx = -30; gx < 30; gx += 7) for (let gy = -30; gy < 30; gy += 7) {
      const s = Math.sin(t * 4 + gx * 0.3 + gy * 0.5 + e.high * 6);
      ctx.fillStyle = `hsl(${(gx * 5 + gy * 3 + t * 60) % 360},${40 + e.high * 50}%,${52 + s * 28}%)`;
      ctx.fillRect(bx + gx, by + gy, 6, 6);
    }
    const sh = ctx.createRadialGradient(bx - 10, by - 10, 4, bx, by, 34);
    sh.addColorStop(0, "rgba(255,255,255,.55)");
    sh.addColorStop(1, "rgba(40,20,80,.4)");
    ctx.fillStyle = sh;
    ctx.fillRect(bx - 30, by - 30, 60, 60);
    ctx.restore();
  },
  solids: [[50, 155, 190, 44], [250, 150, 40, 52], [880, 150, 40, 52]],
  spots: [{ x: 145, y: 228, r: 85, label: "play some music at the DJ booth", key: "dj", hit: [50, 150, 200, 60], fn: () => G.openMusic && G.openMusic() }],
  npcs: [[300, 320, "#e0527a", "Ava", "#4a3328", "pigtails", "#f2c4a0"], [360, 440, "#52c4e0", "Leo", "#2b1d16", "spiky", "#7a4a2e", 1], [640, 330, "#e0c452", "Zoe", "#e07a2f", "bun", "#f2c4a0"], [780, 440, "#8e6be0", "Max", "#1d130e", "spiky", "#5e3a26", 1], [560, 480, "#52e08a", "Ivy", "#1d130e", "puffs", "#8a5636"], [860, 320, "#e08a52", "Sam", "#c0502a", "curly", "#e6b996"]].map(([x, y, c, n, h, st, sk, boy], i) => ({ id: "d" + i, x, y, name: n, dance: i, opts: { dress: c, hair: h, style: st, skin: sk, boy: !!boy, pants: "#4a3b8a" } }))
};
const WIN = { x: 630, y: 28, w: 220, h: 90 };
R[6] = {
  name: "My Room",
  bg() {
    const on = S.light, hour = localHour();
    wallpaper(flowerP("#fde1c8", "#f58fb1", "#f3c53d"));
    floorFill(woodP("#e9b98a", "rgba(110,70,40,.25)"));
    elevatorDoor();
    cast(() => {
      rr(16, 52, 56, 84, [26, 26, 0, 0]);
      ctx.fillStyle = "#f3c53d";
      ctx.fill();
    });
    rr(16, 52, 56, 84, [26, 26, 0, 0]);
    outline();
    rr(24, 62, 40, 74, [20, 20, 0, 0]);
    ctx.fillStyle = "#fff4c9";
    ctx.fill();
    outline(1.2);
    ctx.beginPath();
    ctx.arc(32, 102, 3.2, 0, 6.3);
    inked("#e8513f", 1.1);
    labelTag("Lobby \u2191", 44, 152, 84, 24, "#fffdf6", 0, F(700, 17), INK);
    const { x: wx, y: wy, w: ww, h: wh } = WIN;
    cast(() => {
      rr(wx - 10, wy - 8, ww + 20, wh + 16, 14);
      ctx.fillStyle = "#fffdf6";
      ctx.fill();
    });
    rr(wx - 10, wy - 8, ww + 20, wh + 16, 14);
    outline();
    drawSky(wx, wy, ww, wh, hour);
    ctx.strokeStyle = "#fffdf6";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
    rr(wx, wy, ww, wh, 4);
    outline(1.6);
    for (const [cx, dir] of [[wx - 8, 1], [wx + ww + 8, -1]]) {
      ctx.beginPath();
      ctx.moveTo(cx, wy - 8);
      ctx.lineTo(cx + dir * 30, wy - 8);
      ctx.quadraticCurveTo(cx + dir * 16, wy + 46, cx + dir * 26, wy + wh + 8);
      ctx.lineTo(cx, wy + wh + 8);
      ctx.closePath();
      inked("#f58fb1", 1.5);
    }
    txt(hourLabel(hour), wx + ww / 2, wy + wh + 24, N(400, 16), "#7a5a48");
    cast(() => {
      rr(104, 78, 120, 10, 4);
      ctx.fillStyle = "#b9895a";
      ctx.fill();
    });
    rr(104, 78, 120, 10, 4);
    outline(1.3);
    ["#e8513f", "#4a90e2", "#f3c53d", "#8fcf6a", "#9b7be8"].forEach((c, i) => {
      rr(110 + i * 14, 54 + i % 2 * 4, 11, 24 - i % 2 * 4, 2);
      ctx.fillStyle = c;
      ctx.fill();
      outline(1.1);
    });
    blob(206, 66, 10, 13, "#f7a23b");
    frameArt(256, 44, 56, 44, 0);
    rug(300, 330, 300, 140, "#9b7be8", "#fffaf0");
    bedBase();
    if (!bedOccupied()) bedCovers(false, 0);
    cast(() => {
      rr(560, 190, 50, 50, 8);
      ctx.fillStyle = "#e0894e";
      ctx.fill();
    });
    rr(560, 190, 50, 50, 8);
    outline();
    lamp(585, 160, on);
    cast(() => {
      rr(340, 64, 30, 44, 8);
      ctx.fillStyle = "#fffdf6";
      ctx.fill();
    });
    rr(340, 64, 30, 44, 8);
    outline(1.4);
    rr(348, 70, 14, 32, 5);
    ctx.fillStyle = on ? "#ffd24a" : "#cfcfd6";
    ctx.fill();
    outline(1.1);
    rr(349, on ? 72 : 86, 12, 14, 4);
    ctx.fillStyle = "#fffdf6";
    ctx.fill();
    outline(1);
    cat(240, 470, true);
    plant(860, 360);
  },
  fg() {
    if (S.light) return;
    const hour = localHour(), { x: wx, y: wy, w: ww, h: wh } = WIN;
    ctx.save();
    ctx.fillStyle = "rgba(18,14,50,.72)";
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(wx + ww, wy, -ww, wh);
    ctx.fill("evenodd");
    ctx.restore();
    const c = skyColors(hour);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(wx + ww / 2, wy + wh, 10, wx + ww / 2, wy + wh + 120, 300);
    g.addColorStop(0, c.night > 0.5 ? "rgba(110,130,220,.3)" : "rgba(255,230,170,.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
  solids: [[604, 156, 310, 170], [556, 188, 58, 56], [230, 440, 40, 36], [848, 356, 50, 56]],
  doorUp: [{ x0: 12, x1: 76, fn: () => goLobbyDoor() }],
  spots: [
    { x: 700, y: 352, r: 74, label: "climb into bed", key: "bed", hit: [604, 156, 310, 170], fn: () => toggleBed() },
    { x: 355, y: 172, r: 62, label: "flip the light switch", key: "sw", hit: [330, 56, 50, 60], fn: () => toggleLight() },
    { x: 43, y: 196, r: 60, label: "go back up to the lobby", key: "up", hit: [16, 52, 56, 110], fn: () => goLobbyDoor() },
    { x: 740, y: 178, r: 70, label: "look out the window", key: "win", hit: [620, 20, 240, 110], fn: () => {
      toast("It is " + hourLabel(localHour()) + " where you are.");
    } }
  ],
  npcs: []
};
const BEDHEAD = { x: 684, y: 240 };
function bedOccupied() {
  return !!S.me.bed && S.floor === 6;
}
function bedBase() {
  cast(() => {
    rr(620, 170, 290, 150, 18);
    ctx.fillStyle = "#b9895a";
    ctx.fill();
  });
  rr(620, 170, 290, 150, 18);
  outline();
  cast(() => {
    rr(604, 154, 30, 182, 14);
    ctx.fillStyle = "#9a6a3e";
    ctx.fill();
  });
  rr(604, 154, 30, 182, 14);
  outline();
  rr(636, 182, 262, 126, 12);
  ctx.fillStyle = "#fffdf6";
  ctx.fill();
  outline(1.3);
  cast(() => {
    rr(642, 198, 86, 84, 24);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });
  rr(642, 198, 86, 84, 24);
  ctx.fillStyle = "#fff";
  ctx.fill();
  outline(1.4);
  stitch(642, 198, 86, 84, 24, "rgba(142,201,242,.95)");
}
function bedCovers(occ, br) {
  const x = 716, y = occ ? 206 - br * 1.4 : 190, w = 186, h = occ ? 106 : 116;
  cast(() => {
    rr(x, y, w, h, 16);
    ctx.fillStyle = "#f7a23b";
    ctx.fill();
  });
  rr(x, y, w, h, 16);
  ctx.fillStyle = dotsP("#f7a23b", "#fffdf6", 22, 3.4);
  ctx.fill();
  outline(1.5);
  stitch(x, y, w, h, 16);
  if (occ) {
    ctx.beginPath();
    ctx.ellipse(x + 34, y + h * 0.46 + br, 34, h * 0.44, 0, 0, 6.3);
    ctx.fillStyle = dotsP("#f7a23b", "#fffdf6", 22, 3.4);
    ctx.fill();
    outline(1.4);
  }
  rr(x, y, 34, h, [16, 0, 0, 16]);
  ctx.fillStyle = stripeP("#fffdf6", "#bfe8e4", 6);
  ctx.fill();
  outline(1.4);
}
