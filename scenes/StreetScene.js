// ═══════════════════════════════════════════════════════
//  StreetScene.js  —  Chapter Two: Static City
//
//  Layout: HORIZONTAL scroll. San starts LEFT (hospital
//  exit). Street runs RIGHT. Apartment building is at the
//  FAR RIGHT end. Rain falls diagonally left→right.
//
//  Uses ONLY real system functions (matches actual codebase):
//    addDialogue(speaker, text)
//    runDialogue(onDone?)
//    dialogueActive()
//    triggerMemory(lines[])
//    togglePhone()
//    isPhoneOpen()
// ═══════════════════════════════════════════════════════

import { addDialogue, runDialogue, dialogueActive } from '../systems/DialogueSystem.js';
import { togglePhone, isPhoneOpen }                 from '../systems/PhoneSystem.js';
import { triggerMemory }                            from '../systems/MemorySystem.js';

export default class StreetScene extends Phaser.Scene {

  constructor() { super('StreetScene'); }

  // ════════════════════════════════════════════════════
  //  CREATE
  // ════════════════════════════════════════════════════

  create() {

    this.speed = 80;

    // World: 2400 wide × 320 tall — horizontal scroll
    //   x=0    : hospital exit  (San spawns here)
    //   x=2400 : apartment building entrance
    this.physics.world.setBounds(0, 0, 2400, 640);

    // Interaction flags
    this._doneVending  = false;
    this._doneStore    = false;
    this._doneBuilding = false;

    // Floating thought thresholds (world-x positions)
    this._thoughts = [
      { x:  300, text: 'The air feels different.',    done: false },
      { x:  600, text: 'Same rain.',                  done: false },
      { x:  950, text: 'One year.',                   done: false },
      { x: 1300, text: 'Too many people.',            done: false },
      { x: 1650, text: '...or maybe not enough.',     done: false },
      { x: 2000, text: 'She used to live near here.', done: false },
    ];
    this._thoughtActive = false;

    // Rain particles (camera-fixed)
    this._rain = [];
    for (let i = 0; i < 90; i++) this._rain.push(this._mkDrop(true));

    this._buildWorld();
    this._buildShopOwner();
    this._buildPlayer();
    this._buildCamera();
    this._buildInput();
    this._buildInteractables();
    this._buildRainGraphics();

    // Fade in
    this.cameras.main.fadeIn(900, 0, 0, 0);

    // Entry dialogue after fade
    this.time.delayedCall(1100, () => {
      addDialogue('San', 'Outside.', null);
      addDialogue('San', "It's raining.", null);
      runDialogue();
    });
  }

  // ════════════════════════════════════════════════════
  //  WORLD BUILDING
  // ════════════════════════════════════════════════════

  _buildWorld() {
    this._drawSky();
    this._drawStreet();
    this._drawHospitalExit();
    this._drawVendingMachine();
    this._drawConvenienceStore();
    this._drawApartmentBuilding();
    this._drawStreetProps();
    this._drawAtmosphere();
  }

  _drawSky() {
    const g = this.add.graphics().setDepth(0);

    // Solid base fills the entire world height — no gaps ever
    g.fillStyle(0x090c12); g.fillRect(0, 0, 2400, 640);

    // Sky gradient bands — go all the way to y=162 so no black strip
    const bands = [
      [0x090c12, 0],
      [0x0a0d14, 28],
      [0x0b0f16, 56],
      [0x0c1018, 84],
      [0x0d111a, 112],
      [0x0e121c, 140],
      [0x0f131e, 162]   // last band flush with top sidewalk
    ];
    bands.forEach(([c, y], i) => {
      const nextY = bands[i+1] ? bands[i+1][1] : 162;
      g.fillStyle(c); g.fillRect(0, y, 2400, nextY - y + 1); // +1 overlap kills seams
    });

    // Background building silhouettes — taller than sky so they fully cover it
    g.fillStyle(0x0c0f18);
    [ [0,0,80,165],[80,20,60,145],[140,0,50,165],
      [300,10,70,158],[500,15,90,148],[680,0,60,165],
      [900,0,70,165],[1100,10,80,158],[1300,0,55,165],
      [1500,15,65,152],[1700,0,75,165],[1900,20,60,145],
      [2100,0,80,165],[2280,10,120,158]
    ].forEach(([x,y,w,h]) => g.fillRect(x, y, w, h));

    // Dim distant windows
    g.fillStyle(0x2a2810);
    for (let bx = 0; bx < 2400; bx += 120) {
      for (let r = 0; r < 4; r++) {
        if (Math.random() > 0.45) g.fillRect(bx + Math.random()*80, 20 + r*30, 6, 8);
      }
    }
  }

  _drawStreet() {
    const g = this.add.graphics().setDepth(1);

    // Top sidewalk
    g.fillStyle(0x1e2028); g.fillRect(0, 320, 2400, 60);
    // Road
    g.fillStyle(0x12141a); g.fillRect(0, 380, 2400, 180);
    // Bottom sidewalk
    g.fillStyle(0x1c1e26); g.fillRect(0, 560, 2400, 80);

    // Lane dashes
    g.lineStyle(2, 0x242630, 0.5);
    for (let x = 0; x < 2400; x += 60) g.lineBetween(x, 460, x+36, 460);

    // Top sidewalk tile grid
    g.lineStyle(1, 0x242630, 0.25);
    for (let x = 0; x < 2400; x += 24) g.lineBetween(x, 320, x, 380);
    for (let y = 320; y <= 380; y += 14) g.lineBetween(0, y, 2400, y);

    // Bottom sidewalk tile grid
    for (let x = 0; x < 2400; x += 24) g.lineBetween(x, 560, x, 640);
    for (let y = 560; y <= 640; y += 20) g.lineBetween(0, y, 2400, y);

    // Puddles on road
    [220,400,580,760,940,1100,1300,1480,1660,1840,2040,2220].forEach(px => {
      g.fillStyle(0x1a2034); g.fillEllipse(px, 440, 50+Math.random()*28, 7);
      g.fillStyle(0x22283e, 0.4); g.fillEllipse(px-5, 438, 18, 3);
    });
  }

  _drawHospitalExit() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x191b22); g.fillRect(0, 0, 180, 320);
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 4; row++) {
        g.fillStyle((col+row)%2===0 ? 0x243448 : 0x141820);
        g.fillRect(14+col*52, 10+row*34, 28, 22);
      }
    }
    // Exit doors
    g.fillStyle(0x1c2840); g.fillRect(50, 260, 38, 50);
    g.fillStyle(0x243450); g.fillRect(90, 260, 38, 50);
    g.lineStyle(2, 0x304060); g.strokeRect(48, 258, 84, 54);
    // Fluorescent spill
    g.fillStyle(0x8899aa, 0.28); g.fillRect(56, 256, 64, 3);
    g.fillStyle(0x2244aa, 0.07);
    g.beginPath(); g.moveTo(56,259); g.lineTo(120,259); g.lineTo(136,320); g.lineTo(40,320);
    g.closePath(); g.fillPath();
    g.fillStyle(0x182040, 0.55); g.fillEllipse(90, 324, 72, 7);
  }

  _drawVendingMachine() {
    const g = this.add.graphics().setDepth(3);
    const bx = 560;
    g.fillStyle(0x191b24); g.fillRect(bx, 280, 44, 80);
    g.fillStyle(0x1d1f30); g.fillRect(bx+2, 282, 40, 76);
    const cols = [0x882222, 0x224488, 0x226644, 0x442288];
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 3; r++) {
        g.fillStyle(cols[(c+r)%4]);
        g.fillRect(bx+4+c*18, 288+r*18, 12, 13);
        g.fillStyle(0xffffff, 0.07); g.fillRect(bx+5+c*18, 289+r*18, 10, 3);
      }
    }
    g.fillStyle(0x080a10); g.fillRect(bx+8, 366, 20, 3);
    for (let gl = 3; gl >= 0; gl--) {
      g.lineStyle(gl*2, 0x2244aa, gl*0.06); g.strokeRect(bx-gl, 280-gl, 44+gl*2, 80+gl*2);
    }
    g.fillStyle(0x1a2040, 0.35); g.fillEllipse(bx+22, 366, 48, 7);
    this.add.text(bx+22, 275, '[E]', {
      fontFamily: 'Courier New', fontSize: '8px', color: '#334466'
    }).setOrigin(0.5, 1).setDepth(95);
  }

  _drawConvenienceStore() {
    const g = this.add.graphics().setDepth(2);
    const bx = 1040;
    g.fillStyle(0x16171e); g.fillRect(bx, 0, 180, 162);
    g.fillStyle(0x2a200e); g.fillRect(bx+12, 60, 90, 120);
    g.fillStyle(0x382c16, 0.5); g.fillRect(bx+14, 62, 86, 116);
    g.fillStyle(0x28221a); g.fillRect(bx+16, 130, 80, 4); g.fillRect(bx+16, 160, 80, 4);
    g.fillStyle(0x1c1814); g.fillRect(bx+78, 80, 14, 60);
    g.fillStyle(0x4a2c18, 0.5); g.fillRect(bx+14, 20, 90, 16);
    g.fillStyle(0x1c2230); g.fillRect(bx+115, 240, 28, 80);
    g.lineStyle(1, 0x2a3040); g.strokeRect(bx+115, 240, 28, 80);
    g.fillStyle(0x3a2c14, 0.2);
    g.beginPath();
    g.moveTo(bx+115,320); g.lineTo(bx+143,320); g.lineTo(bx+155,380); g.lineTo(bx+103,380);
    g.closePath(); g.fillPath();
    this.add.text(bx+90, 2, '[E]', {
      fontFamily: 'Courier New', fontSize: '8px', color: '#443322'
    }).setOrigin(0.5, 1).setDepth(95);
  }

  _drawApartmentBuilding() {
    const g = this.add.graphics().setDepth(2);
    const bx = 1900;

    g.fillStyle(0x17181f); g.fillRect(bx, 0, 500, 162);

    // Brick texture
    g.lineStyle(1, 0x1c1d24, 0.35);
    for (let row = 0; row < 8; row++) {
      const off = (row%2)*14;
      for (let col = -1; col < 22; col++) {
        const cx = bx + off + col*24;
        g.lineBetween(cx, row*20, cx+18, row*20);
        g.lineBetween(cx, row*20, cx, row*20+20);
      }
    }

    // Windows 8 cols × 5 rows
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 5; row++) {
        const wx = bx + 20 + col*56;
        const wy = 20 + row*48;
        const lit  = (col+row*3+1)%3 !== 0;
        const warm = (col+row)%4 === 0;
        g.fillStyle(lit ? (warm ? 0x3a2e18 : 0x1e2e3a) : 0x0e0f14);
        g.fillRect(wx, wy, 32, 20);
        if (lit) { g.fillStyle(warm ? 0x3a2a10 : 0x102030, 0.15); g.fillRect(wx-2, wy-2, 36, 24); }
      }
    }

    // HER window — warmly lit, row 1, col 5
    const herX = bx + 20 + 5*56, herY = 39;
    g.fillStyle(0x4a3c1c); g.fillRect(herX, herY, 38, 22);
    g.fillStyle(0x9a6c30, 0.3); g.fillRect(herX-4, herY-4, 46, 30);
    g.fillStyle(0x2a1e10); g.fillRect(herX, herY, 8, 22);
    g.fillStyle(0x2a1e10); g.fillRect(herX+30, herY, 8, 22);

    // Wind chimes beside her window
    g.fillStyle(0x504028); g.fillRect(herX+42, herY-5, 18, 2);
    [0,3,6,10,14].forEach((dx, i) => {
      const len = [12,16,14,18,10][i];
      g.fillRect(herX+42+dx, herY-3, 1, len);
      g.fillStyle(0x5a4830); g.fillRect(herX+41+dx, herY-3+len, 3, 2);
      g.fillStyle(0x504028);
    });

    // Warm glow spill below her window
    g.fillStyle(0x2a1a06, 0.12);
    g.beginPath();
    g.moveTo(herX-8, herY+22); g.lineTo(herX+46, herY+22);
    g.lineTo(herX+66, herY+100); g.lineTo(herX-28, herY+100);
    g.closePath(); g.fillPath();

    // Building entrance
    g.fillStyle(0x12141c); g.fillRect(bx+200, 258, 50, 62);
    g.fillStyle(0x1a1c28); g.fillRect(bx+202, 260, 46, 60);
    g.lineStyle(1, 0x22242e); g.strokeRect(bx+200, 258, 50, 62);
    g.fillStyle(0x3a3824); g.fillRect(bx+244, 290, 4, 16);

    // Entrance puddle
    g.fillStyle(0x121a2e, 0.5); g.fillEllipse(bx+225, 325, 80, 8);

    // [E] hint
    this.add.text(bx+225, 254, '[E] enter', {
      fontFamily: 'Courier New', fontSize: '8px', color: '#3a2c14'
    }).setOrigin(0.5, 1).setDepth(95);
  }

  _drawStreetProps() {
    const g = this.add.graphics().setDepth(4);
    // Street lamps along top sidewalk
    for (let lx = 200; lx < 2400; lx += 280) {
      g.fillStyle(0x20222a); g.fillRect(lx-2, 280, 5, 42); g.fillRect(lx-14, 280, 18, 3);
      g.fillStyle(0xd4b860); g.fillRect(lx-12, 274, 8, 4);
      for (let cone = 5; cone >= 0; cone--) {
        g.fillStyle(0xc89030, cone*0.013);
        g.beginPath();
        g.moveTo(lx-12,278); g.lineTo(lx-4,278);
        g.lineTo(lx-4+cone*12,320); g.lineTo(lx-12-cone*12,320);
        g.closePath(); g.fillPath();
      }
      g.fillStyle(0x504020, 0.18); g.fillEllipse(lx-8, 323, 28, 5);
    }
    // Utility poles bottom sidewalk
    for (let px = 260; px < 2400; px += 320) {
      g.fillStyle(0x24262e); g.fillRect(px, 562, 5, 60);
      g.lineStyle(1, 0x1c1e26, 0.6); g.lineBetween(px+2, 566, px+2, 596);
    }
    // Road drain
    g.fillStyle(0x0e1016); g.fillRect(920, 440, 36, 10);
    g.lineStyle(1, 0x181c24);
    for (let dx = 922; dx < 954; dx += 5) g.lineBetween(dx, 440, dx, 450);
    // Neon sign above store area
    g.fillStyle(0x1a0808); g.fillRect(1046, 2, 58, 9);
    g.fillStyle(0x660022, 0.5); g.fillRect(1050, 3, 50, 6);
  }

  _drawAtmosphere() {
    const fog = this.add.graphics().setDepth(50);
    fog.fillStyle(0x0c1018, 0.10);
    for (let fx = 0; fx < 2400; fx += 400) fog.fillRect(fx, 0, 300, 320);

    const vig = this.add.graphics().setScrollFactor(0).setDepth(185);
    for (let i = 0; i < 28; i++) {
      vig.lineStyle(i*2.2, 0x000000, i/80);
      vig.strokeRect(i, i, 480-i*2, 640-i*2);
    }

    this._grain = this.add.graphics().setScrollFactor(0).setDepth(190);
    this._drawGrain();
  }

  _drawGrain() {
    this._grain.clear();
    for (let n = 0; n < 55; n++) {
      this._grain.fillStyle(0xffffff, Math.random()*0.055);
      this._grain.fillRect(Math.random()*480, Math.random()*640, 1, 1);
    }
  }

  // ════════════════════════════════════════════════════
  //  RAIN
  // ════════════════════════════════════════════════════

  _buildRainGraphics() {
    this._rainGfx = this.add.graphics().setScrollFactor(0).setDepth(170);
  }

  _mkDrop(randomPos = false) {
    return {
      x:     Math.random() * 520,
      y:     randomPos ? Math.random() * 320 : -8,
      speed: 250 + Math.random() * 160,
      len:   7   + Math.random() * 10,
      alpha: 0.10 + Math.random() * 0.20,
      w:     Math.random() > 0.7 ? 1.2 : 0.7
    };
  }

  _updateRain(dt) {
    this._rainGfx.clear();
    this._rain.forEach((d, i) => {
      d.y += d.speed * dt;
      d.x += d.speed * 0.14 * dt;
      if (d.y > 648 || d.x > 520) this._rain[i] = this._mkDrop(false);
      this._rainGfx.lineStyle(d.w, 0x7a90a8, d.alpha);
      this._rainGfx.lineBetween(d.x, d.y, d.x+d.len*0.14, d.y+d.len);
    });
  }

  // ════════════════════════════════════════════════════
  //  SHOP OWNER NPC
  // ════════════════════════════════════════════════════

  _buildShopOwner() {
    // Draw texture: older man, navy uniform, receding hair
    // Store door is at world-x 1118 (bx=1040, door offset +78)
    // NPC stands just outside at x=1122, y=312 (top sidewalk, depth 5)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 4;

    // Hair — receding, dark brown
    g.fillStyle(0x2a1c10); g.fillRect(1*s, 0,    4*s, 1*s);
    g.fillStyle(0x2a1c10); g.fillRect(1*s, 1*s,  1*s, 1*s);
    g.fillStyle(0x2a1c10); g.fillRect(4*s, 1*s,  1*s, 1*s);

    // Face — warm tan
    g.fillStyle(0xd4a878); g.fillRect(1*s, 1*s,  4*s, 4*s);

    // Eyes — small, tired
    g.fillStyle(0x604838); g.fillRect(1*s, 3*s,  1*s, 1*s);
    g.fillStyle(0x604838); g.fillRect(3*s, 3*s,  1*s, 1*s);

    // Nose
    g.fillStyle(0xbc8858); g.fillRect(2*s, 4*s,  2*s, 1*s);

    // Mouth — neutral, slight frown
    g.fillStyle(0xa07858); g.fillRect(1*s, 5*s,  4*s, 1*s);

    // Ears
    g.fillStyle(0xc09868); g.fillRect(0,   3*s,  1*s, 2*s);
    g.fillStyle(0xc09868); g.fillRect(5*s, 3*s,  1*s, 2*s);

    // Neck
    g.fillStyle(0xc09868); g.fillRect(2*s, 5*s,  2*s, 1*s);

    // Body — navy convenience store uniform
    g.fillStyle(0x1c2440); g.fillRect(0,   6*s,  6*s, 5*s);

    // White collar stripe
    g.fillStyle(0xe8e4de); g.fillRect(2*s, 6*s,  2*s, 2*s);

    // Arms
    g.fillStyle(0x1c2440); g.fillRect(0,   6*s,  1*s, 4*s);
    g.fillStyle(0x1c2440); g.fillRect(5*s, 6*s,  1*s, 4*s);

    // Hands (folded at front — arms crossed look)
    g.fillStyle(0xc09868); g.fillRect(1*s, 10*s, 4*s, 1*s);

    // Legs — dark trousers
    g.fillStyle(0x18202e); g.fillRect(1*s, 11*s, 2*s, 5*s);
    g.fillStyle(0x18202e); g.fillRect(3*s, 11*s, 2*s, 5*s);

    g.generateTexture('shopowner', 6*s, 16*s);
    g.destroy();

    // Place NPC just outside the store door on the sidewalk.
    // Door is at world-x 1155 (bx+115). Sidewalk top is y=320.
    // setOrigin(0.5,1) means y is the feet — place feet at y=376
    // (middle of top sidewalk strip, same as player walk height).
    // Depth 8 puts him in front of the building (depth 2) and
    // behind the vignette (depth 100).
    this._shopOwner = this.add.sprite(1155, 376, 'shopowner');
    this._shopOwner.setDepth(8);
    this._shopOwner.setOrigin(0.5, 1);

    // Subtle idle: slight vertical bob (breathing)
    this.tweens.add({
      targets:    this._shopOwner,
      y:          378,
      duration:   2200,
      ease:       'Sine.easeInOut',
      yoyo:       true,
      repeat:     -1,
      delay:      400
    });
  }

  // ════════════════════════════════════════════════════
  //  PLAYER
  // ════════════════════════════════════════════════════

  _buildPlayer() {
    if (!this.textures.exists('san')) {
      const g = this.make.graphics({ x:0, y:0, add:false });
      const s = 4; // Pixel scale
      
      g.clear();

      // ── 1. HAIR (Dark, textured) ──
      g.fillStyle(0x1a1a22);
      g.fillRect(1*s, 0,     4*s, 2*s); // Top crown
      g.fillRect(0,   1*s,   1*s, 3*s); // Hair L
      g.fillRect(5*s, 1*s,   1*s, 2*s); // Hair R
      g.fillStyle(0x2d2d3a);            // Highlight
      g.fillRect(2*s, 0,     2*s, 1*s);

      // ── 2. FACE & SKIN (Tired, matching dialogue portrait) ──
      g.fillStyle(0xc8956a);
      g.fillRect(1*s, 2*s,   4*s, 4*s); // Face
      // Eyes
      g.fillStyle(0x3a2c1e);
      g.fillRect(2*s, 3*s,   1*s, 1*s); // Eye L
      g.fillRect(4*s, 3*s,   1*s, 1*s); // Eye R
      // Nose & Mouth
      g.fillStyle(0xb07d56);
      g.fillRect(3*s, 4*s,   1*s, 1*s); // Nose
      g.fillStyle(0x9a6842);
      g.fillRect(2*s, 5*s,   2*s, 1*s); // Melancholic expression
      // Ears
      g.fillStyle(0xb07d56);
      g.fillRect(0,   3*s,   1*s, 2*s); // Ear L
      g.fillRect(5*s, 3*s,   1*s, 2*s); // Ear R

      // ── 3. NECK & INNER GOWN COLLAR ──
      g.fillStyle(0xb07d56);
      g.fillRect(2*s, 6*s,   2*s, 1*s); // Neck
      g.fillStyle(0xdbe3e8);
      g.fillRect(2*s, 7*s,   2*s, 1*s); // White undershirt collar

      // ── 4. HOSPITAL GOWN / JACKET (Muted blue-grey) ──
      g.fillStyle(0x8aa4b8);
      g.fillRect(0,   7*s,   6*s, 5*s); // Torso
      g.fillStyle(0x6e8a9e);            // Shading
      g.fillRect(0,   7*s,   1*s, 5*s);
      g.fillRect(5*s, 7*s,   1*s, 5*s);
      g.fillStyle(0x2e3a47);            // V-neck fold
      g.fillRect(2*s, 8*s,   2*s, 3*s);

      // ── 5. WAISTLINE / BELT ──
      g.fillStyle(0x1a1c22);
      g.fillRect(0,   12*s,  6*s, 1*s); // Belt strap
      g.fillStyle(0xa08c50);
      g.fillRect(2*s, 12*s,  2*s, 1*s); // Belt buckle

      // ── 6. LEGS (Dark trousers) ──
      g.fillStyle(0x7090a8);
      g.fillRect(0,   13*s,  2*s, 3*s); // Leg L
      g.fillRect(4*s, 13*s,  2*s, 3*s); // Leg R
      g.fillStyle(0x56758c);            // Leg shading
      g.fillRect(0,   13*s,  1*s, 3*s);
      g.fillRect(4*s, 13*s,  1*s, 3*s);

      // ── 7. SHOES ──
      g.fillStyle(0x1a1a22);
      g.fillRect(0,   16*s,  2*s, 1*s); // Shoe L
      g.fillRect(4*s, 16*s,  2*s, 1*s); // Shoe R

      // Generate a 17-pixel high texture (17 * 4 = 68px tall)
      g.generateTexture('san', 6*s, 17*s); 
      g.destroy();
    }

    // Spawn just past hospital exit on the road/sidewalk
    this.player = this.physics.add.sprite(90, 390, 'san');
    this.player.body.setSize(20, 28);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Walls
    this._walls = this.physics.add.staticGroup();
    // (Rest of the static wall and collision logic continues as normal below this...)
    this._wall(0,    0,   2400,   8);   // top of world
    this._wall(0, 632, 2400, 8);   // bottom
    this._wall(0,    0,      8, 320);   // left edge
    this._wall(2392, 0,      8, 320);   // right edge
    // Building blocks (players walks on road only through here)
    this._wall(0, 0, 180, 320);   // hospital building
    this._wall(1040, 0, 180, 320);   // convenience store
    this._wall(1900, 0, 500, 320);   // apartment building

    this.physics.add.collider(this.player, this._walls);
  }

  _wall(x, y, w, h) {
    const wall = this._walls.create(x+w/2, y+h/2, null);
    wall.setVisible(false); wall.body.setSize(w, h); wall.refreshBody();
  }

  // ════════════════════════════════════════════════════
  //  CAMERA
  // ════════════════════════════════════════════════════

  _buildCamera() {
    this.cameras.main.setBounds(0, 0, 2400, 640);
    this.cameras.main.setZoom(1.5);
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
  //  INTERACTABLES
  // ════════════════════════════════════════════════════

  _buildInteractables() {
    this._hint = document.getElementById('interact-hint');
    this._interactables = [
      { x:582,  y:390, r:52, label:'vending machine',    fn: () => this._doVending()  },
      { x:1152, y:390, r:58, label:'convenience store',  fn: () => this._doStore()    },
      { x:2125, y:390, r:72, label:'apartment building', fn: () => this._doBuilding() }
    ];
  }

  _checkInteract() {
    this._interactables.forEach(obj => {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y) < obj.r) {
        obj.fn();
      }
    });
  }

  _updateHint() {
    const el = this._hint;
    if (!el) return;
    let label = '';
    this._interactables.forEach(obj => {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y) < obj.r+22) {
        label = '[E] ' + obj.label;
      }
    });
    el.textContent   = label;
    el.style.display = label ? 'block' : 'none';
  }

  _doVending() {
    if (this._doneVending) return;
    this._doneVending = true;
    triggerMemory([
      'Peach soda.',
      'Rain on the glass.',
      'She laughed at something.',
      '...the neon made her eyes glow.',
      "I can't remember the color."
    ]);
  }

  _doStore() {
    if (this._doneStore) return;
    this._doneStore = true;
    addDialogue('Clerk', 'Hey! its been so long! How are you doing?', null);
    addDialogue('Clerk', '...', null);
    addDialogue('Clerk', 'You look different.', null);
    addDialogue('San',   '...', null);
    runDialogue();
  }

  _doBuilding() {
    if (this._doneBuilding) return;
    this._doneBuilding = true;
    addDialogue('San', '...this building.', null);
    addDialogue('San', 'I know it.', null);
    addDialogue('San', "I've been here before.", null);
    runDialogue(() => {
      this.time.delayedCall(600, () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.time.delayedCall(860, () => this.scene.start('ApartmentInteriorScene'));
      });
    });
  }

  // ════════════════════════════════════════════════════
  //  FLOATING INNER THOUGHTS (x-threshold triggered)
  // ════════════════════════════════════════════════════

  _checkThoughts() {
    if (this._thoughtActive || dialogueActive()) return;
    for (const t of this._thoughts) {
      if (!t.done && this.player.x >= t.x) {
        t.done = true;
        this._spawnThought(t.text);
        break;
      }
    }
  }

  _spawnThought(text) {
    this._thoughtActive = true;
    const lbl = this.add.text(this.player.x, this.player.y - 32, text, {
      fontFamily: 'Courier New', fontSize: '7px', color: '#9aabb8', align: 'center'
    }).setOrigin(0.5, 1).setDepth(160).setAlpha(0);

    this.tweens.add({
      targets: lbl, alpha: { from: 0, to: 0.88 }, y: lbl.y - 18,
      duration: 680, ease: 'Sine.easeOut',
      onComplete: () => {
        this.time.delayedCall(1300, () => {
          this.tweens.add({
            targets: lbl, alpha: 0, y: lbl.y - 12, duration: 580, ease: 'Sine.easeIn',
            onComplete: () => { lbl.destroy(); this._thoughtActive = false; }
          });
        });
      }
    });
  }

  // ════════════════════════════════════════════════════
  //  UPDATE
  // ════════════════════════════════════════════════════

  update(_time, delta) {
    const dt = delta / 1000;

    this._updateRain(dt);
    if (Math.random() > 0.78) this._drawGrain();

    if (dialogueActive() || isPhoneOpen()) {
      this.player.setVelocity(0);
      return;
    }

    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.keys.a.isDown) vx = -this.speed;
    if (this.cursors.right.isDown || this.keys.d.isDown) vx =  this.speed;
    if (this.cursors.up.isDown    || this.keys.w.isDown) vy = -this.speed;
    if (this.cursors.down.isDown  || this.keys.s.isDown) vy =  this.speed;
    if (vx && vy) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) togglePhone();
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this._checkInteract();

    this._checkThoughts();
    this._updateHint();
  }
}