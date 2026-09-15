const fs = require('fs');
const path = require('path');
const pngjs = require('pngjs');
const PNG = pngjs.PNG;

const OUT = path.join(__dirname, '..', 'assets', 'images', 'dashboard');
const S = 128;

const C = {
  navy: [15, 23, 42, 255],
  slate: [27, 38, 56, 255],
  gold: [212, 175, 55, 255],
  goldD: [184, 148, 42, 255],
  goldS: [212, 175, 55, 60],
  white: [248, 250, 252, 255],
};

function mk(bg = C.navy) {
  const p = new PNG({ width: S, height: S });
  for (let i = 0; i < p.data.length; i += 4) {
    p.data[i] = bg[0]; p.data[i+1] = bg[1]; p.data[i+2] = bg[2]; p.data[i+3] = bg[3];
  }
  return p;
}

function px(p, x, y, c) {
  if (x < 0 || x >= S || y < 0 || y >= S) return;
  const i = (S * y + x) * 4;
  const a = c[3] / 255;
  if (a >= 1) { p.data[i] = c[0]; p.data[i+1] = c[1]; p.data[i+2] = c[2]; p.data[i+3] = c[3]; return; }
  p.data[i] = Math.round(c[0] * a + p.data[i] * (1 - a));
  p.data[i+1] = Math.round(c[1] * a + p.data[i+1] * (1 - a));
  p.data[i+2] = Math.round(c[2] * a + p.data[i+2] * (1 - a));
  p.data[i+3] = 255;
}

function rect(p, x, y, w, h, c, fill) {
  if (fill) { for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) px(p, px, py, c); }
  else { line(p, x, y, x + w - 1, y, c); line(p, x, y + h - 1, x + w - 1, y + h - 1, c); line(p, x, y, x, y + h - 1, c); line(p, x + w - 1, y, x + w - 1, y + h - 1, c); }
}

function circle(p, cx, cy, r, c, fill) {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = (x - cx) ** 2 + (y - cy) ** 2;
    if (fill && d <= r * r) px(p, x, y, c);
    else if (!fill && d <= r * r && d > (r - 1.5) * (r - 1.5)) px(p, x, y, c);
  }
}

function line(p, x0, y0, x1, y1, c, t = 1) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    for (let tx = -Math.floor(t/2); tx <= Math.floor(t/2); tx++)
      for (let ty = -Math.floor(t/2); ty <= Math.floor(t/2); ty++)
        px(p, x0 + tx, y0 + ty, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

function save(p, name) { fs.writeFileSync(path.join(OUT, name), PNG.sync.write(p)); }

function newCase() {
  const p = mk();
  rect(p, 32, 20, 64, 88, C.goldS, true); rect(p, 32, 20, 64, 88, C.gold);
  for (let i = 0; i < 4; i++) line(p, 42, 38 + i * 14, 86, 38 + i * 14, C.goldD);
  circle(p, 64, 74, 18, C.gold, true);
  line(p, 56, 74, 72, 74, C.navy, 3); line(p, 64, 66, 64, 82, C.navy, 3);
  return p;
}

function aiAssistant() {
  const p = mk();
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; pts.push([64 + 38 * Math.cos(a), 64 + 38 * Math.sin(a)]); }
  for (let i = 0; i < 6; i++) { const n = (i + 1) % 6; line(p, pts[i][0], pts[i][1], pts[n][0], pts[n][1], C.gold, 2); }
  const nodes = [[49, 52], [79, 52], [64, 64], [46, 74], [82, 74], [64, 82]];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) line(p, nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1], C.goldS);
  for (const [nx, ny] of nodes) { circle(p, nx, ny, 4, C.white, true); circle(p, nx, ny, 4, C.gold); }
  return p;
}

function courtDiary() {
  const p = mk();
  rect(p, 24, 28, 80, 72, C.slate, true); rect(p, 24, 28, 80, 72, C.gold);
  line(p, 64, 28, 64, 100, C.gold, 2);
  for (let i = 0; i < 5; i++) { line(p, 32, 42 + i * 12, 58, 42 + i * 12, C.goldD); line(p, 70, 42 + i * 12, 96, 42 + i * 12, C.goldD); }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rect(p, 72 + c * 7, 44 + r * 7, 6, 6, C.goldS);
  return p;
}

function draftLibrary() {
  const p = mk();
  for (let i = 0; i < 3; i++) { const o = i * 6; rect(p, 28 + o, 24 + o, 68, 80, C.slate, true); rect(p, 28 + o, 24 + o, 68, 80, C.goldD); }
  for (let i = 0; i < 4; i++) line(p, 40, 44 + i * 12, 88, 44 + i * 12, C.gold);
  line(p, 92, 30, 78, 70, C.white, 2);
  return p;
}

function bareActs() {
  const p = mk();
function search() {
  const p = mk();
  circle(p, 56, 56, 26, C.gold); circle(p, 56, 56, 22, C.goldS, true);
  line(p, 76, 76, 92, 92, C.gold, 4);
  rect(p, 36, 50, 52, 40, C.slate, true);
  for (let i = 0; i < 3; i++) line(p, 42, 60 + i * 10, 82, 60 + i * 10, C.goldD);
  return p;
}

function hearings() {
  const p = mk();
  circle(p, 64, 64, 36, C.gold); circle(p, 64, 64, 32, C.slate, true);
  for (let i = 0; i < 12; i++) { const a = (Math.PI / 6) * i; line(p, 64 + 26 * Math.sin(a), 64 - 26 * Math.cos(a), 64 + 32 * Math.sin(a), 64 - 32 * Math.cos(a), C.gold); }
  line(p, 64, 64, 64, 48, C.white, 3); line(p, 64, 64, 82, 56, C.white, 2);
  circle(p, 64, 64, 3, C.gold, true);
  return p;
}

function activeCases() {
  const p = mk();
  rect(p, 28, 40, 72, 52, C.slate, true); rect(p, 28, 40, 72, 52, C.gold);
  line(p, 48, 40, 48, 28, C.gold, 3); line(p, 80, 40, 80, 28, C.gold, 3); line(p, 48, 28, 80, 28, C.gold, 3);
  rect(p, 60, 52, 8, 6, C.gold, true); circle(p, 92, 36, 6, C.gold, true);
  return p;
}

function pendingCases() {
  const p = mk();
  line(p, 44, 30, 84, 30, C.gold, 2); line(p, 44, 98, 84, 98, C.gold, 2);
  line(p, 44, 30, 64, 60, C.gold, 2); line(p, 84, 30, 64, 60, C.gold, 2);
  line(p, 44, 98, 64, 68, C.gold, 2); line(p, 84, 98, 64, 68, C.gold, 2);
  rect(p, 52, 40, 24, 16, C.goldS, true); rect(p, 54, 84, 20, 8, C.goldS, true);
  return p;
}

function revenue() {
  const p = mk();
  circle(p, 64, 64, 32, C.gold, true); circle(p, 64, 64, 32, C.white); circle(p, 64, 64, 26, C.goldD);
  line(p, 56, 52, 68, 52, C.navy, 2); line(p, 68, 52, 56, 64, C.navy, 2);
  line(p, 56, 64, 72, 64, C.navy, 2); line(p, 62, 64, 68, 72, C.navy, 2); line(p, 68, 72, 60, 78, C.navy, 2);
  return p;
}

function clientMeetings() {
  const p = mk();
  circle(p, 64, 50, 12, C.gold, true); rect(p, 48, 62, 32, 20, C.gold, true);
  circle(p, 36, 58, 9, C.goldD, true); rect(p, 26, 67, 20, 15, C.goldD, true);
  circle(p, 92, 58, 9, C.goldD, true); rect(p, 82, 67, 20, 15, C.goldD, true);
  return p;
}

function notifications() {
  const p = mk();
  circle(p, 64, 60, 26, C.gold, true); line(p, 40, 68, 88, 68, C.gold, 3);
  line(p, 64, 68, 64, 88, C.gold, 3); circle(p, 64, 90, 4, C.white, true); circle(p, 64, 34, 4, C.gold, true);
  circle(p, 64, 60, 32, C.goldD);
  return p;
}

function holidays() {
  const p = mk();
  rect(p, 28, 24, 72, 80, C.slate, true); rect(p, 28, 24, 72, 80, C.gold);
  circle(p, 44, 20, 4, C.gold); circle(p, 64, 20, 4, C.gold); circle(p, 84, 20, 4, C.gold);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) rect(p, 34 + c * 12, 36 + r * 16, 10, 12, C.goldS);
  rect(p, 58, 52, 10, 12, C.gold, true);
  return p;
}

function causeList() {
  const p = mk();
  rect(p, 28, 20, 72, 88, C.slate, true); rect(p, 28, 20, 72, 88, C.gold);
  for (let i = 0; i < 5; i++) { const y = 32 + i * 15; circle(p, 40, y + 4, 5, C.goldS, true); line(p, 50, y + 4, 96, y + 4, C.goldD); }
  circle(p, 88, 90, 10, C.goldD);
  return p;
}

function legalNews() {
  const p = mk();
  rect(p, 24, 24, 80, 80, C.slate, true); rect(p, 24, 24, 80, 80, C.gold);
  rect(p, 30, 30, 68, 12, C.gold, true);
  for (let c = 0; c < 3; c++) { const cx = 32 + c * 22; for (let r = 0; r < 4; r++) line(p, cx, 52 + r * 14, cx + 16, 52 + r * 14, C.goldD); }
  return p;
}

function calendar() {
  const p = mk();
  rect(p, 20, 24, 88, 80, C.slate, true); rect(p, 20, 24, 88, 80, C.gold);
  rect(p, 20, 24, 88, 20, C.gold, true);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) rect(p, 26 + c * 14, 52 + r * 14, 12, 12, C.goldS);
  rect(p, 54, 66, 12, 12, C.white, true);
  return p;
}

function time() {
  const p = mk();
  circle(p, 64, 64, 38, C.gold); circle(p, 64, 64, 34, C.slate, true);
  for (let i = 0; i < 12; i++) { const a = (Math.PI / 6) * i; const m = i % 3 === 0; line(p, 64 + (m ? 24 : 28) * Math.sin(a), 64 - (m ? 24 : 28) * Math.cos(a), 64 + 34 * Math.sin(a), 64 - 34 * Math.cos(a), C.gold, m ? 2 : 1); }
  line(p, 64, 64, 64, 46, C.white, 3); line(p, 64, 64, 78, 74, C.white, 2);
  circle(p, 64, 64, 3, C.gold, true);
  return p;
}

const assets = {
  'new-case.png': newCase, 'ai-assistant.png': aiAssistant, 'court-diary.png': courtDiary,
  'draft-library.png': draftLibrary, 'bare-acts.png': bareActs, 'search.png': search,
  'hearings.png': hearings, 'active-cases.png': activeCases, 'pending-cases.png': pendingCases,
  'revenue.png': revenue, 'client-meetings.png': clientMeetings, 'notifications.png': notifications,
  'holidays.png': holidays, 'cause-list.png': causeList, 'legal-news.png': legalNews,
  'calendar.png': calendar, 'time.png': time,
};

let ok = 0;
for (const [name, fn] of Object.entries(assets)) {
  try { save(fn(), name); ok++; } catch(e) { console.error('FAIL', name, e.message); }
}
console.log('Generated ' + ok + '/' + Object.keys(assets).length);

  rect(p, 28, 24, 72, 80, C.slate, true); rect(p, 28, 24, 72, 80, C.gold);
  line(p, 64, 38, 80, 54, C.white, 3); rect(p, 74, 48, 18, 10, C.gold, true);
  for (let i = 0; i < 3; i++) line(p, 38, 70 + i * 10, 96, 70 + i * 10, C.goldD);
  return p;
}

function search() {
  const p = mk();
  circle(p, 56, 56, 26, C.gold); circle(p, 56, 56, 22, C.goldS, true);
  line(p, 76, 76, 92, 92, C.gold, 4);
  rect(p, 36, 50, 52, 40, C.slate, true);
  for (let i = 0; i < 3; i++) line(p, 42, 60 + i * 10, 82, 60 + i * 10, C.goldD);
  return p;
}
