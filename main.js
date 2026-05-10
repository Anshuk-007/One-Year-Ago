// ═══════════════════════════════════════════════════════
//  main.js
// ═══════════════════════════════════════════════════════

import HospitalScene          from './scenes/HospitalScene.js';
import StreetScene            from './scenes/StreetScene.js';
import ApartmentInteriorScene from './scenes/ApartmentInteriorScene.js';
import ConvenienceStoreScene  from './scenes/ConvenienceStoreScene.js';
import TrainStationScene      from './scenes/TrainStationScene.js';
import AccidentSiteScene      from './scenes/AccidentSiteScene.js';
import { showChapterCard }    from './showChapterCard.js';

const config = {
  type:            Phaser.AUTO,
  width:           480,
  height:          640,
  parent:          'phaser-game',
  backgroundColor: '#060608',
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    HospitalScene,
    StreetScene,
    ApartmentInteriorScene,
    ConvenienceStoreScene,
    TrainStationScene,
    AccidentSiteScene
  ]
};

// ── MUSIC ─────────────────────────────────────────────────
// Lives outside Phaser — survives all scene transitions.
// Starts on start-btn click (satisfies browser autoplay policy).

let _bgm = null;

function startMusic() {
  if (_bgm) return;
  _bgm = new Audio('the_mountain-sad-512361.mp3');
  _bgm.loop   = true;
  _bgm.volume = 0.48;
  _bgm.play().catch(() => {});
}

// ── START BUTTON ──────────────────────────────────────────

document.getElementById('start-btn').onclick = () => {

  startMusic();

  const title = document.getElementById('title-screen');
  title.style.transition = 'opacity 0.6s ease';
  title.style.opacity    = '0';

  setTimeout(() => {
    title.style.display = 'none';
    showChapterCard('Chapter One', 'White Ceiling', () => {
      new Phaser.Game(config);
    });
  }, 600);

};
