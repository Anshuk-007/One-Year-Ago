// ═══════════════════════════════════════════════════════
//  showChapterCard.js
//  Isolated helper — import this from both main.js and
//  HospitalScene.js without creating a circular dependency.
// ═══════════════════════════════════════════════════════

/**
 * Show the chapter card with a fade in/out.
 *
 * @param {string}   eyebrow  — e.g. "Chapter Two"
 * @param {string}   title    — e.g. "Static City"
 * @param {Function} onDone   — called after card fades out
 * @param {number}   holdMs   — how long to hold (default 2600)
 */
export function showChapterCard(eyebrow, title, onDone, holdMs = 2600) {

  const card      = document.getElementById('chapter-card');
  const eyebrowEl = card.querySelector('.cc-eyebrow');
  const titleEl   = card.querySelector('.cc-title');

  eyebrowEl.textContent = eyebrow;
  titleEl.textContent   = title;

  card.style.opacity    = '0';
  card.style.display    = 'flex';

  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.7s ease';
    card.style.opacity    = '1';
  });

  setTimeout(() => {
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.display = 'none';
      if (onDone) onDone();
    }, 700);
  }, holdMs);

}
