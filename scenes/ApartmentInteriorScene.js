// ═══════════════════════════════════════════════════════
//  ApartmentInteriorScene.js  —  Chapter Two: The Door
//
//  TRUE 1D SIDE-VIEW layout. World is 3200 × 640.
//  Camera zoom 1.5 — player walks on a single ground line.
//
//  LEFT → RIGHT:
//    0–400    : building corridor / hallway
//    400–460  : door of apt 304 (closed)
//    460–2200 : apartment interior cross-section
//                 left half  : entrance hall + living room
//                 right half : dining nook + bookshelf wall
//    2200–2800: balcony (glass doors + wind chimes visible)
//    2800–3200: night city backdrop
//
//  SEQUENCE:
//    San walks right → stops at door → [E] rings bell
//    → door swings open → tenant sprite appears in frame
//    → dialogue → camera pans right to reveal wind chimes
//    → San notices them → more dialogue → memory flash
// ═══════════════════════════════════════════════════════

import { addDialogue, runDialogue, dialogueActive, clearDialogue } from '../systems/DialogueSystem.js';
import { triggerMemory }                            from '../systems/MemorySystem.js';
import { narrate }                                  from '../systems/NarratorSystem.js';
import { showChapterCard }                          from '../showChapterCard.js';
import { closePhone, setChapter }                   from '../systems/PhoneSystem.js';

const W  = 3200;   // world width
const H  = 640;    // world height = canvas height

// Ground level — player feet rest here
const GY = 430;

export default class ApartmentInteriorScene extends Phaser.Scene {

  constructor() { super('ApartmentInteriorScene'); }

  // ════════════════════════════════════════════════════
  //  CREATE
  // ════════════════════════════════════════════════════

  create() {
    this.speed       = 80;
    this._rang       = false;
    this._doorOpen   = false;
    this._chimeAngle = 0;

    this.physics.world.setBounds(0, 0, W, H);

    this._drawSky();
    this._drawBuilding();
    this._drawCorridor();
    this._drawDoorFrame();
    this._drawApartmentInterior();
    this._drawBalcony();
    this._drawCity();
    this._buildDoorPanel();
    this._buildAtmosphere();

    this._buildPlayer();
    this._buildWalls();
    this._buildCamera();
    this._buildInput();

    this._hint = document.getElementById('interact-hint');

    this.cameras.main.fadeIn(1000, 0, 0, 0);
    setChapter(2);
    this.time.delayedCall(1200, () => {
      addDialogue('San', 'Third floor.');
      addDialogue('San', 'Room 304.');
      runDialogue();
    });
  }

  // ════════════════════════════════════════════════════
  //  WORLD DRAWING
  // ════════════════════════════════════════════════════

  _drawSky() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x06080f); g.fillRect(0, 0, W, H);

    // Distant city silhouette
    g.fillStyle(0x0a0d18);
    [
      [0,0,120,GY-60],[120,40,80,GY-100],[200,10,60,GY-70],
      [260,20,100,GY-80],[500,30,70,GY-90],[700,0,90,GY-60],
      [900,20,120,GY-80],[1100,0,80,GY-60],[1300,10,100,GY-70],
      [1500,0,80,GY-60],[1700,20,120,GY-80],[1900,0,90,GY-60],
      [2100,10,80,GY-70],[2300,0,100,GY-60],[2500,20,120,GY-80],
      [2700,0,80,GY-60],[2900,10,100,GY-70],[3000,0,200,GY-60]
    ].forEach(([x,y,w,h]) => g.fillRect(x, y, w, h));

    // Dim windows in silhouettes
    g.fillStyle(0x1e2418);
    for (let i = 0; i < 180; i++) {
      g.fillRect(
        Math.random() * W,
        20 + Math.random() * (GY - 120),
        5, 7
      );
    }

    // Ground strip
    g.fillStyle(0x0e0f14); g.fillRect(0, GY + 60, W, H - GY - 60);
    g.fillStyle(0x13141a); g.fillRect(0, GY + 60, W, 12);
  }

  _drawBuilding() {
    const g = this.add.graphics().setDepth(1);

    // Facade wall
    g.fillStyle(0x17181f); g.fillRect(0, 0, 460, GY + 60);

    // Brick pattern
    g.lineStyle(1, 0x1c1d24, 0.3);
    for (let row = 0; row < 22; row++) {
      const off = (row % 2) * 14;
      for (let col = -1; col < 18; col++) {
        const cx = off + col * 28;
        g.lineBetween(cx, row * 28, cx + 22, row * 28);
        g.lineBetween(cx, row * 28, cx, row * 28 + 28);
      }
    }

    // Corridor windows (dark — internal)
    [[60, 120], [170, 120], [280, 120]].forEach(([wx, wy]) => {
      g.fillStyle(0x0a0c10); g.fillRect(wx, wy, 60, 80);
      g.lineStyle(1, 0x20222a); g.strokeRect(wx, wy, 60, 80);
      g.fillStyle(0x1a1c24, 0.4); g.fillRect(wx + 2, wy + 2, 28, 76);
    });
  }

  _drawCorridor() {
    const g = this.add.graphics().setDepth(2);

    // Ceiling
    g.fillStyle(0x0d0e14); g.fillRect(0, 0, 460, GY - 180);

    // Top wall face
    g.fillStyle(0x111318); g.fillRect(0, GY - 180, 460, 60);
    // Floor strip
    g.fillStyle(0x0f1016); g.fillRect(0, GY, 460, 60);

    // Dado rail
    g.fillStyle(0x1a1c22); g.fillRect(0, GY - 125, 460, 5);

    // Wall panels
    g.lineStyle(1, 0x1a1c24, 0.4);
    for (let px = 20; px < 420; px += 90) g.strokeRect(px, GY - 178, 72, 52);

    // Fluorescent fixtures
    [100, 280].forEach(lx => {
      g.fillStyle(0xa09848, 0.06); g.fillRect(lx - 24, GY - 183, 48, 6);
      for (let c = 6; c >= 0; c--) {
        g.fillStyle(0xa09848, c * 0.01);
        g.beginPath();
        g.moveTo(lx - 24, GY - 178);
        g.lineTo(lx + 24, GY - 178);
        g.lineTo(lx + 24 + c * 18, GY);
        g.lineTo(lx - 24 - c * 18, GY);
        g.closePath(); g.fillPath();
      }
    });

    // Floor tiles
    g.lineStyle(1, 0x191b22, 0.35);
    for (let x = 0; x < 460; x += 36) g.lineBetween(x, GY, x, GY + 60);
    for (let y = GY; y <= GY + 60; y += 18) g.lineBetween(0, y, 460, y);

    // Worn mat
    g.fillStyle(0x1c1812); g.fillRect(360, GY + 2, 100, 16);
    g.lineStyle(1, 0x14100c); g.strokeRect(360, GY + 2, 100, 16);

    // Door number plate
    this.add.text(430, GY - 145, '3  0  4', {
      fontFamily: 'Courier New', fontSize: '10px', color: '#2e2c1e'
    }).setOrigin(0.5, 0.5).setDepth(8);

    // Doorbell button
    const db = this.add.graphics().setDepth(8);
    db.fillStyle(0x202228); db.fillRect(368, GY - 90, 12, 12);
    db.fillStyle(0x3a3830); db.fillRect(370, GY - 88, 8, 8);

    // Bell hint text (world-space)
    this._bellHint = this.add.text(430, GY - 200, '[E] ring', {
      fontFamily: 'Courier New', fontSize: '8px', color: '#3a3422'
    }).setOrigin(0.5, 1).setDepth(95).setAlpha(0);
  }

  _drawDoorFrame() {
    const g  = this.add.graphics().setDepth(5);
    const dx  = 400;
    const top = GY - 180;
    const bot = GY + 60;

    // Jambs
    g.fillStyle(0x0e0d0b);
    g.fillRect(dx - 8, top - 8, 8,  bot - top + 8); // left
    g.fillRect(dx - 8, top - 8, 70, 8);              // top
    g.fillRect(dx + 62, top - 8, 8, bot - top + 8);  // right

    // Warm glow through open door (hidden at start)
    this._doorLightGfx = this.add.graphics().setDepth(3).setAlpha(0);
    this._doorLightGfx.fillStyle(0x5a3410, 0.4);
    this._doorLightGfx.beginPath();
    this._doorLightGfx.moveTo(dx,       top);
    this._doorLightGfx.lineTo(dx + 62,  top);
    this._doorLightGfx.lineTo(dx + 220, bot);
    this._doorLightGfx.lineTo(dx - 160, bot);
    this._doorLightGfx.closePath();
    this._doorLightGfx.fillPath();
  }

  _drawApartmentInterior() {
    const g  = this.add.graphics().setDepth(2);
    const ax = 460;
    const aw = 1740;

    // ── Ceiling ──────────────────────────────────────
    g.fillStyle(0x141218); g.fillRect(ax, 0, aw, GY - 180);
    g.fillStyle(0x1e1c24); g.fillRect(ax, GY - 185, aw, 8); // cornice

    // ── Walls ────────────────────────────────────────
    g.fillStyle(0x1a1820); g.fillRect(ax, GY - 180, aw, 70);  // upper wall
    g.fillStyle(0x28262e); g.fillRect(ax, GY - 112, aw, 6);   // dado rail
    g.fillStyle(0x18161c); g.fillRect(ax, GY - 106, aw, 106); // lower wall
    g.lineStyle(1, 0x1f1d27, 0.28);
    for (let x = ax; x < ax + aw; x += 52) g.lineBetween(x, GY - 180, x, GY - 112);

    // ── Floor ────────────────────────────────────────
    g.fillStyle(0x1c1710); g.fillRect(ax, GY, aw, 60);
    g.lineStyle(1, 0x231d16, 0.55);
    for (let x = ax; x < ax + aw; x += 32) g.lineBetween(x, GY, x, GY + 60);
    for (let y = GY; y <= GY + 60; y += 16) g.lineBetween(ax, y, ax + aw, y);

    // ── Entrance vestibule (x:460–640) ───────────────
    g.fillStyle(0x121016); g.fillRect(ax, GY - 180, 180, 180);
    g.fillStyle(0x1a1612); g.fillRect(ax + 10, GY + 4, 60, 24); // shoe rack
    g.lineStyle(1, 0x22180e); g.strokeRect(ax + 10, GY + 4, 60, 24);
    g.fillStyle(0x3a3028); g.fillRect(ax + 14, GY + 18, 20, 8);
    g.fillStyle(0x3a3028); g.fillRect(ax + 38, GY + 18, 20, 8);
    g.fillStyle(0x2a2820); g.fillRect(ax + 20, GY - 96, 4, 12); // coat hook
    g.fillStyle(0x8a7848); g.fillCircle(ax + 22, GY - 84, 4);
    g.fillStyle(0x2a2018); g.fillRect(ax + 14, GY - 82, 16, 28); // jacket

    // ── Floor lamp (x:700) ───────────────────────────
    const lx = 700;
    g.fillStyle(0x28180a); g.fillRect(lx - 3, GY - 140, 6, 140);
    g.fillStyle(0x403018); g.fillRect(lx - 22, GY - 146, 44, 10);
    g.fillStyle(0x302208); g.fillRect(lx - 18, GY - 136, 36, 24);
    for (let c = 8; c >= 0; c--) {
      g.fillStyle(0xc87820, c * 0.011);
      g.beginPath();
      g.moveTo(lx - 18, GY - 112); g.lineTo(lx + 18, GY - 112);
      g.lineTo(lx + 18 + c * 22, GY); g.lineTo(lx - 18 - c * 22, GY);
      g.closePath(); g.fillPath();
    }
    g.fillStyle(0x3a2208, 0.18); g.fillEllipse(lx, GY + 8, 100, 10);

    // ── Sofa (x:800–1060) ────────────────────────────
    g.fillStyle(0x2e2824); g.fillRect(800, GY - 70, 260, 70);
    g.fillStyle(0x3a3228); g.fillRect(800, GY - 90, 260, 22);
    g.fillStyle(0x241e1a); g.fillRect(798,  GY - 6,  14, 8);
    g.fillStyle(0x241e1a); g.fillRect(1048, GY - 6,  14, 8);
    g.fillStyle(0x362e28); g.fillRect(800,  GY - 68, 40, 68);
    g.fillStyle(0x362e28); g.fillRect(1020, GY - 68, 40, 68);
    g.lineStyle(1, 0x281e18, 0.5);
    g.lineBetween(896, GY - 68, 896, GY);
    g.lineBetween(960, GY - 68, 960, GY);
    g.fillStyle(0x4a3828); g.fillRect(826, GY - 66, 44, 40); // pillow
    g.lineStyle(1, 0x382c20, 0.5); g.strokeRect(826, GY - 66, 44, 40);

    // ── Coffee table (x:840–1020) ────────────────────
    g.fillStyle(0x201a12); g.fillRect(840, GY - 14, 180, 16);
    g.lineStyle(1, 0x2a2218); g.strokeRect(840, GY - 14, 180, 16);
    g.fillStyle(0x181410); g.fillRect(846, GY, 8, 8);
    g.fillStyle(0x181410); g.fillRect(1004, GY, 8, 8);
    g.fillStyle(0x3a3028); g.fillRect(920, GY - 24, 14, 12); // mug
    g.fillStyle(0x2c2820); g.fillRect(921, GY - 26, 12, 6);

    // ── Bookshelf (x:1120–1240) ──────────────────────
    g.fillStyle(0x1a1610); g.fillRect(1120, GY - 178, 120, 178);
    g.lineStyle(1, 0x14120c); g.strokeRect(1120, GY - 178, 120, 178);
    [GY - 138, GY - 98, GY - 58, GY - 18].forEach(sy => {
      g.fillStyle(0x24201a); g.fillRect(1122, sy, 116, 5);
    });
    const bookColors = [0x4a2a18,0x1a3040,0x2a1a40,0x183828,0x402020,0x1a2a18,0x3a2810,0x182038,0x281a30,0x2a1818,0x184030];
    let bx2 = 1124; let shelf = GY - 178 + 8;
    bookColors.forEach((bc, i) => {
      const bw = 8 + (i % 3) * 3;
      g.fillStyle(bc); g.fillRect(bx2, shelf, bw, 35);
      bx2 += bw + 1;
      if (bx2 > 1228) { bx2 = 1124; shelf += 40; }
    });

    // ── Photo frame on wall (x:1310) ─────────────────
    g.fillStyle(0x0c0e12); g.fillRect(1316, GY - 140, 50, 70);
    g.fillStyle(0x181620); g.fillRect(1319, GY - 137, 44, 64);
    g.lineStyle(2, 0x24202c); g.strokeRect(1316, GY - 140, 50, 70);
    // Blurred silhouette inside frame — no face
    const pg = this.add.graphics().setDepth(3);
    pg.fillStyle(0x4a3820, 0.28); pg.fillCircle(1341, GY - 108, 16);
    pg.fillStyle(0x3a2a14, 0.14); pg.fillCircle(1341, GY - 108, 22);

    // ── Side console table (x:1300) ──────────────────
    g.fillStyle(0x1c1610); g.fillRect(1300, GY - 48, 80, 48);
    g.lineStyle(1, 0x241e14); g.strokeRect(1300, GY - 48, 80, 48);

    // ── Dining table (x:1440–1700) ───────────────────
    g.fillStyle(0x1c1812); g.fillRect(1440, GY - 18, 260, 20);
    g.lineStyle(1, 0x26201a); g.strokeRect(1440, GY - 18, 260, 20);
    g.fillStyle(0x18140e); g.fillRect(1446, GY, 8, 12);
    g.fillStyle(0x18140e); g.fillRect(1684, GY, 8, 12);
    [[1454],[1554],[1644]].forEach(([cx]) => {
      g.fillStyle(0x28221c); g.fillRect(cx, GY - 58, 36, 40);
      g.fillStyle(0x342c24); g.fillRect(cx, GY - 82, 36, 26);
      g.fillStyle(0x201c16); g.fillRect(cx + 2, GY, 8, 8);
      g.fillStyle(0x201c16); g.fillRect(cx + 26, GY, 8, 8);
    });

    // ── Pendant lamp above dining table ──────────────
    g.fillStyle(0x38281a); g.fillRect(1556, GY - 178, 4, 100);
    g.fillStyle(0x4a3020); g.fillRect(1538, GY - 78, 40, 20);
    for (let c = 6; c >= 0; c--) {
      g.fillStyle(0xd09030, c * 0.014);
      g.beginPath();
      g.moveTo(1538, GY - 58); g.lineTo(1578, GY - 58);
      g.lineTo(1578 + c * 14, GY); g.lineTo(1538 - c * 14, GY);
      g.closePath(); g.fillPath();
    }
  }

  _drawBalcony() {
    const g  = this.add.graphics().setDepth(2);
    const bx = 2200;

    // Balcony floor
    g.fillStyle(0x1a1c22); g.fillRect(bx, GY, 600, 60);
    g.lineStyle(1, 0x20222a, 0.35);
    for (let x = bx; x < bx + 600; x += 28) g.lineBetween(x, GY, x, GY + 60);

    // Glass sliding doors (dividing interior from balcony)
    g.fillStyle(0x1c2028);
    g.fillRect(bx,       GY - 178, 16,  238); // left frame post
    g.fillRect(bx + 290, GY - 178, 16,  238); // right frame post
    g.fillRect(bx + 16,  GY - 40,  274, 10);  // mid rail
    g.fillRect(bx + 154, GY - 178, 8,   238); // centre divider
    // Glass panes
    g.fillStyle(0x0d1220, 0.88);
    g.fillRect(bx + 16,  GY - 178, 138, 238);
    g.fillRect(bx + 162, GY - 178, 128, 238);
    // Rain on glass
    g.lineStyle(1, 0x5a7a90, 0.1);
    for (let rx = bx + 20; rx < bx + 290; rx += 10) {
      g.lineBetween(rx, GY - 175, rx + 3, GY - 150);
      g.lineBetween(rx + 5, GY - 130, rx + 7, GY - 110);
      g.lineBetween(rx + 2, GY - 80,  rx + 4, GY - 55);
    }

    // Open balcony beyond glass
    g.fillStyle(0x06080f); g.fillRect(bx + 306, 0, 294, GY);
    // City lights glimpse
    g.fillStyle(0x1e2840, 0.45);
    [bx+315,bx+345,bx+375,bx+415,bx+455,bx+500,bx+540,bx+575].forEach(cx => {
      const ht = 20 + Math.floor(Math.random() * 60);
      g.fillRect(cx, GY - 100 - ht, 12, ht);
    });

    // Railing
    g.fillStyle(0x24262e); g.fillRect(bx + 306, GY - 38, 294, 8);
    g.fillStyle(0x24262e); g.fillRect(bx + 306, GY,      294, 8);
    for (let px = bx + 316; px < bx + 600; px += 18) {
      g.fillStyle(0x20222a); g.fillRect(px, GY - 38, 4, 46);
    }

    // Curtains
    g.fillStyle(0x2a1e0c); g.fillRect(bx - 22, GY - 192, 32, 262);
    g.fillStyle(0x2a1e0c); g.fillRect(bx + 296, GY - 192, 32, 262);
    g.lineStyle(1, 0x1e1608, 0.4);
    [bx-16,bx-10,bx-4].forEach(cx => g.lineBetween(cx, GY-192, cx, GY+70));
    [bx+300,bx+308,bx+316].forEach(cx => g.lineBetween(cx, GY-192, cx, GY+70));
    g.fillStyle(0x3a3020); g.fillRect(bx - 24, GY - 196, 360, 5); // rod

    // Warm interior glow on glass
    g.fillStyle(0x3a2008, 0.06); g.fillRect(bx + 16, GY - 178, 274, 238);

    // ── WIND CHIMES ──────────────────────────────────
    // Hang just inside balcony doors — large and visible
    this._chimeGfx   = this.add.graphics().setDepth(9);
    this._chimeBaseX = bx + 80;
    this._chimeBaseY = GY - 170;
    this._chimeTubes = [
      { dx: -28, len: 40, phase: 0.0, w: 5 },
      { dx: -14, len: 56, phase: 0.6, w: 5 },
      { dx:   0, len: 48, phase: 1.2, w: 6 },
      { dx:  14, len: 62, phase: 1.8, w: 5 },
      { dx:  28, len: 36, phase: 2.4, w: 5 },
    ];
    this._drawChimes(0);

    // Puddles on balcony floor
    g.fillStyle(0x1c2030, 0.5);
    [bx+330,bx+390,bx+450,bx+510,bx+560].forEach(px => {
      g.fillEllipse(px, GY + 56, 32, 6);
    });
  }

  _drawCity() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x06080f); g.fillRect(2800, 0, 400, H);
    g.fillStyle(0x1e2840, 0.35);
    for (let i = 0; i < 20; i++) {
      g.fillRect(2820 + Math.random() * 360, 60 + Math.random() * 300, 8, 12);
    }
  }

  // ── Wind chimes (animated every frame) ──────────────
  _drawChimes(t) {
    const g  = this._chimeGfx;
    g.clear();
    const bx = this._chimeBaseX;
    const by = this._chimeBaseY;

    // Hanging rod
    g.fillStyle(0xa09060); g.fillRect(bx - 36, by, 72, 6);
    // Support cord
    g.lineStyle(1, 0x706040, 0.7); g.lineBetween(bx, by, bx, by - 20);

    this._chimeTubes.forEach(tube => {
      const sway = Math.sin(t + tube.phase) * 7;
      const topX = bx + tube.dx;
      const botX = topX + sway;

      // String
      g.lineStyle(1, 0x807050, 0.8);
      g.lineBetween(topX, by + 6, botX, by + 16);

      // Tube
      g.fillStyle(0xb8a870);
      g.fillRect(botX - 2, by + 16, tube.w, tube.len);
      // Shine line
      g.fillStyle(0xd4c090, 0.45);
      g.fillRect(botX - 1, by + 16, 1, tube.len);

      // Clapper
      g.fillStyle(0x8a7840);
      g.fillRect(botX - 3, by + 16 + tube.len, tube.w + 2, 7);
    });

    // Warm glow around chimes
    g.fillStyle(0xc8a030, 0.05);
    g.fillRect(bx - 44, by - 8, 88, 90);
  }

  // ════════════════════════════════════════════════════
  //  DOOR PANEL (dynamic)
  // ════════════════════════════════════════════════════

  _buildDoorPanel() {
    this._doorGfx = this.add.graphics().setDepth(6);
    this._renderDoorPanel(0);
  }

  _renderDoorPanel(frac) {
    const g     = this._doorGfx;
    g.clear();
    const dx    = 400;
    const top   = GY - 180;
    const bot   = GY + 60;
    const fullW = 62;
    const panelW = Math.max(2, Math.round(fullW * (1 - frac * 0.93)));
    const skew   = Math.round(frac * 32);

    g.fillStyle(0x1c1610);
    g.beginPath();
    g.moveTo(dx,           top);
    g.lineTo(dx + panelW,  top + skew * 0.3);
    g.lineTo(dx + panelW,  bot - skew * 0.3);
    g.lineTo(dx,           bot);
    g.closePath();
    g.fillPath();

    if (frac < 0.5) {
      const op = 1 - frac / 0.5;
      g.lineStyle(1, 0x12100c, op);
      const pw = panelW - 8;
      if (pw > 8) {
        g.strokeRect(dx + 4, top + 8,  pw, 52);
        g.strokeRect(dx + 4, top + 66, pw, 52);
        g.strokeRect(dx + 4, top + 124, pw, 42);
      }
    }

    const knobX = dx + panelW - 10;
    const knobY = top + (bot - top) * 0.45 + skew * 0.05;
    g.fillStyle(0x3a3020); g.fillCircle(knobX, knobY, 6);
    g.fillStyle(0x504030); g.fillCircle(knobX - 1, knobY - 1, 4);

    if (frac < 0.2) {
      g.fillStyle(0x0a0906); g.fillCircle(dx + panelW * 0.5, top + 32, 3);
      g.fillStyle(0x1e1c14); g.fillCircle(dx + panelW * 0.5, top + 32, 1.5);
    }
  }

  // ════════════════════════════════════════════════════
  //  ATMOSPHERE
  // ════════════════════════════════════════════════════

  _buildAtmosphere() {
    const vig = this.add.graphics().setScrollFactor(0).setDepth(185);
    for (let i = 0; i < 32; i++) {
      vig.lineStyle(i * 2, 0x000000, i / 80);
      vig.strokeRect(i, i, 480 - i * 2, 640 - i * 2);
    }
    this._grain = this.add.graphics().setScrollFactor(0).setDepth(190);
    this._drawGrain();
  }

  _drawGrain() {
    this._grain.clear();
    for (let n = 0; n < 60; n++) {
      this._grain.fillStyle(0xffffff, Math.random() * 0.04);
      this._grain.fillRect(Math.random() * 480, Math.random() * 640, 1, 1);
    }
  }

  // ════════════════════════════════════════════════════
  //  PLAYER
  // ════════════════════════════════════════════════════

  _buildPlayer() {
    if (!this.textures.exists('san')) if (!this.textures.exists('san')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const s = 3; // (Some scenes use s = 4, keep the 's' variable as defined in the file!)
      
      g.clear();

      // ── 1. HAIR (Dark, textured, messy style) ──
      g.fillStyle(0x1a1a22);
      g.fillRect(2*s, 0,     4*s, 2*s); // Top crown
      g.fillRect(1*s, 1*s,   1*s, 4*s); // Hair side L
      g.fillRect(6*s, 1*s,   1*s, 3*s); // Hair side R
      g.fillStyle(0x2d2d3a);            // Highlights
      g.fillRect(3*s, 0,     2*s, 1*s);

      // ── 2. FACE & SKIN (Tired, matching dialogue portrait) ──
      g.fillStyle(0xc8956a);
      g.fillRect(2*s, 2*s,   4*s, 4*s); // Main face
      // Eyes (weary and distinct)
      g.fillStyle(0x2d1b10);
      g.fillRect(3*s, 3*s,   1*s, 1*s); // Eye L
      g.fillRect(5*s, 3*s,   1*s, 1*s); // Eye R
      // Nose & Mouth (melancholic expression)
      g.fillStyle(0xb07d56);
      g.fillRect(4*s, 4*s,   1*s, 1*s); // Nose
      g.fillStyle(0x9a6842);
      g.fillRect(3*s, 5*s,   2*s, 1*s); // Mournful mouth
      // Ears
      g.fillStyle(0xb07d56);
      g.fillRect(1*s, 3*s,   1*s, 2*s); // Ear L
      g.fillRect(6*s, 3*s,   1*s, 2*s); // Ear R

      // ── 3. NECK & COLLAR ──
      g.fillStyle(0xb07d56);
      g.fillRect(3*s, 6*s,   2*s, 1*s); // Neck
      g.fillStyle(0xdbe3e8);
      g.fillRect(3*s, 7*s,   2*s, 1*s); // White inner collar

      // ── 4. JACKET / PATIENT GOWN (Detailed folds) ──
      g.fillStyle(0x8aa4b8);
      g.fillRect(1*s, 7*s,   6*s, 5*s); // Main coat body
      // Outer sleeves hanging down slightly
      g.fillRect(0,   7*s,   1*s, 4*s); // Sleeve L
      g.fillRect(7*s,   7*s,   1*s, 4*s); // Sleeve R
      // Darker shading folds
      g.fillStyle(0x6e8a9e);
      g.fillRect(1*s, 7*s,   1*s, 5*s); // Body shadow L
      g.fillRect(6*s, 7*s,   1*s, 5*s); // Body shadow R
      // Inner shirt opening
      g.fillStyle(0x2e3a47);
      g.fillRect(3*s, 8*s,   2*s, 3*s); // Open lapel
      // Hands peeking from sleeves
      g.fillStyle(0xc8956a);
      g.fillRect(0,   11*s,  1*s, 1*s); // Hand L
      g.fillRect(7*s, 11*s,  1*s, 1*s); // Hand R

      // ── 5. BELT LINE ──
      g.fillStyle(0x1a1c22);
      g.fillRect(1*s, 12*s,  6*s, 1*s); // Belt
      g.fillStyle(0xa08c50);
      g.fillRect(3*s, 12*s,  2*s, 1*s); // Brass buckle

      // ── 6. LEGS (Dark trousers) ──
      g.fillStyle(0x7090a8);
      g.fillRect(1*s, 13*s,  2*s, 4*s); // Pant Leg L
      g.fillRect(5*s, 13*s,  2*s, 4*s); // Pant Leg R
      g.fillStyle(0x56758c);            // Shading
      g.fillRect(1*s, 13*s,  1*s, 4*s);
      g.fillRect(5*s, 13*s,  1*s, 4*s);

      // ── 7. SHOES (Dark soles) ──
      g.fillStyle(0x1a1a22);
      g.fillRect(1*s, 17*s,  2*s, 1*s); // Shoe L
      g.fillRect(5*s, 17*s,  2*s, 1*s); // Shoe R

      g.generateTexture('san', 8*s, 18*s);
      g.destroy();
    }
    this.player = this.physics.add.sprite(80, GY, 'san');
    this.player.setOrigin(0.5, 1);
    this.player.body.setSize(20, 28);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  // ════════════════════════════════════════════════════
  //  WALLS
  // ════════════════════════════════════════════════════

  _buildWalls() {
    this._walls = this.physics.add.staticGroup();
    const w = (x, y, ww, hh) => {
      const wall = this._walls.create(x + ww / 2, y + hh / 2, null);
      wall.setVisible(false);
      wall.body.setSize(ww, hh);
      wall.refreshBody();
      return wall;
    };

    w(0,     0,   W, 8);      // top
    w(0,     GY,  W, 8);      // ground (player can't go below)
    w(0,     0,   8, H);      // left edge
    w(W - 8, 0,   8, H);      // right edge

    // Door block
    this._doorWallBody = w(400, GY - 180, 62, 240);

    this.physics.add.collider(this.player, this._walls);
  }

  // ════════════════════════════════════════════════════
  //  CAMERA
  // ════════════════════════════════════════════════════

  _buildCamera() {
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.07, 0.07);
  }

  // ════════════════════════════════════════════════════
  //  INPUT
  // ════════════════════════════════════════════════════

  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys    = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
  }

  // ════════════════════════════════════════════════════
  //  DOORBELL
  // ════════════════════════════════════════════════════

  _ringDoorbell() {
    if (this._rang) return;
    this._rang = true;
    this.player.setVelocity(0);

    const flash = this.add.graphics().setDepth(200);
    flash.fillStyle(0xd4b030); flash.fillCircle(372, GY - 84, 5);
    this.tweens.add({
      targets: flash, alpha: 0, duration: 380,
      onComplete: () => flash.destroy()
    });

    addDialogue('San', '...');
    runDialogue(() => {
      this.time.delayedCall(700, () => this._openDoor());
    });
  }

  // ════════════════════════════════════════════════════
  //  DOOR OPEN
  // ════════════════════════════════════════════════════

  _openDoor() {
    let step = 0;
    const total = 50;
    const tick = this.time.addEvent({
      delay: 18, repeat: total - 1,
      callback: () => {
        step++;
        const frac = step / total;
        this._renderDoorPanel(frac);
        this._doorLightGfx.setAlpha(frac * 0.75);
        if (step >= total) {
          tick.remove();
          this._doorOpen = true;
          this._doorWallBody.body.enable = false;
          this.time.delayedCall(280, () => this._tenantAppears());
        }
      }
    });
  }

  // ════════════════════════════════════════════════════
  //  TENANT IN DOORWAY
  // ════════════════════════════════════════════════════

  _tenantAppears() {
    const g   = this.add.graphics().setDepth(7);
    // Place tenant just to the right of San in the doorway
    const dx  = Math.round(this.player.x) + 28;
    const ty  = GY - 92;
    const s   = 4;   // pixel scale — matches San sprite

    // ── Warm rim-light glow from apartment behind ──
    g.fillStyle(0x5a3010, 0.18);
    g.fillRect(dx - 24, ty - 8, 76, 148);

    // ── Hair ──
    g.fillStyle(0x3a2c1e);
    g.fillRect(dx + 1*s, ty,         4*s, 2*s);  // top
    g.fillRect(dx,       ty + 1*s,   1*s, 3*s);  // side L
    g.fillRect(dx + 5*s, ty + 1*s,   1*s, 3*s);  // side R

    // ── Face ──
    g.fillStyle(0xb8906a);
    g.fillRect(dx + 1*s, ty + 2*s,   4*s, 5*s);

    // Eyes
    g.fillStyle(0x1a1210);
    g.fillRect(dx + 2*s, ty + 4*s,   1*s, 1*s);
    g.fillRect(dx + 4*s, ty + 4*s,   1*s, 1*s);

    // Nose
    g.fillStyle(0xa07858);
    g.fillRect(dx + 3*s, ty + 5*s,   1*s, 1*s);

    // Mouth — slightly uncertain
    g.fillStyle(0x906848);
    g.fillRect(dx + 2*s, ty + 6*s,   3*s, 1*s);

    // Ears
    g.fillStyle(0xa07858);
    g.fillRect(dx,       ty + 3*s,   1*s, 2*s);
    g.fillRect(dx + 5*s, ty + 3*s,   1*s, 2*s);

    // ── Neck ──
    g.fillStyle(0xa07858);
    g.fillRect(dx + 2*s, ty + 7*s,   2*s, 2*s);

    // ── Body / home clothes (warm grey) ──
    g.fillStyle(0x2e2a28);
    g.fillRect(dx,       ty + 9*s,   6*s, 7*s);  // torso

    // Collar highlight
    g.fillStyle(0x3a3632);
    g.fillRect(dx + 1*s, ty + 9*s,   4*s, 2*s);

    // ── Arms ──
    g.fillStyle(0x2e2a28);
    g.fillRect(dx - 1*s, ty + 9*s,   1*s, 5*s);  // arm L
    g.fillRect(dx + 6*s, ty + 9*s,   1*s, 5*s);  // arm R

    // Hands
    g.fillStyle(0xb8906a);
    g.fillRect(dx - 1*s, ty + 14*s,  1*s, 2*s);
    g.fillRect(dx + 6*s, ty + 14*s,  1*s, 2*s);

    // ── Legs ──
    g.fillStyle(0x242028);
    g.fillRect(dx + 1*s, ty + 16*s,  2*s, 7*s);  // leg L
    g.fillRect(dx + 3*s, ty + 16*s,  2*s, 7*s);  // leg R

    // Rim light outline
    g.lineStyle(2, 0x7a4818, 0.6);
    g.lineBetween(dx - 1*s, ty,       dx - 1*s, ty + 23*s);
    g.lineBetween(dx + 7*s, ty,       dx + 7*s, ty + 23*s);

    addDialogue('Tenant', 'Can I help you?');
    addDialogue('San',    "I... I used to know someone here.");
    addDialogue('Tenant', 'The previous owner.');
    addDialogue('Tenant', '...');
    addDialogue('Tenant', 'You knew her?');
    addDialogue('San',    '...');

    runDialogue(() => {
      this.time.delayedCall(400, () => this._cameraRevealChimes());
    });
  }

  // ════════════════════════════════════════════════════
  //  CAMERA PAN → wind chimes → back → more dialogue
  // ════════════════════════════════════════════════════

  _cameraRevealChimes() {
    this.cameras.main.stopFollow();
    this.player.setVelocity(0);

    // Pan right to reveal wind chimes on balcony
    this.cameras.main.pan(
      this._chimeBaseX, GY - 60,
      2400, 'Sine.easeInOut', false,
      (cam, progress) => {
        if (progress < 1) return;

        // Hold on chimes for a moment
        this.time.delayedCall(1400, () => {
          addDialogue('San', '...those wind chimes.');
          runDialogue(() => {

            // Pan back to door / tenant
            this.cameras.main.pan(
              460, GY - 60, 1600, 'Sine.easeInOut', false,
              (c2, p2) => {
                if (p2 < 1) return;

                addDialogue('Tenant', 'They were already here when I moved in.');
                addDialogue('Tenant', 'I kept them.');
                addDialogue('San',    '...');
                runDialogue(() => {
                  this.time.delayedCall(400, () => {
                    triggerMemory([
                      'A balcony.',
                      'The sun was going down.',
                      'She was laughing at something.',
                      'Wind chimes.',
                      'Her silhouette against the light.',
                      '...',
                      "I should remember her face.",
                      "Why can't I remember her face."
                    ], {
                      onDone: () => {
                        this.cameras.main.startFollow(this.player, true, 0.07, 0.07);
                        this._memoryDone = true;
                        this.time.delayedCall(600, () => {
                          narrate('He left.', 1200, () => {
                            this.cameras.main.fade(900, 0, 0, 0, false, (cam, progress) => {
                              if (progress === 1) {
                                showChapterCard('Chapter Three', '11:42 PM', () => {
                                  this.scene.start('ConvenienceStoreScene');
                                });
                              }
                            });
                          });
                        });
                      }
                    });
                  });
                });
              }
            );
          });
        });
      }
    );
  }

  // ════════════════════════════════════════════════════
  //  HINT
  // ════════════════════════════════════════════════════

  _updateHint() {
    const nearDoor = !this._rang && Math.abs(this.player.x - 400) < 60;
    if (this._bellHint) this._bellHint.setAlpha(nearDoor ? 0.85 : 0);
    const el = this._hint;
    if (el) {
      el.textContent   = nearDoor ? '[E] ring doorbell' : '';
      el.style.display = nearDoor ? 'block' : 'none';
    }
  }

  // ════════════════════════════════════════════════════
  //  UPDATE
  // ════════════════════════════════════════════════════

  update(time, delta) {
    const dt = delta / 1000;

    if (Math.random() > 0.8) this._drawGrain();

    // Wind chimes always sway
    this._chimeAngle += dt * 0.85;
    this._drawChimes(this._chimeAngle);

    if (dialogueActive() || this._rang) {
      this.player.setVelocity(0);
      this._updateHint();
      return;
    }

    // 1D — horizontal only
    let vx = 0;
    if (this.cursors.left.isDown  || this.keys.a.isDown) vx = -this.speed;
    if (this.cursors.right.isDown || this.keys.d.isDown) vx =  this.speed;
    this.player.setVelocity(vx, 0);

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (Math.abs(this.player.x - 400) < 60) this._ringDoorbell();
    }

    this._updateHint();
  }
}
