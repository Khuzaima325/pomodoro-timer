// Pomodoro timer: 25-minute focus sessions, 5-minute short breaks,
// 15-minute long break after every 4 focus sessions.

const DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODES = ["focus", "short", "long"];

let mode = "focus";
let remaining = DURATIONS.focus;
let intervalId = null;
let focusCount = 0; // completed focus sessions in the current cycle

const timerEl = document.getElementById("timer");
const labelEl = document.getElementById("session-label");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const modeButtons = {
  focus: document.getElementById("mode-focus"),
  short: document.getElementById("mode-short"),
  long: document.getElementById("mode-long"),
};

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function render() {
  timerEl.textContent = format(remaining);
  document.title = `${format(remaining)} — Pomodoro`;
  labelEl.textContent =
    mode === "focus"
      ? `Session ${Math.min(focusCount + 1, 4)} of 4`
      : mode === "short"
        ? "Short break — stretch, drink water"
        : "Long break — you earned it";
  MODES.forEach((m) => modeButtons[m].classList.toggle("active", m === mode));
}

function beep(times = 3) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    const t = ctx.currentTime + i * 0.35;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}

function setMode(next) {
  stop();
  mode = next;
  remaining = DURATIONS[next];
  render();
}

function tick() {
  remaining -= 1;
  if (remaining <= 0) {
    stop();
    beep();
    if (mode === "focus") {
      focusCount += 1;
      if (focusCount % 4 === 0) {
        setMode("long");
        focusCount = 0;
      } else {
        setMode("short");
      }
    } else {
      setMode("focus");
    }
    return;
  }
  render();
}

function start() {
  if (intervalId) return;
  intervalId = setInterval(tick, 1000);
  startBtn.textContent = "Pause";
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
  startBtn.textContent = "Start";
}

startBtn.addEventListener("click", () => (intervalId ? stop() : start()));
resetBtn.addEventListener("click", () => {
  stop();
  remaining = DURATIONS[mode];
  render();
});
MODES.forEach((m) => modeButtons[m].addEventListener("click", () => setMode(m)));

render();
