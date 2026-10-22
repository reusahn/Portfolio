// room for one more  mat 236 project 1
// draw  pull  throw

// base colors
const inks = [
  [246, 111, 101],
  [249, 177, 57],
  [95, 188, 223],
  [167, 128, 226],
  [132, 197, 133],
  [235, 116, 168]
];
let pad; // drawing pad
let helpbox; // help bounds
let ui = []; // top button bounds
let draft = null; // unfinished shape
let pieces = []; // flying and placed shapes
let ink = 0; // current color
let prevink = -1; // previous preset color
let palopen = false; // picker open
let hueval = 0; // hue position
let satval = 1; // saturation position
let litval = 1; // brightness position
let picktone = null; // saved saturation and brightness
let inputby = null; // active input source
let action = null; // current input action
let touchid = null; // active finger id
let lasttap = -1000; // last touch time
let helpopen = false; // help open
let helplay = ''; // help layout
let helprows = []; // help lines
let helptext = ''; // last help content
let pointer = { x: 0, y: 0 }; // current drag point
let hover = { x: -100, y: -100 }; // mouse hover point
let dragfrom = null; // aim pull start
let score = 0; // color match points
let shots = 0; // throws on this side
let combo = 0; // matching streak
let hint = ''; // short message
let hintend = 0; // message end time
let skyedge = 0; // bottom of play area
let lasttick = 0; // previous frame time
let camstate = 'off'; // camera status
let camerr = ''; // camera error
let cam = null; // webcam capture
let model = null; // handpose model
let hands = []; // latest hand data
let camtoken = 0; // camera request id
let fistdown = false; // fist pressed
let cursor = null; // hand cursor
let waitopen = false; // wait for open hand
let losthand = 0; // frames without hand
let prevhand = { x: 0, y: 0 }; // smoothed hand point
let holdn = 0; // fist frame count
let openn = 0; // open hand frame count
let handseq = 0; // hand detection count
let seenframe = -1; // last processed detection
let seenat = 0; // last hand time
const gaprad = 20; // gap fill distance
const fillmax = 0.97; // auto save threshold
let fillpct = 0; // filled area with small gaps
let inkfill = 0; // actual shape coverage
let savenext = false; // save pending
let mansave = false; // manual save pending
let autoat = null; // auto save start time
let startat = new Date(); // side start time
let page = 1; // side number
let lastfill = 0; // last fill check
let saved = []; // archived sides
let faceidx = -1; // selected archive side
let slide = null; // side transition
let turnyaw = 0; // archive rotation
let facelist = []; // visible archive faces
let turndrag = null; // archive drag state
let pieceid = 1; // shape id counter

// canvas setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont('Arial');
  arrange();
  nextink();
  say('DRAW A LINE OR CURVE IN THE PAD');
}

// next color
function nextink() {
  if (picktone) {
    hueval = random(360);
    ink = hsvrgb(hueval, picktone.s, picktone.v);
    prevink = -1;
  } else {
    const choices = inks.map((_, i) => i).filter((i) => i !== prevink);
    ink = random(choices);
    prevink = ink;
  }
  palopen = false;
}

// rgb from color
function getrgb(value) {
  return Array.isArray(value) ? value : inks[value];
}

// hsv to rgb
function hsvrgb(h, s, v) {
  // channel on hue wheel
  const part = (n) => (n + h / 60) % 6;
  // channel brightness
  const channel = (n) => v - v * s * max(0, min(part(n), 4 - part(n), 1));
  return [round(channel(5) * 255), round(channel(3) * 255), round(channel(1) * 255)];
}

// rgb to hsv
function rgbhsv(rgb) {
  const [r, g, b] = rgb.map((n) => n / 255);
  const brightest = max(r, g, b);
  const darkest = min(r, g, b);
  const range = brightest - darkest;
  let h = 0;
  if (range > 0) {
    if (brightest === r) h = ((g - b) / range) % 6;
    else if (brightest === g) h = (b - r) / range + 2;
    else h = (r - g) / range + 4;
  }
  return {
    h: (h * 60 + 360) % 360,
    s: brightest ? range / brightest : 0,
    v: brightest
  };
}

// color match
function matchink(a, b) {
  const first = getrgb(a), second = getrgb(b);
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]) < 45;
}

// picker bounds
function palbox() {
  const w = min(220, width - 16);
  const x = constrain(pad.x + pad.w - w - 8, 8, width - w - 8);
  const y = max(8, pad.y - 188);
  return {
    x, y, w, h: 171,
    square: { x: x + 12, y: y + 12, w: w - 24, h: 105 },
    hue: { x: x + 12, y: y + 132, w: w - 24, h: 15 }
  };
}

// box hit test
function inbox(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

// picked color
function setink(x, y, part) {
  const box = palbox()[part];
  const amount = constrain((x - box.x) / box.w, 0, 1);
  if (part === 'hue') {
    hueval = amount * 359.9;
    if (!picktone) picktone = { s: satval, v: litval };
  } else {
    satval = amount;
    litval = 1 - constrain((y - box.y) / box.h, 0, 1);
    picktone = { s: satval, v: litval };
  }
  ink = hsvrgb(hueval, picktone.s, picktone.v);
  prevink = -1;
  if (draft) draft.color = ink;
}

// canvas layout
function arrange() {
  const w = min(390, max(180, width - 36)),
    h = height < 560 ? 110 : 142;
  // space for pulling back
  const margin = height < 560 ? 50 : 70;
  pad = { x: (width - w) / 2, y: height - h - margin, w, h };
  palopen = false;
  const layout = width >= 960 ? 'wide' : 'compact';
  if (layout !== helplay) {
    helpopen = false;
    helplay = layout;
  }
  helptext = '';
  sethelp();
  skyedge = max(130, pad.y - 18);
  ui = [];
  addbtn('hand', width - (width < 600 ? 92 : 120), 65, width < 600 ? 76 : 96, 29);
  addbtn('seal', width - (width < 600 ? 170 : 208), 65, width < 600 ? 68 : 78, 29);
  fillrate();
}

// help bounds
function sethelp() {
  const wide = width >= 960;
  const w = helpopen ? (wide ? 220 : min(280, width - 32)) : 78;
  const h = helpopen ? 68 + helprows.length * 17 : 34;
  const bottom = height < 560 ? 8 : 16;
  helpbox = {
    x: wide ? pad.x + pad.w + 24 : 16,
    y: wide ? max(16, min(pad.y, height - h - 18)) : height - h - bottom,
    w,
    h
  };
}

// button bounds
function addbtn(id, x, y, w, h) {
  ui.push({ id, x, y, w, h });
}

// resize positions
function windowResized() {
  if (slide) {
    slide.old.remove();
    slide = null;
    startat = new Date();
  }
  const sx = windowWidth / width,
    sy = windowHeight / height;
  for (const p of pieces) {
    p.start.x *= sx;
    p.start.y *= sy;
    p.target.x *= sx;
    p.target.y *= sy;
    p.x *= sx;
    p.y *= sy;
  }
  resizeCanvas(windowWidth, windowHeight);
  draft = null;
  inputby = null;
  action = null;
  arrange();
}

// pad hit test
function inpad(x, y) {
  return x >= pad.x && x <= pad.x + pad.w && y >= pad.y && y <= pad.y + pad.h;
}

// button hit test
function hitbtn(x, y) {
  return ui.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
}

// short hint
function say(s) {
  hint = s;
  hintend = millis() + 3500;
}

// frame update
function draw() {
  const now = millis(),
    dt = min(0.05, max(0, (now - lasttick) / 1000));
  lasttick = now;
  background(249, 249, 247);
  if (slide) {
    drawslide();
    drawtop();
    drawgallery();
    trackhand();
    if (cursor) drawhand();
    return;
  }
  flyforms(dt);
  settleall(dt);
  if (pieces.length && now - lastfill > 450) {
    fillrate();
    lastfill = now;
    autosave();
  }
  if (
    savenext &&
    !pieces.some((p) => p.phase === 'flying') &&
    (mansave ||
      pieces.every((p) => Math.hypot(p.vx || 0, p.vy || 0) < 0.08) ||
      (autoat !== null && now - autoat > 2200))
  ) {
    savenext = false;
    mansave = false;
    autoat = null;
    storepage();
    return;
  }
  drawforms();
  drawpad();
  drawdraft();
  drawtop();
  drawgallery();
  drawpal();
  trackhand();
  if (cursor) drawhand();
}

// pad and color dot
function drawpad() {
  fill(254);
  stroke(37, 46, 53, 150);
  strokeWeight(1.2);
  rect(pad.x, pad.y, pad.w, pad.h, 3);
  noStroke();
  fill(132, 140, 143);
  textAlign(LEFT, TOP);
  textSize(9);
  text(
    draft
      ? 'PULL FROM CENTER'
      : camstate === 'on'
        ? 'MOUSE / TOUCH PAD'
        : 'DRAW HERE',
    pad.x + 18,
    pad.y + 17
  );
  const rgb = getrgb(draft ? draft.color : ink);
  const colx = pad.x + pad.w - 26;
  const coly = pad.y + 27;
  noFill();
  stroke(104, 112, 116, dist(hover.x, hover.y, colx, coly) < 20 ? 180 : 85);
  strokeWeight(1);
  circle(colx, coly, 31);
  noStroke();
  fill(...rgb);
  circle(colx, coly, 16);
  if (camstate === 'on') drawcam();
}

// color picker
function drawpal() {
  if (!palopen) return;
  const picker = palbox();
  const square = picker.square;
  const hue = picker.hue;
  fill(255, 248);
  stroke(161, 170, 173, 190);
  strokeWeight(1);
  rect(picker.x, picker.y, picker.w, picker.h, 8);
  noStroke();
  fill(...hsvrgb(hueval, 1, 1));
  rect(square.x, square.y, square.w, square.h);
  for (let x = 0; x < square.w; x++) {
    noStroke();
    fill(255, 255, 255, (1 - x / square.w) * 255);
    rect(square.x + x, square.y, 1.1, square.h);
  }
  for (let y = 0; y < square.h; y++) {
    fill(0, 0, 0, (y / square.h) * 255);
    rect(square.x, square.y + y, square.w, 1.1);
  }
  for (let x = 0; x < hue.w; x++) {
    fill(...hsvrgb((x / hue.w) * 360, 1, 1));
    rect(hue.x + x, hue.y, 1.1, hue.h);
  }
  noFill();
  stroke(49, 56, 60);
  strokeWeight(1);
  rect(square.x, square.y, square.w, square.h);
  rect(hue.x, hue.y, hue.w, hue.h);
  stroke(39, 47, 52);
  strokeWeight(3);
  circle(square.x + satval * square.w,
    square.y + (1 - litval) * square.h, 14);
  stroke(255);
  strokeWeight(1.5);
  circle(square.x + satval * square.w,
    square.y + (1 - litval) * square.h, 14);
  stroke(255);
  strokeWeight(2);
  line(hue.x + hueval / 360 * hue.w, hue.y - 3,
    hue.x + hueval / 360 * hue.w, hue.y + hue.h + 3);
  stroke(39, 47, 52);
  strokeWeight(1);
  line(hue.x + hueval / 360 * hue.w + 2, hue.y - 3,
    hue.x + hueval / 360 * hue.w + 2, hue.y + hue.h + 3);
  noStroke();
}

// help panel
function drawhelp() {
  if (slide || faceidx >= 0) return;
  const hand = camstate === 'on',
    aim = !!draft?.strokes.length;
  const lines = hand
    ? aim
      ? [
          'Move to the center circle.',
          'Close your fist and pull back.',
          'Open your hand to throw.'
        ]
      : [
          'Close your fist to press.',
          'Move freely to draw.',
          'Open your hand to release.'
        ]
    : aim
      ? [
          'Grab the center circle.',
          'Hold and pull the shape back.',
          'Release to throw. Space also throws.'
        ]
      : [
          'Draw a line or curve in the pad.',
          'Grab its center and pull back.',
          'Release to throw it into open space.'
        ];
  const note = millis() < hintend ? hint : '';
  lines.push(hand ? 'Fist on the color dot, then drag in the picker.' : 'Click the color dot, then drag in the picker.');
  const content = lines.join('|') + note + width;
  push();
  textSize(12);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  if (content !== helptext) {
    helptext = content;
    helprows = [];
    const linew = (width >= 960 ? 220 : min(280, width - 32)) - 26;
    for (let i = 0; i < lines.length; i++) {
      helprows.push(...wraptext(i + 1 + '. ' + lines[i], linew));
    }
    if (note) {
      helprows.push('');
      helprows.push(...wraptext(note, linew));
    }
    sethelp();
  }
  const b = helpbox;
  fill(249, 249, 247, 250);
  stroke(214, 220, 221);
  strokeWeight(1);
  rect(b.x, b.y, b.w, b.h, 7);
  noStroke();
  fill(82, 102, 110);
  textSize(11);
  text(helpopen ? '×  HELP' : '?  HELP', b.x + 12, b.y + 10);
  if (helpopen) {
    fill(53, 71, 78);
    textSize(10);
    text(hand ? 'HAND · WHOLE SCREEN' : 'DRAW · PULL · THROW', b.x + 12, b.y + 35);
    fill(52, 66, 74);
    textSize(12);
    for (let i = 0; i < helprows.length; i++)
      text(helprows[i], b.x + 12, b.y + 53 + i * 17);
  }
  pop();
}

// wrap help text
function wraptext(message, linew) {
  const lines = [];
  let line = '';
  for (const word of message.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && textWidth(next) > linew) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// title and controls
function drawtop() {
  const mobile = width < 600;
  noStroke();
  fill(34, 39, 43);
  textAlign(LEFT, TOP);
  textSize(mobile ? 14 : 16);
  textStyle(NORMAL);
  const title = 'ROOM FOR ONE MORE';
  text(title, 20, 20);
  const progx = 20 + textWidth(title) + 18;
  const progside = progx + 92 < width - 100;
  fill(120, 128, 135);
  textSize(10);
  text(
    floor(fillpct * 100) + '%  →  97%',
    progside ? progx : 21,
    progside ? 24 : 46
  );
  for (const b of ui) {
    const on = b.id === 'hand' && camstate === 'on';
    noStroke();
    fill(on ? color(45, 56, 65) : color(255));
    rect(b.x, b.y, b.w, b.h, 8);
    noFill();
    stroke(65, 75, 83, on ? 0 : 65);
    strokeWeight(1);
    rect(b.x, b.y, b.w, b.h, 8);
    noStroke();
    fill(on ? 255 : 58);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(
      b.id === 'hand'
        ? camstate === 'on'
          ? 'HAND ON'
          : camstate === 'loading'
            ? 'CANCEL'
            : 'HAND OFF'
        : savenext
          ? 'SAVING…'
          : 'SAVE/NEXT',
      b.x + b.w / 2,
      b.y + b.h / 2
    );
  }
  drawshelf();
  if (camstate === 'loading' || camstate === 'error' ||
      (camstate === 'on' && !hands.length)) {
    fill(camstate === 'error' ? color(186, 62, 61) : color(107, 119, 125));
    textSize(9);
    const s =
      camstate === 'loading'
        ? 'STARTING HAND…'
        : camstate === 'error'
          ? 'HAND ERROR: ' + camerr
          : 'SHOW YOUR HAND';
    text(s, 21, mobile ? 111 : 106, min(width - 35, 510));
  }
  drawhelp();
}

// camera preview
function drawcam() {
  if (!cam?.elt || cam.elt.readyState < 2) return;
  const w = 112,
    h = 83,
    x = width - w - 18,
    y = height - pad.h - h - 83;
  push();
  noStroke();
  fill(255, 240);
  rect(x - 4, y - 4, w + 8, h + 8, 7);
  translate(x + w, y);
  scale(-1, 1);
  drawingContext.drawImage(cam.elt, 0, 0, w, h);
  pop();
  if (hands.length) {
    const hand = hands[0],
      vw = cam.elt.videoWidth || 640,
      vh = cam.elt.videoHeight || 480;
    const point = getpalm(hand);
    if (point) {
      fill(36, 115, 103);
      stroke(255);
      strokeWeight(1.5);
      circle(x + (point.x / vw) * w, y + (point.y / vh) * h, fistdown ? 13 : 10);
    }
  }
}

// drawing preview
function drawdraft() {
  if (!draft) return;
  const rgb = getrgb(draft.color);
  if (draft.strokes.length) {
    const body = makeform(draft.strokes);
    const shift =
      action?.type === 'aim'
        ? { x: pointer.x - dragfrom.x, y: pointer.y - dragfrom.y }
        : { x: 0, y: 0 };
    if (action?.type === 'aim') {
      noFill();
      stroke(165, 172, 174, 170);
      strokeWeight(1.2);
      drawingContext.setLineDash([5, 5]);
      pathshape(
        body.outline.map((q) => ({ x: q.x + body.center.x, y: q.y + body.center.y }))
      );
      drawingContext.setLineDash([]);
    }
    fill(...rgb);
    stroke(40, 46, 51);
    strokeWeight(3.2);
    strokeJoin(ROUND);
    pathshape(
      body.outline.map((q) => ({
        x: q.x + body.center.x + shift.x,
        y: q.y + body.center.y + shift.y
      }))
    );
    const cx = body.center.x + shift.x,
      cy = body.center.y + shift.y;
    if (action?.type === 'aim') {
      noFill();
      stroke(47, 55, 60);
      strokeWeight(1.4);
      line(cx, cy, body.center.x, body.center.y);
      circle(body.center.x, body.center.y, 8);
      const ax = constrain(
        -shift.x * 1.5,
        -min(135, width * 0.28),
        min(135, width * 0.28)
      );
      const ay = constrain(-shift.y * 1.5, -min(160, height * 0.22), 80) - 32;
      const ex = cx + ax,
        ey = cy + ay,
        a = atan2(ay, ax);
      drawingContext.setLineDash([4, 5]);
      line(cx, cy, ex, ey);
      drawingContext.setLineDash([]);
      line(ex, ey, ex - 11 * cos(a - 0.5), ey - 11 * sin(a - 0.5));
      line(ex, ey, ex - 11 * cos(a + 0.5), ey - 11 * sin(a + 0.5));
    }
    fill(254);
    stroke(40, 46, 51);
    strokeWeight(1.7);
    circle(cx, cy, 15);
    noStroke();
    fill(40, 46, 51);
    circle(cx, cy, 3.5);
  }
  noFill();
  stroke(...rgb, 190);
  strokeWeight(8);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  if (action?.type === 'drawing' && action.path) {
    beginShape();
    for (const p of action.path) vertex(p.x, p.y);
    endShape();
  }
}

// gap between strokes
function linkline() {
  if (!draft || draft.strokes.length < 2) return null;
  const st = draft.strokes,
    a = st[st.length - 2].at(-1),
    b = st.at(-1)[0];
  return { a, b };
}

// distance to sketch
function nearmark(x, y) {
  if (!draft) return Infinity;
  let best = Infinity;
  for (const s of draft.strokes) {
    if (s.length === 1) {
      best = min(best, dist(x, y, s[0].x, s[0].y));
      continue;
    }
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1],
        b = s[i],
        dx = b.x - a.x,
        dy = b.y - a.y;
      const t = constrain(
        ((x - a.x) * dx + (y - a.y) * dy) / max(0.0001, dx * dx + dy * dy),
        0,
        1
      );
      best = min(best, dist(x, y, a.x + t * dx, a.y + t * dy));
    }
  }
  return best;
}

// start input
function beginat(x, y, source) {
  if (inputby) return;
  if (faceidx >= 0) {
    viewbegin(x, y, source);
    return;
  }
  if (slide) return;
  inputby = source;
  pointer = { x, y };
  if (palopen) {
    const picker = palbox();
    const reach = source === 'hand' ? 12 : 6;
    const huebox = {
      x: picker.hue.x,
      y: picker.hue.y - reach,
      w: picker.hue.w,
      h: picker.hue.h + reach * 2
    };
    const part = inbox(x, y, huebox)
      ? 'hue'
      : inbox(x, y, picker.square)
        ? 'square'
        : null;
    if (part) {
      action = { type: 'color', part };
      setink(x, y, part);
    } else {
      palopen = false;
      action = { type: 'button' };
    }
    return;
  }
  if (
    helpbox &&
    x >= helpbox.x &&
    x <= helpbox.x + helpbox.w &&
    y >= helpbox.y &&
    y <= helpbox.y + helpbox.h
  ) {
    palopen = false;
    if (y < helpbox.y + 34) {
      helpopen = !helpopen;
      sethelp();
    }
    action = { type: 'button' };
    return;
  }
  const b = hitbtn(x, y);
  if (b) {
    palopen = false;
    action = { type: 'button' };
    if (b.id === 'hand') togglecam();
    else savepage();
    return;
  }
  const tile = hitshelf(x, y);
  if (tile) {
    palopen = false;
    action = { type: 'button' };
    opengallery(tile.index);
    return;
  }
  if (dist(x, y, pad.x + pad.w - 26, pad.y + 27) < (source === 'hand' ? 28 : 20)) {
    if (!picktone) {
      const selected = rgbhsv(getrgb(draft ? draft.color : ink));
      hueval = selected.h;
      satval = selected.s;
      litval = selected.v;
    }
    palopen = true;
    action = { type: 'button' };
    return;
  }
  // handle can leave the pad
  if (draft?.strokes.length) {
    const body = makeform(draft.strokes);
    if (dist(x, y, body.center.x, body.center.y) < (source === 'hand' ? 44 : 20)) {
      action = { type: 'aim' };
      dragfrom = { x, y };
      return;
    }
  }
  if (tapform(x, y)) {
    action = { type: 'tap' };
    return;
  }
  // hand can draw anywhere
  const inhelp =
    helpbox &&
    x >= helpbox.x &&
    x <= helpbox.x + helpbox.w &&
    y >= helpbox.y &&
    y <= helpbox.y + helpbox.h;
  if ((source !== 'hand' && !inpad(x, y)) || (source === 'hand' && inhelp)) {
    action = { type: 'idle' };
    return;
  }
  if (!draft) draft = { strokes: [], color: ink };
  action = { type: 'drawing', path: [{ x, y }] };
}

// move input
function moveat(x, y, source) {
  if (inputby !== source) return;
  pointer = { x, y };
  if (action?.type === 'color') {
    // only drag inside picker
    if (inbox(x, y, palbox()[action.part]))
      setink(x, y, action.part);
    return;
  }
  if (action?.type === 'gallery') {
    viewmove(x, y);
    return;
  }
  if (action?.type === 'drawing') {
    const p = action.path.at(-1);
    const px = constrain(x, 10, width - 10),
      py = constrain(y, 10, height - 10);
    if (dist(p.x, p.y, px, py) > 2.8) action.path.push({ x: px, y: py });
  }
}

// finish input
function endat(x, y, source) {
  if (inputby !== source) return;
  moveat(x, y, source);
  if (action?.type === 'gallery') viewend(x, y);
  if (action?.type === 'drawing') {
    const path = action.path;
    if (path.length === 1) path.push({ x: path[0].x + 1, y: path[0].y + 1 });
    draft.strokes.push(path);
    say('GRAB THE CENTER, PULL DOWN, RELEASE  ·  OR PRESS SPACE');
  } else if (action?.type === 'aim') {
    const offset = { x: x - dragfrom.x, y: y - dragfrom.y };
    if (Math.hypot(offset.x, offset.y) < 12) say('PULL THE SHAPE BACK TO AIM');
    else launch(aimat({ x, y }), offset);
  }
  inputby = null;
  action = null;
  dragfrom = null;
}

// launch target
function aimat(end) {
  const center = draft?.strokes.length
    ? makeform(draft.strokes).center
    : { x: pad.x + pad.w / 2, y: pad.y + pad.h / 2 };
  const dx = dragfrom ? end.x - dragfrom.x : 0;
  const dy = dragfrom ? end.y - dragfrom.y : 0;
  return {
    x: constrain(center.x - dx * 2.7, 32, width - 32),
    y: constrain(pad.y - 145 - max(0, dy) * 2.15 + min(0, dy) * 0.8, 92, skyedge - 55)
  };
}

// smooth a stroke
function smoothpath(points) {
  if (points.length < 3) return points;
  return points.map((p, i) =>
    i === 0 || i === points.length - 1
      ? p
      : {
          x: (points[i - 1].x + 2 * p.x + points[i + 1].x) / 4,
          y: (points[i - 1].y + 2 * p.y + points[i + 1].y) / 4
        }
  );
}

// points between positions
function samples(a, b, spacing = 8) {
  const count = max(1, ceil(dist(a.x, a.y, b.x, b.y) / spacing)),
    out = [];
  for (let i = 0; i < count; i++)
    out.push({ x: lerp(a.x, b.x, i / count), y: lerp(a.y, b.y, i / count) });
  return out;
}

// strokes to shape
function makeform(strokes) {
  const points = [];
  for (const stroke of strokes) {
    const smoothed = smoothpath(stroke);
    if (points.length) points.push(...samples(points.at(-1), smoothed[0]));
    for (let i = 0; i < smoothed.length - 1; i++)
      points.push(...samples(smoothed[i], smoothed[i + 1]));
    points.push(smoothed.at(-1));
  }
  let hull = gethull(points);
  if (hull.length < 3 || polyarea(hull) < 220) {
    let a = points[0],
      b = points.at(-1),
      longest = 0;
    for (const q of points)
      for (const r of points) {
        const d = dist(q.x, q.y, r.x, r.y);
        if (d > longest) {
          longest = d;
          a = q;
          b = r;
        }
      }
    if (longest < 5) {
      b = { x: a.x + 5, y: a.y };
      longest = 5;
    }
    const nx = (-(b.y - a.y) / longest) * 16,
      ny = ((b.x - a.x) / longest) * 16;
    hull = [
      { x: a.x + nx, y: a.y + ny },
      { x: b.x + nx, y: b.y + ny },
      { x: b.x - nx, y: b.y - ny },
      { x: a.x - nx, y: a.y - ny }
    ];
  }
  const center = {
    x: hull.reduce((s, p) => s + p.x, 0) / hull.length,
    y: hull.reduce((s, p) => s + p.y, 0) / hull.length
  };
  // soften closed outline
  hull = hull.map((p) => {
    const dx = p.x - center.x,
      dy = p.y - center.y,
      d = max(1, Math.hypot(dx, dy));
    return { x: dx + (dx / d) * 9, y: dy + (dy / d) * 9 };
  });
  for (let k = 0; k < 3; k++) {
    const next = [];
    for (let i = 0; i < hull.length; i++) {
      const a = hull[i],
        b = hull[(i + 1) % hull.length];
      next.push(
        { x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
        { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 }
      );
    }
    hull = next;
  }
  hull = resample(hull, 40);
  return {
    center,
    outline: hull,
    bound: max(...hull.map((p) => Math.hypot(p.x, p.y)))
  };
}

// even outline points
function resample(poly, count) {
  if (poly.length < 3) return poly;
  const lengths = poly.map((p, i) =>
    Math.hypot(poly[(i + 1) % poly.length].x - p.x, poly[(i + 1) % poly.length].y - p.y)
  );
  const total = lengths.reduce((a, b) => a + b, 0),
    step = total / count,
    out = [];
  let edge = 0,
    at = 0;
  for (let i = 0; i < count; i++) {
    const goal = i * step;
    while (edge < poly.length - 1 && at + lengths[edge] < goal) {
      at += lengths[edge++];
    }
    const t = constrain((goal - at) / max(0.00001, lengths[edge]), 0, 1);
    out.push({
      x: lerp(poly[edge].x, poly[(edge + 1) % poly.length].x, t),
      y: lerp(poly[edge].y, poly[(edge + 1) % poly.length].y, t)
    });
  }
  return out;
}

// outer edge
function gethull(points) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) return sorted;
  // edge side test
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const lower = [],
    upper = [];
  for (const p of sorted) {
    while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// polygon area
function polyarea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i],
      q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return abs(a) * 0.5;
}

// throw the shape
function launch(target, offset = { x: 0, y: 0 }) {
  if (!draft || !draft.strokes.length) return;
  const geometry = makeform(draft.strokes);
  const piece = {
    id: pieceid++,
    outline: geometry.outline,
    bound: geometry.bound,
    start: { x: geometry.center.x + offset.x, y: geometry.center.y + offset.y },
    target,
    x: geometry.center.x + offset.x,
    y: geometry.center.y + offset.y,
    scale: 1,
    color: draft.color,
    phase: 'flying',
    progress: 0,
    duration: 0.64 + random(0.12, 0.26),
    vx: 0,
    vy: 0,
    matched: false
  };
  pieces.push(piece);
  draft = null;
  nextink();
  shots++;
  say('FLY  ·  PLACE THE NEXT COLOR BESIDE ITS MATCH');
}

// land and match
function settle(p) {
  p.phase = 'settled';
  p.x = p.target.x;
  p.y = p.target.y;
  p.scale = 0.82;
  p.vx = constrain((p.target.x - p.start.x) * 0.006, -3, 3);
  p.vy = constrain((p.target.y - p.start.y) * 0.003, -2, 2);
  pushapart(10);
  let touching = false;
  for (const other of pieces) {
    if (other === p || other.phase !== 'settled' || !matchink(other.color, p.color)) continue;
    if (edgegap(p, other) < 18) {
      touching = true;
      combo++;
      score += combo;
      p.matched = true;
      other.matched = true;
      say('SAME COLOR TOUCHES · +' + combo);
      break;
    }
  }
  if (!touching) combo = 0;
  fillrate();
  autosave();
}

// flight animation
function flyforms(dt) {
  for (const p of pieces) {
    if (p.phase !== 'flying') continue;
    p.progress = min(1, p.progress + dt / p.duration);
    const t = p.progress,
      e = 1 - pow(1 - t, 3);
    p.x = lerp(p.start.x, p.target.x, e);
    p.y = lerp(p.start.y, p.target.y, e) - sin(PI * t) * 16;
    p.scale = lerp(1, 0.82, e);
    if (t >= 1) settle(p);
  }
}

// outline on canvas
function worldpoly(p) {
  return p.outline.map((q) => ({ x: p.x + q.x * p.scale, y: p.y + q.y * p.scale }));
}

// shape overlap
function collide(a, b) {
  if (
    !a.outline ||
    !b.outline ||
    dist(a.x, a.y, b.x, b.y) > a.bound * a.scale + b.bound * b.scale + 4
  )
    return null;
  const aa = worldpoly(a),
    bb = worldpoly(b);
  let best = Infinity,
    nx = 0,
    ny = 0;
  for (const poly of [aa, bb])
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length],
        dx = q.x - p.x,
        dy = q.y - p.y,
        len = Math.hypot(dx, dy);
      if (len < 0.01) continue;
      const ax = -dy / len,
        ay = dx / len;
      let a0 = Infinity,
        a1 = -Infinity,
        b0 = Infinity,
        b1 = -Infinity;
      for (const v of aa) {
        const n = v.x * ax + v.y * ay;
        a0 = min(a0, n);
        a1 = max(a1, n);
      }
      for (const v of bb) {
        const n = v.x * ax + v.y * ay;
        b0 = min(b0, n);
        b1 = max(b1, n);
      }
      const overlap = min(a1, b1) - max(a0, b0);
      if (overlap <= 0) return null;
      if (overlap < best) {
        best = overlap;
        nx = ax;
        ny = ay;
      }
    }
  if ((b.x - a.x) * nx + (b.y - a.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { overlap: best, nx, ny };
}

// distance between edges
function edgegap(a, b) {
  if (!a.outline || !b.outline) return Infinity;
  if (dist(a.x, a.y, b.x, b.y) > a.bound * a.scale + b.bound * b.scale + 22)
    return Infinity;
  if (collide(a, b)) return 0;
  const aa = worldpoly(a),
    bb = worldpoly(b);
  let best = Infinity;
  for (const [vertices, edges] of [
    [aa, bb],
    [bb, aa]
  ])
    for (const p of vertices)
      for (let j = 0; j < edges.length; j++) {
        const u = edges[j],
          v = edges[(j + 1) % edges.length],
          dx = v.x - u.x,
          dy = v.y - u.y;
        const t = constrain(
          ((p.x - u.x) * dx + (p.y - u.y) * dy) / max(1, dx * dx + dy * dy),
          0,
          1
        );
        best = min(best, dist(p.x, p.y, u.x + t * dx, u.y + t * dy));
      }
  return best;
}

// keep inside bounds
function keepin(p) {
  const poly = worldpoly(p),
    minx = min(...poly.map((q) => q.x)),
    maxx = max(...poly.map((q) => q.x));
  const miny = min(...poly.map((q) => q.y)),
    maxy = max(...poly.map((q) => q.y));
  const top = skytop(),
    bottom = skyedge - 13;
  if (minx < 12) {
    p.x += 12 - minx;
    p.vx = max(0, p.vx) * 0.35;
  }
  if (maxx > width - 12) {
    p.x -= maxx - (width - 12);
    p.vx = min(0, p.vx) * 0.35;
  }
  if (miny < top) {
    p.y += top - miny;
    p.vy = max(0, p.vy) * 0.35;
  }
  if (maxy > bottom) {
    p.y -= maxy - bottom;
    p.vy = min(0, p.vy) * 0.35;
  }
}

// push on tap
function tapform(x, y) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (p.phase !== 'settled' || !inpoly(x, y, softpoly(p))) continue;
    const dx = p.x - x,
      dy = p.y - y,
      d = Math.hypot(dx, dy);
    const nx = d < 12 ? (p.x < width * 0.5 ? 0.55 : -0.55) : dx / d;
    const ny = d < 12 ? -0.85 : dy / d;
    p.vx = constrain((p.vx || 0) + nx * 5.8, -7, 7);
    p.vy = constrain((p.vy || 0) + ny * 5.8 - 1.1, -7, 7);
    say('SHAPE NUDGED · CLICK A SHAPE TO PUSH · SAVE/NEXT TO TURN');
    return true;
  }
  return false;
}

// resolve overlaps
function pushapart(iterations = 2) {
  const settled = pieces.filter((p) => p.phase === 'settled' && p.outline);
  let changed = false;
  for (let step = 0; step < iterations; step++) {
    let pushed = false;
    for (let i = 0; i < settled.length; i++)
      for (let j = i + 1; j < settled.length; j++) {
        const a = settled[i],
          b = settled[j],
          hit = collide(a, b);
        if (!hit || hit.overlap < 0.18) continue;
        const move = (hit.overlap + 0.2) * 0.52;
        a.x -= hit.nx * move;
        a.y -= hit.ny * move;
        b.x += hit.nx * move;
        b.y += hit.ny * move;
        if (step === 0) {
          const impulse = min(1.6, hit.overlap * 0.035);
          a.vx -= hit.nx * impulse;
          a.vy -= hit.ny * impulse;
          b.vx += hit.nx * impulse;
          b.vy += hit.ny * impulse;
        }
        pushed = true;
        changed = true;
      }
    for (const p of settled) keepin(p);
    if (!pushed) break;
  }
  return changed;
}

// resting shape motion
function settleall(dt) {
  const settled = pieces.filter((p) => p.phase === 'settled');
  if (!settled.length) return;
  const tick = min(2.5, dt * 60),
    drag = pow(0.84, tick);
  for (const p of settled) {
    p.x += (p.vx || 0) * tick;
    p.y += (p.vy || 0) * tick;
    p.vx = (p.vx || 0) * drag;
    p.vy = (p.vy || 0) * drag;
    if (Math.hypot(p.vx, p.vy) < 0.035) p.vx = p.vy = 0;
    if (p.outline) keepin(p);
  }
  // attract then separate
  for (let i = 0; i < settled.length; i++)
    for (let j = i + 1; j < settled.length; j++) {
      const a = settled[i],
        b = settled[j],
        gap = edgegap(a, b);
      if (gap <= 0.18 || gap >= 22) continue;
      const d = max(1, dist(a.x, a.y, b.x, b.y));
      const pull = min(3.2, (gap - 0.18) * 0.28) * tick;
      const nx = (b.x - a.x) / d,
        ny = (b.y - a.y) / d;
      a.x += nx * pull * 0.5;
      a.y += ny * pull * 0.5;
      b.x -= nx * pull * 0.5;
      b.y -= ny * pull * 0.5;
    }
  pushapart(3);
}

// placed shapes
function drawforms(graphics) {
  for (const p of pieces) {
    if (!p.outline) continue;
    const poly = softpoly(p),
      rgb = getrgb(p.color);
    if (graphics) {
      graphics.fill(...rgb);
      graphics.stroke(40, 46, 51);
      graphics.strokeWeight(3.5);
      graphics.strokeJoin(ROUND);
      pathshape(poly, graphics);
    } else {
      fill(...rgb);
      stroke(40, 46, 51);
      strokeWeight(3.5);
      strokeJoin(ROUND);
      pathshape(poly);
    }
  }
}

// shape fill and border
function pathshape(poly, g) {
  if (poly.length < 3) return;
  if (g) g.beginShape();
  else beginShape();
  // same path for border
  for (const p of poly) {
    if (g) g.vertex(p.x, p.y);
    else vertex(p.x, p.y);
  }
  if (g) g.endShape(CLOSE);
  else endShape(CLOSE);
}

// touching surface
function softpoly(p) {
  const poly = worldpoly(p);
  if (p.phase !== 'settled') return poly;
  for (const other of pieces) {
    if (other === p || other.phase !== 'settled' || !other.outline) continue;
    const distance = Math.hypot(p.x - other.x, p.y - other.y);
    if (distance > p.bound * p.scale + other.bound * other.scale + 22) continue;
    const gap = edgegap(p, other);
    if (gap >= 20) continue;
    const strength = constrain((20 - gap) / 13, 0, 1),
      nx = (other.x - p.x) / max(1, distance),
      ny = (other.y - p.y) / max(1, distance);
    const support = max(...poly.map((v) => (v.x - p.x) * nx + (v.y - p.y) * ny));
    const backedge = min(
      ...worldpoly(other).map((v) => (v.x - p.x) * nx + (v.y - p.y) * ny)
    );
    const midplane = (support + backedge) * 0.5;
    const width = max(22, min(55, support * 0.85));
    for (const v of poly) {
      const projection = (v.x - p.x) * nx + (v.y - p.y) * ny;
      const near = constrain(1 - (support - projection) / width, 0, 1);
      if (near > 0) {
        // flatten contact edge
        const displacement = (midplane - projection) * near * 0.95 * strength;
        v.x += nx * displacement;
        v.y += ny * displacement;
      } else if (projection < -support * 0.28) {
        const bulge =
          4.5 *
          strength *
          constrain((-projection - support * 0.28) / max(12, support), 0, 1);
        v.x -= nx * bulge;
        v.y -= ny * bulge;
      }
    }
  }
  return poly;
}

// top of play area
function skytop() {
  return min(skyedge - 80, width < 600 ? 170 : 106);
}

// point in shape
function inpoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i],
      b = poly[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

// filled area
function fillrate() {
  const top = skytop(),
    bottom = skyedge - 13,
    cell = 12;
  const shapes = pieces
    .filter((p) => p.phase === 'settled' && p.outline)
    .map((p) => {
      const poly = worldpoly(p);
      return {
        poly,
        minx: min(...poly.map((q) => q.x)),
        maxx: max(...poly.map((q) => q.x)),
        miny: min(...poly.map((q) => q.y)),
        maxy: max(...poly.map((q) => q.y))
      };
    });
  let filled = 0,
    inked = 0,
    total = 0;
  for (let y = top + cell * 0.5; y < bottom; y += cell)
    for (let x = 12 + cell * 0.5; x < width - 12; x += cell) {
      total++;
      if (
        shapes.some(
          (s) =>
            x >= s.minx &&
            x <= s.maxx &&
            y >= s.miny &&
            y <= s.maxy &&
            inpoly(x, y, s.poly)
        )
      ) {
        inked++;
        filled++;
        continue;
      }
      // small gaps count as full
      if (shapes.some((s) => nearpoly(x, y, s, gaprad))) filled++;
    }
  inkfill = total ? inked / total : 0;
  fillpct = total ? filled / total : 0;
}

// nearby edge
function nearpoly(x, y, shape, radius) {
  if (
    x < shape.minx - radius ||
    x > shape.maxx + radius ||
    y < shape.miny - radius ||
    y > shape.maxy + radius
  )
    return false;
  const poly = shape.poly,
    limit = radius * radius;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i],
      b = poly[(i + 1) % poly.length],
      dx = b.x - a.x,
      dy = b.y - a.y;
    const t = constrain(
      ((x - a.x) * dx + (y - a.y) * dy) / max(0.0001, dx * dx + dy * dy),
      0,
      1
    );
    if ((x - a.x - t * dx) ** 2 + (y - a.y - t * dy) ** 2 <= limit) return true;
  }
  return false;
}

// hand cursor
function drawhand() {
  const { x, y } = cursor;
  noFill();
  stroke(37, 45, 50, 210);
  strokeWeight(1.5);
  circle(x, y, fistdown ? 18 : 27);
  if (fistdown) {
    noStroke();
    fill(45, 52, 56);
    circle(x, y, 4);
  }
}

// mouse press
function mousePressed() {
  if (millis() - lasttap < 500) return false;
  beginat(mouseX, mouseY, 'mouse');
  return false;
}

// mouse drag
function mouseDragged() {
  moveat(mouseX, mouseY, 'mouse');
  return false;
}

// mouse release
function mouseReleased() {
  endat(mouseX, mouseY, 'mouse');
  return false;
}

// mouse hover
function mouseMoved() {
  hover = { x: mouseX, y: mouseY };
}

// touch start
function touchStarted() {
  lasttap = millis();
  if (touchid === null && touches.length) {
    const finger = touches[0];
    touchid = finger.id;
    beginat(finger.x, finger.y, 'touch');
  }
  return false;
}

// touch move
function touchMoved() {
  lasttap = millis();
  const finger = touches.find((t) => t.id === touchid);
  if (finger) moveat(finger.x, finger.y, 'touch');
  return false;
}

// touch end
function touchEnded() {
  lasttap = millis();
  if (!touches.some((t) => t.id === touchid)) {
    endat(pointer.x, pointer.y, 'touch');
    touchid = null;
  }
  return false;
}

// keyboard shortcuts
function keyPressed() {
  if (keyIsDown(CONTROL) || keyIsDown(ALT) || keyIsDown(91) || keyIsDown(93)) return;
  if (faceidx >= 0) {
    if (key === 'Escape') faceidx = -1;
    if (key === 'ArrowLeft') setface(faceidx - 1);
    if (key === 'ArrowRight') setface(faceidx + 1);
    return false;
  }
  if (slide) return;
  if (key === ' ') {
    if (draft) launch(aimat({ x: pad.x + pad.w / 2, y: pad.y - 140 }));
    return false;
  }
  if (key.toLowerCase() === 'h') togglecam();
  if (key.toLowerCase() === 's') savepage();
  if (key.toLowerCase() === 'g' && saved.length) opengallery(saved.length - 1);
  if (key === 'Escape') {
    draft = null;
    action = null;
    inputby = null;
    say('DRAW A NEW FORM');
  }
}

// clear current side
function reset() {
  pieces = [];
  draft = null;
  score = 0;
  combo = 0;
  shots = 0;
  fillpct = 0;
  inkfill = 0;
  savenext = false;
  mansave = false;
  autoat = null;
  fillrate();
  say('FIELD CLEARED · DRAW A NEW FORM');
}

// async timeout
function timeout(promise, ms, label) {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => (timer = setTimeout(() => reject(new Error(label)), ms)))
  ]).finally(() => clearTimeout(timer));
}

// load handpose
async function loadhand() {
  if (typeof ml5 !== 'undefined' && typeof ml5.handPose === 'function') return;

  // local ml5 then cdn
  let lasterr;
  for (const source of [
    './libraries/ml5.min.js',
    'https://unpkg.com/ml5@1.3.1/dist/ml5.min.js'
  ]) {
    try {
      const loaded = await import(source);
      if (typeof ml5 === 'undefined' && loaded.default?.handPose)
        window.ml5 = loaded.default;
      if (typeof ml5 !== 'undefined' && typeof ml5.handPose === 'function') return;
    } catch (err) {
      lasterr = err;
      console.warn('Hand library:', source, err);
    }
  }
  throw new Error(lasterr ? 'ML5 FAILED: CHECK CONSOLE / LIBRARIES FOLDER' :
    'ML5 DID NOT INITIALIZE: CHECK LIBRARIES FOLDER');
}

// stop camera
function stopcam() {
  camtoken++;
  if (inputby === 'hand') endat(prevhand.x, prevhand.y, 'hand');
  try {
    model?.detectStop();
  } catch (e) {
    console.warn(e);
  }
  model = null;
  cam?.elt?.srcObject?.getTracks().forEach((t) => t.stop());
  cam?.remove();
  cam = null;
  hands = [];
  cursor = null;
  fistdown = false;
  holdn = 0;
  openn = 0;
  losthand = 0;
  waitopen = false;
  prevhand = { x: 0, y: 0 };
  handseq = 0;
  seenframe = -1;
  seenat = 0;
  camstate = 'off';
  say('HAND INPUT OFF');
}

// camera on off
async function togglecam() {
  if (camstate === 'on' || camstate === 'loading') {
    stopcam();
    return;
  }
  const token = ++camtoken;
  camstate = 'loading';
  camerr = '';
  try {
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error('USE LOCALHOST OR HTTPS');
    await timeout(loadhand(), 60000, 'HAND LIBRARY TIMED OUT');
    if (token !== camtoken) return;
    await timeout(
      new Promise((resolve) => {
        cam = createCapture(VIDEO, { flipped: true }, resolve);
        cam.size(640, 480);
        cam.hide();
      }),
      18000,
      'VIDEO DID NOT START'
    );
    if (token !== camtoken) return;
    model = await timeout(
      Promise.resolve(ml5.handPose({ flipped: true })),
      60000,
      'HAND MODEL TIMED OUT'
    );
    if (model?.ready) await timeout(model.ready, 60000, 'HAND MODEL TIMED OUT');
    if (token !== camtoken) return;
    model.detectStart(cam, (result) => {
      if (token === camtoken) {
        hands = result || [];
        handseq++;
      }
    });
    camstate = 'on';
    say('CLOSE FIST = PRESS · OPEN HAND = RELEASE · DRAW ANYWHERE');
  } catch (err) {
    if (token !== camtoken) return;
    console.error('ROOM FOR ONE MORE hand:', err);
    camerr = (
      err?.name === 'NotAllowedError'
        ? 'CAMERA PERMISSION DENIED'
        : err?.name === 'NotFoundError'
          ? 'CAMERA NOT FOUND'
          : String(err?.message || err)
    )
      .toUpperCase()
      .slice(0, 70);
    try {
      model?.detectStop();
    } catch (e) {}
    model = null;
    cam?.elt?.srcObject?.getTracks().forEach((t) => t.stop());
    cam?.remove();
    cam = null;
    hands = [];
    camstate = 'error';
  }
}

// hand landmark
function handpt(hand, name, index) {
  return hand[name] || hand.keypoints?.[index];
}

// palm center
function getpalm(hand) {
  const bases = [5, 9, 13, 17]
    .map((i, j) =>
      handpt(
        hand,
        ['index_finger_mcp', 'middle_finger_mcp', 'ring_finger_mcp', 'pinky_mcp'][j],
        i
      )
    )
    .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (bases.length < 3) return null;
  const wrist = handpt(hand, 'wrist', 0);
  const x = bases.reduce((sum, p) => sum + p.x, 0) / bases.length;
  const y = bases.reduce((sum, p) => sum + p.y, 0) / bases.length;
  return wrist && Number.isFinite(wrist.x) && Number.isFinite(wrist.y)
    ? { x: x * 0.82 + wrist.x * 0.18, y: y * 0.82 + wrist.y * 0.18 }
    : { x, y };
}

// fist detection
function isfist(hand, holding = false) {
  const wrist = handpt(hand, 'wrist', 0);
  if (!Number.isFinite(wrist?.x) || !Number.isFinite(wrist?.y)) return null;
  const curled = [];
  for (const [name, mcp, pip, dip, tip] of [
    ['index_finger', 5, 6, 7, 8],
    ['middle_finger', 9, 10, 11, 12],
    ['ring_finger', 13, 14, 15, 16],
    ['pinky', 17, 18, 19, 20]
  ]) {
    const [a, b, c, d] = [
      ['mcp', mcp],
      ['pip', pip],
      ['dip', dip],
      ['tip', tip]
    ].map(([part, i]) => handpt(hand, name + '_' + part, i));
    if (![a, b, c, d].every((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y)))
      return null;
    // landmark distance
    const distance = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    const proximal = distance(a, b),
      distal = distance(b, d);
    if (proximal < 1 || distal < 1) return null;
    const cosine =
      ((a.x - b.x) * (d.x - b.x) + (a.y - b.y) * (d.y - b.y)) / (proximal * distal);
    const reach = distance(a, d) / max(1, proximal + distance(b, c) + distance(c, d));
    // four fingers with hold tolerance
    curled.push(cosine > (holding ? -0.5 : -0.15) || reach < (holding ? 0.73 : 0.63));
  }
  // index and middle curled
  return curled[0] && curled[1] && curled.filter(Boolean).length >= 3;
}

// camera to canvas
function screenpt(palm, vw, vh) {
  // camera center to canvas
  return {
    x: 18 + constrain((palm.x / vw - 0.08) / 0.84, 0, 1) * max(0, width - 36),
    y: 18 + constrain((palm.y / vh - 0.08) / 0.84, 0, 1) * max(0, height - 36)
  };
}

// release fist
function endhand() {
  if (fistdown) endat(prevhand.x, prevhand.y, 'hand');
  fistdown = false;
  holdn = 0;
  openn = 0;
}

// hand input
function trackhand() {
  if (camstate !== 'on' || !cam) {
    cursor = null;
    return;
  }
  if (handseq === seenframe) {
    if (fistdown && millis() - seenat > 1200) endhand();
    return;
  }
  seenframe = handseq;
  const h = hands[0],
    palm = h && getpalm(h);
  if (!palm) {
    cursor = null;
    losthand++;
    holdn = 0;
    openn = 0;
    if (losthand >= 4) endhand();
    return;
  }
  const relost = losthand > 0;
  losthand = 0;
  seenat = millis();
  const vw = cam.elt.videoWidth || 640,
    vh = cam.elt.videoHeight || 480;
  const raw = screenpt(palm, vw, vh),
    rawx = raw.x,
    rawy = raw.y;
  const x = prevhand.x && !relost ? lerp(prevhand.x, rawx, 0.58) : rawx;
  const y = prevhand.y && !relost ? lerp(prevhand.y, rawy, 0.58) : rawy;
  cursor = { x, y };
  prevhand = { x, y };
  const pressed = isfist(h, fistdown);
  if (pressed === null) {
    holdn = 0;
    openn = min(3, openn + 1);
    if (openn >= 3) endhand();
    return;
  }
  holdn = pressed ? min(3, holdn + 1) : 0;
  openn = !pressed ? min(3, openn + 1) : 0;
  if (waitopen) {
    if (openn >= 3) {
      waitopen = false;
      holdn = 0;
    }
    return;
  }
  if (!fistdown && holdn >= 2 && (!inputby || inputby === 'hand')) {
    beginat(x, y, 'hand');
    fistdown = camstate === 'on' && inputby === 'hand';
  }
  if (fistdown && openn >= 3) {
    endhand();
    return;
  }
  if (fistdown) moveat(x, y, 'hand');
}

// save at 97 percent
function autosave() {
  if (fillpct < fillmax || savenext) return;
  savenext = true;
  autoat = millis();
}

// manual save
function savepage() {
  if (slide) return;
  savenext = true;
  mansave = true;
  if (draft?.strokes.length) {
    launch(aimat({ x: pad.x + pad.w / 2, y: pad.y - 140 }));
    say('SAVING AFTER THIS SHAPE LANDS');
    return;
  }
  draft = null;
  if (pieces.some((p) => p.phase === 'flying')) {
    say('SAVING AFTER THIS SHAPE LANDS');
    return;
  }
  // manual save during motion
  savenext = false;
  mansave = false;
  autoat = null;
  storepage();
}

// filename date
function stamp(date) {
  // two digit date
  const two = (n) => String(n).padStart(2, '0');
  const offset = -date.getTimezoneOffset(),
    sign = offset < 0 ? '-' : '+';
  return (
    `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}_` +
    `${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}` +
    `${sign}${two(floor(abs(offset) / 60))}${two(abs(offset) % 60)}`
  );
}

// archive current side
function storepage() {
  if (slide) return false;
  const ended = new Date(),
    name = `Room_for_One_More_${stamp(startat)}_to_${stamp(ended)}.png`;
  let snapshot, old, dataurl;
  try {
    snapshot = createGraphics(width, ceil(skyedge));
    snapshot.pixelDensity(1);
    snapshot.background(249, 249, 247);
    drawforms(snapshot);
    dataurl = (snapshot.canvas || snapshot.elt).toDataURL('image/png');
    old = createGraphics(width, height);
    old.pixelDensity(1);
    old.background(249, 249, 247);
    old.image(snapshot, 0, 0);
    old.noFill();
    old.stroke(42, 49, 54, 145);
    old.strokeWeight(1);
    old.rect(pad.x, pad.y, pad.w, pad.h, 3);
  } catch (err) {
    console.error('Archive image:', err);
    old?.remove();
    say('IMAGE COULD NOT BE SAVED · TRY SEAL AGAIN');
    return false;
  } finally {
    snapshot?.remove();
  }
  const id = ended.getTime() + '-' + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    start: startat.toISOString(),
    end: ended.toISOString(),
    name,
    coverage: fillpct,
    dataUrl: dataurl
  };
  loadimage(record);
  saved.push(record);
  saved.sort((a, b) => a.end.localeCompare(b.end));
  slide = { old, started: millis(), duration: 1750 };
  pieces = [];
  draft = null;
  score = 0;
  combo = 0;
  shots = 0;
  // wait for hand release
  waitopen = fistdown || holdn > 0;
  fistdown = false;
  holdn = 0;
  openn = 0;
  inputby = null;
  action = null;
  dragfrom = null;
  touchid = null;
  savenext = false;
  mansave = false;
  autoat = null;
  fillrate();
  nextink();
  page = saved.length + 1;
  return true;
}

// next side transition
function drawslide() {
  const t = constrain((millis() - slide.started) / slide.duration, 0, 1);
  const ease = t * t * (3 - 2 * t),
    split = width * (1 - ease);
  image(slide.old, split - width, 0, width, height);
  noStroke();
  fill(249, 249, 247);
  rect(split, 0, width - split, height);
  stroke(184, 190, 192, 130 * (1 - t));
  strokeWeight(1);
  line(split, 0, split, height);
  noStroke();
  fill(87, 96, 100, 175 * sin(PI * t));
  textAlign(CENTER, CENTER);
  textSize(11);
  text('ONE MORE SIDE', split + (width - split) / 2, height * 0.44);
  if (t >= 1) {
    slide.old.remove();
    slide = null;
    startat = new Date();
    say('NEW WHITE SPACE · THE PREVIOUS FACE IS IN THE ARCHIVE');
  }
}

// archive image
function loadimage(record) {
  const picture = new Image();
  picture.src = record.dataUrl;
  record.picture = picture;
}

// archive thumbnail bounds
function shelfbox() {
  return { x: width - 91, y: 17, w: 73, h: 44 };
}

// thumbnail hit test
function hitshelf(x, y) {
  const b = shelfbox();
  return saved.length && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
    ? { index: frontface(saved.length, millis() * 0.0004) }
    : null;
}

// archive thumbnail
function drawshelf() {
  const b = shelfbox();
  noStroke();
  fill(126, 137, 142);
  textAlign(RIGHT, TOP);
  textSize(9);
  text('ARCHIVE  ' + String(saved.length).padStart(2, '0'), width - 18, 8);
  if (!saved.length) {
    noFill();
    stroke(163, 172, 175, 120);
    strokeWeight(1);
    drawingContext.setLineDash([3, 4]);
    rect(width - 62, 25, 43, 30, 3);
    drawingContext.setLineDash([]);
    return;
  }
  drawobject(
    b.x + b.w * 0.5,
    b.y + b.h * 0.5,
    b.w * 0.75,
    b.h * 0.82,
    saved.length === 1 ? 0.08 : millis() * 0.0004
  );
}

// front facing side
function frontface(n, yaw) {
  if (n <= 1) return 0;
  let best = -Infinity,
    index = 0;
  for (let i = 0; i < n; i++) {
    const facing = cos(yaw + (TWO_PI * i) / n);
    if (facing > best) {
      best = facing;
      index = i;
    }
  }
  return index;
}

// 3d to canvas
function projpt(x, y, z, cx, cy, focal) {
  const s = focal / (focal - z);
  return { x: cx + x * s, y: cy + y * s, z };
}

// archive faces
function drawobject(cx, cy, w, h, yaw, selected = -1) {
  const n = saved.length;
  if (!n) return [];
  const focal = max(350, w * 2.1),
    faces = [];
  if (n <= 2) {
    const half = w * 0.42,
      depth = n === 1 ? 0 : max(8, w * 0.075);
    for (let i = 0; i < n; i++) {
      const a = yaw + PI * i,
        localz = depth * 0.5;
      const corners = [
        [-half, -h * 0.48],
        [half, -h * 0.48],
        [half, h * 0.48],
        [-half, h * 0.48]
      ];
      const quad = corners.map(([x, y]) =>
        projpt(
          x * cos(a) + localz * sin(a),
          y,
          localz * cos(a) - x * sin(a),
          cx,
          cy,
          focal
        )
      );
      faces.push({ index: i, quad, depth: localz * cos(a), facing: cos(a) });
    }
  } else {
    const radius = w * 0.47,
      step = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      const a = yaw + step * i,
        left = a - step * 0.5,
        right = a + step * 0.5;
      const l = { x: radius * sin(left), z: radius * cos(left) };
      const r = { x: radius * sin(right), z: radius * cos(right) };
      const quad = [
        projpt(l.x, -h * 0.48, l.z, cx, cy, focal),
        projpt(r.x, -h * 0.48, r.z, cx, cy, focal),
        projpt(r.x, h * 0.48, r.z, cx, cy, focal),
        projpt(l.x, h * 0.48, l.z, cx, cy, focal)
      ];
      faces.push({ index: i, quad, depth: (l.z + r.z) * 0.5, facing: cos(a) });
    }
  }
  const visible = faces
    .filter((f) => f.facing > 0.02)
    .sort((a, b) => a.depth - b.depth);
  const ctx = drawingContext;
  for (const face of visible) {
    const img = saved[face.index].picture,
      q = face.quad;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(q[0].x, q[0].y);
    for (let j = 1; j < 4; j++) ctx.lineTo(q[j].x, q[j].y);
    ctx.closePath();
    ctx.fillStyle = '#f2f3f0';
    ctx.fill();
    ctx.restore();
    if (img?.complete && img.naturalWidth) drawtexture(img, q);
    ctx.beginPath();
    ctx.moveTo(q[0].x, q[0].y);
    for (let j = 1; j < 4; j++) ctx.lineTo(q[j].x, q[j].y);
    ctx.closePath();
    ctx.strokeStyle = face.index === selected ? '#202a2f' : '#535f64';
    ctx.lineWidth = face.index === selected ? 2.5 : 1.3;
    ctx.stroke();
  }
  return visible.sort((a, b) => b.depth - a.depth);
}

// image on face
function drawtexture(img, q) {
  const iw = img.naturalWidth,
    ih = img.naturalHeight;
  textri(
    img,
    [q[0], q[1], q[2]],
    [
      [0, 0],
      [iw, 0],
      [iw, ih]
    ]
  );
  textri(
    img,
    [q[0], q[2], q[3]],
    [
      [0, 0],
      [iw, ih],
      [0, ih]
    ]
  );
}

// image triangle mapping
function textri(img, dest, source) {
  const [[u0, v0], [u1, v1], [u2, v2]] = source;
  const [p0, p1, p2] = dest,
    du1 = u1 - u0,
    dv1 = v1 - v0,
    du2 = u2 - u0,
    dv2 = v2 - v0;
  const det = du1 * dv2 - du2 * dv1;
  if (abs(det) < 0.001) return;
  const a = ((p1.x - p0.x) * dv2 - (p2.x - p0.x) * dv1) / det;
  const b = ((p1.y - p0.y) * dv2 - (p2.y - p0.y) * dv1) / det;
  const c = ((p2.x - p0.x) * du1 - (p1.x - p0.x) * du2) / det;
  const d = ((p2.y - p0.y) * du1 - (p1.y - p0.y) * du2) / det;
  const e = p0.x - a * u0 - c * v0,
    f = p0.y - b * u0 - d * v0,
    ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

// turn to side
function setface(index) {
  if (!saved.length) return;
  faceidx = (index + saved.length) % saved.length;
  turnyaw =
    (-TWO_PI * faceidx) / saved.length +
    (saved.length >= 3
      ? (PI / saved.length) * 0.8
      : saved.length === 2
        ? 0.1
        : 0);
}

// open archive
function opengallery(index) {
  palopen = false;
  setface(index);
}

// gallery layout
function viewbox() {
  const wide = width > 780;
  return wide
    ? {
        object: {
          cx: width * 0.34,
          cy: height * 0.45,
          w: min(width * 0.53, 550),
          h: min(height * 0.56, 400)
        },
        image: { x: width * 0.64, y: height * 0.25, w: width * 0.3, h: height * 0.44 }
      }
    : {
        object: {
          cx: width * 0.5,
          cy: height * 0.33,
          w: width * 0.75,
          h: height * 0.39
        },
        image: { x: width * 0.13, y: height * 0.56, w: width * 0.74, h: height * 0.21 }
      };
}

// archive view
function drawgallery() {
  if (faceidx < 0 || !saved.length) return;
  const item = saved[faceidx],
    layout = viewbox(),
    box = layout.image;
  noStroke();
  fill(249, 249, 247, 247);
  rect(0, 0, width, height);
  fill(39, 49, 53);
  textAlign(LEFT, TOP);
  textSize(width < 600 ? 15 : 20);
  text('ROOM FOR ONE MORE', 20, 20);
  fill(117, 128, 132);
  textSize(10);
  text('ARCHIVE ' + String(saved.length).padStart(2, '0') + '  ·  DRAG TO TURN', 21, 49);
  const o = layout.object;
  facelist = drawobject(o.cx, o.cy, o.w, o.h, turnyaw, faceidx);
  noStroke();
  fill(66, 77, 83);
  textAlign(CENTER, TOP);
  textSize(10);
  text(
    'FACE ' +
      String(faceidx + 1).padStart(2, '0') +
      ' / ' +
      String(saved.length).padStart(2, '0'),
    box.x + box.w * 0.5,
    box.y - 23
  );
  if (item.picture?.complete && item.picture.naturalWidth) {
    const ratio = item.picture.naturalWidth / item.picture.naturalHeight;
    const iw = min(box.w, box.h * ratio),
      ih = iw / ratio;
    drawingContext.drawImage(
      item.picture,
      box.x + (box.w - iw) / 2,
      box.y + (box.h - ih) / 2,
      iw,
      ih
    );
  }
  noFill();
  stroke(118, 128, 132, 140);
  strokeWeight(1);
  rect(box.x, box.y, box.w, box.h);
  noStroke();
  fill(57, 68, 72);
  textAlign(CENTER, TOP);
  textSize(10);
  text(
    new Date(item.start).toLocaleString() +
      '  →  ' +
      new Date(item.end).toLocaleString(),
    box.x + box.w * 0.5,
    box.y + box.h + 12,
    min(box.w, width - 30)
  );
  const controls = viewbtn();
  for (const q of controls) {
    noFill();
    stroke(103, 114, 119, 125);
    strokeWeight(1);
    rect(q.x, q.y, q.w, q.h, 5);
    noStroke();
    fill(55, 65, 70);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(q.label, q.x + q.w / 2, q.y + q.h / 2);
  }
}

// archive buttons
function viewbtn() {
  const y = height - 67,
    bw = min(130, (width - 68) / 3);
  return [
    { id: 'prev', label: '← PREV', x: 18, y, w: bw, h: 31 },
    { id: 'download', label: 'DOWNLOAD PNG', x: (width - bw) / 2, y, w: bw, h: 31 },
    { id: 'next', label: 'NEXT →', x: width - bw - 18, y, w: bw, h: 31 },
    { id: 'close', label: '×', x: width - 49, y: 17, w: 31, h: 31 }
  ];
}

// archive button click
function viewclick(x, y) {
  const b = viewbtn().find(
    (q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h
  );
  if (!b) return false;
  if (b.id === 'close') faceidx = -1;
  if (b.id === 'prev') setface(faceidx - 1);
  if (b.id === 'next') setface(faceidx + 1);
  if (b.id === 'download') savepng(saved[faceidx]);
  return true;
}

// start archive gesture
function viewbegin(x, y, source) {
  inputby = source;
  if (viewclick(x, y)) {
    action = { type: 'button' };
    return;
  }
  action = { type: 'gallery' };
  turndrag = { startx: x, starty: y, lastx: x, moved: false };
}

// rotate archive
function viewmove(x, y) {
  if (!turndrag) return;
  if (abs(x - turndrag.startx) > 5) turndrag.moved = true;
  turnyaw += (x - turndrag.lastx) * 0.011;
  turndrag.lastx = x;
}

// choose archive side
function viewend(x, y) {
  if (!turndrag) return;
  if (turndrag.moved) faceidx = frontface(saved.length, turnyaw);
  else {
    const hit = facelist.find((face) => inpoly(x, y, face.quad));
    if (hit) faceidx = hit.index;
  }
  turndrag = null;
}

// download png
function savepng(record) {
  const picture = record.picture;
  if (!picture?.complete || !picture.naturalWidth) return;
  const copy = createGraphics(picture.naturalWidth, picture.naturalHeight);
  copy.pixelDensity(1);
  copy.drawingContext.drawImage(picture, 0, 0);
  saveCanvas(copy.canvas, record.name, 'png');
  copy.remove();
}
