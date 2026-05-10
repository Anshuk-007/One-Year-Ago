// ═══════════════════════════════════════════════════════
//  TrainStationScene.js  —  Chapter Four: Platform
//
//  World: 2400 × 640, horizontal scroll
//  San walks the platform. A train comes. He doesn't board.
//  setChapter(4) fires after the train leaves.
// ═══════════════════════════════════════════════════════

import { addDialogue, runDialogue, dialogueActive, clearDialogue } from '../systems/DialogueSystem.js';
import { narrate, narrateSequence }                                 from '../systems/NarratorSystem.js';
import { togglePhone, isPhoneOpen, closePhone, setChapter }        from '../systems/PhoneSystem.js';
import { showChapterCard }                                          from '../showChapterCard.js';

const W  = 2400;
const H  = 640;
const GY = 420;   // platform surface y

export default class TrainStationScene extends Phaser.Scene {

  constructor() { super('TrainStationScene'); }

  // ══════════════════════════════════════════════════
  //  CREATE
  // ══════════════════════════════════════════════════

  create() {

    this.speed           = 80;
    this._stopX          = 1200;   // San halts here, train triggers
    this._stopped        = false;
    this._trainTriggered = false;
    this._trainDone      = false;
    this._chapterSet     = false;
    this._phoneHinted    = false;
    this._phoneWasOpen   = false;
    this._waitingForPhone= false;
    this._exitDone       = false;
    this._thoughtActive  = false;

    this._thoughts = [
      { x:  400, text: 'This is where we took the train.',  done: false },
      { x:  700, text: 'She hated waiting.',                done: false },
      { x:  900, text: "She'd pace the platform like this.", done: false },
      { x: 1100, text: 'I was always late.',                done: false },
    ];

    this.physics.world.setBounds(0, 0, W, H);

    this._buildWorld();
    this._buildPeople();
    this._buildPlayer();
    this._buildCamera();
    this._buildInput();
    this._buildAtmosphere();

    this._hint = document.getElementById('interact-hint');

    this.cameras.main.fadeIn(900, 0, 0, 0);
  }

  // ══════════════════════════════════════════════════
  //  WORLD
  // ══════════════════════════════════════════════════

  _buildWorld() {
    const g = this.add.graphics().setDepth(0);

    // Sky / ceiling — dark station interior
    g.fillStyle(0x0a0a0e); g.fillRect(0, 0, W, H);

    // Ceiling band
    g.fillStyle(0x0e0e14); g.fillRect(0, 0, W, 180);

    // Ceiling support beams
    for (let bx = 0; bx < W; bx += 300) {
      g.fillStyle(0x121218); g.fillRect(bx, 0, 24, 180);
      g.fillStyle(0x0e0e16); g.fillRect(bx + 4, 0, 2, 180);
    }

    // Overhead light fixtures — yellow cones
    for (let lx = 80; lx < W; lx += 220) {
      g.fillStyle(0x2a2820); g.fillRect(lx - 18, 20, 36, 10);
      g.fillStyle(0xd4c890, 0.7); g.fillRect(lx - 14, 22, 28, 6);
      for (let c = 8; c >= 0; c--) {
        g.fillStyle(0xc8b850, c * 0.012);
        g.beginPath();
        g.moveTo(lx - 14, 30);
        g.lineTo(lx + 14, 30);
        g.lineTo(lx + 70 + c * 8, GY);
        g.lineTo(lx - 70 - c * 8, GY);
        g.closePath(); g.fillPath();
      }
    }

    // Back wall — tiled
    g.fillStyle(0x101018); g.fillRect(0, 180, W, GY - 180);
    g.lineStyle(1, 0x14141c, 0.5);
    for (let tx = 0; tx < W; tx += 48) g.lineBetween(tx, 180, tx, GY);
    for (let ty = 180; ty < GY; ty += 48) g.lineBetween(0, ty, W, ty);

    // Departure board
    this._buildDepartureBoard(g, 560, 192);

    // Platform surface
    g.fillStyle(0x161620); g.fillRect(0, GY, W, H - GY);

    // Platform edge — yellow safety line
    g.fillStyle(0xe8c840, 0.55); g.fillRect(0, GY, W, 4);

    // Platform floor tiles
    g.lineStyle(1, 0x1a1a28, 0.4);
    for (let tx = 0; tx < W; tx += 60) g.lineBetween(tx, GY, tx, H);
    for (let ty = GY; ty < H; ty += 60) g.lineBetween(0, ty, W, ty);

    // Track bed below platform edge
    g.fillStyle(0x060608); g.fillRect(0, GY - 30, W, 30);
    g.fillStyle(0x0e0c0a); g.fillRect(0, GY - 26, W, 4);  // rail 1
    g.fillRect(0, GY - 10, W, 4);                          // rail 2

    // Benches
    [280, 560, 840, 1400, 1780, 2100].forEach(bx => {
      g.fillStyle(0x1c1c28); g.fillRect(bx, GY + 20, 80, 12);
      g.fillStyle(0x14141e); g.fillRect(bx + 4, GY + 32, 8, 24);
      g.fillStyle(0x14141e); g.fillRect(bx + 68, GY + 32, 8, 24);
      g.fillStyle(0x1a1a24); g.fillRect(bx, GY + 12, 80, 8);
    });

    // Vending machines
    [420, 1020, 1650].forEach(vx => {
      g.fillStyle(0x141828); g.fillRect(vx, GY - 80, 36, 80);
      g.fillStyle(0x1c2038); g.fillRect(vx + 2, GY - 76, 32, 60);
      [[0x882222,0x224488],[0x226644,0x884422],[0x442288,0x886622]].forEach(([c1,c2], row) => {
        g.fillStyle(c1); g.fillRect(vx + 4, GY - 72 + row * 18, 13, 14);
        g.fillStyle(c2); g.fillRect(vx + 19, GY - 72 + row * 18, 13, 14);
      });
      g.fillStyle(0xb8a040, 0.5); g.fillRect(vx + 8, GY - 10, 20, 8);
      g.lineStyle(1, 0x1e2240); g.strokeRect(vx, GY - 80, 36, 80);
    });

    // Entrance / turnstiles — left section
    g.fillStyle(0x0e0e16); g.fillRect(0, GY - 100, 280, 100);
    [80, 160].forEach(tx => {
      g.fillStyle(0x222236); g.fillRect(tx - 4, GY - 90, 8, 90);
      g.fillStyle(0x282844); g.fillRect(tx - 16, GY - 70, 32, 4);
    });
    g.fillStyle(0x0c1030); g.fillRect(20, 185, 160, 32);
    g.fillStyle(0x2040b8, 0.6); g.fillRect(22, 187, 156, 28);

    // Tunnel mouth — right end
    g.fillStyle(0x060608); g.fillRect(1820, 0, W - 1820, GY);
    g.fillStyle(0x080a0c); g.fillRect(1820, 0, 20, GY);

    // Rain — visible through station roof gaps
    this._rain = [];
    for (let i = 0; i < 55; i++) this._rain.push(this._mkDrop(true));
    this._rainG = this.add.graphics().setDepth(160);

    // Physics walls
    const walls = this.physics.add.staticGroup();
    const aw = (x, y, w, h) => {
      const wall = walls.create(x + w/2, y + h/2, null);
      wall.setVisible(false); wall.body.setSize(w, h); wall.refreshBody();
    };
    aw(0,      0,  10,  H);
    aw(W - 10, 0,  10,  H);
    aw(0,      0,  W,   GY - 70);
    this._walls = walls;
  }

  _buildDepartureBoard(g, x, y) {
    g.fillStyle(0x080c18); g.fillRect(x, y, 240, 70);
    g.fillStyle(0x0c1020); g.fillRect(x + 2, y + 2, 236, 66);
    g.lineStyle(1, 0x1e2840); g.strokeRect(x, y, 240, 70);
    [[0x1a3060],[0x182848],[0x121e38]].forEach(([c], row) => {
      g.fillStyle(c); g.fillRect(x + 8, y + 8 + row * 20, 160, 12);
      g.fillStyle(0x102040); g.fillRect(x + 178, y + 8 + row * 20, 54, 12);
    });
    this._boardX = x; this._boardY = y;
  }

  // ══════════════════════════════════════════════════
  //  COMMUTER SILHOUETTES
  // ══════════════════════════════════════════════════

  _buildPeople() {
    if (!this.textures.exists('silhouette')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const s = 3;
      g.fillStyle(0x0e0e16);
      g.fillRect(2*s, 0,    4*s, 4*s);
      g.fillRect(1*s, 4*s,  6*s, 6*s);
      g.fillRect(1*s, 10*s, 2*s, 5*s);
      g.fillRect(5*s, 10*s, 2*s, 5*s);
      g.generateTexture('silhouette', 8*s, 15*s);
      g.destroy();
    }

    this._commuters = [];
    [620, 760, 880, 990].forEach(cx => {
      const c = this.add.sprite(cx, GY - 22, 'silhouette');
      c.setDepth(18);
      c.setAlpha(0.45 + Math.random() * 0.25);
      this._commuters.push(c);
    });
  }

  // ══════════════════════════════════════════════════
  //  PLAYER
  // ══════════════════════════════════════════════════

  _buildPlayer() {
    if (!this.textures.exists('san')) {
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
    this.player = this.physics.add.sprite(120, GY - 27, 'san');
    this.player.body.setSize(18, 26);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this._walls);
  }

  // ══════════════════════════════════════════════════
  //  CAMERA + INPUT
  // ══════════════════════════════════════════════════

  _buildCamera() {
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  _buildInput() {
    this._cursors = this.input.keyboard.createCursorKeys();
    this._keys    = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
  }

  // ══════════════════════════════════════════════════
  //  ATMOSPHERE
  // ══════════════════════════════════════════════════

  _buildAtmosphere() {
    const vig = this.add.graphics().setScrollFactor(0).setDepth(170);
    for (let i = 0; i < 28; i++) {
      vig.lineStyle(i * 2.5, 0x000000, i / 70);
      vig.strokeRect(i, i, 480 - i*2, 640 - i*2);
    }
    this._grainG = this.add.graphics().setScrollFactor(0).setDepth(175);
    this._updateGrain();
  }

  _updateGrain() {
    this._grainG.clear();
    for (let n = 0; n < 45; n++) {
      this._grainG.fillStyle(0xffffff, Math.random() * 0.035);
      this._grainG.fillRect(Math.random() * 480, Math.random() * 640, 1, 1);
    }
  }

  // ══════════════════════════════════════════════════
  //  RAIN
  // ══════════════════════════════════════════════════

  _mkDrop(randomY = false) {
    return {
      x:     Math.random() * 480,
      y:     randomY ? Math.random() * 640 : -8,
      speed: 260 + Math.random() * 100,
      alpha: 0.06 + Math.random() * 0.1,
      len:   5 + Math.random() * 9
    };
  }

  _updateRain(delta) {
    const dt = delta / 1000;
    this._rainG.clear();
    this._rain.forEach(d => {
      d.y += d.speed * dt;
      d.x += d.speed * 0.2 * dt;
      if (d.y > 640) { d.y = -8; d.x = Math.random() * 480; }
      this._rainG.lineStyle(1, 0x8899cc, d.alpha);
      this._rainG.lineBetween(d.x, d.y, d.x + d.len * 0.2, d.y + d.len);
    });
  }

  // ══════════════════════════════════════════════════
  //  TRAIN SEQUENCE
  // ══════════════════════════════════════════════════

  _triggerTrain() {
    if (this._trainTriggered) return;
    this._trainTriggered = true;
    this.player.setVelocity(0);

    // Short beat before train arrives
    this.time.delayedCall(600, () => this._runTrainArrival());
  }

  _runTrainArrival() {

    const trainG = this.add.graphics().setDepth(15);
    const glowG  = this.add.graphics().setDepth(14);

    const trainY = GY - 56;
    const trainW = 320;
    const trainH = 52;

    const drawTrain = (gfx, tx) => {
      gfx.clear();
      gfx.fillStyle(0x1a1c2c); gfx.fillRect(tx, trainY, trainW, trainH);
      gfx.fillStyle(0x202440); gfx.fillRect(tx, trainY + 14, trainW, 6);
      for (let wi = 0; wi < 6; wi++) {
        gfx.fillStyle(0x0e1828); gfx.fillRect(tx + 12 + wi * 50, trainY + 6, 32, 20);
        gfx.fillStyle(0xc8d8e0, 0.06); gfx.fillRect(tx + 12 + wi * 50, trainY + 6, 32, 6);
      }
      [70, 220].forEach(dx => {
        gfx.fillStyle(0x141624); gfx.fillRect(tx + dx, trainY, 36, trainH);
        gfx.fillStyle(0x1e2038); gfx.fillRect(tx + dx + 2, trainY + 2, 16, trainH - 4);
        gfx.fillStyle(0x1e2038); gfx.fillRect(tx + dx + 18, trainY + 2, 16, trainH - 4);
      });
      gfx.fillStyle(0x0c0c14); gfx.fillRect(tx, trainY + trainH, trainW, 6);
    };

    const stopX = 700;

    // Shake just before stop
    this.time.delayedCall(1200, () => this.cameras.main.shake(280, 0.006));

    this.tweens.add({
      targets:  { val: W + 80 },
      val:      stopX,
      duration: 1400,
      ease:     'Cubic.easeOut',
      onUpdate: (tween, target) => {
        drawTrain(trainG, target.val);
        glowG.clear();
        for (let gi = 6; gi >= 0; gi--) {
          glowG.fillStyle(0xe8e0c0, gi * 0.018);
          glowG.fillCircle(target.val - gi * 10, trainY + trainH / 2, 20 + gi * 14);
        }
      },
      onComplete: () => {
        glowG.clear();
        drawTrain(trainG, stopX);
        this.time.delayedCall(500, () => this._doorsOpen(trainG, glowG, stopX, trainY, trainW, trainH, drawTrain));
      }
    });
  }

  _doorsOpen(trainG, glowG, stopX, trainY, trainW, trainH, drawTrain) {
    // Commuters board
    this._commuters.forEach((c, i) => {
      this.time.delayedCall(i * 160, () => {
        this.tweens.add({
          targets:  c,
          x:        stopX + 88 + (i % 2) * 150,
          duration: 700,
          ease:     'Linear',
          onComplete: () => c.setVisible(false)
        });
      });
    });

    this.time.delayedCall(2000, () => this._doorsClose(trainG, glowG, stopX, trainY, trainW, trainH, drawTrain));
  }

  _doorsClose(trainG, glowG, stopX, trainY, trainW, trainH, drawTrain) {
    this.cameras.main.shake(100, 0.003);

    this.tweens.add({
      targets:  { val: stopX },
      val:      -trainW - 100,
      duration: 1100,
      ease:     'Cubic.easeIn',
      onUpdate: (tween, target) => {
        drawTrain(trainG, target.val);
      },
      onComplete: () => {
        trainG.destroy();
        glowG.destroy();
        this._trainDone = true;
        this._afterTrain();
      }
    });
  }

  _afterTrain() {
    // setChapter AFTER train leaves — per spec
    setChapter(4);
    this._chapterSet = true;

    narrate("He didn't get on.", 2400, () => {
      this.time.delayedCall(400, () => {
        if (this._hint) {
          this._hint.textContent   = '[P] check phone';
          this._hint.style.display = 'block';
        }
        this._waitingForPhone = true;
      });
    });
  }

  _afterPhoneClosed() {
    if (this._exitDone) return;
    if (this._hint) this._hint.style.display = 'none';

    narrate('One more place.', 2000, () => {
      this._doExit();
    });
  }

  // ══════════════════════════════════════════════════
  //  EXIT
  // ══════════════════════════════════════════════════

  _doExit() {
    if (this._exitDone) return;
    this._exitDone = true;

    clearDialogue();
    closePhone();

    this.cameras.main.fade(800, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        showChapterCard('Chapter Five', 'The Corner', () => {
          this.scene.start('AccidentSiteScene');
        });
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  UPDATE
  // ══════════════════════════════════════════════════

  update(time, delta) {

    if (Math.random() > 0.82) this._updateGrain();
    this._updateRain(delta);

    // Detect: phone was opened then closed after chapter unlock
    if (this._waitingForPhone) {
      if (isPhoneOpen()) {
        this._phoneWasOpen = true;
        if (this._hint) this._hint.style.display = 'none';
      } else if (this._phoneWasOpen) {
        this._waitingForPhone = false;
        this._phoneWasOpen    = false;
        this.time.delayedCall(500, () => this._afterPhoneClosed());
      }
    }

    if (dialogueActive() || isPhoneOpen()) {
      this.player.setVelocity(0);
      return;
    }

    // San halts at _stopX — train triggers
    if (!this._stopped && this.player.x >= this._stopX) {
      this._stopped = true;
      this.player.setVelocity(0);
      this._triggerTrain();
      return;
    }

    // Movement — blocked rightward once stopped until after phone
    let vx = 0, vy = 0;

    if (this._cursors.left.isDown  || this._keys.a.isDown) vx = -this.speed;
    if (!this._stopped || this._trainDone) {
      if (this._cursors.right.isDown || this._keys.d.isDown) vx = this.speed;
    }
    if (this._cursors.up.isDown    || this._keys.w.isDown) vy = -this.speed;
    if (this._cursors.down.isDown  || this._keys.s.isDown) vy =  this.speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.player.setVelocity(vx, vy);

    // Floating thoughts — fire while walking toward stop
    if (!this._stopped) {
      this._thoughts.forEach(t => {
        if (!t.done && this.player.x >= t.x && !this._thoughtActive) {
          t.done          = true;
          this._thoughtActive = true;
          narrate(t.text, 1600, () => { this._thoughtActive = false; });
        }
      });
    }

    // Phone toggle
    if (Phaser.Input.Keyboard.JustDown(this._keys.p)) togglePhone();
  }
}
