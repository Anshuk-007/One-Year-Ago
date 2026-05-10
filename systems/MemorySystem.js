
// ═══════════════════════════════════════════════════════
//  MemorySystem.js
//  Handles fragmented memory flashes.
//  Memories are:
//    - purely sensory (sound, light, warmth)
//    - incomplete — no clear faces
//    - delivered as short disconnected lines
//    - shown on a warm white flash, not cold
//  Per direction doc: "imply emotions through atmosphere"
// ═══════════════════════════════════════════════════════

import {
  addDialogue,
  runDialogue,
  dialogueActive
} from './DialogueSystem.js';

// How many memories San has found (used for journal)
let memoriesFound = 0;

// ── PUBLIC API ──────────────────────────────────────────

/**
 * Trigger a memory flash sequence.
 *
 * @param {Array}  lines     — short sensory fragments (strings)
 * @param {Object} options
 *   @param {number} flashDuration — ms for the warm flash (default 800)
 *   @param {Function} onDone     — callback after all lines dismissed
 */
export function triggerMemory(lines, options = {}) {

  if (dialogueActive()) return;

  const {
    flashDuration = 800,
    onDone        = null
  } = options;

  memoriesFound++;

  const flash = document.getElementById('memory-flash');

  // Warm flash in — not white, not cold
  flash.animate(
    [
      { opacity: 0 },
      { opacity: 0.78 },
      { opacity: 0   }
    ],
    {
      duration:   flashDuration,
      easing:     'ease-in-out',
      fill:       'forwards'
    }
  );

  // Wait for flash peak before showing text
  setTimeout(() => {

    lines.forEach(line => {
      addDialogue('Memory', line, drawMemoryPortrait);
    });

    runDialogue(onDone);

  }, flashDuration * 0.4);
}

/**
 * Returns how many memory fragments San has recovered.
 * Used by journal system.
 */
export function getMemoriesFound() {
  return memoriesFound;
}

// ── PORTRAIT ────────────────────────────────────────────
// Memory portrait — abstract warm blur, no face,
// just light suggesting a human presence

function drawMemoryPortrait(canvas) {

  const ctx = canvas.getContext('2d');
  const w   = canvas.width;
  const h   = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Warm dark background
  ctx.fillStyle = '#0e0b08';
  ctx.fillRect(0, 0, w, h);

  // Soft warm radial glow — presence without face
  const grad = ctx.createRadialGradient(
    w * 0.5, h * 0.42,  4,
    w * 0.5, h * 0.42, h * 0.55
  );
  grad.addColorStop(0,   'rgba(220, 180, 140, 0.28)');
  grad.addColorStop(0.5, 'rgba(180, 130,  90, 0.12)');
  grad.addColorStop(1,   'rgba(0,    0,    0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Very faint silhouette outline — just a shape, no features
  ctx.strokeStyle = 'rgba(200, 170, 130, 0.14)';
  ctx.lineWidth   = 1;

  // Head outline (barely visible)
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.34, 14, 17, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Shoulder line (barely visible)
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.65);
  ctx.quadraticCurveTo(w * 0.5, h * 0.56, w * 0.85, h * 0.65);
  ctx.stroke();

  // Subtle wind chime lines — recurring symbol
  const chimeX = w * 0.72;
  const chimeY = h * 0.12;
  ctx.strokeStyle = 'rgba(180, 160, 120, 0.2)';
  ctx.lineWidth   = 1;
  for (let i = 0; i < 4; i++) {
    const x = chimeX + i * 4;
    ctx.beginPath();
    ctx.moveTo(x, chimeY);
    ctx.lineTo(x, chimeY + 12 + i * 3);
    ctx.stroke();
  }
}

