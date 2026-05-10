// ═══════════════════════════════════════════════════════
//  AccidentSiteScene.js  —  Chapter Five: The Corner
//
//  World: 480 × 640, single screen
//  A street corner. Flowers. Candles. A note.
//  San was the one driving.
//  // BGM: soft piano, single note pattern
// ═══════════════════════════════════════════════════════

import { addDialogue, runDialogue, dialogueActive, clearDialogue } from '../systems/DialogueSystem.js';
import { narrate, narrateSequence }                                 from '../systems/NarratorSystem.js';
import { togglePhone, isPhoneOpen, closePhone, setChapter }        from '../systems/PhoneSystem.js';
import { showChapterCard }                                          from '../showChapterCard.js';

const W  = 480;
const H  = 640;
const GY = 450;  // ground level

export default class AccidentSiteScene extends Phaser.Scene {

  constructor() { super('AccidentSiteScene'); }

  // ══════════════════════════════════════════════════
  //  CREATE
  // ══════════════════════════════════════════════════

  create() {

    this.speed         = 62;
    this._noteExamined = false;
    this._phoneWasOpen = false;
    this._waitingForPhoneClose = false;
    this._dialogueDone = false;
    this._endStarted   = false;

    this.physics.world.setBounds(0, 0, W, H);

    this._buildWorld();
    this._buildPlayer();
    this._buildCamera();
    this._buildInput();
    this._buildAtmosphere();

    this._hint = document.getElementById('interact-hint');

    // Fade in
    this.cameras.main.fadeIn(1200, 0, 0, 0);

    // Opening narration sequence
    this.time.delayedCall(1400, () => {
      narrateSequence([
        { text: 'This corner.',    holdMs: 1800 },
        { text: 'December 14th.', holdMs: 1800 },
        { text: '11:58 PM.',      holdMs: 2200 },
      ], null);
    });
  }

  // ══════════════════════════════════════════════════
  //  WORLD
  // ══════════════════════════════════════════════════

  _buildWorld() {
    const g = this.add.graphics().setDepth(0);

    // Night sky — near black
    g.fillStyle(0x060608); g.fillRect(0, 0, W, H);

    // Far background buildings — very dark silhouettes
    [[0x0a0a0e, 30, 60, 90, 320],[0x080810, 140, 80, 100, 300],[0x0a0a10, 260, 50, 140, 340],[0x090910, 380, 70, 80, 310]].forEach(([c, x, w, bh]) => {
      g.fillStyle(c); g.fillRect(x, H - GY - bh + 100, w, bh);
      // Window dots — tiny, dim
      for (let wy = H - GY - bh + 120; wy < H - GY + 80; wy += 20) {
        for (let wx = x + 8; wx < x + w - 8; wx += 16) {
          if (Math.random() > 0.6) {
            g.fillStyle(0x1a1a28, 0.4 + Math.random() * 0.3);
            g.fillRect(wx, wy, 4, 6);
          }
        }
      }
    });

    // Street — dark wet asphalt
    g.fillStyle(0x0c0c12); g.fillRect(0, GY - 40, W, H - GY + 40);

    // Wet pavement reflections — puddle patches
    [[60, GY + 10, 80, 20],[200, GY + 40, 60, 14],[320, GY + 5, 100, 18],[100, GY + 60, 40, 10]].forEach(([rx, ry, rw, rh]) => {
      g.fillStyle(0x10101c, 0.5); g.fillRect(rx, ry, rw, rh);
      g.fillStyle(0x12121e, 0.3); g.fillRect(rx + 4, ry + 2, rw - 8, rh - 4);
    });

    // Streetlight — the one warm light source
    const lightX = 340;
    // Pole
    g.fillStyle(0x1a1a22); g.fillRect(lightX - 2, GY - 200, 4, 200);
    // Arm
    g.fillStyle(0x1c1c24); g.fillRect(lightX - 30, GY - 198, 32, 4);
    // Lamp head
    g.fillStyle(0x28281e); g.fillRect(lightX - 38, GY - 204, 18, 10);
    g.fillStyle(0xe8e090, 0.9); g.fillRect(lightX - 36, GY - 202, 14, 6);
    // Light cone — warm yellow
    for (let c = 10; c >= 0; c--) {
      g.fillStyle(0xd4b840, c * 0.014);
      g.beginPath();
      g.moveTo(lightX - 36, GY - 196);
      g.lineTo(lightX - 22, GY - 196);
      g.lineTo(lightX + 80 + c * 12, GY + 20);
      g.lineTo(lightX - 140 - c * 12, GY + 20);
      g.closePath(); g.fillPath();
    }
    // Light pool on ground
    for (let c = 8; c >= 0; c--) {
      g.fillStyle(0xc8a830, c * 0.018);
      g.fillEllipse(lightX - 29, GY + 8, 180 + c * 20, 30 + c * 4);
    }

    // Wall — left side of screen, brick texture
    g.fillStyle(0x0e0c10); g.fillRect(0, 100, 120, GY - 100);

    // Wall texture — very faint brick pattern
    g.lineStyle(1, 0x121018, 0.6);
    for (let wy = 100; wy < GY; wy += 14) {
      const offset = (Math.floor((wy - 100) / 14) % 2) * 16;
      for (let wx = offset; wx < 120; wx += 32) {
        g.strokeRect(wx, wy, 30, 12);
      }
    }

    // Chalk / spray memorial markings on wall — very faint
    g.lineStyle(1, 0x3a3040, 0.35);
    // Heart outline
    g.beginPath();
    g.moveTo(28, GY - 80);
    g.lineTo(36, GY - 90); g.lineTo(44, GY - 80); g.lineTo(28, GY - 65); g.lineTo(28, GY - 80);
    g.stroke();
    // Cross mark
    g.lineBetween(14, GY - 50, 22, GY - 42);
    g.lineBetween(22, GY - 50, 14, GY - 42);
    // Date-like markings — small tally lines
    for (let ti = 0; ti < 4; ti++) {
      g.lineBetween(14 + ti * 5, GY - 30, 14 + ti * 5, GY - 22);
    }

    // Flowers against wall — wilted, pixel art
    this._buildFlowers(g);

    // Rain
    this._rain = [];
    for (let i = 0; i < 50; i++) this._rain.push(this._mkDrop(true));
    this._rainG = this.add.graphics().setDepth(155);

    // Candles — built as separate graphics for animation
    this._candleG = this.add.graphics().setDepth(10);
    this._candles = [
      { x: 24, y: GY - 12, alive: true,  phase: Math.random() * Math.PI * 2 },
      { x: 38, y: GY - 10, alive: true,  phase: Math.random() * Math.PI * 2 },
      { x: 52, y: GY - 14, alive: false, phase: 0 },
      { x: 64, y: GY - 11, alive: true,  phase: Math.random() * Math.PI * 2 },
    ];

    // Note — small white rectangle, interactable
    this._noteX = 72;
    this._noteY = GY - 24;
    const noteG = this.add.graphics().setDepth(12);
    noteG.fillStyle(0xe8e4dc); noteG.fillRect(this._noteX - 10, this._noteY - 8, 20, 14);
    noteG.fillStyle(0xd0ccc4); noteG.fillRect(this._noteX - 8, this._noteY - 6, 16, 10);
    // Tiny lines on note (text impression)
    noteG.lineStyle(1, 0xb0aca4, 0.5);
    [0, 3, 6].forEach(ly => noteG.lineBetween(this._noteX - 6, this._noteY - 4 + ly, this._noteX + 4, this._noteY - 4 + ly));

    // Physics walls
    const walls = this.physics.add.staticGroup();
    const aw = (x, y, w, h) => {
      const wall = walls.create(x + w/2, y + h/2, null);
      wall.setVisible(false); wall.body.setSize(w, h); wall.refreshBody();
    };
    aw(0,   0,  10,  H);
    aw(W-10,0,  10,  H);
    aw(0,   0,  W,   GY - 60);
    this._walls = walls;
  }

  _buildFlowers(g) {
    // Wilted flowers — pixel cluster against wall base
    const stems = [[18, GY - 10],[30, GY - 12],[44, GY - 8],[58, GY - 10],[72, GY - 12]];
    stems.forEach(([fx, fy]) => {
      // Stem
      g.lineStyle(1, 0x2a3818, 0.7);
      g.lineBetween(fx, fy, fx - 2 + Math.random() * 4, fy - 18 - Math.random() * 8);
      // Wilted head
      const headX = fx - 1 + Math.random() * 3;
      const headY = fy - 20 - Math.random() * 6;
      const colors = [0x6a2030, 0x582840, 0x4a3020, 0x5a4028, 0x603828];
      const c = colors[Math.floor(Math.random() * colors.length)];
      g.fillStyle(c, 0.6);
      g.fillCircle(headX, headY, 3 + Math.random() * 2);
      // Fallen petals
      for (let p = 0; p < 2; p++) {
        g.fillStyle(c, 0.3);
        g.fillCircle(fx + (Math.random() - 0.5) * 16, fy - 2 + Math.random() * 4, 1.5);
      }
    });
  }

  // ══════════════════════════════════════════════════
  //  PLAYER
  // ══════════════════════════════════════════════════

  _buildPlayer(){ if (!this.textures.exists('san')) {
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

    this.player = this.physics.add.sprite(80, GY - 27, 'san');
    this.player.body.setSize(18, 26);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
    this.physics.add.collider(this.player, this._walls);
  }

  // ══════════════════════════════════════════════════
  //  CAMERA + INPUT
  // ══════════════════════════════════════════════════

  _buildCamera() {
    this.cameras.main.setZoom(1.6);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
  }

  _buildInput() {
    this._cursors = this.input.keyboard.createCursorKeys();
    this._keys    = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
  }

  // ══════════════════════════════════════════════════
  //  ATMOSPHERE
  // ══════════════════════════════════════════════════

  _buildAtmosphere() {
    const vig = this.add.graphics().setScrollFactor(0).setDepth(165);
    for (let i = 0; i < 30; i++) {
      vig.lineStyle(i * 2.8, 0x000000, i / 65);
      vig.strokeRect(i, i, 480 - i*2, 640 - i*2);
    }
    this._grainG = this.add.graphics().setScrollFactor(0).setDepth(170);
    this._updateGrain();
  }

  _updateGrain() {
    this._grainG.clear();
    for (let n = 0; n < 40; n++) {
      this._grainG.fillStyle(0xffffff, Math.random() * 0.03);
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
      speed: 240 + Math.random() * 80,
      alpha: 0.06 + Math.random() * 0.08,
      len:   5 + Math.random() * 8
    };
  }

  _updateRain(delta) {
    const dt = delta / 1000;
    this._rainG.clear();
    this._rain.forEach(d => {
      d.y += d.speed * dt;
      d.x += d.speed * 0.15 * dt;
      if (d.y > 640) { d.y = -8; d.x = Math.random() * 480; }
      this._rainG.lineStyle(1, 0x7788aa, d.alpha);
      this._rainG.lineBetween(d.x, d.y, d.x + d.len * 0.15, d.y + d.len);
    });
  }

  _updateCandles(time) {
    this._candleG.clear();
    this._candles.forEach(c => {
      if (!c.alive) {
        // Burnt out — just a stub
        this._candleG.fillStyle(0x2a2018); this._candleG.fillRect(c.x - 2, c.y - 4, 4, 6);
        this._candleG.fillStyle(0x1a1410); this._candleG.fillRect(c.x - 1, c.y - 6, 2, 4);
        return;
      }
      // Candle body
      this._candleG.fillStyle(0xe8dcc8); this._candleG.fillRect(c.x - 2, c.y - 12, 4, 14);
      this._candleG.fillStyle(0xd0c4b0); this._candleG.fillRect(c.x + 1, c.y - 12, 1, 14);
      // Wick
      this._candleG.fillStyle(0x181410); this._candleG.fillRect(c.x - 0.5, c.y - 14, 1, 3);
      // Flame — flicker via sin
      const flicker = Math.sin(time * 0.004 + c.phase);
      const alpha   = 0.65 + flicker * 0.25;
      const fy      = c.y - 18 + flicker * 1.2;
      this._candleG.fillStyle(0xe8a030, alpha);
      this._candleG.fillEllipse(c.x, fy, 4, 6);
      this._candleG.fillStyle(0xfff0c0, alpha * 0.6);
      this._candleG.fillEllipse(c.x, fy + 1, 2, 3);
      // Small glow halo
      this._candleG.fillStyle(0xd09020, alpha * 0.08);
      this._candleG.fillCircle(c.x, fy, 10);
    });
  }

  // ══════════════════════════════════════════════════
  //  NOTE INTERACTION
  // ══════════════════════════════════════════════════

  _examineNote() {
    if (this._noteExamined) return;
    this._noteExamined = true;

    if (this._hint) this._hint.style.display = 'none';
    this.player.setVelocity(0);

    // Final phone unlock
    setChapter(5);

    // Auto-open phone
    this.time.delayedCall(400, () => {
      togglePhone();
      this._waitingForPhoneClose = true;
    });
  }

  _afterPhoneClosed() {
    if (this._dialogueDone) return;
    this._dialogueDone = true;

    // Final dialogue — San was driving
    addDialogue('San', 'She was waiting outside for me.');
    addDialogue('San', 'She came out to meet me.');
    addDialogue('San', 'She was right here.');
    addDialogue('San', '...');
    addDialogue('San', 'I was the one driving.');

    runDialogue(() => {
      narrate('...', 3000, () => {
        narrate('One year ago.', 3000, () => {
          this._doEnding();
        });
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  ENDING
  // ══════════════════════════════════════════════════

  _doEnding() {
    if (this._endStarted) return;
    this._endStarted = true;

    clearDialogue();
    closePhone();

    // Slow fade to black
    this.cameras.main.fade(2500, 0, 0, 0, false, (cam, progress) => {
      if (progress === 1) {
        this._showTagline();
      }
    });
  }

  _showTagline() {
    const gc = document.getElementById('gc');

    // Black backing
    const bg = document.createElement('div');
    bg.id = 'ending-bg';
    bg.style.cssText = `
      position:absolute; inset:0; background:#000;
      z-index:300; opacity:0; transition:opacity 1.2s ease;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:0;
    `;

    // Tagline text
    const tagline = document.createElement('div');
    tagline.style.cssText = `
      font-family:'Courier New',monospace;
      font-size:11px; letter-spacing:3px; color:#555;
      text-align:center;
    `;
    tagline.textContent = 'she was here · you are sure of it';
    bg.appendChild(tagline);

    gc.appendChild(bg);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { bg.style.opacity = '1'; });
    });

    // After 4 seconds — show diary button bottom-left
    setTimeout(() => { this._showDiaryButton(bg, gc); }, 4000);
  }

  _showDiaryButton(bg, gc) {
    const btn = document.createElement('button');
    btn.id = 'diary-btn';
    btn.style.cssText = `
      position:absolute;
      bottom:18px; left:18px;
      font-family:'Courier New',monospace;
      font-size:8px; color:#2a2a2a;
      letter-spacing:3px; text-transform:lowercase;
      border:1px solid #1a1a1a;
      padding:8px 14px;
      background:transparent; cursor:pointer;
      z-index:310;
      opacity:0; transition:opacity 0.8s ease, color 0.2s, border-color 0.2s;
    `;
    btn.textContent = '📖 journal';
    gc.appendChild(btn);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { btn.style.opacity = '1'; });
    });

    btn.onmouseover = () => { btn.style.color = '#b02020'; btn.style.borderColor = '#b02020'; };
    btn.onmouseout  = () => { btn.style.color = '#2a2a2a'; btn.style.borderColor = '#1a1a1a'; };
    btn.onclick     = () => { btn.remove(); this._openDiary(bg, gc); };
  }

  _openDiary(bg, gc) {
    const diary = document.createElement('div');
    diary.id = 'diary-overlay';
    diary.style.cssText = `
      position:absolute; inset:0;
      background:#000;
      z-index:400;
      opacity:0; transition:opacity 0.9s ease;
      overflow-y:auto;
      font-family:'Courier New',monospace;
    `;

    const POEM = `Saturday morning, the sun rose,
He picked up his phone, which lay beside;
The very person then he chose
Was her, to greet the first sunlight.

"Good morning," then a message was
Sent in a second, as she received.
"Good morning" from her side he saw,
And in his eyes, joy was conceived.

All the chores then he did,
Not for a second the thought left
Of her, whom he had a date with;
Daydreaming, he spent the day rest.

And so the sun lowered its shine,
As the day advanced to night.
He wore a shirt so fine,
With a smile nowhere to hide.

He bought a bouquet of flowers,
As the best gift he could find.
On the way, his heart hovered,
And so was his restless mind.

And so he drove to the place
Where they were to meet.
And so in the light she saw his face,
Where he waited, tapping his feet.

Both then went somewhere to dine,
They talked for an hour or so.
And left, emptying the glass of wine,
For a slow walk as the time flowed.

And so, as the night drowned,
He drove her to her house.
Dropping her off, both shared goodbyes,
And he returned from the lights and crowd.

The day following, he woke again,
And greeted her with a text.
But to his surprise, it wasn't the same,
As nothing came back.

Passed then a whole day,
And nothing from her side was seen.
Then again came night to stay;
Thought he, "Busy she must have been."

Then again passed another,
But nothing actually returned.
To him, it started to bother;
His face looked tensed and concerned.

With the passing of the third one,
He started making calls.
But again, he reached none,
So his patience started to fall.

With time, his heart was drenched with fear,
Weird thoughts grasped his mind.
His eyes turned red with tears;
He opened his device in no time.

No new message was there,
No new call was shared.
"Might she have left her phone somewhere?"
Mumbling, at the device he stared.

Passed another couple of hours,
No call, no reply he received.
For he cared so much for his lover,
Weighing so much, his heart grieved.

But then, as time passed,
Fainter his vision was getting.
With every second past,
He could hear the sound of beeping.

And finally, he sat next to the wall,
While slowly the lights dimmed.
Pressure he could feel in his chest,
And slowly his head leaned.

"Call the doctor!" is what he heard
At his back, with the beeping sound.
And he could see her, blurred,
And so, no longer he felt the ground.

From the door, the doctor entered,
As he started getting his senses back.
Lying on the bed next to the wall,
With a soft pillow under his neck.

Soon he realized it wasn't his home,
And soon the doctor arrived.
"Where am I?" he anxiously asked.
"In the hospital," the doctor replied.

He realized it was a long sleep,
And asked about the time.
Some seasons advanced and a year leaped;
The doctor added-in a day he would be fine.

But he remembered those hours
He spent waiting for her;
From buying the bouquet of flowers,
To how his vision had blurred.

From all the days they talked,
To the evening they spent;
He could remember the paths they walked,
And all the messages he had sent.

He asked the nurse for his device,
And so to him she brought.
Switching it on, he rubbed his eyes,
And opened her messages slot.

With swiping, his heart dropped,
As no new message had been sent.
With teary eyes, he finally saw:
*Last seen: 389 days ago.`;

    diary.innerHTML = `
      <div style="
        max-width:340px; margin:0 auto;
        padding:48px 24px 60px;
      ">
        <div style="
          font-size:8px; color:#b02020;
          letter-spacing:5px; text-transform:uppercase;
          text-align:center; margin-bottom:10px;
        ">San's Journal</div>

        <div style="
          width:40px; height:1px;
          background:#b02020; opacity:0.4;
          margin:0 auto 32px;
        "></div>

        <div style="
          font-family:'Courier New', monospace;
          font-size:10px; 
          font-weight:bold; 
          color:#ffffff;
          letter-spacing:4px; 
          text-transform:uppercase;
          text-align:center; 
          margin-bottom:32px;
        ">Last Seen</div>

        <div style="
          font-size:11px; color:#666;
          line-height:2.6; letter-spacing:0.5px;
          text-align:center; white-space:pre-line;
        ">${POEM}</div>

        <div style="
          width:40px; height:1px;
          background:#1a1a1a;
          margin:40px auto 20px;
        "></div>

        <div style="
          font-size:9px; color:#888; /* 1. Changed from #222 to #888 so it is readable */
          letter-spacing:3px; text-align:center;
          line-height:2.2; font-style:italic;
          margin-bottom:24px;       /* Added a gap before the backstory note */
        ">— Anshuk</div>

        <div style="
          font-size:9px; color:#555;
          line-height:1.8; letter-spacing:1px;
          text-align:center; max-width:280px; margin: 0 auto;
          border-top: 1px dashed #888;
          padding-top: 20px;
        ">
          Long ago, I wrote this poem, and decided to continue the story through this rough story game. SO Where did she go? I would love to know your thoughts. Thank you for playing.
        </div>

        <div style="margin-top:48px; text-align:center;">
          <button id="diary-close" style="
            font-family:'Courier New',monospace;
            font-size:8px; color:#222;
            letter-spacing:3px; text-transform:lowercase;
            border:1px solid #181818;
            padding:9px 24px; background:transparent;
            cursor:pointer;
            transition:color 0.2s, border-color 0.2s;
          ">close</button>
        </div>
    `;

    gc.appendChild(diary);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { diary.style.opacity = '1'; });
    });

    const closeBtn = document.getElementById('diary-close');
    closeBtn.onmouseover = () => { closeBtn.style.color = '#666'; closeBtn.style.borderColor = '#333'; };
    closeBtn.onmouseout  = () => { closeBtn.style.color = '#222';  closeBtn.style.borderColor = '#181818'; };
    closeBtn.onclick = () => {
      diary.style.opacity = '0';
      setTimeout(() => {
        diary.remove();
        // Freeze — game over
        bg.style.opacity = '1';
      }, 900);
    };
  }

  // ══════════════════════════════════════════════════
  //  UPDATE
  // ══════════════════════════════════════════════════

  update(time, delta) {

    if (Math.random() > 0.84) this._updateGrain();
    this._updateRain(delta);
    this._updateCandles(time);

    // Note proximity hint
    const nearNote = Math.abs(this.player.x - this._noteX) < 50 && !this._noteExamined;
    if (this._hint) {
      if (nearNote) {
        this._hint.textContent   = '[E] examine';
        this._hint.style.display = 'block';
      } else if (!this._noteExamined && !this._waitingForPhoneClose) {
        this._hint.style.display = 'none';
      }
    }

    // Wait for phone to be opened then closed
    if (this._waitingForPhoneClose) {
      if (isPhoneOpen()) {
        this._phoneWasOpen = true;
      } else if (this._phoneWasOpen) {
        this._waitingForPhoneClose = false;
        this._phoneWasOpen         = false;
        this.time.delayedCall(600, () => this._afterPhoneClosed());
      }
    }

    if (dialogueActive() || isPhoneOpen() || this._endStarted) {
      this.player.setVelocity(0);
      return;
    }

    // Note interaction
    if (nearNote && Phaser.Input.Keyboard.JustDown(this._keys.e)) {
      this._examineNote();
      return;
    }

    // Movement
    let vx = 0, vy = 0;
    if (this._cursors.left.isDown  || this._keys.a.isDown) vx = -this.speed;
    if (this._cursors.right.isDown || this._keys.d.isDown) vx =  this.speed;
    if (this._cursors.up.isDown    || this._keys.w.isDown) vy = -this.speed;
    if (this._cursors.down.isDown  || this._keys.s.isDown) vy =  this.speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.player.setVelocity(vx, vy);

    // Phone toggle
    if (Phaser.Input.Keyboard.JustDown(this._keys.p)) togglePhone();
  }
}
