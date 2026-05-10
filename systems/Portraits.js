
// ═══════════════════════════════════════════════════════
//  Portraits.js  (NEW FILE)
//  Pixel-art portrait renderers for the dialogue box.
//  Each function receives a <canvas> element and draws
//  directly onto it using the 2D context.
//
//  Canvas size is 108 × 124 px.
//  Pixel size (s) = 4 throughout (4px per logical pixel).
//
//  Design principles per direction doc:
//   San  — tired, detached, muted blue-grey palette
//   Doctor — clinical calm, greying hair
//   Nurse  — warm, professional
//   Memory — abstract warm glow, NO face (see MemorySystem)
// ═══════════════════════════════════════════════════════

// ── Helper ──────────────────────────────────────────────

function r(ctx, x, y, w, h, c, s = 4) {
  ctx.fillStyle = c;
  ctx.fillRect(x * s, y * s, w * s, h * s);
}

function bg(canvas, color = '#0c0c11') {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

// ── SAN ─────────────────────────────────────────────────
// Palette: muted, blue-grey gown, dark messy hair,
// tired eyes with dark circles, light stubble.

export function portraitSan(canvas) {
  const ctx = bg(canvas);
  const s   = 4;

  // Hospital gown body
  r(ctx,  3, 15, 21, 13, '#8AA4B8', s);
  r(ctx,  3, 15,  2, 13, '#7A94A8', s); // left shading
  r(ctx, 22, 15,  2, 13, '#7A94A8', s); // right shading
  r(ctx, 10, 15,  6,  4, '#6A8498', s); // collar opening

  // Arms
  r(ctx,  1, 15,  3, 10, '#8AA4B8', s);
  r(ctx, 22, 15,  3, 10, '#8AA4B8', s);
  // Hands
  r(ctx,  1, 25,  3,  4, '#C8956A', s);
  r(ctx, 22, 25,  3,  4, '#C8956A', s);

  // Neck
  r(ctx, 11, 12,  5,  4, '#C8956A', s);

  // Head
  r(ctx,  7,  3, 13, 10, '#C8956A', s);

  // Hair — messy, long coma hair
  r(ctx,  6,  2, 15,  3, '#1A100A', s);
  r(ctx,  6,  3,  2,  6, '#1A100A', s);
  r(ctx, 18,  3,  2,  6, '#1A100A', s);
  r(ctx,  7,  4,  2,  3, '#221408', s); // inner strand
  r(ctx, 17,  4,  2,  3, '#221408', s);
  r(ctx,  8,  5,  1,  3, '#1A100A', s); // forelock

  // Ears
  r(ctx,  5,  7,  2,  3, '#B88060', s);
  r(ctx, 19,  7,  2,  3, '#B88060', s);

  // Eyebrows — slightly furrowed (confused, not angry)
  r(ctx,  8,  6,  4,  1, '#1A100A', s);
  r(ctx, 14,  6,  4,  1, '#1A100A', s);
  r(ctx,  8,  7,  1,  1, '#1A100A', s); // inner furrow
  r(ctx, 17,  7,  1,  1, '#1A100A', s);

  // Eye whites
  r(ctx,  8,  8,  4,  2, '#FFFFFF', s);
  r(ctx, 14,  8,  4,  2, '#FFFFFF', s);

  // Iris — dark brown, slightly unfocused
  r(ctx,  9,  8,  2,  2, '#4A3020', s);
  r(ctx, 15,  8,  2,  2, '#4A3020', s);

  // Pupil
  r(ctx,  9,  9,  1,  1, '#100808', s);
  r(ctx, 15,  9,  1,  1, '#100808', s);

  // Dark circles under eyes
  r(ctx,  8, 10,  4,  1, '#A87050', s);
  r(ctx, 14, 10,  4,  1, '#A87050', s);

  // Nose
  r(ctx, 12, 10,  2,  1, '#B07858', s);
  r(ctx, 11, 11,  4,  1, '#A87050', s);

  // Mouth — slightly open, dazed, not smiling
  r(ctx, 10, 12,  6,  1, '#985840', s);
  r(ctx, 11, 13,  4,  1, '#C07060', s); // inner lip

  // Stubble — 1 year of no shaving
  const ctx2 = canvas.getContext('2d');
  ctx2.fillStyle    = '#7A5040';
  ctx2.globalAlpha  = 0.32;
  r(ctx2,  8, 12,  3,  2, '#7A5040', s);
  r(ctx2, 15, 12,  3,  2, '#7A5040', s);
  r(ctx2, 10, 13,  6,  2, '#7A5040', s);
  ctx2.globalAlpha  = 1;
}

// ── DOCTOR ──────────────────────────────────────────────
// Palette: white coat, blue shirt, greying hair,
// calm tired eyes. Clinical but not cold.

export function portraitDoctor(canvas) {
  const ctx = bg(canvas);
  const s   = 4;

  // White coat body
  r(ctx,  3, 15, 21, 13, '#D8D8D0', s);
  r(ctx,  3, 15,  2, 13, '#C0C0B8', s); // shading
  r(ctx, 22, 15,  2, 13, '#C0C0B8', s);

  // Shirt under coat
  r(ctx, 10, 15,  6,  5, '#4A6FA5', s);

  // Arms
  r(ctx,  1, 15,  3, 10, '#D8D8D0', s);
  r(ctx, 22, 15,  3, 10, '#D8D8D0', s);
  r(ctx,  1, 25,  3,  3, '#C8A882', s);
  r(ctx, 22, 25,  3,  3, '#C8A882', s);

  // Clipboard
  r(ctx, 18, 18,  7,  9, '#C8A050', s);
  r(ctx, 19, 19,  5,  7, '#F8F4EC', s);
  r(ctx, 20, 21,  3,  1, '#D0CCC4', s);
  r(ctx, 20, 23,  4,  1, '#D0CCC4', s);
  r(ctx, 20, 25,  2,  1, '#D0CCC4', s);

  // Stethoscope
  r(ctx,  9, 15,  1,  4, '#333338', s);
  r(ctx, 14, 15,  1,  4, '#333338', s);
  r(ctx,  9, 19,  6,  1, '#333338', s);

  // Name badge
  r(ctx,  5, 20,  6,  3, '#FFFFFF', s);
  r(ctx,  6, 21,  4,  1, '#4444AA', s);

  // Neck
  r(ctx, 11, 12,  5,  4, '#C8A882', s);

  // Head
  r(ctx,  7,  3, 13, 10, '#C8A882', s);

  // Hair — greying, thinning on top
  r(ctx,  6,  3, 15,  3, '#888880', s);
  r(ctx,  6,  3,  2,  6, '#888880', s);
  r(ctx, 18,  3,  2,  6, '#888880', s);
  r(ctx,  9,  2,  9,  2, '#B8A890', s); // skin showing through thinning top

  // Ears
  r(ctx,  5,  7,  2,  3, '#C09070', s);
  r(ctx, 19,  7,  2,  3, '#C09070', s);

  // Eyebrows — thick, grey
  r(ctx,  8,  6,  4,  1, '#666658', s);
  r(ctx, 14,  6,  4,  1, '#666658', s);

  // Eyes whites
  r(ctx,  8,  8,  4,  2, '#FFFFFF', s);
  r(ctx, 14,  8,  4,  2, '#FFFFFF', s);

  // Iris — blue-grey, tired but kind
  r(ctx,  9,  8,  2,  2, '#3A5A8A', s);
  r(ctx, 15,  8,  2,  2, '#3A5A8A', s);

  // Pupil
  r(ctx,  9,  9,  1,  1, '#111118', s);
  r(ctx, 15,  9,  1,  1, '#111118', s);

  // Under-eye lines (age)
  r(ctx,  8, 10,  4,  1, '#B89878', s);
  r(ctx, 14, 10,  4,  1, '#B89878', s);

  // Nose
  r(ctx, 12, 10,  2,  1, '#B08868', s);
  r(ctx, 11, 11,  4,  1, '#B08868', s);

  // Mouth — flat, neutral concern
  r(ctx, 10, 12,  6,  1, '#906040', s);
  r(ctx, 10, 12,  1,  1, '#784030', s);
  r(ctx, 15, 12,  1,  1, '#784030', s);
}

// ── NURSE ───────────────────────────────────────────────
// Palette: teal scrubs, warm brown skin, dark hair,
// slight soft smile — professional warmth.

export function portraitNurse(canvas) {
  const ctx = bg(canvas);
  const s   = 4;

  // Scrubs body — teal
  r(ctx,  3, 15, 21, 13, '#2A7A7A', s);
  r(ctx,  1, 15,  3, 10, '#2A7A7A', s);
  r(ctx, 22, 15,  3, 10, '#2A7A7A', s);
  r(ctx,  1, 25,  3,  3, '#D4A07A', s);
  r(ctx, 22, 25,  3,  3, '#D4A07A', s);

  // Neck
  r(ctx, 11, 12,  5,  4, '#D4A07A', s);

  // Head
  r(ctx,  7,  3, 13, 10, '#D4A07A', s);

  // Hair — dark, pulled back
  r(ctx,  6,  2, 15,  3, '#2C1810', s);
  r(ctx,  6,  3,  2,  6, '#2C1810', s);
  r(ctx, 18,  3,  2,  6, '#2C1810', s);

  // Nurse cap
  r(ctx,  9,  1,  9,  2, '#FFFFFF', s);
  r(ctx, 12,  1,  3,  2, '#b02020', s);

  // Ears
  r(ctx,  5,  7,  2,  3, '#C49068', s);
  r(ctx, 19,  7,  2,  3, '#C49068', s);

  // Eyebrows
  r(ctx,  8,  6,  4,  1, '#2C1810', s);
  r(ctx, 14,  6,  4,  1, '#2C1810', s);

  // Eyes
  r(ctx,  8,  8,  4,  2, '#FFFFFF', s);
  r(ctx, 14,  8,  4,  2, '#FFFFFF', s);
  r(ctx,  9,  8,  2,  2, '#7A4A2A', s);
  r(ctx, 15,  8,  2,  2, '#7A4A2A', s);
  r(ctx,  9,  9,  1,  1, '#111',    s);
  r(ctx, 15,  9,  1,  1, '#111',    s);

  // Nose
  r(ctx, 12, 10,  2,  1, '#C08868', s);
  r(ctx, 11, 11,  4,  1, '#B08060', s);

  // Slight smile
  r(ctx, 10, 12,  7,  1, '#A07050', s);
  r(ctx, 11, 13,  5,  1, '#C08868', s);
  r(ctx, 10, 12,  1,  1, '#885040', s);
  r(ctx, 16, 12,  1,  1, '#885040', s);
}

// ── GENERIC "NOTICE / OBJECT" ───────────────────────────
// For interactables with no human speaker.
// Shows a dim room interior suggestion.

export function portraitNotice(canvas) {
  const ctx = bg(canvas, '#0a0a0e');
  const s   = 4;

  // Vague window shape — dark light
  r(ctx,  6,  4, 15, 18, '#121820', s);
  r(ctx,  8,  6, 11, 14, '#1A2430', s);
  r(ctx,  8,  6,  5, 14, '#1C2634', s); // reflection

  // Window frame
  const c = canvas.getContext('2d');
  c.strokeStyle = '#2A3440';
  c.lineWidth   = 2;
  c.strokeRect(6 * s, 4 * s, 15 * s, 18 * s);
  c.lineTo(13 * s, 4 * s);
  c.lineTo(13 * s, 22 * s);
  c.stroke();

  // Suggestion of flowers (recurring symbol)
  r(ctx, 17,  6,  2, 10, '#3A5A3A', s); // stem
  r(ctx, 15,  4,  6,  5, '#883344', s); // flower
}

