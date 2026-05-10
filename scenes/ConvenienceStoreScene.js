// ═══════════════════════════════════════════════════════
//  ConvenienceStoreScene.js  —  Chapter Three: 11:42 PM
//
//  San leaves the apartment building and finds himself
//  at the convenience store he and she used to visit.
//
//  World: 480 × 640 (single room, no scroll)
//  Sequence:
//    Fade in → clerk recognises San → San opens phone
//    → reads "maybe :)" (chapter 3 unlocked) → walks out
//    → fade → chapter card → scene.start('StreetScene')
//       (returns to street to continue to train station)
// ═══════════════════════════════════════════════════════

import { addDialogue, runDialogue, dialogueActive, clearDialogue } from '../systems/DialogueSystem.js';
import { togglePhone, isPhoneOpen, closePhone, setChapter }        from '../systems/PhoneSystem.js';
import { narrate, narrateSequence }                                 from '../systems/NarratorSystem.js';
import { showChapterCard }                                          from '../showChapterCard.js';

const GY = 430;   // ground y — feet level

export default class ConvenienceStoreScene extends Phaser.Scene {

  constructor() { super('ConvenienceStoreScene'); }

  // ══════════════════════════════════════════════════
  //  CREATE
  // ══════════════════════════════════════════════════

  create() {

    this.speed         = 72;
    this._talked       = false;
    this._phoneShown   = false;
    this._exitDone     = false;

    // Unlock chapter 3 phone messages
    setChapter(3);

    this.physics.world.setBounds(0, 0, 480, 640);

    this._drawRoom();
    this._drawClerk();
    this._buildAtmosphere();
    this._buildWalls();
    this._buildPlayer();
    this._buildCamera();
    this._buildInput();

    this._hint = document.getElementById('interact-hint');

    // Fade in then opening narration
    this.cameras.main.fadeIn(900, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      narrateSequence([
        { text: 'The same fluorescent light.',  holdMs: 1600 },
        { text: 'The same smell of instant noodles.', holdMs: 1600 },
        { text: 'Everything the same.',          holdMs: 2000 },
      ], null);
    });

  }

  // ══════════════════════════════════════════════════
  //  WORLD DRAWING
  // ══════════════════════════════════════════════════

  _drawRoom() {

    const g = this.add.graphics().setDepth(0);

    // Back wall — warm dirty white
    g.fillStyle(0x1c1a16); g.fillRect(0, 0, 480, 640);

    // Ceiling strip — fluorescent
    g.fillStyle(0x2a2820); g.fillRect(0, 0, 480, 60);

    // Fluorescent light fixtures
    [80, 240, 400].forEach(lx => {
      g.fillStyle(0x383430); g.fillRect(lx - 30, 10, 60, 10);
      g.fillStyle(0xd4d0c0, 0.55); g.fillRect(lx - 26, 12, 52, 6);
      // Light cone on floor
      for (let c = 5; c >= 0; c--) {
        g.fillStyle(0xc8c090, c * 0.016);
        g.beginPath();
        g.moveTo(lx - 26, 20); g.lineTo(lx + 26, 20);
        g.lineTo(lx + 60 + c * 10, GY); g.lineTo(lx - 60 - c * 10, GY);
        g.closePath(); g.fillPath();
      }
    });

    // Floor — worn linoleum
    g.fillStyle(0x181614); g.fillRect(0, GY, 480, 640 - GY);

    // Floor grid lines
    g.lineStyle(1, 0x222018, 0.4);
    for (let x = 0; x < 480; x += 40) g.lineBetween(x, GY, x, 640);
    for (let y = GY; y < 640; y += 40) g.lineBetween(0, y, 480, y);

    // Back wall shelf units — left side
    this._drawShelfUnit(g, 20,  60, 120, 360);
    this._drawShelfUnit(g, 160, 60, 120, 360);

    // Counter — right side where clerk stands
    g.fillStyle(0x1e1c18); g.fillRect(300, 220, 180, 210);
    g.fillStyle(0x28261e); g.fillRect(300, 220, 180, 12);   // counter top
    g.fillStyle(0x141210); g.fillRect(300, 232, 4, 198);    // left edge shadow

    // Cash register on counter
    g.fillStyle(0x1a1820); g.fillRect(370, 196, 48, 28);
    g.fillStyle(0x121018); g.fillRect(374, 200, 40, 20);
    g.fillStyle(0x20d878, 0.6);
    // Screen numbers
    g.fillRect(378, 204, 6, 4); g.fillRect(386, 204, 6, 4); g.fillRect(394, 204, 6, 4);

    // Counter front label / stripe
    g.fillStyle(0x2a2418); g.fillRect(300, GY - 10, 180, 10);

    // Window — left of door, looking out to rainy street
    g.fillStyle(0x0e1420); g.fillRect(20, 80, 100, 100);
    g.fillStyle(0x121a2c); g.fillRect(24, 84, 92, 92);
    // Rain streaks on window
    g.lineStyle(1, 0x1e2840, 0.6);
    for (let rx = 30; rx < 115; rx += 12) {
      g.lineBetween(rx, 86, rx + 4, 170);
    }
    g.lineStyle(2, 0x282420);
    g.strokeRect(20, 80, 100, 100);

    // Door — bottom right, player exits here
    g.fillStyle(0x0e1018); g.fillRect(400, 280, 60, GY - 280);
    g.fillStyle(0x121620); g.fillRect(402, 282, 56, GY - 284);
    g.lineStyle(1, 0x1e2230); g.strokeRect(400, 280, 60, GY - 280);
    // Door handle
    g.fillStyle(0x484440); g.fillRect(402, 360, 4, 14);
    // EXIT sign above door
    g.fillStyle(0x1a3018); g.fillRect(408, 266, 36, 12);
    g.fillStyle(0x22cc44, 0.5); g.fillRect(410, 268, 32, 8);

    // Hanging price tags / signs
    g.fillStyle(0x22201a); g.fillRect(160, 36, 40, 14);
    g.fillStyle(0xb02020, 0.5); g.fillRect(162, 38, 36, 10);

    // Small fridge unit — far right wall
    g.fillStyle(0x141824); g.fillRect(440, 80, 40, 200);
    g.fillStyle(0x1a2030); g.fillRect(442, 82, 36, 196);
    // Fridge contents (coloured blobs)
    const drinks = [0x882222, 0x224488, 0x226644, 0x884422, 0x442288];
    drinks.forEach((c, i) => {
      g.fillStyle(c); g.fillRect(444, 90 + i * 36, 32, 28);
      g.fillStyle(0xffffff, 0.06); g.fillRect(444, 90 + i * 36, 32, 6);
    });
    g.lineStyle(1, 0x222840); g.strokeRect(440, 80, 40, 200);

  }

  _drawShelfUnit(g, x, y, w, h) {
    g.fillStyle(0x201e18); g.fillRect(x, y, w, h);
    // Shelves
    [0, 1, 2, 3, 4].forEach(i => {
      const sy = y + 20 + i * 64;
      g.fillStyle(0x2a2820); g.fillRect(x + 2, sy, w - 4, 6);
      // Products on shelf — coloured blocks
      for (let px = x + 4; px < x + w - 8; px += 18) {
        const hue = (px * 37 + i * 53) % 6;
        const colors = [0x882222, 0x224488, 0x226644, 0x884422, 0x442288, 0x886622];
        g.fillStyle(colors[hue]); g.fillRect(px, sy - 22, 14, 22);
        g.fillStyle(0xffffff, 0.05); g.fillRect(px, sy - 22, 14, 5);
      }
    });
    g.lineStyle(1, 0x141210); g.strokeRect(x, y, w, h);
  }

  _drawClerk() {
    // Clerk sprite — standing behind counter
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 4;

    // Hair
    g.fillStyle(0x1c1008); g.fillRect(1*s, 0,    6*s, 2*s);
    g.fillRect(0,    1*s,  1*s, 3*s);
    g.fillRect(7*s,  1*s,  1*s, 3*s);
    // Face
    g.fillStyle(0xd4a878); g.fillRect(1*s, 2*s, 6*s, 5*s);
    // Eyes
    g.fillStyle(0xf0ece6); g.fillRect(2*s, 3*s, 2*s, 2*s);
    g.fillStyle(0xf0ece6); g.fillRect(5*s, 3*s, 2*s, 2*s);
    g.fillStyle(0x604838); g.fillRect(2*s, 3*s, 1*s, 1*s);
    g.fillStyle(0x604838); g.fillRect(5*s, 3*s, 1*s, 1*s);
    // Eye bags — tired
    g.fillStyle(0xb09070); g.fillRect(2*s, 5*s, 2*s, 1*s);
    g.fillStyle(0xb09070); g.fillRect(5*s, 5*s, 2*s, 1*s);
    // Nose
    g.fillStyle(0xbc8858); g.fillRect(3*s, 6*s, 2*s, 1*s);
    // Mouth — neutral
    g.fillStyle(0xa07858); g.fillRect(2*s, 8*s, 4*s, 1*s);
    // Ears
    g.fillStyle(0xc09868); g.fillRect(0,   3*s, 1*s, 3*s);
    g.fillStyle(0xc09868); g.fillRect(7*s, 3*s, 1*s, 3*s);
    // Neck
    g.fillStyle(0xc09868); g.fillRect(3*s, 7*s, 2*s, 2*s);
    // Uniform — navy
    g.fillStyle(0x1c2440); g.fillRect(0,   9*s, 8*s, 6*s);
    g.fillStyle(0xe8e4de); g.fillRect(3*s, 9*s, 2*s, 2*s); // collar

    g.generateTexture('clerk_store', 8*s, 15*s);
    g.destroy();

    this._clerk = this.add.sprite(360, GY - 58, 'clerk_store');
    this._clerk.setDepth(5);
  }

  // ══════════════════════════════════════════════════
  //  ATMOSPHERE
  // ══════════════════════════════════════════════════

  _buildAtmosphere() {

    // Vignette — camera fixed
    const vig = this.add.graphics().setScrollFactor(0).setDepth(180);
    for (let i = 0; i < 28; i++) {
      vig.lineStyle(i * 2.5, 0x000000, i / 75);
      vig.strokeRect(i, i, 480 - i * 2, 640 - i * 2);
    }

    // Grain
    this._grainG = this.add.graphics().setScrollFactor(0).setDepth(185);
    this._updateGrain();

  }

  _updateGrain() {
    this._grainG.clear();
    for (let n = 0; n < 50; n++) {
      this._grainG.fillStyle(0xffffff, Math.random() * 0.04);
      this._grainG.fillRect(Math.random() * 480, Math.random() * 640, 1, 1);
    }
  }

  // ══════════════════════════════════════════════════
  //  WALLS / PHYSICS
  // ══════════════════════════════════════════════════

  _buildWalls() {

    this._walls = this.physics.add.staticGroup();

    const aw = (x, y, w, h) => {
      const wall = this._walls.create(x + w/2, y + h/2, null);
      wall.setVisible(false); wall.body.setSize(w, h); wall.refreshBody();
    };

    // World boundary
    aw(0,    0,   10,  640);   // left wall
    aw(470,  0,   10,  640);   // right wall

    // Floor — San walks on this, full width
    aw(0,  GY,  480,  10);

    // Back wall — stops San walking into the shelves/back area
    // Sits 60px above floor so San has room to move along the front of store
    aw(0,    0,  480,  GY - 60);

    // Counter front face — San cannot walk behind counter (right side)
    // Counter visual is at x:300, but we let San walk up to x:295
    aw(295, GY - 60, 10, 60);  // counter left edge stops San here

    // Right boundary before door — door gap is x:400–460
    aw(460, 0,  20, 640);      // right of door frame

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

    // Spawn at left side of store
    this.player = this.physics.add.sprite(80, GY - 27, 'san');
    this.player.body.setSize(18, 26);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this._walls);

    // Exit zone — door at right
    this._exitZone = this.add.zone(430, GY - 14, 60, 28);
    this.physics.world.enable(this._exitZone, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.overlap(this.player, this._exitZone, () => this._handleExit(), null, this);

    // Clerk talk zone
    this._clerkZone = this.add.zone(310, GY - 14, 100, 28);
    this.physics.world.enable(this._clerkZone, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.overlap(this.player, this._clerkZone, () => this._doClerkTalk(), null, this);

  }

  // ══════════════════════════════════════════════════
  //  CAMERA + INPUT
  // ══════════════════════════════════════════════════

  _buildCamera() {
    this.cameras.main.setZoom(1.4);
    this.cameras.main.setBounds(0, 0, 480, 640);
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
  //  CLERK DIALOGUE
  // ══════════════════════════════════════════════════

  _doClerkTalk() {
    if (this._talked) return;
    this._talked = true;

    this.player.setVelocity(0);

    addDialogue('Clerk', 'You used to come here late at night.');
    addDialogue('Clerk', 'With her.');
    addDialogue('San',   '...');
    addDialogue('Clerk', 'I remember because she always bought two of the same thing.');
    addDialogue('Clerk', 'Said you could never decide for yourself.');
    addDialogue('San',   '...');
    addDialogue('San',   'Yeah.');

    runDialogue(() => {
      // After clerk talk — show phone prompt
      this.time.delayedCall(600, () => {
        this._showPhonePrompt();
      });
    });
  }

  _showPhonePrompt() {
    if (this._phoneShown) return;
    this._phoneShown = true;

    narrate('He opened the phone.', 1400, () => {
      // Open phone so player sees unlocked chapter 3 messages
      const ui = document.getElementById('phone-ui');

      // Manually build the chat window via PhoneSystem toggle
      import('../systems/PhoneSystem.js').then(({ togglePhone }) => {
        togglePhone(); // open

        // After player has seen it — auto close after 4 seconds and continue
        this.time.delayedCall(4000, () => {
          togglePhone(); // close
          this.time.delayedCall(400, () => {
            addDialogue('San', '"maybe :)"');
            addDialogue('San', '...');
            addDialogue('San', 'She was waiting outside.');
            runDialogue(() => {
              this._readyToExit = true;
              if (this._hint) {
                this._hint.textContent   = '→ leave';
                this._hint.style.display = 'block';
              }
            });
          });
        });
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  EXIT
  // ══════════════════════════════════════════════════

  _handleExit() {
    if (this._exitDone) return;
    if (!this._readyToExit) return;
    this._exitDone = true;

    this.player.setVelocity(0);
    clearDialogue();
    closePhone();

    if (this._hint) this._hint.style.display = 'none';

    this.cameras.main.fade(800, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        showChapterCard('Chapter Four', 'Platform', () => {
          this.scene.start('TrainStationScene');
        });
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  UPDATE
  // ══════════════════════════════════════════════════

  update(time, delta) {

    if (Math.random() > 0.8) this._updateGrain();

    if (dialogueActive() || isPhoneOpen()) {
      this.player.setVelocity(0);
      return;
    }

    let vx = 0, vy = 0;

    if (this._cursors.left.isDown  || this._keys.a.isDown) vx = -this.speed;
    if (this._cursors.right.isDown || this._keys.d.isDown) vx =  this.speed;
    if (this._cursors.up.isDown    || this._keys.w.isDown) vy = -this.speed;
    if (this._cursors.down.isDown  || this._keys.s.isDown) vy =  this.speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this._keys.p)) togglePhone();

  }
}
