/*!
 * EKSTRAKLASA DRAFT — animacje ekranu startowego
 * Wersja produkcyjna: wszystkie moduły połączone w jeden plik.
 * Kolejność sekcji odpowiada kolejności wymaganej przez silnik.
 */

/* ===== TITLE-ANIMATION-CORE.js ===== */
(function () {
  'use strict';

  const PITCH_LENGTH_M = 105;
  const PITCH_WIDTH_M = 68;
  const GOAL_WIDTH_M = 7.32;
  const GOAL_DEPTH_M = 2.2;

  function createCore(canvas, renderScale = 1) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);

    const W = canvas.width / renderScale;
    const CANVAS_H = canvas.height / renderScale;
    const OUTER_GRASS = 6;
    const H = 130; // logiczna wysokość samej murawy; pasy poza boiskiem są osobno
    const FIELD_LEFT = 4;
    const FIELD_W = 200;
    const FIELD_RIGHT = FIELD_LEFT + FIELD_W;
    const pxPerMeterX = FIELD_W / PITCH_LENGTH_M;
    const pxPerMeterY = H / PITCH_WIDTH_M;
    const goalCenterY = Math.round(H / 2);
    const goalHalfWidth = Math.round((GOAL_WIDTH_M / 2) * pxPerMeterY);
    const goalTop = goalCenterY - goalHalfWidth;
    const goalBottom = goalCenterY + goalHalfWidth;
    const goalDepth = Math.max(4, Math.round(GOAL_DEPTH_M * pxPerMeterX));

    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y + OUTER_GRASS), Math.round(w), Math.round(h));
    }

    function metersFromLeft(m) { return FIELD_LEFT + m * pxPerMeterX; }
    function metersFromRight(m) { return FIELD_RIGHT - m * pxPerMeterX; }

    function drawGoal(side, netKick) {
      const isRight = side === 'right';
      const lineX = isRight ? FIELD_RIGHT : FIELD_LEFT;

      ctx.save();
      ctx.beginPath();
      if (isRight) ctx.rect(lineX + 1, OUTER_GRASS, W - lineX - 1, H);
      else ctx.rect(0, OUTER_GRASS, lineX, H);
      ctx.clip();

      ctx.globalAlpha = netKick ? 0.95 : 0.52;
      if (isRight) {
        for (let x = lineX + 1; x <= lineX + goalDepth; x += 2) {
          px(x + (netKick ? 1 : 0), goalTop + 1, 1, goalBottom - goalTop - 1, '#dcefdc');
        }
        for (let y = goalTop + 2; y < goalBottom; y += 3) {
          px(lineX + 1, y, goalDepth, 1, '#dcefdc');
        }
        px(lineX + 1, goalTop, goalDepth, 1, '#ffffff');
        px(lineX + 1, goalBottom, goalDepth, 1, '#ffffff');
        px(lineX + goalDepth, goalTop, 1, goalBottom - goalTop + 1, '#b9c7b9');
      } else {
        for (let x = lineX - 1; x >= lineX - goalDepth; x -= 2) {
          px(x - (netKick ? 1 : 0), goalTop + 1, 1, goalBottom - goalTop - 1, '#dcefdc');
        }
        for (let y = goalTop + 2; y < goalBottom; y += 3) {
          px(lineX - goalDepth, y, goalDepth, 1, '#dcefdc');
        }
        px(lineX - goalDepth, goalTop, goalDepth, 1, '#ffffff');
        px(lineX - goalDepth, goalBottom, goalDepth, 1, '#ffffff');
        px(lineX - goalDepth, goalTop, 1, goalBottom - goalTop + 1, '#b9c7b9');
      }
      ctx.restore();

      const postX = isRight ? lineX : lineX - 1;
      px(postX, goalTop - 1, 1, 3, '#ffffff');
      px(postX, goalBottom - 1, 1, 3, '#ffffff');
    }

    let currentBallColor = '#ffffff';

    let currentKits = {
      red: { primary: '#d92f2f', secondary: '#741717' },
      green: { primary: '#28aa48', secondary: '#0d5422' }
    };

    function setKits(kits) {
      if (!kits) return;
      if (kits.red) currentKits.red = kits.red;
      if (kits.green) currentKits.green = kits.green;
    }

    function setBallColor(color) {
      currentBallColor = color || '#ffffff';
    }

    function getBallColor() {
      return currentBallColor;
    }

    function drawPlayer(x, y, team, pose, facing, skinColor) {
      const kit = currentKits[team] || currentKits.red;
      const shirt = kit.primary || '#d92f2f';
      const dark = kit.secondary || '#222222';
      const skin = skinColor || '#e3b178';
      const dir = facing === 'left' ? -1 : 1;

      if (pose === 'keeper-dive') {
        px(x - 3, y, 7, 2, shirt);
        px(x + dir * 4, y - 1, 2, 1, skin);
        px(x - dir * 4, y + 1, 2, 1, dark);
        return;
      }

      // Pochylona sylwetka do zagrania głową. Głowa znajduje się
      // 2 px przed i 3 px nad współrzędnymi zawodnika, co pozwala scenie
      // zsynchronizować dokładny punkt kontaktu z piłką.
      if (pose === 'header') {
        px(x + dir * 2, y - 3, 1, 1, skin);
        px(x - 1, y - 2, 3, 2, shirt);
        px(x - dir * 2, y - 1, 2, 1, skin);
        px(x - 1, y, 1, 2, dark);
        px(x + 1, y, 1, 2, dark);
        return;
      }

      px(x, y - 2, 1, 1, skin);
      px(x - 1, y - 1, 3, 2, shirt);
      px(x - 1, y + 1, 1, 2, dark);
      px(x + 1, y + 1, 1, 2, dark);

      if (pose === 'kick') px(x + dir * 2, y + 1, 2, 1, dark);
      if (pose === 'jump') px(x - 1, y + 2, 3, 1, '#1e7a30');
    }

    function bezier(t, p0, p1, p2, p3) {
      const u = 1 - t;
      return {
        x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
        y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
      };
    }

    function drawBallOnPath(t, p0, p1, p2, p3) {
      const p = bezier(t, p0, p1, p2, p3);
      px(p.x, p.y, 1, 1, currentBallColor);
      if (t > 0.08) {
        const q = bezier(Math.max(0, t - 0.055), p0, p1, p2, p3);
        ctx.globalAlpha = 0.42;
        px(q.x, q.y, 1, 1, currentBallColor);
        ctx.globalAlpha = 1;
      }
    }

    return {
      ctx, W, H, CANVAS_H, OUTER_GRASS, FIELD_LEFT, FIELD_RIGHT, FIELD_W,
      pxPerMeterX, pxPerMeterY, goalHalfWidth, goalDepth,
      goalCenterY, goalTop, goalBottom,
      px, metersFromLeft, metersFromRight,
      drawGoal, drawPlayer, drawBallOnPath, setKits, setBallColor, getBallColor
    };
  }

  window.TitleAnimationCore = { createCore };
  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
})();
;

/* ===== TITLE-PITCH-STYLES.js ===== */
(function () {
  'use strict';

  const PROFILES = {
    classic: {
      base: '#2f8f35', outer: '#26782f', stripe: '#278331', stripeWidthM: 10.5,
      line: '#d9edd9', ball: '#ffffff', texture: 'clean'
    },
    plain: {
      base: '#286f31', outer: '#225e2a', stripe: null,
      line: '#c7d9c9', ball: '#ffffff', texture: 'plain'
    },
    frozen: {
      base: '#64806f', outer: '#536b5e', stripe: null,
      line: '#d7e3dd', ball: '#ffffff', texture: 'frozen'
    },
    snow: {
      base: '#e9ece8', outer: '#d9ded8', stripe: null,
      line: '#f28c18', ball: '#f28c18', texture: 'snow'
    },
    dry: {
      base: '#8e963f', outer: '#787d35', stripe: '#7f8937', stripeWidthM: 6.5,
      line: '#e1dfb5', ball: '#ffffff', texture: 'dry'
    },
    wet: {
      base: '#1f6531', outer: '#194f28', stripe: null,
      line: '#c6d8cd', ball: '#ffffff', texture: 'wet'
    },
    muddy: {
      base: '#55702d', outer: '#465b27', stripe: null,
      line: '#d0d5b6', ball: '#ffffff', texture: 'muddy'
    },
    classicNarrow: {
      base: '#318c39', outer: '#287730', stripe: '#287d32', stripeWidthM: 7,
      line: '#d9edd9', ball: '#ffffff', texture: 'clean'
    }
  };

  function hash(n) {
    const x = Math.sin(n * 91.173 + 17.31) * 43758.5453;
    return x - Math.floor(x);
  }

  function rect(core, x, y, w, h, color, alpha) {
    const { ctx, OUTER_GRASS } = core;
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y + OUTER_GRASS), Math.round(w), Math.round(h));
    ctx.restore();
  }

  function fillCanvas(core, color) {
    const { ctx, W, CANVAS_H } = core;
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, CANVAS_H);
    ctx.restore();
  }

  function line(core, x1, y1, x2, y2, color, alpha) {
    const { ctx, OUTER_GRASS } = core;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.62 : alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.42;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(x1, y1 + OUTER_GRASS);
    ctx.lineTo(x2, y2 + OUTER_GRASS);
    ctx.stroke();
    ctx.restore();
  }

  function drawTexture(core, profile) {
    const { FIELD_LEFT, FIELD_RIGHT, FIELD_W, H, pxPerMeterX } = core;
    // Otoczenie boiska jest częścią tego samego canvasa i zmienia kolor razem z murawą.
    fillCanvas(core, profile.outer || profile.base);
    rect(core, FIELD_LEFT, 0, FIELD_W, H, profile.base);

    // Pasy koszenia są poprzeczne względem długości boiska: pionowe na ekranie.
    if (profile.stripe && profile.stripeWidthM) {
      const sw = Math.max(4, Math.round(profile.stripeWidthM * pxPerMeterX));
      let stripe = false;
      for (let x = FIELD_LEFT; x < FIELD_RIGHT; x += sw) {
        if (stripe) rect(core, x, 0, Math.min(sw, FIELD_RIGHT - x), H, profile.stripe, 0.72);
        stripe = !stripe;
      }
    }

    if (profile.texture === 'dry') {
      for (let i = 0; i < 30; i++) {
        const x = FIELD_LEFT + 2 + Math.floor(hash(i * 5) * (FIELD_W - 4));
        const y = 2 + Math.floor(hash(i * 7 + 3) * (H - 4));
        rect(core, x, y, 2 + (i % 4), 1 + (i % 2), i % 3 ? '#a7a153' : '#6f7933', 0.38);
      }
    } else if (profile.texture === 'wet') {
      for (let i = 0; i < 15; i++) {
        const x = FIELD_LEFT + 3 + Math.floor(hash(i * 9) * (FIELD_W - 12));
        const y = 4 + Math.floor(hash(i * 13 + 2) * (H - 10));
        rect(core, x, y, 4 + (i % 6), 1, '#a6c8cc', 0.18);
        if (i % 3 === 0) rect(core, x + 2, y + 1, 2 + (i % 3), 1, '#0b4325', 0.22);
      }
    } else if (profile.texture === 'muddy') {
      for (let i = 0; i < 34; i++) {
        const nearGoal = i < 20;
        const x = nearGoal
          ? FIELD_RIGHT - 5 - Math.floor(hash(i * 4 + 1) * 42)
          : FIELD_LEFT + Math.floor(hash(i * 4 + 1) * FIELD_W);
        const y = 5 + Math.floor(hash(i * 6 + 4) * (H - 10));
        rect(core, x, y, 3 + (i % 7), 1 + (i % 3), i % 2 ? '#654425' : '#7b5530', 0.46);
      }
      // Wydeptany pas przed prawą bramką.
      rect(core, FIELD_RIGHT - 23, H / 2 - 9, 19, 18, '#684827', 0.28);
    } else if (profile.texture === 'snow') {
      // Pełne zaśnieżenie: czysta biała nawierzchnia bez szarych przetarć.
      // Pomarańczowe linie i piłka zapewniają kontrast.
    } else if (profile.texture === 'frozen') {
      // Lekko zmarznięta murawa: chłodniejsza zieleń i tylko kilka
      // nieregularnych płatów śniegu. Linie pozostają czyste i czytelne.
      const patches = [
        [14, 14, 8, 2], [39, 104, 6, 2], [72, 31, 10, 2],
        [108, 112, 7, 2], [137, 18, 9, 2], [171, 91, 8, 2],
        [188, 46, 5, 2]
      ];
      for (let i = 0; i < patches.length; i++) {
        const [ox, y, w, h] = patches[i];
        rect(core, FIELD_LEFT + ox, y, w, h, '#edf2ef', 0.58);
        if (i % 2 === 0) rect(core, FIELD_LEFT + ox + 2, y + h, Math.max(2, w - 4), 1, '#dce6e0', 0.34);
      }
      // Dyskretne lodowe refleksy, bez mgły i bez szarego nalotu.
      for (let i = 0; i < 9; i++) {
        const x = FIELD_LEFT + 5 + Math.floor(hash(i * 11 + 5) * (FIELD_W - 12));
        const y = 5 + Math.floor(hash(i * 7 + 9) * (H - 10));
        rect(core, x, y, 4 + (i % 4), 1, '#cfe0d9', 0.18);
      }
    } else if (profile.texture === 'plain') {
      for (let i = 0; i < 14; i++) {
        const x = FIELD_LEFT + Math.floor(hash(i * 4) * FIELD_W);
        const y = Math.floor(hash(i * 9 + 2) * H);
        rect(core, x, y, 3 + i % 4, 1, '#214f2b', 0.12);
      }
    }
  }

  function drawArc(core, cx, cy, rx, ry, start, end, color, predicate) {
    const { ctx, OUTER_GRASS } = core;
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.42;
    ctx.lineCap = 'butt';

    if (!predicate) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + OUTER_GRASS, rx, ry, 0, start, end);
      ctx.stroke();
      ctx.restore();
      return;
    }

    let previous = null;
    const steps = 192;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = start + (end - start) * i / steps;
      const point = { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
      if (predicate(point)) {
        if (!previous) ctx.moveTo(point.x, point.y + OUTER_GRASS);
        else ctx.lineTo(point.x, point.y + OUTER_GRASS);
        previous = point;
      } else {
        previous = null;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawMarkings(core, color) {
    const {
      FIELD_LEFT, FIELD_RIGHT, FIELD_W, H,
      pxPerMeterX, pxPerMeterY, goalCenterY
    } = core;

    const halfX = FIELD_LEFT + FIELD_W / 2;
    const centerRadiusX = 9.15 * pxPerMeterX;
    const centerRadiusY = 9.15 * pxPerMeterY;
    const penaltyDepth = 16.5 * pxPerMeterX;
    const penaltyWidth = 40.32 * pxPerMeterY;
    const goalAreaDepth = 5.5 * pxPerMeterX;
    const goalAreaWidth = 18.32 * pxPerMeterY;
    const penaltyY1 = goalCenterY - penaltyWidth / 2;
    const penaltyY2 = goalCenterY + penaltyWidth / 2;
    const goalY1 = goalCenterY - goalAreaWidth / 2;
    const goalY2 = goalCenterY + goalAreaWidth / 2;
    const leftSpot = FIELD_LEFT + 11 * pxPerMeterX;
    const rightSpot = FIELD_RIGHT - 11 * pxPerMeterX;

    // Obrys i linia środkowa.
    line(core, FIELD_LEFT, 0, FIELD_RIGHT, 0, color);
    line(core, FIELD_LEFT, H - 1, FIELD_RIGHT, H - 1, color);
    line(core, FIELD_LEFT, 0, FIELD_LEFT, H - 1, color);
    line(core, FIELD_RIGHT, 0, FIELD_RIGHT, H - 1, color);
    line(core, halfX, 0, halfX, H - 1, color, 0.64);

    // Okrąg w metrach, renderowany z osobnymi skalami X/Y — wizualnie jest kołem.
    drawArc(core, halfX, goalCenterY, centerRadiusX, centerRadiusY, 0, Math.PI * 2, color);
    rect(core, halfX, goalCenterY, 1, 1, color);

    // Pola karne.
    line(core, FIELD_LEFT, penaltyY1, FIELD_LEFT + penaltyDepth, penaltyY1, color);
    line(core, FIELD_LEFT + penaltyDepth, penaltyY1, FIELD_LEFT + penaltyDepth, penaltyY2, color);
    line(core, FIELD_LEFT + penaltyDepth, penaltyY2, FIELD_LEFT, penaltyY2, color);
    line(core, FIELD_RIGHT, penaltyY1, FIELD_RIGHT - penaltyDepth, penaltyY1, color);
    line(core, FIELD_RIGHT - penaltyDepth, penaltyY1, FIELD_RIGHT - penaltyDepth, penaltyY2, color);
    line(core, FIELD_RIGHT - penaltyDepth, penaltyY2, FIELD_RIGHT, penaltyY2, color);

    // Pola bramkowe.
    line(core, FIELD_LEFT, goalY1, FIELD_LEFT + goalAreaDepth, goalY1, color);
    line(core, FIELD_LEFT + goalAreaDepth, goalY1, FIELD_LEFT + goalAreaDepth, goalY2, color);
    line(core, FIELD_LEFT + goalAreaDepth, goalY2, FIELD_LEFT, goalY2, color);
    line(core, FIELD_RIGHT, goalY1, FIELD_RIGHT - goalAreaDepth, goalY1, color);
    line(core, FIELD_RIGHT - goalAreaDepth, goalY1, FIELD_RIGHT - goalAreaDepth, goalY2, color);
    line(core, FIELD_RIGHT - goalAreaDepth, goalY2, FIELD_RIGHT, goalY2, color);

    // Punkty karne.
    rect(core, leftSpot, goalCenterY, 1, 1, color);
    rect(core, rightSpot, goalCenterY, 1, 1, color);

    // Łuki pola karnego — tylko fragment poza prostokątem.
    const arcRX = 9.15 * pxPerMeterX;
    const arcRY = 9.15 * pxPerMeterY;
    drawArc(core, leftSpot, goalCenterY, arcRX, arcRY, -Math.PI / 2, Math.PI / 2, color,
      p => p.x >= FIELD_LEFT + penaltyDepth);
    drawArc(core, rightSpot, goalCenterY, arcRX, arcRY, Math.PI / 2, Math.PI * 1.5, color,
      p => p.x <= FIELD_RIGHT - penaltyDepth);
  }

  function draw(profileName, core) {
    const profile = PROFILES[profileName] || PROFILES.classic;
    drawTexture(core, profile);
    drawMarkings(core, profile.line);
    core.setBallColor(profile.ball);
    return profile;
  }

  window.TitlePitchStyles = { draw, profiles: PROFILES };
})();
;

/* ===== TITLE-WEATHER.js ===== */
(function () {
  'use strict';

  function hash(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function tintField(core, color, alpha) {
    const { ctx, FIELD_LEFT, FIELD_RIGHT, OUTER_GRASS, H } = core;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(FIELD_LEFT, OUTER_GRASS, FIELD_RIGHT - FIELD_LEFT, H);
    ctx.restore();
  }

  function drawRainUnderlay(core) {
    const { ctx, FIELD_LEFT, FIELD_RIGHT, OUTER_GRASS, H, px } = core;
    tintField(core, '#07131d', 0.13);
    ctx.save();
    ctx.globalAlpha = 0.16;
    const glints = [[28,19,9],[61,102,7],[94,45,5],[126,112,8],[158,27,6],[184,88,7]];
    for (const [x,y,w] of glints) px(FIELD_LEFT + x, y, w, 1, '#b8d9df');
    ctx.restore();
  }

  function drawRainOverlay(core, t) {
    const { ctx, W, CANVAS_H } = core;
    const frame = Math.floor(t / 55);
    ctx.save();
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = '#b8d9df';
    for (let i = 0; i < 34; i++) {
      const baseX = Math.floor(hash(i * 3 + 1) * (W + 28)) - 14;
      const speed = 3 + Math.floor(hash(i * 7 + 4) * 4);
      const y = (Math.floor(hash(i * 11 + 8) * CANVAS_H) + frame * speed) % (CANVAS_H + 10) - 5;
      const x = baseX - Math.floor(y * 0.13);
      ctx.fillRect(x, y, 1, 3);
      if (i % 5 === 0) ctx.fillRect(x - 1, y + 3, 1, 1);
    }
    ctx.restore();
  }

  function drawFogUnderlay(core) {
    tintField(core, '#a7b7bd', 0.10);
  }

  function drawFogOverlay(core, t) {
    const { ctx, W, CANVAS_H } = core;
    const drift = Math.floor(t / 180) % 22;
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#d9e2e5';
    for (let i = -1; i < 6; i++) {
      const x = i * 46 + drift - 24;
      const y = 18 + (i % 3) * 34;
      ctx.fillRect(x, y, 34, 5);
      ctx.fillRect(x + 7, y - 3, 22, 3);
      ctx.fillRect(x + 4, y + 5, 27, 3);
    }
    ctx.restore();
  }

  function drawSnowUnderlay(core) {
    tintField(core, '#b8c7cc', 0.07);
  }

  function drawSnowOverlay(core, t) {
    const { ctx, W, CANVAS_H } = core;
    const frame = Math.floor(t / 95);
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = '#e8f1f3';
    for (let i = 0; i < 24; i++) {
      const x0 = Math.floor(hash(i * 13 + 2) * W);
      const y0 = Math.floor(hash(i * 17 + 5) * CANVAS_H);
      const y = (y0 + frame * (1 + (i % 2))) % CANVAS_H;
      const x = (x0 + Math.floor(Math.sin((frame + i) * 0.35) * 2) + W) % W;
      ctx.fillRect(x, y, 1, 1);
      if (i % 7 === 0) ctx.fillRect(x + 1, y, 1, 1);
    }
    ctx.restore();
  }

  function drawWindOverlay(core, t) {
    const { ctx, FIELD_LEFT, FIELD_RIGHT, OUTER_GRASS, H } = core;
    const phase = Math.floor(t / 85);
    ctx.save();
    ctx.globalAlpha = 0.23;
    ctx.fillStyle = '#d8edf0';
    for (let i = 0; i < 9; i++) {
      const y = OUTER_GRASS + 10 + i * 13;
      const x = FIELD_LEFT + ((phase * 6 + i * 23) % (FIELD_RIGHT - FIELD_LEFT + 36)) - 18;
      ctx.fillRect(x, y, 8 + (i % 3) * 3, 1);
      ctx.fillRect(x + 4, y - 1, 4, 1);
    }
    ctx.restore();
  }

  function drawMudUnderlay(core) {
    const { ctx, px, metersFromRight, goalCenterY } = core;
    ctx.save();
    ctx.globalAlpha = 0.34;
    const mud = [
      [metersFromRight(14.5), goalCenterY - 15, 9, 4],
      [metersFromRight(11.0), goalCenterY - 2, 12, 5],
      [metersFromRight(16.0), goalCenterY + 12, 8, 4],
      [metersFromRight(8.0), goalCenterY + 5, 7, 3],
      [metersFromRight(20.5), goalCenterY + 18, 6, 3]
    ];
    for (const [x,y,w,h] of mud) {
      px(x, y, w, h, '#5b3a1e');
      px(x + 2, y + 1, Math.max(2, w - 4), 1, '#734b28');
    }
    ctx.restore();
  }


  function drawSnowfallOverlay(core, t) {
    const { ctx, W, CANVAS_H } = core;
    const frame = Math.floor(t / 90);
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = '#f4f7f6';
    for (let i = 0; i < 26; i++) {
      const x0 = Math.floor(hash(i * 13 + 2) * W);
      const y0 = Math.floor(hash(i * 17 + 5) * CANVAS_H);
      const y = (y0 + frame * (1 + (i % 2))) % CANVAS_H;
      const x = (x0 + Math.floor(Math.sin((frame + i) * 0.34) * 2) + W) % W;
      ctx.fillRect(x, y, 1, 1);
      if (i % 8 === 0) ctx.fillRect(x + 1, y, 1, 1);
    }
    ctx.restore();
  }

  function drawNightUnderlay(core) {
    const { ctx, W, CANVAS_H } = core;
    ctx.save();
    ctx.globalAlpha = 0.31;
    ctx.fillStyle = '#071126';
    ctx.fillRect(0, 0, W, CANVAS_H);

    // Dwa subtelne snopy reflektorów, bez zasłaniania murawy i linii.
    ctx.globalCompositeOperation = 'screen';
    const leftGlow = ctx.createRadialGradient(28, 0, 2, 58, 54, 92);
    leftGlow.addColorStop(0, 'rgba(235,244,255,0.30)');
    leftGlow.addColorStop(0.45, 'rgba(170,200,235,0.10)');
    leftGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, W, CANVAS_H);

    const rightGlow = ctx.createRadialGradient(W - 28, 0, 2, W - 58, 54, 92);
    rightGlow.addColorStop(0, 'rgba(235,244,255,0.28)');
    rightGlow.addColorStop(0.45, 'rgba(170,200,235,0.09)');
    rightGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, W, CANVAS_H);
    ctx.restore();
  }

  function drawNightOverlay(core, t) {
    const { ctx, W } = core;
    const pulse = 0.11 + (Math.sin(t / 420) + 1) * 0.025;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#dcecff';
    ctx.fillRect(11, 1, 22, 1);
    ctx.fillRect(W - 33, 1, 22, 1);
    ctx.restore();
  }

  const effects = {
    rain:     { drawUnderlay: drawRainUnderlay, drawOverlay: drawRainOverlay },
    snowfall: { drawOverlay: drawSnowfallOverlay },
    mud:      { drawUnderlay: drawMudUnderlay },
    night:    { drawUnderlay: drawNightUnderlay, drawOverlay: drawNightOverlay }
  };

  window.TitleWeather = {
    drawUnderlay(type, core, t) {
      const effect = effects[type];
      if (effect && effect.drawUnderlay) effect.drawUnderlay(core, t);
    },
    drawOverlay(type, core, t) {
      const effect = effects[type];
      if (effect && effect.drawOverlay) effect.drawOverlay(core, t);
    }
  };
})();
;

/* ===== TITLE-SCENE-FREE-KICK.js ===== */
(function () {
  'use strict';

  const FREE_KICK_M = 25;
  const WALL_DIST_M = 9.15;
  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smooth = value => {
    const k = clamp01(value);
    return k * k * (3 - 2 * k);
  };

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'free-kick',
    duration: 4400,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalTop, px,
        getBallColor, metersFromRight, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;
      const goalX = FIELD_RIGHT;
      const ball = { x: metersFromRight(FREE_KICK_M), y: 84 };
      const wallX = metersFromRight(FREE_KICK_M - WALL_DIST_M);
      const end = { x: goalX + 1, y: goalTop + 3 };
      const c1 = { x: wallX - 4, y: 55 };
      const c2 = { x: goalX - 18, y: goalTop - 4 };
      const shotStart = 900;
      const flight = 1450;
      const shotT = clamp01((t - shotStart) / flight);
      const kicked = t >= shotStart;
      const goalMoment = shotT >= 0.98 && t < 3000;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Zielony wykonawca strzela przeciw czerwonej drużynie. Rozbieg kończy się dokładnie przy piłce. W chwili uderzenia
      // piłka znajduje się przy wysuniętej stopie, tak jak w scenie Mili.
      const runStart = { x: ball.x - 11, y: ball.y + 6 };
      const contact = { x: ball.x - 2, y: ball.y - 2 };
      const runT = smooth((t - 220) / (shotStart - 220));
      let kickerX = runStart.x + (contact.x - runStart.x) * runT;
      let kickerY = runStart.y + (contact.y - runStart.y) * runT;

      // Krótki naturalny krok po uderzeniu zamiast zatrzymania sylwetki.
      if (t > shotStart) {
        const follow = smooth((t - shotStart) / 300);
        kickerX += follow * 2;
        kickerY -= follow * 1;
      }

      const kicking = t >= shotStart - 70 && t < shotStart + 230;
      drawPlayer(kickerX, kickerY, 'green', kicking ? 'kick' : 'normal', 'right');

      const wallJump = t >= shotStart + 100 && t <= shotStart + 560;
      const jumpOffset = wallJump ? -2 : 0;
      for (let i = 0; i < 5; i++) {
        drawPlayer(wallX, 58 + i * 4 + jumpOffset, 'red', wallJump ? 'jump' : 'normal', 'left');
      }

      if (shotT < 0.62) {
        drawPlayer(goalX - 3, goalCenterY, 'red', 'normal', 'left');
      } else {
        const dive = Math.min(1, (shotT - 0.62) / 0.34);
        drawPlayer(goalX - 4 - dive * 2, goalCenterY - dive * 5, 'red', 'keeper-dive', 'left');
      }

      if (!kicked) px(ball.x, ball.y, 1, 1, getBallColor());
      else if (shotT < 1) drawBallOnPath(shotT, ball, c1, c2, end);
      else if (t < 3000) px(goalX + 2, end.y, 1, 1, getBallColor());
    }
  });
})();
;

/* ===== TITLE-SCENE-PENALTY.js ===== */
(function () {
  'use strict';

  const PENALTY_MARK_M = 11;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = v => {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'penalty',
    duration: 4700,
    draw(core, t) {
      const {
        FIELD_LEFT, goalCenterY, goalBottom, pxPerMeterY, px,
        getBallColor, metersFromLeft, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;

      const yFromMeters = m => m * pxPerMeterY;
      const point = p => ({ x: metersFromLeft(p.xM), y: yFromMeters(p.yM) });
      const ball = { x: metersFromLeft(PENALTY_MARK_M), y: goalCenterY };
      const end = { x: FIELD_LEFT - 1, y: goalBottom - 3 };
      const c1 = { x: ball.x - 8, y: ball.y - 1 };
      const c2 = { x: FIELD_LEFT + 8, y: goalBottom - 5 };
      const shotStart = 1350;
      const flight = 720;
      const shotT = clamp01((t - shotStart) / flight);
      const kicked = t >= shotStart;
      const goalMoment = shotT >= 0.97 && t < 3100;

      drawGoal('left', goalMoment);
      drawGoal('right', false);

      // Zawodnicy oczekujący na dobitkę, wybicie i kontrę pozostają statyczni,
      // ale nie tworzą już regularnych rzędów ani lustrzanej figury. Część graczy
      // stoi bliżej łuku, część pół kroku głębiej, a asekuracja zajmuje różne pasy boiska.
      const actors = [];

      const attackersAtBox = [
        { xM: 20.8, yM: 22.6 },
        { xM: 22.7, yM: 28.1 },
        { xM: 21.5, yM: 39.8 },
        { xM: 23.4, yM: 45.1 }
      ];
      attackersAtBox.forEach(p => {
        actors.push({ ...point(p), team: 'red', facing: 'left' });
      });

      const defendersAtBox = [
        { xM: 22.1, yM: 20.3 },
        { xM: 20.7, yM: 25.9 },
        { xM: 23.6, yM: 31.2 },
        { xM: 21.0, yM: 42.6 },
        { xM: 22.8, yM: 47.7 }
      ];
      defendersAtBox.forEach(p => {
        actors.push({ ...point(p), team: 'green', facing: 'right' });
      });

      const coverAttackers = [
        { xM: 29.5, yM: 31.0 },
        { xM: 34.8, yM: 44.0 },
        { xM: 39.2, yM: 23.8 }
      ];
      coverAttackers.forEach(p => {
        actors.push({ ...point(p), team: 'red', facing: 'left' });
      });

      const counterPlayers = [
        { xM: 43.8, yM: 38.6 },
        { xM: 56.5, yM: 28.4 }
      ];
      counterPlayers.forEach(p => {
        actors.push({ ...point(p), team: 'green', facing: 'right' });
      });

      // Wykonawca podchodzi po skosie i ustawia stopę dokładnie przy piłce.
      // Wcześniej jego punkt rysowania był o 5 pikseli za nisko, przez co piłka
      // znajdowała się przy głowie zamiast przy nodze. Geometria kontaktu jest
      // teraz taka sama jak w dobrze czytelnej scenie gola Mili.
      const runT = smooth((t - 300) / (shotStart - 300));
      const shooterStartX = metersFromLeft(17.2);
      const shooterStartY = ball.y + 5;
      const shooterContactX = ball.x + 2;
      const shooterContactY = ball.y - 2;
      const kickPose = t >= shotStart - 90 && t < shotStart + 250;
      actors.push({
        x: lerp(shooterStartX, shooterContactX, runT),
        y: lerp(shooterStartY, shooterContactY, runT),
        team: 'red',
        facing: 'left',
        pose: kickPose ? 'kick' : 'normal'
      });

      // Bramkarz reaguje dopiero, gdy piłka jest realnie w jego zasięgu.
      if (shotT < 0.48) {
        const danceFrame = Math.floor(t / 150) % 4;
        const swayY = [-2, 0, 2, 0][danceFrame];
        actors.push({
          x: FIELD_LEFT - 1,
          y: goalCenterY + swayY,
          team: 'green', facing: 'right', pose: 'normal'
        });
      } else {
        const dive = clamp01((shotT - 0.48) / 0.45);
        actors.push({
          x: FIELD_LEFT + dive * 4,
          y: goalCenterY + dive * 5,
          team: 'green', facing: 'right', pose: 'keeper-dive'
        });
      }

      actors.sort((a, b) => a.y - b.y);
      actors.forEach(a => drawPlayer(a.x, a.y, a.team, a.pose || 'normal', a.facing));

      if (!kicked) px(ball.x, ball.y, 1, 1, getBallColor());
      else if (shotT < 1) drawBallOnPath(shotT, ball, c1, c2, end);
      else if (t < 3100) px(FIELD_LEFT - 2, end.y, 1, 1, getBallColor());
    }
  });
})();
;

/* ===== TITLE-SCENE-MILA-COMPACT.js ===== */
(function () {
  'use strict';

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = v => {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  function move(from, to, t) {
    const k = smooth(t);
    return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) };
  }

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'mila-germany-compact',
    duration: 6500,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalTop,
        pxPerMeterY, metersFromLeft,
        px, getBallColor, drawGoal, drawPlayer, drawBallOnPath
      } = core;

      const yM = m => m * pxPerMeterY;
      const point = (x, y) => ({ x: metersFromLeft(x), y: yM(y) });
      const goalX = FIELD_RIGHT;

      const lewyStart = point(61, 45);
      const lewyEnd = point(80, 42);
      const milaStart = point(65, 29);
      const milaEnd = point(87, 34);
      const shotEnd = { x: goalX + 1, y: goalTop + 4 };

      const carryStart = 500;
      const carryEnd = 2650;
      const layoffStart = 2800;
      const layoffDuration = 620;
      const shotStart = 3850;
      const shotDuration = 720;
      const goalMoment = t >= shotStart + shotDuration - 80 && t < 5400;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      const carryT = clamp01((t - carryStart) / (carryEnd - carryStart));
      const milaRunT = clamp01((t - 650) / 3000);
      const layoffT = clamp01((t - layoffStart) / layoffDuration);
      const shotT = clamp01((t - shotStart) / shotDuration);

      const lewy = t < carryStart ? lewyStart : move(lewyStart, lewyEnd, carryT);
      const mila = move(milaStart, milaEnd, milaRunT);

      // Dwóch obrońców próbuje zamknąć Lewandowskiego, trzeci pilnuje wejścia Mili.
      const d1 = move(point(63, 43), point(80.5, 41.5), clamp01((t - 250) / 2700));
      const d2 = move(point(68, 50), point(82, 45), clamp01((t - 450) / 2800));
      const d3 = move(point(73, 30), point(86, 35.5), clamp01((t - 600) / 3200));

      // Polski partner rozciąga akcję i odciąga jednego wracającego rywala.
      const support = move(point(58, 54), point(83, 54), clamp01((t - 300) / 3300));

      drawPlayer(support.x, support.y, 'red', 'normal', 'right');
      drawPlayer(d1.x, d1.y, 'green', 'normal', 'right');
      drawPlayer(d2.x, d2.y, 'green', 'normal', 'right');
      drawPlayer(d3.x, d3.y, 'green', 'normal', 'right');

      drawPlayer(
        lewy.x, lewy.y,
        'red',
        t >= layoffStart && t < layoffStart + 230 ? 'kick' : 'normal',
        'right'
      );
      drawPlayer(
        mila.x, mila.y,
        'red',
        t >= shotStart && t < shotStart + 250 ? 'kick' : 'normal',
        'right'
      );

      // Neuer przesuwa się pod prowadzącego piłkę i dopiero po strzale rzuca się w przeciwną stronę.
      if (t < shotStart || shotT < 0.62) {
        const shift = clamp01((Math.min(t, shotStart) - 900) / 2700);
        drawPlayer(goalX - 3, goalCenterY + shift * 3.2, 'green', 'normal', 'left');
      } else {
        const dive = clamp01((shotT - 0.62) / 0.34);
        drawPlayer(goalX - 3 - dive * 4, goalCenterY + 3 - dive * 7, 'green', 'keeper-dive', 'left');
      }

      // Piłka: prowadzenie pod presją, odegranie do Mili, lewonożny strzał.
      if (t < carryStart) {
        px(lewyStart.x + 2, lewyStart.y + 2, 1, 1, getBallColor());
      } else if (t < layoffStart) {
        const touch = Math.floor((t - carryStart) / 210) % 2;
        px(lewy.x + 2 + touch, lewy.y + 2, 1, 1, getBallColor());
      } else if (t < layoffStart + layoffDuration) {
        const passEnd = { x: milaEnd.x - 1, y: milaEnd.y + 1 };
        drawBallOnPath(
          layoffT,
          { x: lewyEnd.x + 2, y: lewyEnd.y + 2 },
          { x: lewyEnd.x + 7, y: lewyEnd.y - 2 },
          { x: milaEnd.x - 7, y: milaEnd.y + 2 },
          passEnd
        );
      } else if (t < shotStart) {
        px(mila.x + 2, mila.y + 2, 1, 1, getBallColor());
      } else if (shotT < 1) {
        drawBallOnPath(
          shotT,
          { x: milaEnd.x + 2, y: milaEnd.y + 2 },
          { x: milaEnd.x + 10, y: milaEnd.y - 2 },
          { x: goalX - 10, y: goalTop + 6 },
          shotEnd
        );
      } else if (t < 5400) {
        px(goalX + 2, shotEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-SCENE-ONE-ON-ONE.js ===== */
(function () {
  'use strict';

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smooth = value => {
    const k = clamp01(value);
    return k * k * (3 - 2 * k);
  };

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'one-on-one',
    duration: 5200,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalBottom, px,
        getBallColor, metersFromRight, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;

      const goalX = FIELD_RIGHT;
      const passStart = { x: metersFromRight(47), y: 82 };
      const runStart = { x: metersFromRight(36), y: 69 };
      // To jest pozycja środka sylwetki napastnika w chwili strzału.
      const shotPlayer = { x: metersFromRight(14), y: 66 };
      const shotOrigin = { x: shotPlayer.x + 2, y: shotPlayer.y + 2 };
      const shotEnd = { x: goalX + 1, y: goalBottom - 3 };

      const passStartTime = 520;
      const passDuration = 820;
      const chaseStart = passStartTime + passDuration;
      const chaseDuration = 1850;
      const shotStart = chaseStart + chaseDuration;
      const shotDuration = 690;

      const passT = clamp01((t - passStartTime) / passDuration);
      const chaseT = clamp01((t - chaseStart) / chaseDuration);
      const shotT = clamp01((t - shotStart) / shotDuration);
      const goalMoment = shotT >= 0.97 && t < 4300;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Pomocnik podchodzi do piłki i zagrywa ją stopą, a nie z wysokości tułowia.
      const passerStart = { x: passStart.x - 7, y: passStart.y + 3 };
      const passerContact = { x: passStart.x - 2, y: passStart.y - 2 };
      const passerRun = smooth((t - 120) / (passStartTime - 120));
      let passerX = passerStart.x + (passerContact.x - passerStart.x) * passerRun;
      let passerY = passerStart.y + (passerContact.y - passerStart.y) * passerRun;
      if (t > passStartTime) {
        const follow = smooth((t - passStartTime) / 260);
        passerX += follow * 1.5;
        passerY -= follow * 0.5;
      }
      const passerKick = t >= passStartTime - 60 && t < passStartTime + 210;
      drawPlayer(passerX, passerY, 'red', passerKick ? 'kick' : 'normal', 'right');

      // Napastnik rusza w tempo między obrońcami. Jego współrzędne opisują
      // środek sprite'a, dzięki czemu piłka podczas prowadzenia pozostaje przy stopie.
      let strikerX = runStart.x;
      let strikerY = runStart.y;
      if (t >= passStartTime && t < chaseStart) {
        const lead = Math.min(1, (t - passStartTime) / passDuration);
        strikerX += lead * 10;
        strikerY -= lead * 1;
      } else if (t >= chaseStart) {
        strikerX = runStart.x + 10 + chaseT * (shotPlayer.x - (runStart.x + 10));
        strikerY = runStart.y - 1 + chaseT * (shotPlayer.y - (runStart.y - 1));
      }
      const strikerKick = t >= shotStart - 70 && t < shotStart + 230;
      drawPlayer(
        strikerX, strikerY, 'red',
        strikerKick ? 'kick' : 'normal',
        'right', '#21130d'
      );

      // Dwóch spóźnionych obrońców biegnie za napastnikiem.
      const defenderProgress = clamp01((t - 420) / 3200);
      drawPlayer(
        metersFromRight(33) + defenderProgress * 29,
        57 + defenderProgress * 5,
        'green', 'normal', 'right'
      );
      drawPlayer(
        metersFromRight(31) + defenderProgress * 26,
        79 - defenderProgress * 7,
        'green', 'normal', 'right'
      );

      // Bramkarz zaczyna na linii, potem wychodzi i skraca kąt.
      let keeperX = goalX - 3;
      let keeperY = goalCenterY;
      if (t >= chaseStart && t < shotStart) {
        keeperX = goalX - 3 - chaseT * 12;
        keeperY = goalCenterY + chaseT * 2;
        drawPlayer(keeperX, keeperY, 'green', 'normal', 'left');
      } else if (t >= shotStart) {
        const dive = Math.min(1, shotT / 0.72);
        keeperX = goalX - 15 - dive * 2;
        keeperY = goalCenterY + 2 + dive * 5;
        drawPlayer(keeperX, keeperY, 'green', 'keeper-dive', 'left');
      } else {
        drawPlayer(keeperX, keeperY, 'green', 'normal', 'left');
      }

      // Piłka: prostopadłe podanie, krótkie kontakty stopą i strzał do dalszego rogu.
      if (t < passStartTime) {
        px(passStart.x, passStart.y, 1, 1, getBallColor());
      } else if (t < chaseStart) {
        // Na końcu podania piłka trafia dokładnie pod nogę rozpędzającego się napastnika.
        const passEnd = { x: runStart.x + 12, y: runStart.y + 1 };
        const p1 = { x: passStart.x + 11, y: passStart.y - 5 };
        const p2 = { x: passEnd.x - 10, y: passEnd.y + 2 };
        drawBallOnPath(passT, passStart, p1, p2, passEnd);
      } else if (t < shotStart) {
        const touch = Math.floor((t - chaseStart) / 250) % 2;
        px(strikerX + 2 + touch, strikerY + 2, 1, 1, getBallColor());
      } else if (shotT < 1) {
        const c1 = { x: shotOrigin.x + 10, y: shotOrigin.y + 1 };
        const c2 = { x: goalX - 9, y: goalBottom - 4 };
        drawBallOnPath(shotT, shotOrigin, c1, c2, shotEnd);
      } else if (t < 4300) {
        px(goalX + 2, shotEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-SCENE-WING-CROSS.js ===== */
(function () {
  'use strict';

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'wing-cross-header',
    duration: 6100,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalTop, px,
        getBallColor, metersFromRight, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;

      const goalX = FIELD_RIGHT;

      // Prawa flanka (dolna część mini-boiska), atak na prawą bramkę.
      const wingStart = { x: metersFromRight(43), y: 111 };
      const duelPoint = { x: metersFromRight(31), y: 108 };
      const crossPoint = { x: metersFromRight(18), y: 103 };
      const headerPoint = { x: metersFromRight(9.5), y: goalCenterY + 2 };
      const goalEnd = { x: goalX + 1, y: goalTop + 4 };

      const approachStart = 250;
      const approachDuration = 1050;
      const duelStart = approachStart + approachDuration;
      const duelDuration = 820;
      const burstStart = duelStart + duelDuration;
      const burstDuration = 930;
      const crossStart = burstStart + burstDuration;
      const crossDuration = 1180;
      const headerStart = crossStart + crossDuration;
      const headerDuration = 620;

      const approachT = Math.max(0, Math.min(1, (t - approachStart) / approachDuration));
      const duelT = Math.max(0, Math.min(1, (t - duelStart) / duelDuration));
      const burstT = Math.max(0, Math.min(1, (t - burstStart) / burstDuration));
      const crossT = Math.max(0, Math.min(1, (t - crossStart) / crossDuration));
      const headerT = Math.max(0, Math.min(1, (t - headerStart) / headerDuration));
      const goalMoment = headerT >= 0.96 && t < 5300;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Skrzydłowy prowadzi piłkę do pojedynku 1 na 1.
      let wingerX = wingStart.x;
      let wingerY = wingStart.y;
      if (t >= approachStart && t < duelStart) {
        wingerX += approachT * (duelPoint.x - wingStart.x);
        wingerY += approachT * (duelPoint.y - wingStart.y);
      } else if (t >= duelStart && t < burstStart) {
        // Krótki zwód: krok do środka, następnie powrót na linię.
        const fake = duelT < 0.5 ? duelT * 2 : (1 - duelT) * 2;
        wingerX = duelPoint.x + duelT * 3;
        wingerY = duelPoint.y - fake * 5;
      } else if (t >= burstStart) {
        wingerX = duelPoint.x + 3 + burstT * (crossPoint.x - (duelPoint.x + 3));
        wingerY = duelPoint.y + burstT * (crossPoint.y - duelPoint.y);
      }

      const wingerCrossing = t >= crossStart && t < crossStart + 260;
      drawPlayer(wingerX, wingerY, 'red', wingerCrossing ? 'kick' : 'normal', 'right');

      // Boczny obrońca podchodzi, reaguje na zwód i zostaje pół kroku z tyłu.
      let fullbackX = duelPoint.x + 5;
      let fullbackY = duelPoint.y - 4;
      if (t < duelStart) {
        const closeT = Math.max(0, Math.min(1, (t - 500) / 800));
        fullbackX += (1 - closeT) * 7;
        fullbackY -= (1 - closeT) * 5;
      } else if (t < burstStart) {
        const wrongWay = duelT < 0.55 ? duelT / 0.55 : (1 - duelT) / 0.45;
        fullbackX += duelT * 2;
        fullbackY -= wrongWay * 5;
      } else {
        fullbackX = duelPoint.x + 5 + burstT * 10;
        fullbackY = duelPoint.y - 4 + burstT * 2;
      }
      drawPlayer(fullbackX, fullbackY, 'green', 'normal', 'right');

      // Napastnik i stoper ustawiają się w polu karnym.
      const boxRunT = Math.max(0, Math.min(1, (t - 1450) / 2700));
      const strikerBaseX = metersFromRight(15.5);
      const strikerX = strikerBaseX + boxRunT * (headerPoint.x - strikerBaseX);
      const strikerY = 53 + boxRunT * (headerPoint.y - 53);

      const defenderBaseX = metersFromRight(13.5);
      const defenderX = defenderBaseX + boxRunT * (headerPoint.x + 1 - defenderBaseX);
      const defenderY = 60 + boxRunT * (headerPoint.y + 3 - 60);

      const strikerJump = t >= headerStart - 180 && t < headerStart + 250;
      const defenderJump = t >= headerStart - 60 && t < headerStart + 290;
      const strikerLift = strikerJump ? -3 : 0;
      const defenderLift = defenderJump ? -2 : 0;

      drawPlayer(strikerX, strikerY + strikerLift, 'red', strikerJump ? 'jump' : 'normal', 'right');
      drawPlayer(defenderX, defenderY + defenderLift, 'green', defenderJump ? 'jump' : 'normal', 'right');

      // Dodatkowy stoper zamyka środek, ale nie dochodzi do piłki.
      const coverT = Math.max(0, Math.min(1, (t - 1800) / 2500));
      drawPlayer(
        metersFromRight(8) - coverT * 1,
        goalCenterY - 12 + coverT * 5,
        'green', 'normal', 'left'
      );

      // Bramkarz przesuwa się za dośrodkowaniem, potem rzuca się po główce.
      if (t < crossStart) {
        drawPlayer(goalX - 3, goalCenterY + 2, 'green', 'normal', 'left');
      } else if (t < headerStart) {
        const track = crossT;
        drawPlayer(goalX - 3, goalCenterY + 2 - track * 3, 'green', 'normal', 'left');
      } else {
        const dive = Math.min(1, headerT / 0.74);
        drawPlayer(
          goalX - 4 - dive * 2,
          goalCenterY - 1 - dive * 6,
          'green', 'keeper-dive', 'left'
        );
      }

      // Piłka: prowadzenie przy nodze, dośrodkowanie łukiem, potem główka do bramki.
      if (t < crossStart) {
        const touch = Math.floor(Math.max(0, t - approachStart) / 210) % 2;
        px(wingerX + 3 + touch, wingerY + 2, 1, 1, getBallColor());
      } else if (t < headerStart) {
        const windBend = Math.sin(crossT * Math.PI) * 5;
        const c1 = { x: crossPoint.x + 13, y: crossPoint.y - 34 - windBend };
        const c2 = { x: headerPoint.x - 7, y: headerPoint.y - 27 + windBend * 0.55 };
        drawBallOnPath(crossT, crossPoint, c1, c2, headerPoint);
      } else if (headerT < 1) {
        const c1 = { x: headerPoint.x + 8, y: headerPoint.y - 5 };
        const c2 = { x: goalX - 8, y: goalTop + 6 };
        drawBallOnPath(headerT, headerPoint, c1, c2, goalEnd);
      } else if (t < 5300) {
        px(goalX + 2, goalEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-SCENE-LONG-THROW.js ===== */
(function () {
  'use strict';

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smooth = value => {
    const k = clamp01(value);
    return k * k * (3 - 2 * k);
  };

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'long-throw-flick-tap-in',
    duration: 6000,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalBottom, px,
        getBallColor, metersFromRight, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;

      const goalX = FIELD_RIGHT;
      const throwPoint = { x: metersFromRight(23), y: 0 };
      const releasePoint = { x: throwPoint.x, y: -4 };
      const flickPoint = { x: metersFromRight(10.5), y: goalCenterY - 7 };
      // W pozie header głowa jest dwa piksele przed i trzy piksele nad środkiem sprite'a.
      const headerContact = { x: flickPoint.x - 2, y: flickPoint.y + 3 };
      const finishPoint = { x: metersFromRight(4.8), y: goalCenterY + 5 };
      const goalEnd = { x: goalX + 1, y: goalBottom - 3 };

      const setupStart = 250;
      const throwStart = 1050;
      const throwDuration = 1200;
      const flickStart = throwStart + throwDuration;
      const flickDuration = 650;
      const finishStart = flickStart + flickDuration;
      const finishDuration = 640;

      const throwT = clamp01((t - throwStart) / throwDuration);
      const flickT = clamp01((t - flickStart) / flickDuration);
      const finishT = clamp01((t - finishStart) / finishDuration);
      const goalMoment = finishT >= 0.96 && t < 5000;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Wyrzucający robi nabieg równolegle do linii bocznej.
      const run = clamp01((t - setupStart) / 650);
      const throwerX = throwPoint.x - 10 + run * 9;
      const throwerY = -2;
      const throwing = t >= throwStart - 180 && t < throwStart + 180;
      drawPlayer(throwerX, throwerY, 'red', 'normal', 'right');

      if (throwing || t < throwStart) {
        px(throwerX - 2, throwerY - 3, 2, 1, '#e3b178');
        px(throwerX + 1, throwerY - 3, 2, 1, '#e3b178');
      }
      if (t < throwStart) {
        px(throwerX, throwerY - 4, 1, 1, getBallColor());
      }

      // Pierwszy napastnik dochodzi głową dokładnie do punktu, w którym kończy się wyrzut.
      // Sylwetka pochyla się w stronę lotu, więc kontakt nie wygląda jak odbicie od tułowia.
      const targetStart = { x: metersFromRight(14.5), y: goalCenterY - 12 };
      const targetRun = smooth((t - 800) / (flickStart - 800));
      let targetX = targetStart.x + (headerContact.x - targetStart.x) * targetRun;
      let targetY = targetStart.y + (headerContact.y - targetStart.y) * targetRun;
      if (t > flickStart) {
        const landing = smooth((t - flickStart) / 380);
        targetX += landing * 1.5;
        targetY += landing * 2;
      }
      const targetHeader = t >= flickStart - 170 && t < flickStart + 220;
      drawPlayer(targetX, targetY, 'red', targetHeader ? 'header' : 'normal', 'right');

      // Stoper skacze odrobinę później i przegrywa pozycję.
      const markerContact = { x: flickPoint.x + 2, y: flickPoint.y + 5 };
      const markerStart = { x: metersFromRight(13.5), y: goalCenterY - 9 };
      const markerRun = smooth((t - 900) / (flickStart + 80 - 900));
      const markerX = markerStart.x + (markerContact.x - markerStart.x) * markerRun;
      const markerY = markerStart.y + (markerContact.y - markerStart.y) * markerRun;
      const markerJump = t >= flickStart - 40 && t < flickStart + 260;
      drawPlayer(markerX, markerY, 'green', markerJump ? 'jump' : 'normal', 'left');

      // Drugi napastnik czeka na przedłużenie przy dalszym słupku.
      const poacherRun = clamp01((t - 1200) / 1850);
      const poacherX = metersFromRight(8.5) + poacherRun * (finishPoint.x - metersFromRight(8.5));
      const poacherY = goalCenterY + 14 + poacherRun * (finishPoint.y - (goalCenterY + 14));
      drawPlayer(poacherX, poacherY, 'red', t >= finishStart && t < finishStart + 220 ? 'kick' : 'normal', 'right');

      const coverRun = clamp01((t - 1350) / 1900);
      drawPlayer(
        metersFromRight(9.5) + coverRun * 4,
        goalCenterY + 8 + coverRun * 2,
        'green', 'normal', 'right'
      );

      const extraRun = clamp01((t - 950) / 2200);
      drawPlayer(
        metersFromRight(18.5) + extraRun * 8.5,
        goalCenterY + 22 - extraRun * 11,
        'red', 'normal', 'right'
      );
      drawPlayer(
        metersFromRight(20.5) + extraRun * 6.5,
        goalCenterY - 23 + extraRun * 10,
        'green', 'normal', 'right'
      );
      drawPlayer(
        metersFromRight(11.5) + extraRun * 2.0,
        goalCenterY + 1 + extraRun * 5,
        'green', 'normal', 'left'
      );
      drawPlayer(
        metersFromRight(24),
        goalCenterY + 21 - extraRun * 3,
        'red', 'normal', 'right'
      );
      drawPlayer(
        metersFromRight(23),
        goalCenterY - 19 + extraRun * 2,
        'green', 'normal', 'left'
      );

      // Bramkarz przesuwa się do bliższego słupka, po przedłużeniu zmienia kierunek.
      if (t < flickStart) {
        const shift = clamp01((t - throwStart) / throwDuration);
        drawPlayer(goalX - 3, goalCenterY - shift * 4, 'green', 'normal', 'left');
      } else if (t < finishStart) {
        drawPlayer(goalX - 3, goalCenterY - 3 + flickT * 6, 'green', 'normal', 'left');
      } else {
        const dive = Math.min(1, finishT / 0.72);
        drawPlayer(goalX - 4 - dive * 2, goalCenterY + 2 + dive * 5, 'green', 'keeper-dive', 'left');
      }

      // Piłka: długi wyrzut dociera do czoła, zmienia kierunek po główce
      // i dopiero potem spada do zawodnika zamykającego akcję.
      if (t < throwStart) {
        // piłka już nad głową wyrzucającego
      } else if (t < flickStart) {
        const c1 = { x: releasePoint.x + 10, y: -13 };
        const c2 = { x: flickPoint.x - 10, y: flickPoint.y - 24 };
        drawBallOnPath(throwT, releasePoint, c1, c2, flickPoint);
      } else if (t < finishStart) {
        const c1 = { x: flickPoint.x + 6, y: flickPoint.y + 2 };
        const c2 = { x: finishPoint.x - 3, y: finishPoint.y - 6 };
        drawBallOnPath(flickT, flickPoint, c1, c2, finishPoint);
      } else if (finishT < 1) {
        const c1 = { x: finishPoint.x + 5, y: finishPoint.y };
        const c2 = { x: goalX - 5, y: goalBottom - 2 };
        drawBallOnPath(finishT, finishPoint, c1, c2, goalEnd);
      } else if (t < 5000) {
        px(goalX + 2, goalEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-SCENE-CORNER-CUTBACK.js ===== */
(function () {
  'use strict';

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'corner-cutback-volley',
    duration: 6400,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalTop, px,
        getBallColor, metersFromRight, drawGoal, drawPlayer,
        drawBallOnPath
      } = core;

      const goalX = FIELD_RIGHT;
      const corner = { x: FIELD_RIGHT, y: core.H - 1 }; // dokładny prawy dolny narożnik
      const edge = { x: metersFromRight(20.5), y: goalCenterY + 9 };
      const strikePoint = { x: metersFromRight(19), y: goalCenterY + 8 };
      const goalEnd = { x: goalX + 1, y: goalTop + 4 };

      const jostleStart = 250;
      const cornerStart = 1250;
      const passDuration = 1250;
      const runUpStart = cornerStart + 350;
      const strikeStart = cornerStart + passDuration;
      const strikeDuration = 900;

      const passT = Math.max(0, Math.min(1, (t - cornerStart) / passDuration));
      const shotT = Math.max(0, Math.min(1, (t - strikeStart) / strikeDuration));
      const goalMoment = shotT >= 0.97 && t < 5350;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Wykonawca stoi ZA linią końcową, tuż obok narożnika, i kopie do środka boiska.
      // Dzięki zapasowi canvasu na bramkę jest widoczny poza murawą.
      const cornerKick = t >= cornerStart && t < cornerStart + 240;
      // Wykonawca stoi na pasie poza linią końcową i tuż obok linii bocznej.
      drawPlayer(corner.x + 3, corner.y + 2, 'red', cornerKick ? 'kick' : 'normal', 'left');
      if (t < cornerStart) px(corner.x, corner.y, 1, 1, getBallColor());

      // Tłok w polu karnym: zawodnicy poruszają się i przepychają, ale piłka ich omija.
      const crowd = [
        { x: 10.5, y: -11, team: 'red', phase: 0 },
        { x: 9.5, y: -5, team: 'green', phase: 1 },
        { x: 8.0, y: 1, team: 'red', phase: 2 },
        { x: 7.5, y: 7, team: 'green', phase: 3 },
        { x: 13.0, y: 11, team: 'red', phase: 4 },
        { x: 12.0, y: 4, team: 'green', phase: 5 },
        { x: 15.0, y: -1, team: 'green', phase: 6 }
      ];

      for (const p of crowd) {
        const active = t >= jostleStart && t < strikeStart + 300;
        const step = active ? (Math.floor((t + p.phase * 95) / 180) % 2) : 0;
        const sway = p.phase % 2 === 0 ? step : -step;
        drawPlayer(
          metersFromRight(p.x) + sway,
          goalCenterY + p.y + (step ? -1 : 0),
          p.team,
          'normal',
          p.team === 'red' ? 'right' : 'left'
        );
      }

      // Strzelec czeka przed polem i rusza do wycofanej piłki.
      const runnerStartX = metersFromRight(27);
      const runT = Math.max(0, Math.min(1, (t - runUpStart) / (strikeStart - runUpStart)));
      const runnerX = runnerStartX + runT * (strikePoint.x - runnerStartX);
      const runnerY = goalCenterY + 15 + runT * (strikePoint.y - (goalCenterY + 15));
      drawPlayer(runnerX, runnerY, 'red', t >= strikeStart && t < strikeStart + 260 ? 'kick' : 'normal', 'right');

      // Jeden obrońca wychodzi do strzału, ale za późno.
      const closeT = Math.max(0, Math.min(1, (t - runUpStart - 150) / 1100));
      drawPlayer(
        metersFromRight(17) + closeT * 2,
        goalCenterY + 2 + closeT * 4,
        'green', 'normal', 'left'
      );

      // Bramkarz obserwuje tłok i reaguje dopiero, gdy piłka wychodzi zza zawodników.
      if (shotT < 0.62) {
        const sway = Math.floor(t / 250) % 2 === 0 ? -1 : 1;
        drawPlayer(goalX - 3, goalCenterY + sway, 'green', 'normal', 'left');
      } else {
        const dive = Math.max(0, Math.min(1, (shotT - 0.62) / 0.34));
        drawPlayer(goalX - 4 - dive * 2, goalCenterY - dive * 6, 'green', 'keeper-dive', 'left');
      }

      // Piłka z rożnego nie idzie w tłok, tylko przed pole karne.
      if (t >= cornerStart && t < strikeStart) {
        const c1 = { x: corner.x - 9, y: corner.y - 23 };
        const c2 = { x: edge.x + 10, y: edge.y - 20 };
        drawBallOnPath(passT, corner, c1, c2, edge);
      } else if (t >= strikeStart && shotT < 1) {
        // Mocny, prawie prosty strzał przez tłum w górny róg.
        const c1 = { x: strikePoint.x + 18, y: strikePoint.y - 4 };
        const c2 = { x: goalX - 16, y: goalTop + 7 };
        drawBallOnPath(shotT, strikePoint, c1, c2, goalEnd);
      } else if (t >= strikeStart && t < 5350) {
        px(goalX + 2, goalEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-SCENE-CITKO-LOB.js ===== */
(function () {
  'use strict';

  window.TitleAnimationScenes = window.TitleAnimationScenes || [];
  window.TitleAnimationScenes.push({
    id: 'citko-lob',
    duration: 5600,
    draw(core, t) {
      const {
        FIELD_RIGHT, goalCenterY, goalTop, ctx,
        px, getBallColor, metersFromLeft, metersFromRight,
        drawGoal, drawPlayer
      } = core;

      const goalX = FIELD_RIGHT;
      const duelPoint = { x: metersFromLeft(51), y: 69 };
      const carryEnd = { x: metersFromLeft(61), y: 66 };
      const shotEnd = { x: goalX + 1, y: goalTop + 4 };

      const duelStart = 300;
      const winBallAt = 980;
      const carryEndAt = 1950;
      const shotStart = 2150;
      const flightDuration = 2150;
      const shotT = Math.max(0, Math.min(1, (t - shotStart) / flightDuration));
      const goalMoment = shotT >= 0.985 && t < 4850;

      drawGoal('left', false);
      drawGoal('right', goalMoment);

      // Zielony zawodnik próbuje opanować piłkę przy środku boiska.
      const defenderShift = t < winBallAt
        ? Math.min(1, Math.max(0, (t - duelStart) / (winBallAt - duelStart)))
        : 1;
      const defenderX = duelPoint.x + defenderShift * 2;
      const defenderY = duelPoint.y - defenderShift;
      drawPlayer(defenderX, defenderY + 4, 'green', 'normal', 'right');

      // Czerwony zawodnik doskakuje, wygrywa pojedynek i wychodzi z piłką.
      let attackerX = duelPoint.x - 10;
      let attackerY = duelPoint.y + 5;
      if (t >= duelStart && t < winBallAt) {
        const p = (t - duelStart) / (winBallAt - duelStart);
        attackerX += p * 9;
        attackerY -= p * 4;
      } else if (t >= winBallAt && t < carryEndAt) {
        const p = (t - winBallAt) / (carryEndAt - winBallAt);
        attackerX = duelPoint.x - 1 + p * (carryEnd.x - (duelPoint.x - 1));
        attackerY = duelPoint.y + 1 + p * (carryEnd.y - (duelPoint.y + 1));
      } else if (t >= carryEndAt) {
        attackerX = carryEnd.x;
        attackerY = carryEnd.y;
      }
      // Punkt rysowania zawodnika i punkt piłki muszą korzystać z tej samej
      // geometrii. Dzięki temu lob zaczyna się przy wysuniętej stopie, a nie
      // przy tułowiu, co wcześniej dawało wrażenie rzutu ręką.
      const attackerDrawY = attackerY + 4;
      const kickPose = t >= shotStart - 90 && t < shotStart + 260 ? 'kick' : 'normal';
      drawPlayer(attackerX, attackerDrawY, 'red', kickPose, 'right');

      // Drugi zielony zawodnik zostaje z tyłu i nie zdąża z doskokiem.
      const chaserP = Math.max(0, Math.min(1, (t - 900) / 2300));
      drawPlayer(
        metersFromLeft(47) + chaserP * 18,
        82 - chaserP * 7,
        'green',
        'normal',
        'right'
      );

      // Bramkarz od początku jest mocno wysunięty i po strzale rozpaczliwie się cofa.
      const keeperBaseX = metersFromRight(18);
      if (t < shotStart) {
        const sway = Math.floor(t / 260) % 2 === 0 ? -1 : 1;
        drawPlayer(keeperBaseX, goalCenterY + sway, 'green', 'normal', 'left');
      } else if (shotT < 0.62) {
        const retreat = shotT / 0.62;
        drawPlayer(
          keeperBaseX + retreat * 10,
          goalCenterY - retreat * 2,
          'green',
          'normal',
          'left'
        );
      } else {
        const leap = Math.min(1, (shotT - 0.62) / 0.3);
        drawPlayer(
          keeperBaseX + 10 + leap * 3,
          goalCenterY - 2 - leap * 6,
          'green',
          'keeper-dive',
          'left'
        );
      }

      // Piłka: krótka walka, prowadzenie i bardzo wysoki lob z daleka.
      // ctx pochodzi ze wspólnego modułu; bez niego starsza wersja sceny crashowała.
      if (t < duelStart) {
        px(duelPoint.x + 2, duelPoint.y + 3, 1, 1, getBallColor());
      } else if (t < winBallAt) {
        const bump = Math.floor((t - duelStart) / 120) % 2;
        px(duelPoint.x + 2 - bump, duelPoint.y + 3 - bump, 1, 1, getBallColor());
      } else if (t < carryEndAt) {
        const touch = Math.floor((t - winBallAt) / 220) % 2;
        px(attackerX + 3 + touch, attackerDrawY + 2, 1, 1, getBallColor());
      } else if (t < shotStart) {
        px(carryEnd.x + 2, carryEnd.y + 6, 1, 1, getBallColor());
      } else if (shotT < 1) {
        // Lob pokazany jako wysokość, a nie boczne podkręcenie:
        // cień biegnie po murawie prawie prostą linią, piłka unosi się nad nim
        // po paraboli i stromo opada za cofającym się bramkarzem.
        const ease = shotT < 0.72
          ? Math.pow(shotT / 0.72, 0.88) * 0.72
          : 0.72 + Math.pow((shotT - 0.72) / 0.28, 1.35) * 0.28;
        const contactX = carryEnd.x + 2;
        const contactY = carryEnd.y + 6;
        const groundX = contactX + (shotEnd.x - contactX) * ease;
        const groundY = contactY + (shotEnd.y - contactY) * ease;
        const height = Math.sin(Math.PI * shotT) * 24;

        ctx.globalAlpha = 0.24;
        px(groundX, groundY, 1, 1, '#081808');
        ctx.globalAlpha = 1;
        px(groundX, groundY - height, 1, 1, getBallColor());

        if (shotT > 0.05) {
          const prevT = Math.max(0, shotT - 0.045);
          const prevEase = prevT < 0.72
            ? Math.pow(prevT / 0.72, 0.88) * 0.72
            : 0.72 + Math.pow((prevT - 0.72) / 0.28, 1.35) * 0.28;
          const prevX = contactX + (shotEnd.x - contactX) * prevEase;
          const prevGroundY = contactY + (shotEnd.y - contactY) * prevEase;
          const prevHeight = Math.sin(Math.PI * prevT) * 24;
          ctx.globalAlpha = 0.38;
          px(prevX, prevGroundY - prevHeight, 1, 1, getBallColor());
          ctx.globalAlpha = 1;
        }
      } else if (t < 4850) {
        px(goalX + 2, shotEnd.y, 1, 1, getBallColor());
      }
    }
  });
})();
;

/* ===== TITLE-ANIMATION.js ===== */
(function () {
  'use strict';

  function initTitleAnimation() {
    const pitch = document.querySelector('#screen-title .pitch-preview');
    const screen = document.getElementById('screen-title');
    if (!pitch || !screen || pitch.querySelector('.title-free-kick-canvas')) return;
    if (!window.TitleAnimationCore || !Array.isArray(window.TitleAnimationScenes)) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'title-free-kick-canvas';
    const RENDER_SCALE = 4;
    canvas.width = 208 * RENDER_SCALE;
    canvas.height = 142 * RENDER_SCALE;
    canvas.setAttribute('aria-hidden', 'true');
    pitch.appendChild(canvas);
    pitch.classList.add('title-animation-active');

    const core = window.TitleAnimationCore.createCore(canvas, RENDER_SCALE);
    const scenes = window.TitleAnimationScenes.slice();

    const fallbackKits = {
      red: { primary: '#d92f2f', secondary: '#741717' },
      green: { primary: '#28aa48', secondary: '#0d5422' }
    };

    // Każda scena ma własny, ręcznie ustalony komplet barw.
    // Nazwy red/green są techniczne i oznaczają dwie strony sceny.
    // Barwy są stałe dla scen; wyjątkiem jest reprezentacyjna Polska w białych koszulkach i czerwonych spodenkach.
    const fixedSceneKits = {
      'free-kick': {
        // Widzew Łódź vs Legia Warszawa
        red:   { primary: '#E63B3B', secondary: '#B51F2E' },
        green: { primary: '#4A7729', secondary: '#1F4D24' }
      },
      'penalty': {
        // Lech Poznań vs Wisła Kraków
        red:   { primary: '#0057B8', secondary: '#002F87' },
        green: { primary: '#8B0000', secondary: '#4F0000' }
      },
      'one-on-one': {
        // Śnieżna scena: maksymalny kontrast — czarni kontra czerwoni.
        red:   { primary: '#111111', secondary: '#292929' },
        green: { primary: '#E33A32', secondary: '#9E1717' }
      },
      'wing-cross-header': {
        // Jagiellonia Białystok vs Zagłębie Lubin
        red:   { primary: '#B8860B', secondary: '#C8102E' },
        green: { primary: '#FB8500', secondary: '#9A4D00' }
      },
      'long-throw-flick-tap-in': {
        // Arka Gdynia vs Korona Kielce
        red:   { primary: '#FDE100', secondary: '#0057B8' },
        green: { primary: '#C8102E', secondary: '#FFD700' }
      },
      'corner-cutback-volley': {
        // Pogoń Szczecin vs Śląsk Wrocław
        red:   { primary: '#1D3557', secondary: '#8E1F2F' },
        green: { primary: '#008751', secondary: '#101010' }
      },
      'mila-germany-compact': {
        // Polska kontra Niemcy — białe koszulki, czerwone spodenki kontra czerń.
        red:   { primary: '#F4F4F0', secondary: '#D62828' },
        green: { primary: '#111111', secondary: '#343434' }
      },
      'citko-lob': {
        // Widzew Łódź vs Atlético Madryt
        red:   { primary: '#E63B3B', secondary: '#B51F2E' },
        green: { primary: '#1D3557', secondary: '#C8102E' }
      }
    };

    const sceneKits = new Map();
    scenes.forEach(scene => {
      sceneKits.set(scene.id, fixedSceneKits[scene.id] || fallbackKits);
    });
    const cycle = scenes.reduce((sum, scene) => sum + scene.duration, 0);

    const sceneWeather = {
      // Zielona murawa, ale w trakcie akcji pada lekki śnieg.
      'penalty': 'snowfall',
      // Pełne zaśnieżenie jest już częścią profilu murawy; bez dodatkowych szarych efektów.
      'long-throw-flick-tap-in': 'rain',
      // Ostatnia akcja ma delikatne nocne światło reflektorów.
      'citko-lob': 'night'
    };


    const scenePitchStyle = {
      'free-kick': 'classic',
      'penalty': 'frozen',
      'one-on-one': 'snow',
      'wing-cross-header': 'dry',
      'long-throw-flick-tap-in': 'wet',
      'corner-cutback-volley': 'muddy',
      'mila-germany-compact': 'classicNarrow',
      'citko-lob': 'classicNarrow'
    };

    let raf = 0;
    let startedAt = 0;
    let running = false;

    function drawScene(ms) {
      core.ctx.clearRect(0, 0, core.W, core.CANVAS_H);
      if (!scenes.length || cycle <= 0) return;

      let local = ms % cycle;
      for (const scene of scenes) {
        if (local < scene.duration) {
          core.setKits(sceneKits.get(scene.id) || fallbackKits);
          const pitchStyle = scenePitchStyle[scene.id] || 'classic';
          if (window.TitlePitchStyles) {
            window.TitlePitchStyles.draw(pitchStyle, core);
          } else {
            core.setBallColor('#ffffff');
          }
          const weather = sceneWeather[scene.id] || null;
          if (weather && window.TitleWeather) {
            window.TitleWeather.drawUnderlay(weather, core, local);
          }
          scene.draw(core, local);
          if (weather && window.TitleWeather) {
            window.TitleWeather.drawOverlay(weather, core, local);
          }
          return;
        }
        local -= scene.duration;
      }
    }

    function frame(now) {
      if (!running) return;
      if (!startedAt) startedAt = now;
      drawScene(now - startedAt);
      raf = requestAnimationFrame(frame);
    }

    function startAnimation() {
      if (running || !screen.classList.contains('active')) return;
      running = true;
      startedAt = 0;
      raf = requestAnimationFrame(frame);
    }

    function stopAnimation() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      startedAt = 0;
      core.ctx.clearRect(0, 0, core.W, core.CANVAS_H);
    }

    new MutationObserver(() => {
      if (screen.classList.contains('active')) startAnimation();
      else stopAnimation();
    }).observe(screen, { attributes: true, attributeFilter: ['class'] });

    startAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTitleAnimation, { once: true });
  } else {
    initTitleAnimation();
  }
})();
;

