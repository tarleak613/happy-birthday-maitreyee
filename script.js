// ---------------------------------------------------------------------
// CONFIG — edit these to reuse this page for someone else's birthday
// ---------------------------------------------------------------------
const CONFIG = {
  name: "Maitreyee",
  age: 24,
};

// ---------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const match = document.querySelector(".match");
const cakeArea = document.querySelector(".cake-area");
const cakeImg = document.querySelector(".cake");
const ageBadge = document.getElementById("ageBadge");
const smokeLayer = document.getElementById("smokeLayer");
const messageEl = document.getElementById("birthdayMessage");
const instructionsEl = document.getElementById("instructions");
const fallbackToggle = document.getElementById("fallbackToggle");
const fallbackControls = document.getElementById("fallbackControls");
const btnLight = document.getElementById("btnLight");
const btnBlow = document.getElementById("btnBlow");
const loadingOverlay = document.getElementById("loadingOverlay");

function hideLoadingOverlay() {
  loadingOverlay.classList.add("hidden");
}

// ---------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const WEBCAM_WIDTH = isMobile ? 240 : 300;
const WEBCAM_HEIGHT = isMobile ? 180 : 225;
const BLOW_THRESHOLD = 70; // how sensitive the mic is
const LIGHT_DISTANCE = 20; // how close match needs to be to light candles

canvas.width = WEBCAM_WIDTH;
canvas.height = WEBCAM_HEIGHT;

// Track hand position
let handPosition = { x: 0.5, y: 0.5 };
let isHandDetected = false;

let isCakeLit = false;
let isCandlesBlownOut = false;

// ---------------------------------------------------------------------
// Hand tracking (MediaPipe)
// ---------------------------------------------------------------------
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1,
  minDetectionConfidence: isMobile ? 0.6 : 0.7,
  minTrackingConfidence: isMobile ? 0.4 : 0.5,
});

hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    isHandDetected = true;

    const indexTip = landmarks[8];
    handPosition.x = 1 - indexTip.x;
    handPosition.y = indexTip.y;

    updateMatchPosition();
    checkCandleLighting();
  } else {
    isHandDetected = false;
  }
});

function updateMatchPosition() {
  if (!isHandDetected) return;

  const cakeRect = cakeArea.getBoundingClientRect();
  const padding = 20;
  const matchX = padding + handPosition.x * (cakeRect.width - padding * 2 - 40);
  const matchY = padding + handPosition.y * (cakeRect.height - padding * 2 - 60);

  match.style.left = `${matchX}px`;
  match.style.top = `${matchY}px`;
}

function checkCandleLighting() {
  if (isCakeLit || isCandlesBlownOut) return;

  const matchRect = match.getBoundingClientRect();
  const cakeRect = cakeImg.getBoundingClientRect();

  const matchTipX = matchRect.left + matchRect.width / 2;
  const matchTipY = matchRect.top;

  const candleX = cakeRect.left + cakeRect.width / 2;
  const candleY = cakeRect.top + 10;

  const distance = Math.sqrt(
    Math.pow(matchTipX - candleX, 2) + Math.pow(matchTipY - candleY, 2)
  );

  if (distance < LIGHT_DISTANCE) {
    lightCake();
  }
}

// ---------------------------------------------------------------------
// Cake state
// ---------------------------------------------------------------------
function lightCake() {
  if (isCakeLit) return;

  isCakeLit = true;
  cakeImg.src = "assets/cake_lit.gif";
  match.style.display = "none";
  ageBadge.classList.add("lit");
  instructionsEl.textContent = "Make a wish, then blow to finish it off!";

  playMatchStrike();
}

function blowOutCandles() {
  if (!isCakeLit || isCandlesBlownOut) return;

  isCandlesBlownOut = true;
  cakeImg.src = "assets/cake_unlit.gif";
  ageBadge.classList.remove("lit");
  instructionsEl.textContent = "Wish sent. 🎂";

  playBlowWhoosh();
  spawnSmoke();
  createConfetti();

  messageEl.classList.add("show");

  setTimeout(playBirthdaySong, 900);
}

// ---------------------------------------------------------------------
// Smoke wisps
// ---------------------------------------------------------------------
function spawnSmoke() {
  const wispCount = 6;
  for (let i = 0; i < wispCount; i++) {
    setTimeout(() => {
      const wisp = document.createElement("span");
      wisp.className = "smoke-wisp";
      const drift = (Math.random() - 0.5) * 40;
      wisp.style.setProperty("--smoke-drift", `${drift}px`);
      wisp.style.left = `${(Math.random() - 0.5) * 16}px`;
      smokeLayer.appendChild(wisp);
      setTimeout(() => wisp.remove(), 2000);
    }, i * 120);
  }
}

// ---------------------------------------------------------------------
// Confetti
// ---------------------------------------------------------------------
const CONFETTI_SYMBOLS = ["⭒", "˚", "⋆", "⊹", "₊", "݁", "˖", "✦", "✧", "·", "°", "✶"];
const CONFETTI_COLORS = ["#051fc2", "#ff6a9c", "#ffb03b", "#7c5cff", "#00c2a8"];

function createConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const confettiCount = 90;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("span");
      confetti.className = "confetti";
      confetti.textContent =
        CONFETTI_SYMBOLS[Math.floor(Math.random() * CONFETTI_SYMBOLS.length)];

      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
      confetti.style.setProperty(
        "--confetti-color",
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      );

      const duration = 4 + Math.random() * 4;
      confetti.style.animationDuration = duration + "s";
      confetti.style.animationDelay = Math.random() * 0.5 + "s";

      const swayAmount = (Math.random() - 0.5) * 100;
      confetti.style.setProperty("--sway", swayAmount + "px");

      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), (duration + 1) * 1000);
    }, i * 40);
  }

  setTimeout(() => container.remove(), 15000);
}

// ---------------------------------------------------------------------
// Audio: mic-based blow detection + synthesized sound effects/song
// ---------------------------------------------------------------------
let audioContext = null;
let analyser = null;
let microphone = null;
let isBlowDetectionActive = false;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

async function initBlowDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const ac = getAudioContext();
    analyser = ac.createAnalyser();
    microphone = ac.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    isBlowDetectionActive = true;
    detectBlow();
  } catch (err) {
    console.error("Error accessing microphone:", err);
    showFallbackControls();
  }
}

// Temporary on-screen readout to help calibrate BLOW_THRESHOLD.
// Set SHOW_MIC_DEBUG to true if you ever need to re-check mic levels.
const SHOW_MIC_DEBUG = false;
let micDebugEl = null;
if (SHOW_MIC_DEBUG) {
  micDebugEl = document.createElement("div");
  micDebugEl.style.cssText =
    "font-family:monospace;font-size:0.7rem;color:#051fc2;margin-top:0.5rem;";
  instructionsEl.insertAdjacentElement("afterend", micDebugEl);
}

function detectBlow() {
  if (!isBlowDetectionActive) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

  if (micDebugEl) {
    micDebugEl.textContent = `mic level: ${volume.toFixed(1)} / threshold: ${BLOW_THRESHOLD}`;
  }

  if (volume > BLOW_THRESHOLD && isCakeLit && !isCandlesBlownOut) {
    blowOutCandles();
  }

  requestAnimationFrame(detectBlow);
}

// Short scratchy "strike" sound when the candles catch light
function playMatchStrike() {
  try {
    const ac = getAudioContext();
    const bufferSize = ac.sampleRate * 0.25;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.35, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

    noise.connect(filter).connect(gain).connect(ac.destination);
    noise.start();
  } catch (err) {
    console.error("Sound effect error:", err);
  }
}

// Soft breathy "whoosh" when candles are blown out
function playBlowWhoosh() {
  try {
    const ac = getAudioContext();
    const bufferSize = ac.sampleRate * 0.6;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, ac.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.6);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.001, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);

    noise.connect(filter).connect(gain).connect(ac.destination);
    noise.start();
  } catch (err) {
    console.error("Sound effect error:", err);
  }
}

// Instrumental rendition of the traditional (public-domain) birthday tune
function playBirthdaySong() {
  try {
    const ac = getAudioContext();
    const NOTE = {
      G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
      D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
    };

    // [note, beats]
    const melody = [
      ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
      ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
      ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
      ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
    ];

    const beatDuration = 0.32;
    let t = ac.currentTime + 0.05;

    melody.forEach(([note, beats]) => {
      const freq = NOTE[note];
      const dur = beats * beatDuration;

      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.setValueAtTime(0.22, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);

      t += dur;
    });
  } catch (err) {
    console.error("Birthday song error:", err);
  }
}

// ---------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT,
        facingMode: "user",
      },
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      startHandTracking();
      hideLoadingOverlay();
    };
  } catch (err) {
    console.error("Error accessing webcam:", err);
    hideLoadingOverlay();
    showFallbackControls();
  }
}

function startHandTracking() {
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: WEBCAM_WIDTH,
    height: WEBCAM_HEIGHT,
  });

  camera.start();
}

// ---------------------------------------------------------------------
// Manual fallback (no camera/mic, or user just prefers buttons)
// ---------------------------------------------------------------------
function showFallbackControls() {
  fallbackControls.classList.remove("hidden");
}

fallbackToggle.addEventListener("click", () => {
  fallbackControls.classList.toggle("hidden");
});

btnLight.addEventListener("click", () => {
  getAudioContext();
  lightCake();
});

btnBlow.addEventListener("click", () => {
  getAudioContext();
  blowOutCandles();
});

// ---------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".age-number").textContent = String(CONFIG.age);

  // Safety net: if the camera never resolves (e.g. the permission prompt
  // gets ignored), don't leave the loader spinning forever.
  setTimeout(() => {
    if (!loadingOverlay.classList.contains("hidden")) {
      hideLoadingOverlay();
      showFallbackControls();
    }
  }, 12000);

  initCamera();
  initBlowDetection();

  // Some mobile browsers start the audio engine "suspended" until any
  // touch happens, even after mic permission is granted. This silently
  // wakes it up on the first tap, without gating anything on it.
  document.addEventListener(
    "touchstart",
    () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
    },
    { once: true, passive: true }
  );
});