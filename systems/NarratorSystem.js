
// ═══════════════════════════════════════════════════════
//  NarratorSystem.js  (NEW FILE)
//  Handles San's inner monologue — shown as plain white
//  text on near-black screen. No dialogue box. No portrait.
//  Used for: opening narration, chapter transitions,
//  emotional beats between scenes.
//
//  Per direction doc:
//   "use silence heavily"
//   "let players infer emotional meaning"
//   "imply emotions through atmosphere"
// ═══════════════════════════════════════════════════════

let narratorQueue = [];
let narratorBusy  = false;

// ── PUBLIC API ──────────────────────────────────────────

/**
 * Show a single line of narration on black, then call cb.
 * @param {string}   text     — short line, prefer < 8 words
 * @param {number}   holdMs   — how long to hold after fade-in
 * @param {Function} cb       — called after fade-out completes
 */
export function narrate(text, holdMs = 1400, cb = null) {
  narratorQueue.push({ text, holdMs, cb });
  if (!narratorBusy) processQueue();
}

/**
 * Show a sequence of narration lines one after another.
 * @param {Array}    lines    — [{text, holdMs}] or just [text, text, ...]
 * @param {Function} onDone   — called after all lines finish
 */
export function narrateSequence(lines, onDone = null) {
  const items = lines.map(l =>
    typeof l === 'string' ? { text: l, holdMs: 1400 } : l
  );

  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    narrate(item.text, item.holdMs, isLast ? onDone : null);
  });
}

// ── INTERNAL ────────────────────────────────────────────

function processQueue() {
  if (narratorQueue.length === 0) {
    narratorBusy = false;
    return;
  }

  narratorBusy = true;
  const { text, holdMs, cb } = narratorQueue.shift();

  const overlay  = document.getElementById('narration');
  const textEl   = document.getElementById('narration-text');

  textEl.textContent = text;
  textEl.classList.remove('visible');
  overlay.classList.add('active');

  // Fade text in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      textEl.classList.add('visible');
    });
  });

  // Hold, then fade out
  setTimeout(() => {
    textEl.classList.remove('visible');

    setTimeout(() => {
      overlay.classList.remove('active');

      // Callback fires, then process next in queue
      if (cb) cb();
      setTimeout(() => processQueue(), 200);

    }, 700); // fade-out duration

  }, holdMs);
}
