// ═══════════════════════════════════════════════════════
//  HospitalScene.js
//  Chapter One — White Ceiling
// ═══════════════════════════════════════════════════════

import {
  addDialogue,
  runDialogue,
  dialogueActive,
  clearDialogue
} from '../systems/DialogueSystem.js';

import {
  togglePhone,
  isPhoneOpen,
  closePhone,
  initPhone
} from '../systems/PhoneSystem.js';

import {
  triggerMemory
} from '../systems/MemorySystem.js';

import {
  narrate,
  narrateSequence
} from '../systems/NarratorSystem.js';

import {
  portraitSan,
  portraitDoctor,
  portraitNurse
} from '../systems/Portraits.js';

import { showChapterCard } from '../showChapterCard.js';

export default class HospitalScene extends Phaser.Scene {

  constructor() {
    super('HospitalScene');
  }

  create() {

    this.speed = 82;
    this.exitTriggered = false;

    this.createRoom();
    this.createWalls();
    this.createVignette();
    this.createPlayerTexture();
    this.createDoctorSprite();
    this.createNurseSprite();

    // EXIT sign text + arrow — world space, above door
    this.add.text(456, 308, '→ EXIT', {
      fontFamily: 'Courier New',
      fontSize:   '11px',
      color:      '#44ee66',
      stroke:     '#0a1a0a',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(20);

    this.player = this.physics.add.sprite(240, 140, 'san');
    this.player.body.setSize(20, 28);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    // Exit zone — right side wall door (x:440, y:340–420)
    this.exitZone = this.add.zone(448, 380, 18, 80);
    this.physics.world.enable(
      this.exitZone,
      Phaser.Physics.Arcade.STATIC_BODY
    );
    this.physics.add.overlap(
      this.player,
      this.exitZone,
      this.handleExit,
      null,
      this
    );

    // Camera fixed on intro area; startFollow deferred until after intro
    this.cameras.main.setZoom(1.8);
    this.cameras.main.centerOn(260, 210);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });

    this.interactables = [
      {
        x: 145, y: 155, radius: 50,
        action: () => {
          triggerMemory([
            'Wind chimes.',
            'Summer sunlight.',
            'Someone laughing.',
            '...her?'
          ]);
        }
      }
    ];

    // Exit hint — shown after intro, points right
    this.exitHint = this.add.text(430, 380, '► EXIT', {
      fontFamily: 'Courier New',
      fontSize: '9px',
      color: '#555555',
      align: 'right'
    });
    this.exitHint.setOrigin(1, 0.5);
    this.exitHint.setDepth(90);
    this.exitHint.setAlpha(0);

    this.interactHint = document.getElementById('interact-hint');

    initPhone();

    this.startIntro();

  }

  // ─── ROOM ─────────────────────────────────────────────

  createRoom() {

    const g = this.add.graphics();

    // Floor + walls
    g.fillStyle(0xc6c2bc); g.fillRect(0, 0, 480, 640);
    g.fillStyle(0xaaa59d); g.fillRect(0, 210, 480, 430);

    for (let x = 0; x < 480; x += 32) {
      g.lineStyle(1, 0x96918b, 0.25);
      g.lineBetween(x, 210, x, 640);
    }
    for (let y = 210; y < 640; y += 32) {
      g.lineStyle(1, 0x96918b, 0.25);
      g.lineBetween(0, y, 480, y);
    }

    // Window — left wall
    g.fillStyle(0x4e5f6d); g.fillRect(24, 24, 150, 160);
    g.fillStyle(0x74889a); g.fillRect(30, 30, 138, 148);
    g.fillStyle(0x5f7487); g.fillRect(36, 36, 60, 136);
    g.lineStyle(3, 0xbeb8b0);
    g.strokeRect(24, 24, 150, 160);
    g.lineBetween(99, 24, 99, 184);

    // Flower pot
    g.fillStyle(0x7a2a38); g.fillRect(136, 140, 24, 36);
    g.fillStyle(0x4c6d4d); g.fillRect(144, 104, 4, 40);
    g.fillStyle(0xdd6677); g.fillRect(138, 96, 16, 16);

    // Bed shadow + bed
    g.fillStyle(0x000000, 0.15); g.fillRect(118, 206, 248, 144);
    g.fillStyle(0x6f6d72); g.fillRect(120, 70, 240, 132);
    g.fillStyle(0xe7e2db); g.fillRect(126, 76, 228, 120);
    g.fillStyle(0xf3efea); g.fillRect(132, 82, 88, 38);
    g.fillStyle(0x6886a0); g.fillRect(126, 126, 228, 64);
    g.fillStyle(0x58789a); g.fillRect(126, 126, 228, 12);

    // Monitor
    g.fillStyle(0x282832); g.fillRect(372, 148, 82, 62);
    g.fillStyle(0x10203a); g.fillRect(376, 152, 74, 54);
    g.lineStyle(2, 0x20d878);
    g.beginPath();
    g.moveTo(380, 180); g.lineTo(388, 180); g.lineTo(392, 170);
    g.lineTo(396, 190); g.lineTo(402, 180); g.lineTo(412, 180);
    g.lineTo(418, 172); g.lineTo(422, 188); g.lineTo(430, 180);
    g.lineTo(446, 180);
    g.strokePath();

    // IV stand
    g.fillStyle(0x909090); g.fillRect(364, 64, 4, 144);
    g.fillStyle(0x808080); g.fillRect(354, 64, 24, 4);
    g.fillStyle(0xc8ddd0); g.fillRect(352, 68, 28, 40);

    // Cabinet
    g.fillStyle(0x15151d); g.fillRect(420, 280, 60, 170);
    g.fillStyle(0xb9aa90); g.fillRect(470, 340, 6, 8);
    g.fillStyle(0x626268); g.fillRect(360, 230, 56, 10);
    g.fillStyle(0x585860); g.fillRect(360, 210, 56, 6);
    g.fillStyle(0x585860); g.fillRect(364, 236, 6, 32);
    g.fillStyle(0x585860); g.fillRect(406, 236, 6, 32);

    // ── EXIT DOOR — right wall ──────────────────────────
    // Door frame
    g.fillStyle(0xb8b2aa);
    g.fillRect(438, 335, 42, 90);

    // Door surface
    g.fillStyle(0xcac4bc);
    g.fillRect(440, 337, 38, 86);

    // Door panel detail
    g.fillStyle(0xb4aea6);
    g.fillRect(443, 342, 14, 36);
    g.fillRect(443, 382, 14, 30);
    g.fillRect(460, 342, 14, 36);
    g.fillRect(460, 382, 14, 30);

    // Door handle
    g.fillStyle(0x888070);
    g.fillRect(440, 375, 6, 12);

    // Slight light leak from corridor beyond door
    g.fillStyle(0xd4cfc0, 0.15);
    g.beginPath();
    g.moveTo(478, 337);
    g.lineTo(478, 423);
    g.lineTo(440, 410);
    g.lineTo(440, 350);
    g.closePath();
    g.fillPath();

    // EXIT sign box above door
    g.fillStyle(0x0e2a0e);
    g.fillRect(432, 314, 48, 18);
    g.lineStyle(1, 0x22aa33, 0.9);
    g.strokeRect(432, 314, 48, 18);

  }

  createWalls() {

    this.walls = this.physics.add.staticGroup();

    const addWall = (x, y, w, h) => {
      const wall = this.walls.create(x + w / 2, y + h / 2, null);
      wall.setVisible(false);
      wall.body.setSize(w, h);
      wall.refreshBody();
    };

    // Top wall — solid (no exit here)
    addWall(0, 0, 480, 40);

    // Left wall
    addWall(0, 0, 40, 640);

    // Right wall — split around exit door (y:335–425)
    addWall(440, 0, 40, 335);
    addWall(440, 425, 40, 215);

    // Bottom wall
    addWall(0, 600, 480, 40);

    // Furniture colliders
    addWall(120, 70, 240, 132); // bed
    addWall(352, 68, 28, 140); // IV stand
    addWall(360, 210, 56, 60); // cabinet top
    addWall(420, 280, 60, 170); // cabinet body

  }

  createVignette() {

    const g = this.add.graphics();
    g.setDepth(100);
    for (let i = 0; i < 40; i++) {
      g.lineStyle(i * 2, 0x000000, i / 90);
      g.strokeRect(i, i, 480 - i * 2, 640 - i * 2);
    }

  }

  createPlayerTexture() {{if (!this.textures.exists('san')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const s = 4;
      
      g.clear();

      // ── 1. HAIR ──
      g.fillStyle(0x1a1a22);
      g.fillRect(1*s, 0,     4*s, 2*s); // Top crown
      g.fillRect(0,   1*s,   1*s, 3*s); // Hair L
      g.fillRect(5*s, 1*s,   1*s, 2*s); // Hair R
      g.fillStyle(0x2d2d3a);            // Highlight
      g.fillRect(2*s, 0,     2*s, 1*s);

      // ── 2. FACE & SKIN ──
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
      g.fillRect(2*s, 5*s,   2*s, 1*s); // Melancholic mouth
      // Ears
      g.fillStyle(0xb07d56);
      g.fillRect(0,   3*s,   1*s, 2*s); // Ear L
      g.fillRect(5*s, 3*s,   1*s, 2*s); // Ear R

      // ── 3. NECK & COLLAR ──
      g.fillStyle(0xb07d56);
      g.fillRect(2*s, 6*s,   2*s, 1*s); // Neck
      g.fillStyle(0xdbe3e8);
      g.fillRect(2*s, 7*s,   2*s, 1*s); // Inner shirt collar

      // ── 4. JACKET / GOWN ──
      g.fillStyle(0x8aa4b8);
      g.fillRect(0,   7*s,   6*s, 5*s); // Torso
      g.fillStyle(0x6e8a9e);            // Shading
      g.fillRect(0,   7*s,   1*s, 5*s);
      g.fillRect(5*s, 7*s,   1*s, 5*s);
      g.fillStyle(0x2e3a47);            // Gown lapel
      g.fillRect(2*s, 8*s,   2*s, 3*s);

      // ── 5. WAISTLINE / BELT ──
      g.fillStyle(0x1a1c22);
      g.fillRect(0,   12*s,  6*s, 1*s); // Belt
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

      g.generateTexture('san', 6*s, 17*s);
      g.destroy();
    }
  }}
  

  createDoctorSprite() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 4; // Pixel scale matching San and the Tenant

    g.clear();

    // ── 1. GREYING HAIR (Distinguished, professional) ──
    g.fillStyle(0x787c85); // Salt-and-pepper base
    g.fillRect(1 * s, 0, 4 * s, 2 * s); // Crown
    g.fillRect(0, 1 * s, 1 * s, 3 * s); // Left sideburn
    g.fillRect(5 * s, 1 * s, 1 * s, 3 * s); // Right sideburn
    g.fillStyle(0xa9adb5);            // Silver-grey hair highlights
    g.fillRect(1 * s, 0, 1 * s, 1 * s);
    g.fillRect(4 * s, 0, 1 * s, 1 * s);

    // ── 2. FACE & SKIN (Warm tone, matching Portraits.js) ──
    g.fillStyle(0xc8a882);
    g.fillRect(1 * s, 2 * s, 4 * s, 4 * s); // Main face
    // Eyes
    g.fillStyle(0x2c1810);
    g.fillRect(2 * s, 3 * s, 1 * s, 1 * s); // Eye L
    g.fillRect(4 * s, 3 * s, 1 * s, 1 * s); // Eye R
    // Glasses Bridge / Nose
    g.fillStyle(0x888880);
    g.fillRect(3 * s, 3 * s, 1 * s, 1 * s); // Frame bridge
    g.fillStyle(0xb59069);
    g.fillRect(3 * s, 4 * s, 1 * s, 1 * s); // Nose shadow
    // Expression (Calm mouth)
    g.fillStyle(0x947253);
    g.fillRect(2 * s, 5 * s, 2 * s, 1 * s);

    // ── 3. NECK & MEDICAL TIE ──
    g.fillStyle(0xc8a882);
    g.fillRect(2 * s, 6 * s, 2 * s, 1 * s); // Neck
    g.fillStyle(0x2d3748);            // Dark blue clinical tie
    g.fillRect(2 * s, 7 * s, 2 * s, 1 * s);

    // ── 4. DOCTOR'S WHITE COAT (Light clean grey/white layers) ──
    g.fillStyle(0xeef0f2);            // Clean white/light grey lab coat
    g.fillRect(0, 7 * s, 6 * s, 6 * s); // Outer coat body
    g.fillStyle(0xcfd2d6);            // Shading of coat lapels & edges
    g.fillRect(0, 7 * s, 1 * s, 6 * s); // Left border
    g.fillRect(5 * s, 7 * s, 1 * s, 6 * s); // Right border
    // Inner shirt (showing behind the lab coat collar)
    g.fillStyle(0xd1e0ec);            // Muted light blue medical shirt
    g.fillRect(2 * s, 8 * s, 2 * s, 1 * s);

    // ── 5. TROUSERS (Dark clinical scrubs) ──
    g.fillStyle(0x323c4a);
    g.fillRect(0, 13 * s, 2 * s, 3 * s); // Pant Leg L
    g.fillRect(4 * s, 13 * s, 2 * s, 3 * s); // Pant Leg R
    g.fillStyle(0x212832);            // Inner shadow
    g.fillRect(0, 13 * s, 1 * s, 3 * s);
    g.fillRect(4 * s, 13 * s, 1 * s, 3 * s);

    // ── 6. SHOES ──
    g.fillStyle(0x1a1a22);
    g.fillRect(0, 16 * s, 2 * s, 1 * s); // Left formal shoe
    g.fillRect(4 * s, 16 * s, 2 * s, 1 * s); // Right formal shoe

    // Create a 17-pixel high texture (17 * 4 = 68px tall) to perfectly scale with San
    g.generateTexture('doctor', 6 * s, 17 * s);
    g.destroy();

    this.doctor = this.add.sprite(520, 240, 'doctor');
  }

  createNurseSprite() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 4; // Scale matching San and Doctor
    
    g.clear();

    // ── 1. NURSE CAP (White with a small red cross) ──
    g.fillStyle(0xffffff);
    g.fillRect(1*s, 0,     4*s, 1*s); // Cap base
    g.fillStyle(0xb02020);
    g.fillRect(3*s, 0,     1*s, 1*s); // Red emblem pixel

    // ── 2. HAIR (Dark brown, matching Portraits.js) ──
    g.fillStyle(0x2c1810);
    g.fillRect(1*s, 1*s,   4*s, 1*s); // Fringe / crown hair
    g.fillRect(0,   2*s,   1*s, 4*s); // Left framing hair
    g.fillRect(5*s, 2*s,   1*s, 4*s); // Right framing hair

    // ── 3. FACE & SKIN (Warm skin tone, matching Portraits.js) ──
    g.fillStyle(0xd4a07a);
    g.fillRect(1*s, 2*s,   4*s, 4*s); // Main face
    // Eyes
    g.fillStyle(0x111111);
    g.fillRect(2*s, 3*s,   1*s, 1*s); // Eye L
    g.fillRect(4*s, 3*s,   1*s, 1*s); // Eye R
    // Blushing cheeks
    g.fillStyle(0xe29c9c);
    g.fillRect(1*s, 4*s,   1*s, 1*s); // Cheek L
    g.fillRect(4*s, 4*s,   1*s, 1*s); // Cheek R
    // Nose and smiling mouth
    g.fillStyle(0xb08060);
    g.fillRect(3*s, 4*s,   1*s, 1*s); // Nose
    g.fillStyle(0xa04040);
    g.fillRect(2*s, 5*s,   2*s, 1*s); // Warm smile

    // ── 4. NECK & COLLAR CUTOUT ──
    g.fillStyle(0xd4a07a);
    g.fillRect(2*s, 6*s,   2*s, 1*s); // Neck
    g.fillStyle(0xd4a07a);
    g.fillRect(2*s, 7*s,   2*s, 1*s); // Teal scrub V-neck inner skin

    // ── 5. TEAL SCRUBS (Torso, matching Portraits.js) ──
    g.fillStyle(0x2a7a7a);            // Hospital teal scrubs
    g.fillRect(0,   7*s,   6*s, 6*s); // Main scrub top
    g.fillStyle(0x1d5757);            // Left shadow / sleeve border
    g.fillRect(0,   7*s,   1*s, 6*s);
    g.fillStyle(0x1d5757);            // Right shadow / sleeve border
    g.fillRect(5*s, 7*s,   1*s, 6*s);
    // Hospital ID Badge on chest
    g.fillStyle(0xffffff);
    g.fillRect(1*s, 8*s,   1*s, 1*s); // ID card
    g.fillStyle(0xb02020);
    g.fillRect(1*s, 9*s,   1*s, 1*s); // Lanyard clip

    // ── 6. SCRUB PANTS (Legs) ──
    g.fillStyle(0x2a7a7a);
    g.fillRect(0,   13*s,  2*s, 3*s); // Leg L
    g.fillRect(4*s, 13*s,  2*s, 3*s); // Leg R
    g.fillStyle(0x1d5757);            // Leg shading
    g.fillRect(0,   13*s,  1*s, 3*s);
    g.fillRect(4*s, 13*s,  1*s, 3*s);

    // ── 7. SHOES (White medical clogs) ──
    g.fillStyle(0xeef0f2);
    g.fillRect(0,   16*s,  2*s, 1*s); // Left shoe
    g.fillRect(4*s, 16*s,  2*s, 1*s); // Right shoe

    // Creates the texture at a 17-pixel scale (17 * 4 = 68px tall)
    g.generateTexture('nurse', 6*s, 17*s);
    g.destroy();

    this.nurse = this.add.sprite(520, 320, 'nurse');
    this.nurse.setDepth(10);
  }
  // ─── INTRO ────────────────────────────────────────────

  startIntro() {

    this.player.setPosition(240, 140);

    narrateSequence(
      [
        { text: 'White ceiling.', holdMs: 1600 },
        { text: 'Fluorescent light.', holdMs: 1400 },
        { text: 'The smell of antiseptic.', holdMs: 1600 },
        { text: 'How long.', holdMs: 2000 }
      ],
      () => {
        this.tweens.add({
          targets: this.doctor,
          x: 300,
          duration: 1800,
          ease: 'Sine.easeOut',
          onComplete: () => { this.introDialogue(); }
        });
      }
    );

  }

  introDialogue() {

    addDialogue('Dr. Mehta', 'Mr. San. Can you hear me?', portraitDoctor);
    addDialogue('Dr. Mehta', 'You have been unconscious for nearly a year.', portraitDoctor);
    addDialogue('San', '...', portraitSan);
    addDialogue('San', 'My phone.', portraitSan);

    runDialogue(() => { this.nurseEntrance(); });

  }

  nurseEntrance() {

    this.tweens.add({
      targets: this.nurse,
      x: 340,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        addDialogue('Nurse', 'We kept it charged.', portraitNurse);
        addDialogue('Nurse', 'There was only one unread message.', portraitNurse);
        runDialogue(() => { this.doctorExit(); });
      }
    });

  }

  doctorExit() {

    this.tweens.add({
      targets: this.doctor,
      x: 560,
      duration: 1800,
      ease: 'Sine.easeInOut',
      onComplete: () => {

        // Camera now follows the player
        this.cameras.main.startFollow(this.player, true, 0.06, 0.06);

        // Show exit hint
        this.tweens.add({
          targets: this.exitHint,
          alpha: 0.7,
          duration: 1200,
          ease: 'Sine.easeIn'
        });

        document.getElementById('hud').classList.remove('hidden');

      }
    });

  }

  // ─── EXIT ─────────────────────────────────────────────

  handleExit() {

    if (this.exitTriggered) return;
    this.exitTriggered = true;

    this.player.setVelocity(0);
    clearDialogue();
    closePhone();

    // Narration bridges the walk from ward → lobby → outside
    narrateSequence(
      [
        { text: 'The corridor was quiet.', holdMs: 1600 },
        { text: 'Someone held the door for him.', holdMs: 1600 },
        { text: 'The automatic doors opened.', holdMs: 1400 },
        { text: 'Cold air.', holdMs: 1200 },
        { text: 'Rain.', holdMs: 1800 }
      ],
      () => {
        this.cameras.main.fade(900, 0, 0, 0, false, (cam, progress) => {
          if (progress === 1) {
            showChapterCard('Chapter Two', 'Static City', () => {
              this.scene.start('StreetScene');
            });
          }
        });
      }
    );

  }

  // ─── UPDATE ───────────────────────────────────────────

  update() {

    if (dialogueActive() || isPhoneOpen()) {
      this.player.setVelocity(0);
      return;
    }

    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.keys.a.isDown) vx = -this.speed;
    if (this.cursors.right.isDown || this.keys.d.isDown) vx = this.speed;
    if (this.cursors.up.isDown || this.keys.w.isDown) vy = -this.speed;
    if (this.cursors.down.isDown || this.keys.s.isDown) vy = this.speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) togglePhone();
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.checkInteraction();

    this.updateInteractHint();

  }

  updateInteractHint() {

    let near = false;

    this.interactables.forEach(obj => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, obj.x, obj.y
      );
      if (dist < obj.radius + 20) near = true;
    });

    if (this.interactHint) {
      this.interactHint.textContent = near ? '[E] EXAMINE' : '';
      this.interactHint.style.display = near ? 'block' : 'none';
    }

  }

  checkInteraction() {

    this.interactables.forEach(obj => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, obj.x, obj.y
      );
      if (dist < obj.radius) obj.action();
    });

  }

}