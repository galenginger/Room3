// ── State contract ────────────────────────────────────────────────────────
// Replace NEXT_ROOM_URL with the actual Room 4 URL when the class decides it.

function completeRoom(n, nextUrl) {
  localStorage.setItem('escapedRoom_' + n, 'true');
  setTimeout(function () { window.location.href = nextUrl; }, 1400);
}

// ── Cipher data ────────────────────────────────────────────────────────────
// 26 alien symbols mapped to positions 0-25 (same as A-Z)
var ALIEN = [
  '⊕','✦','⌖','⊹','⟁','⌘','☽','⊗','◈','✸',
  '⊛','⟐','⊜','⊝','⊞','⊟','⊠','⊡','⋈','⋉',
  '⋊','⋋','⋌','⋍','⋎','⋏'
];
var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Ciphertext symbol indices for ⋊⟐⟁✦⋏ = NEXUS at offset 7
// Encode: letter index L → ALIEN[(L + 7) % 26]
// N=13 → 20=⋊, E=4 → 11=⟐, X=23 → 4=⟁, U=20 → 1=✦, S=18 → 25=⋏
var CIPHER_INDICES = [20, 11, 4, 1, 25];
var CORRECT_OFFSET = 7;
var ANSWER = 'NEXUS';
var ROOM_NUMBER   = 3;
var PREV_ROOM_URL = 'room2.runasp.net/';
var NEXT_ROOM_URL = 'http://escape-room-4.runasp.net/';
var HINT_PENALTY_SECONDS = 30;
var HINTS = [
  'Hint 1: Frequency band 7 is repeated in the signal log for a reason.',
  'Hint 2: Rotate the cipher terminal until the frequency offset is 07.',
  'Hint 3: At the correct offset, the decoded clearance code spells NEXUS.'
];

// ── Timer ─────────────────────────────────────────────────────────────────
var startTime = null;

function initTimer() {
  var params = new URLSearchParams(window.location.search);
  var t = params.get('t');
  if (t) {
    startTime = parseInt(t, 10);
    localStorage.setItem('escapeStartTime', t);
  } else {
    var stored = localStorage.getItem('escapeStartTime');
    if (stored) startTime = parseInt(stored, 10);
  }
  if (startTime) {
    tickTimer();
    setInterval(tickTimer, 1000);
  }
}

function tickTimer() {
  var el = document.getElementById('timer-display');
  if (!el || !startTime) return;
  var elapsed = Math.floor((Date.now() - startTime) / 1000);
  var mins = Math.floor(elapsed / 60);
  var secs = elapsed % 60;
  el.textContent = (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
}

function withTimer(url) {
  if (!startTime) return url;
  return url + (url.includes('?') ? '&' : '?') + 't=' + startTime;
}

// ── Hints ─────────────────────────────────────────────────────────────────
function getHintStorageKey(name) {
  return 'room' + ROOM_NUMBER + name;
}

function getUsedHints() {
  return parseInt(localStorage.getItem(getHintStorageKey('HintsUsed')) || '0', 10);
}

function getHintPenalty() {
  return parseInt(localStorage.getItem(getHintStorageKey('HintPenalty')) || '0', 10);
}

function updateHintUi() {
  var usedHints = getUsedHints();
  var penalty = getHintPenalty();
  var hintButton = document.getElementById('hint-button');
  var hintText = document.getElementById('hint-text');
  var penaltyText = document.getElementById('hint-penalty');

  if (!hintButton || !hintText || !penaltyText) return;

  penaltyText.textContent = '+' + penalty + 's';

  if (usedHints > 0) {
    hintText.textContent = HINTS[Math.min(usedHints, HINTS.length) - 1];
  }

  if (usedHints >= HINTS.length) {
    hintButton.disabled = true;
    hintButton.textContent = '[ ALL HINTS USED ]';
  }
}

function useHint() {
  var usedHints = getUsedHints();
  if (usedHints >= HINTS.length) return;

  usedHints += 1;
  var penalty = usedHints * HINT_PENALTY_SECONDS;

  localStorage.setItem(getHintStorageKey('HintsUsed'), String(usedHints));
  localStorage.setItem(getHintStorageKey('HintPenalty'), String(penalty));
  updateHintUi();
}

// ── Wheel state ────────────────────────────────────────────────────────────
var offset = 0;
var CX = 140, CY = 140, N = 26;
var OUTER_R = 114, INNER_R = 78;

// ── Build SVG rings ────────────────────────────────────────────────────────
function buildRings() {
  var outerG = document.getElementById('outer-ring');
  var innerG = document.getElementById('inner-ring');

  for (var i = 0; i < N; i++) {
    var rad = (i * 360 / N - 90) * Math.PI / 180;
    var deg = i * 360 / N;

    // Outer ring: alien symbols
    var ox = CX + OUTER_R * Math.cos(rad);
    var oy = CY + OUTER_R * Math.sin(rad);
    var ot = makeSVGText(ALIEN[i], ox, oy, deg, {
      fill: 'rgba(180,79,255,0.82)',
      fontSize: '13',
      fontFamily: 'monospace',
      className: 'alien-sym',
      dataIdx: i
    });
    outerG.appendChild(ot);

    // Inner ring: letters (fixed)
    var ix = CX + INNER_R * Math.cos(rad);
    var iy = CY + INNER_R * Math.sin(rad);
    var it = makeSVGText(LETTERS[i], ix, iy, deg, {
      fill: 'rgba(0,245,212,0.75)',
      fontSize: '11',
      fontFamily: 'Orbitron,monospace',
      fontWeight: '700'
    });
    innerG.appendChild(it);
  }
}

function makeSVGText(content, x, y, rotateDeg, opts) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x);
  el.setAttribute('y', y);
  el.setAttribute('text-anchor', 'middle');
  el.setAttribute('dominant-baseline', 'central');
  el.setAttribute('transform', 'rotate(' + rotateDeg + ' ' + x + ' ' + y + ')');
  el.setAttribute('fill', opts.fill);
  el.setAttribute('font-size', opts.fontSize);
  el.setAttribute('font-family', opts.fontFamily);
  if (opts.fontWeight) el.setAttribute('font-weight', opts.fontWeight);
  if (opts.className)  el.setAttribute('class', opts.className);
  if (opts.dataIdx !== undefined) el.setAttribute('data-idx', opts.dataIdx);
  el.textContent = content;
  return el;
}

// ── Rotate wheel ───────────────────────────────────────────────────────────
function rotate(dir) {
  offset = ((offset + dir) % 26 + 26) % 26;
  var degrees = offset * (360 / 26);
  document.getElementById('outer-ring').style.transform = 'rotate(' + degrees + 'deg)';
  document.getElementById('offset-display').textContent = offset < 10 ? '0' + offset : '' + offset;
  document.getElementById('center-offset').textContent = offset;
  updateDecoded();
  highlightAlignedSymbol();
}

// ── Build symbol grid (called once on init) ────────────────────────────────
function buildSymbolGrid() {
  var grid = document.getElementById('symbol-grid');
  grid.innerHTML = '';
  CIPHER_INDICES.forEach(function (s, i) {
    var cell = document.createElement('div');
    cell.className = 'sym-cell';
    cell.id = 'sym-cell-' + i;

    var top = document.createElement('div');
    top.className = 'sym-alien';
    top.textContent = ALIEN[s];

    var bot = document.createElement('div');
    bot.className = 'sym-letter';
    bot.id = 'sym-letter-' + i;
    bot.textContent = '?';

    cell.appendChild(top);
    cell.appendChild(bot);
    grid.appendChild(cell);
  });
}

// ── Update symbol grid on each rotation ───────────────────────────────────
function updateDecoded() {
  var correctAnswer = ANSWER.split('');
  CIPHER_INDICES.forEach(function (s, i) {
    var letter = LETTERS[(s - offset + 26) % 26];
    var correct = letter === correctAnswer[i];

    var cell   = document.getElementById('sym-cell-' + i);
    var lEl    = document.getElementById('sym-letter-' + i);

    lEl.textContent = letter;
    if (correct) {
      cell.classList.add('sym-correct');
    } else {
      cell.classList.remove('sym-correct');
    }
  });
}

// ── Highlight aligned symbol ───────────────────────────────────────────────
function highlightAlignedSymbol() {
  document.querySelectorAll('.alien-sym').forEach(function (el) {
    var idx = parseInt(el.getAttribute('data-idx'), 10);
    var alignedLetter = (idx - offset + 26) % 26; // 0 = A
    if (alignedLetter === 0) {
      el.setAttribute('fill', '#00f5d4');
      el.setAttribute('font-size', '15');
    } else {
      el.setAttribute('fill', 'rgba(180,79,255,0.82)');
      el.setAttribute('font-size', '13');
    }
  });
}

// ── Check answer ───────────────────────────────────────────────────────────
function checkAnswer() {
  var val = document.getElementById('answer').value.trim().toUpperCase();
  var fb  = document.getElementById('feedback');
  var gs  = document.getElementById('game-screen');

  if (val === ANSWER) {
    fb.className = 'feedback success';
    fb.textContent = '[ CLEARANCE GRANTED — TRANSMITTING COORDINATES ]';
    flash(gs, 'flash-ok');
    completeRoom(ROOM_NUMBER, withTimer(NEXT_ROOM_URL));
  } else if (val.length > 0) {
    fb.className = 'feedback error';
    fb.textContent = '[ INVALID CODE — ALIGN WHEEL TO CORRECT OFFSET ]';
    flash(gs, 'flash-err');
  }
}

function flash(el, cls) {
  el.classList.add(cls);
  setTimeout(function () { el.classList.remove(cls); }, 650);
}

// ── Ambient effects ────────────────────────────────────────────────────────
function createStars() {
  for (var i = 0; i < 130; i++) {
    var s = document.createElement('div');
    s.className = 'star';
    var size = Math.random() < 0.75 ? 1 : (Math.random() < 0.6 ? 2 : 3);
    s.style.cssText = [
      'width:'              + size + 'px',
      'height:'             + size + 'px',
      'left:'               + (Math.random() * 100) + 'vw',
      'top:'                + (Math.random() * 100) + 'vh',
      'animation-duration:' + (2 + Math.random() * 5) + 's',
      'animation-delay:'    + (Math.random() * 6) + 's'
    ].join(';');
    document.body.appendChild(s);
  }
}

function createParticles() {
  var colors = ['#00f5d4', '#b44fff', '#00f5d4', '#00f5d4'];
  for (var i = 0; i < 18; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = [
      'left:'               + (Math.random() * 100) + 'vw',
      'background:'         + color,
      'box-shadow:0 0 4px ' + color,
      'animation-duration:' + (9 + Math.random() * 14) + 's',
      'animation-delay:'    + (Math.random() * 12) + 's'
    ].join(';');
    document.body.appendChild(p);
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('back-link').href = PREV_ROOM_URL;
  initTimer();

  if (PREV_ROOM_URL.startsWith('http') && localStorage.getItem('escapedRoom_' + (ROOM_NUMBER - 1)) !== 'true') {
    window.location.href = PREV_ROOM_URL;
    return;
  }

  createStars();
  createParticles();
  buildRings();
  buildSymbolGrid();
  updateDecoded();
  updateHintUi();

  document.getElementById('answer').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkAnswer();
  });

  document.getElementById('hint-button').addEventListener('click', useHint);
});
