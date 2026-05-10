// ═══════════════════════════════════════════════════════
//  DialogueSystem.js  —  with speaker portraits
//
//  Canvas: 48×48px, grid scale s=3 (16×16 cells max)
//  All portrait coords must satisfy (y+h) <= 16
// ═══════════════════════════════════════════════════════

let queue  = [];
let active = false;

// ── helper: draw one cell block ──────────────────────
// s=3 means each "pixel" is 3×3 real pixels on 48×48 canvas

function px(ctx, x, y, w, h, color) {
  const s = 3;
  ctx.fillStyle = color;
  ctx.fillRect(x * s, y * s, w * s, h * s);
}

// ── Portrait drawers (48×48 canvas, 16×16 grid) ──────

const PORTRAITS = {

  'San': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    // BG
    ctx.fillStyle = '#0c0c14'; ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#131620'; ctx.fillRect(0, 28, 48, 20);

    // Hair
    px(ctx, 3, 0, 10, 2, '#1a1822');
    px(ctx, 2, 1,  1, 3, '#1a1822');
    px(ctx, 13,1,  1, 3, '#1a1822');

    // Face
    px(ctx, 3, 2, 10, 7, '#c8956a');

    // Eyes — whites then pupils
    px(ctx, 4, 4, 2, 2, '#e8e4de');
    px(ctx, 9, 4, 2, 2, '#e8e4de');
    px(ctx, 4, 4, 1, 1, '#2e2018');
    px(ctx, 9, 4, 1, 1, '#2e2018');

    // Nose
    px(ctx, 7, 7, 2, 1, '#a87050');

    // Mouth — flat/sad
    px(ctx, 5, 9, 6, 1, '#906040');
    px(ctx, 5, 9, 1, 1, '#7a5030');
    px(ctx,10, 9, 1, 1, '#7a5030');

    // Ears
    px(ctx, 2, 4, 1, 3, '#a87050');
    px(ctx,13, 4, 1, 3, '#a87050');

    // Neck
    px(ctx, 6,10, 4, 2, '#a87050');

    // Shoulders (fits: y=12, h=4 → y+h=16 ✓)
    px(ctx, 0,12,16, 4, '#7a9ab4');
    px(ctx, 0,12, 2, 4, '#5a7a94');
    px(ctx,14,12, 2, 4, '#5a7a94');
  },

  'Clerk': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = '#0e0c10'; ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#14121a'; ctx.fillRect(0, 28, 48, 20);

    // Hair — receding
    px(ctx, 4, 0,  8, 2, '#2a1c10');
    px(ctx, 2, 1,  2, 2, '#2a1c10');
    px(ctx,12, 1,  2, 2, '#2a1c10');

    // Face
    px(ctx, 3, 2, 10, 7, '#d4a878');

    // Eyes — tired
    px(ctx, 4, 4, 2, 2, '#e0dcd6');
    px(ctx, 9, 4, 2, 2, '#e0dcd6');
    px(ctx, 4, 4, 1, 1, '#604838');
    px(ctx, 9, 4, 1, 1, '#604838');
    // Bags
    px(ctx, 3, 6, 4, 1, '#b89068');
    px(ctx, 8, 6, 4, 1, '#b89068');

    // Nose
    px(ctx, 7, 7, 2, 1, '#bc8858');

    // Mouth — neutral
    px(ctx, 5, 9, 6, 1, '#a07858');

    // Ears
    px(ctx, 2, 4, 1, 3, '#c09868');
    px(ctx,13, 4, 1, 3, '#c09868');

    // Neck
    px(ctx, 6,10, 4, 2, '#c09868');

    // Uniform — navy (y=12, h=4 ✓)
    px(ctx, 0,12,16, 4, '#1c2440');
    px(ctx, 5,12, 6, 2, '#e8e4de'); // collar
  },

  'Tenant': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = '#100e0c'; ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#1a1612'; ctx.fillRect(0, 28, 48, 20);

    // Hair — longer
    px(ctx, 2, 0, 12, 2, '#3a2c1e');
    px(ctx, 1, 1,  2, 5, '#3a2c1e');
    px(ctx,13, 1,  2, 5, '#3a2c1e');

    // Face
    px(ctx, 3, 2, 10, 7, '#b8906a');

    // Eyes — guarded
    px(ctx, 3, 4, 3, 1, '#2a1e18'); // brow shadow
    px(ctx, 9, 4, 3, 1, '#2a1e18');
    px(ctx, 4, 5, 2, 2, '#dedad4');
    px(ctx, 9, 5, 2, 2, '#dedad4');
    px(ctx, 4, 5, 1, 1, '#5a4030');
    px(ctx, 9, 5, 1, 1, '#5a4030');

    // Nose
    px(ctx, 7, 7, 2, 1, '#a07858');

    // Mouth — uncertain
    px(ctx, 5, 9, 6, 1, '#987050');

    // Ears
    px(ctx, 2, 4, 1, 3, '#a07858');
    px(ctx,13, 4, 1, 3, '#a07858');

    // Neck
    px(ctx, 6,10, 4, 2, '#a07858');

    // Home clothes — warm grey (y=12, h=4 ✓)
    px(ctx, 0,12,16, 4, '#2e2a28');
    px(ctx, 5,12, 6, 2, '#383430'); // neckline
  },

  'Dr. Mehta': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = '#0c0e12'; ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#141820'; ctx.fillRect(0, 28, 48, 20);

    // Hair — neat, greying
    px(ctx, 3, 0, 10, 2, '#484040');
    px(ctx, 2, 1,  1, 3, '#484040');
    px(ctx,13, 1,  1, 3, '#484040');

    // Face
    px(ctx, 3, 2, 10, 7, '#c8a882');

    // Glasses
    px(ctx, 3, 4, 4, 3, '#303038'); // left lens frame
    px(ctx, 9, 4, 4, 3, '#303038'); // right lens frame
    px(ctx, 7, 5, 2, 1, '#303038'); // bridge
    px(ctx, 4, 4, 2, 2, '#c8d8e0'); // left lens
    px(ctx,10, 4, 2, 2, '#c8d8e0'); // right lens
    px(ctx, 4, 4, 1, 1, '#283040');
    px(ctx,10, 4, 1, 1, '#283040');

    // Nose
    px(ctx, 7, 7, 2, 1, '#b09070');

    // Mouth — professional
    px(ctx, 5, 9, 6, 1, '#988060');

    // Ears
    px(ctx, 2, 4, 1, 3, '#b89870');
    px(ctx,13, 4, 1, 3, '#b89870');

    // Neck
    px(ctx, 6,10, 4, 2, '#b89870');

    // White coat (y=12, h=4 ✓)
    px(ctx, 0,12,16, 4, '#d8dce0');
    px(ctx, 5,12, 6, 2, '#b8bcc0'); // lapels
  },

  'Memory': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = '#060608'; ctx.fillRect(0, 0, 48, 48);
    // Radial white glow
    const g = ctx.createRadialGradient(24, 22, 2, 24, 22, 22);
    g.addColorStop(0, 'rgba(255,250,230,0.85)');
    g.addColorStop(0.5, 'rgba(200,180,140,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 48, 48);
    // Question mark
    ctx.fillStyle = 'rgba(220,200,160,0.9)';
    ctx.font = 'bold 24px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 24, 26);
  },

  'Nurse': (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = '#0c0e12'; ctx.fillRect(0, 0, 48, 48);
    ctx.fillStyle = '#141820'; ctx.fillRect(0, 28, 48, 20);

    // Hair — brown, pulled back
    const p = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x*3, y*3, w*3, h*3); };

    p(3, 0, 10, 2, '#3a2010');
    p(2, 1,  1, 4, '#3a2010');
    p(13,1,  1, 4, '#3a2010');

    // Nurse cap
    p(4, 0, 8, 2, '#e8e4de');
    p(7, 0, 2, 1, '#b02020'); // red cross stripe

    // Face
    p(3, 2, 10, 7, '#c8906a');

    // Eyes — kind
    p(4, 4, 2, 2, '#e0dcd6');
    p(9, 4, 2, 2, '#e0dcd6');
    p(4, 4, 1, 1, '#3a2818');
    p(9, 4, 1, 1, '#3a2818');

    // Nose
    p(7, 7, 2, 1, '#a87050');

    // Mouth — slight smile
    p(5, 9, 6, 1, '#906040');
    p(5, 9, 1, 1, '#c07050');
    p(10,9, 1, 1, '#c07050');

    // Ears
    p(2, 4, 1, 3, '#a87050');
    p(13,4, 1, 3, '#a87050');

    // Neck
    p(6,10, 4, 2, '#a87050');

    // Scrubs — teal
    p(0,12,16, 4, '#2a7a78');
    p(5,12, 6, 2, '#e8e4de'); // collar
  }

};

function drawDefaultPortrait(ctx, name) {
  ctx.clearRect(0, 0, 48, 48);
  ctx.fillStyle = '#0e0e16'; ctx.fillRect(0, 0, 48, 48);
  ctx.fillStyle = '#222230'; ctx.fillRect(8, 8, 32, 32);
  ctx.fillStyle = '#888898';
  ctx.font = 'bold 20px Courier New';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((name || '?')[0].toUpperCase(), 24, 26);
}

function drawPortrait(speakerName) {
  const canvas = document.getElementById('dlg-portrait');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const fn  = PORTRAITS[speakerName];
  if (fn) { fn(ctx); } else { drawDefaultPortrait(ctx, speakerName); }
}

// ── Core API ──────────────────────────────────────────

export function addDialogue(speaker, text) {
  queue.push({ speaker, text });
}

export function runDialogue(onFinish = null) {
  if (queue.length === 0) {
    active = false;
    document.getElementById('dialogue-box').style.display = 'none';
    if (onFinish) onFinish();
    return;
  }

  active = true;

  const item    = queue.shift();
  const box     = document.getElementById('dialogue-box');
  const spkEl   = document.getElementById('speaker-name');
  const textEl  = document.getElementById('dialogue-text');

  box.style.display   = 'flex';   // always flex, not block
  spkEl.textContent   = item.speaker;

  drawPortrait(item.speaker);

  typeText(textEl, item.text, () => {
    box.onclick = () => {
      box.onclick = null;
      runDialogue(onFinish);
    };
  });
}

function typeText(el, text, callback) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) { clearInterval(interval); callback(); }
  }, 24);
}

export function dialogueActive() { return active; }

export function clearDialogue() { queue = []; active = false; document.getElementById('dialogue-box').style.display = 'none'; }