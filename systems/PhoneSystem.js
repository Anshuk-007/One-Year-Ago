// ═══════════════════════════════════════════════════════
//  PhoneSystem.js
//  The phone is a key emotional object.
//
//  The last unread message is: "see ya :)"
//  This line must NEVER change. Per direction doc:
//    "Initially casual, ordinary, harmless.
//     At ending: devastating in retrospect.
//     The emotional impact comes from how normal it was."
//
//  Phone unlocks more content as the story progresses.
//  Chapters 1–2: only the final message visible.
//  Chapters 3+:  blurred photos, old texts, fragments.
// ═══════════════════════════════════════════════════════

let phoneOpen = false;
let currentChapter = 1;

// ── MESSAGE DATA ────────────────────────────────────────
// All timestamps are Dec 14 — the night of the accident.
// Earlier messages are revealed as story progresses.

const MESSAGE_LAYERS = {

  // Available from Chapter 1 — the only unread message
  1: [
    {
      wrap: 'received',
      text: 'see ya :)',
      time: '11:42 PM',
      final: true     // gets special styling
    }
  ],

  // Unlocked Chapter 2 — first hint something was planned that night
  2: [
    {
      wrap: 'received',
      text: 'you ok?',
      time: '10:44 PM',
      final: false
    }
  ],

  // Unlocked Chapter 3 — older messages before it
  3: [
    {
      wrap: 'sent',
      text: 'almost there. 10 mins.',
      time: '10:58 PM',
      final: false
    },
    {
      wrap: 'received',
      text: 'ok ok take ur time',
      time: '11:01 PM',
      final: false
    },
    {
      wrap: 'sent',
      text: 'you already waiting outside?',
      time: '11:08 PM',
      final: false
    },
    {
      wrap: 'received',
      text: 'maybe :)',
      time: '11:09 PM',
      final: false
    }
  ],

  // Unlocked Chapter 4 — he was on his way to pick her up
  4: [
    {
      wrap: 'sent',
      text: 'on my way.',
      time: '11:32 PM',
      final: false
    },
    {
      wrap: 'received',
      text: 'hurry up lol',
      time: '11:33 PM',
      final: false
    }
  ],

  // Unlocked Chapter 5 — the very last exchange before getting in the car
  5: [
    {
      wrap: 'sent',
      text: 'tonight was really good',
      time: '11:38 PM',
      final: false
    },
    {
      wrap: 'received',
      text: 'yeah.',
      time: '11:39 PM',
      final: false
    },
    {
      wrap: 'received',
      text: 'you always take forever to say things like that lol',
      time: '11:40 PM',
      final: false
    },
    {
      wrap: 'sent',
      text: 'i know. sorry.',
      time: '11:41 PM',
      final: false
    }
    // followed by: "see ya :)" — always last
  ]
};

// ── PUBLIC API ──────────────────────────────────────────

/**
 * Toggle phone open/closed.
 */
export function togglePhone() {
  phoneOpen = !phoneOpen;
  const ui = document.getElementById('phone-ui');
  if (phoneOpen) {
    _clearBadge();
    buildChatWindow();
    ui.classList.remove('hidden');
  } else {
    ui.classList.add('hidden');
  }
}

/**
 * Returns true if the phone screen is currently open.
 */
export function isPhoneOpen() {
  return phoneOpen;
}

/**
 * Update which chapter the player is on.
 * This unlocks additional message layers.
 * Call this from HospitalScene / CityScene when chapter advances.
 * @param {number} chapter
 */
export function setChapter(chapter) {
  if (chapter > currentChapter) {
    currentChapter = chapter;
    if (MESSAGE_LAYERS[chapter]) {
      _fireNotification();
    }
  } else {
    currentChapter = chapter;
  }
}

/**
 * Force close phone (call on scene transitions, cutscenes).
 */
export function closePhone() {
  phoneOpen = false;
  document.getElementById('phone-ui').classList.add('hidden');
}

// ── SETUP ───────────────────────────────────────────────

/**
 * Call once on game start to wire up close buttons and lock canvas inputs.
 */
export function initPhone() {

  // Back arrow closes phone
  document.getElementById('phone-back').onclick = (e) => {
    e.stopPropagation();
    togglePhone();
  };

  // HUD phone button
  const hudPhone = document.getElementById('btn-phone');
  if (hudPhone) {
    hudPhone.onclick = (e) => {
      e.stopPropagation();
      togglePhone();
    };
  }

  // PREVENT CANVAS ACTION INTERCEPTIONS (San moving behind the phone)
  const phoneUi = document.getElementById('phone-ui');
  if (phoneUi) {
    const eventsToBlock = [
      'pointerdown', 'pointermove', 'pointerup',
      'mousedown', 'mousemove', 'mouseup',
      'touchstart', 'touchmove', 'touchend',
      'wheel', 'scroll'
    ];
    eventsToBlock.forEach(evtName => {
      phoneUi.addEventListener(evtName, (e) => {
        e.stopPropagation();
      }, { passive: true });
    });
  }
}

// ── INTERNAL ────────────────────────────────────────────

// Track which chapters have already been shown to player
// so we can fire a notification only on new unlocks
let _notifiedChapters = new Set([1]);
let _prevChapter = 1;

function buildChatWindow() {

  const window_ = document.getElementById('chat-window');
  window_.innerHTML = '';

  // Apply responsive CSS-attributes inline to ensure touch scrolls correctly
  if (window_) {
    window_.style.overflowY = 'auto';
    window_.style.maxHeight = '100%';
    window_.style.webkitOverflowScrolling = 'touch';
    window_.style.touchAction = 'pan-y'; // Isolates gestures to vertical swipes only
  }

  // ── Retrieving screen — shown while "loading" ──────
  // If this is the very first open (chapter 1, no new unlock),
  // show a corrupted-data retrieving state briefly first.
  const isFirstOpen = currentChapter === 1 && _notifiedChapters.size === 1;

  if (isFirstOpen) {
    _showRetrievingState(window_, () => _renderMessages(window_));
  } else {
    _renderMessages(window_);
  }

}

function _showRetrievingState(window_, onDone) {

  // Corrupted placeholder lines
  window_.innerHTML = '';

  const status = document.createElement('div');
  status.className = 'msg-retrieving';
  status.innerHTML = `
    <div class="ret-icon">⚠</div>
    <div class="ret-title">MESSAGES CORRUPTED</div>
    <div class="ret-sub">Attempting data recovery...</div>
    <div class="ret-bar"><div class="ret-fill"></div></div>
  `;
  window_.appendChild(status);

  // Animate bar fill over 1.8s then reveal messages
  const fill = status.querySelector('.ret-fill');
  let pct = 0;
  const interval = setInterval(() => {
    pct += 2;
    fill.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        status.style.opacity = '0';
        status.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
          if (onDone) onDone();
        }, 420);
      }, 300);
    }
  }, 36);

}

function _renderMessages(window_) {

  window_.innerHTML = '';

  const messages = [];

  // FIX: Collect messages sequentially from OLD to NEW (2 -> 3 -> 4 -> 5)
  // This positions historical dialogue at the top of the chat logs.
  [2, 3, 4, 5].forEach(ch => {
    if (currentChapter >= ch && MESSAGE_LAYERS[ch]) {
      messages.push(...MESSAGE_LAYERS[ch]);
    }
  });

  // Always append the final unread message ("see ya :)") at the absolute bottom
  messages.push(...MESSAGE_LAYERS[1]);

  // If new messages just unlocked — show a recovery notice at top
  const hasNew = currentChapter > 1 && !_notifiedChapters.has(currentChapter);
  if (hasNew) {
    const notice = document.createElement('div');
    notice.className = 'msg-recovered';
    notice.textContent = `↑  ${_newMessageCount()} message${_newMessageCount() !== 1 ? 's' : ''} recovered`;
    window_.appendChild(notice);
  }

  // Render messages top to bottom
  messages.forEach((msg, idx) => {

    const wrap = document.createElement('div');
    wrap.className = `msg-wrap ${msg.wrap}`;
    if (msg.final) wrap.classList.add('msg-final');

    // Fade-in stagger for newly recovered messages
    if (hasNew && _isNewMessage(msg)) {
      wrap.style.opacity = '0';
      wrap.style.transition = `opacity 0.4s ease ${idx * 80}ms`;
      setTimeout(() => { wrap.style.opacity = '1'; }, 50);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = msg.text;

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = msg.time;

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    window_.appendChild(wrap);

  });

  // Smooth scroll to the bottom so the most recent text is immediately visible,
  // allowing the user to scroll back up through time naturally!
  setTimeout(() => {
    window_.scrollTop = window_.scrollHeight;
  }, 10);

}

function _newMessageCount() {
  const layer = MESSAGE_LAYERS[currentChapter];
  return layer ? layer.length : 0;
}

function _isNewMessage(msg) {
  const layer = MESSAGE_LAYERS[currentChapter];
  if (!layer) return false;
  return layer.some(m => m.text === msg.text && m.time === msg.time);
}

// ── NOTIFICATION BADGE ───────────────────────────────────
// Call this from setChapter() so a badge appears on the
// HUD phone button whenever new messages unlock.

function _fireNotification() {
  const btn = document.getElementById('btn-phone');
  if (!btn) return;

  // Badge dot
  let badge = document.getElementById('phone-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'phone-badge';
    btn.appendChild(badge);
  }
  badge.textContent = '';
  badge.classList.add('badge-pulse');

  // Toast message — appears top of screen
  let toast = document.getElementById('phone-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'phone-toast';
    document.getElementById('gc').appendChild(toast);
  }

  const count = _newMessageCount();
  toast.textContent = `${count} message${count !== 1 ? 's' : ''} recovered  [P]`;
  toast.classList.remove('toast-hide');
  toast.classList.add('toast-show');

  // Auto hide toast after 3.5s
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
  }, 3500);

}

// Clear badge when phone is opened
function _clearBadge() {
  const badge = document.getElementById('phone-badge');
  if (badge) {
    badge.classList.remove('badge-pulse');
    badge.textContent = '';
  }
  _notifiedChapters.add(currentChapter);
}