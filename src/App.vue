<template>
  <div class="app-wrapper">
    <!-- Ambient background orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="stopwatch">
      <!-- Header -->
      <header class="header">
        <div class="header-icon">⏱</div>
        <h1 class="header-title">Cronómetro</h1>
      </header>

      <!-- Circular progress + time display -->
      <div class="clock-container">
        <svg class="progress-ring" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
          <!-- Background track -->
          <circle
            class="ring-track"
            cx="140" cy="140" r="120"
            fill="none"
            stroke-width="6"
          />
          <!-- Animated progress arc -->
          <circle
            class="ring-progress"
            :class="{ 'ring-paused': isPaused, 'ring-running': isRunning && !isPaused }"
            cx="140" cy="140" r="120"
            fill="none"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
          <!-- Tick marks -->
          <g v-for="i in 60" :key="i">
            <line
              :x1="140 + 108 * Math.cos((i * 6 - 90) * Math.PI / 180)"
              :y1="140 + 108 * Math.sin((i * 6 - 90) * Math.PI / 180)"
              :x2="140 + (i % 5 === 0 ? 96 : 102) * Math.cos((i * 6 - 90) * Math.PI / 180)"
              :y2="140 + (i % 5 === 0 ? 96 : 102) * Math.sin((i * 6 - 90) * Math.PI / 180)"
              :stroke="i % 5 === 0 ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'"
              :stroke-width="i % 5 === 0 ? 2 : 1"
            />
          </g>
        </svg>

        <!-- Inner clock face -->
        <div class="clock-face">
          <div class="time-block">
            <div class="time-display" :class="{ 'time-running': isRunning && !isPaused, 'time-paused': isPaused }">
              <span class="time-segment">{{ time.hours }}</span>
              <span class="time-colon" :class="{ blink: isRunning && !isPaused }">:</span>
              <span class="time-segment">{{ time.minutes }}</span>
              <span class="time-colon" :class="{ blink: isRunning && !isPaused }">:</span>
              <span class="time-segment">{{ time.seconds }}</span>
            </div>
            <div class="time-ms">
              <span class="ms-label">ms</span>
              <span class="ms-value">{{ time.milliseconds }}</span>
            </div>
          </div>

          <!-- Status badge -->
          <div class="status-badge" :class="statusClass">
            <span class="status-dot"></span>
            <span class="status-text">{{ statusText }}</span>
          </div>
        </div>
      </div>

      <!-- Initial time (only while stopped); start() resumes from elapsedTime -->
      <div v-if="!isRunning" class="initial-time">
        Tiempo inicial
        <label v-for="(label, unit) in unitLabels" :key="unit">
          <input
            :id="`input-initial-${unit}`"
            type="number"
            min="0"
            :max="unit === 'hours' ? undefined : 59"
            :value="Number(time[unit])"
            @change="setPart(unit, ($event.target as HTMLInputElement).valueAsNumber)"
          />
          {{ label }}
        </label>
      </div>

      <!-- Controls -->
      <div class="controls">
        <!-- Start / Pause / Resume -->
        <button
          v-if="!isRunning"
          id="btn-start"
          @click="start"
          class="btn btn-start"
          aria-label="Iniciar cronómetro"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span>Iniciar</span>
        </button>

        <button
          v-if="isRunning && !isPaused"
          id="btn-pause"
          @click="pause"
          class="btn btn-pause"
          aria-label="Pausar cronómetro"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <span>Pausar</span>
        </button>

        <button
          v-if="isRunning && isPaused"
          id="btn-resume"
          @click="resume"
          class="btn btn-resume"
          aria-label="Reanudar cronómetro"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span>Reanudar</span>
        </button>

        <button
          id="btn-reset"
          @click="reset"
          class="btn btn-reset"
          :disabled="!isRunning && elapsedTime === 0"
          aria-label="Reiniciar cronómetro"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          <span>Reiniciar</span>
        </button>
      </div>

      <!-- Add time (only while paused) -->
      <template v-if="isPaused">
        <button
          v-if="!showAdd"
          id="btn-add-time"
          @click="showAdd = true"
          class="btn btn-reset"
        >
          <span>+ Agregar tiempo</span>
        </button>
        <form v-else class="initial-time" @submit.prevent="confirmAdd">
          <label v-for="(label, unit) in unitLabels" :key="unit">
            <input :id="`input-add-${unit}`" type="number" min="0" v-model.number="toAdd[unit]" />
            {{ label }}
          </label>
          <button type="submit" class="btn btn-resume">Aceptar</button>
          <button type="button" class="btn btn-reset" @click="showAdd = false">Cancelar</button>
        </form>
      </template>

      <!-- Elapsed time in seconds label -->
      <div class="elapsed-label" v-if="elapsedTime > 0">
        {{ (elapsedTime / 1000).toFixed(2) }}s transcurridos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useStopwatch } from './composables/useStopwatch';

const {
  elapsedTime,
  isRunning,
  isPaused,
  start,
  pause,
  resume,
  reset,
  addTime,
  formatTime
} = useStopwatch();

const showAdd = ref(false);
const toAdd = reactive({ hours: 0, minutes: 0, seconds: 0 });

function confirmAdd(): void {
  const ms = (Object.keys(unitMs) as (keyof typeof unitMs)[])
    .reduce((sum, u) => sum + Math.max(0, Math.floor(toAdd[u] || 0)) * unitMs[u], 0);
  addTime(ms);
  Object.assign(toAdd, { hours: 0, minutes: 0, seconds: 0 });
  showAdd.value = false;
}

const time = computed(() => formatTime(elapsedTime.value));

const unitLabels = { hours: 'h', minutes: 'm', seconds: 's' } as const;
const unitMs = { hours: 3600000, minutes: 60000, seconds: 1000 };

// Replace one unit of the starting time, keeping the other two
function setPart(unit: keyof typeof unitMs, value: number): void {
  const n = Math.max(0, Math.floor(value || 0));
  elapsedTime.value += (n - Number(time.value[unit])) * unitMs[unit];
}

// Progress ring: 60s = full rotation
const circumference = 2 * Math.PI * 120; // r=120
const dashOffset = computed(() => {
  const seconds = (elapsedTime.value / 1000) % 60;
  const progress = seconds / 60;
  return circumference * (1 - progress);
});

const statusText = computed(() => {
  if (!isRunning.value) return 'Listo';
  if (isPaused.value) return 'Pausado';
  return 'En ejecución';
});

const statusClass = computed(() => {
  if (!isRunning.value) return 'status-idle';
  if (isPaused.value) return 'status-paused';
  return 'status-running';
});
</script>

<style scoped>
/* ─── Reset & Base ─────────────────────────────── */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ─── App Wrapper ──────────────────────────────── */
.app-wrapper {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  background: #080b14;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ─── Ambient Orbs ─────────────────────────────── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
}
.orb-1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, #7c3aed, transparent 70%);
  top: -100px;
  left: -100px;
  animation: floatOrb 12s ease-in-out infinite;
}
.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #2563eb, transparent 70%);
  bottom: -80px;
  right: -80px;
  animation: floatOrb 9s ease-in-out infinite reverse;
}
.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #06b6d4, transparent 70%);
  top: 50%;
  left: 60%;
  animation: floatOrb 15s ease-in-out infinite 2s;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.05); }
}

/* ─── Main Stopwatch Card ──────────────────────── */
.stopwatch {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.8rem;
  padding: 2.5rem 2rem;
  width: min(420px, 95vw);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.08),
    0 30px 80px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ─── Header ───────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.header-icon {
  font-size: 1.3rem;
}
.header-title {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* ─── Clock Container (SVG + face) ────────────── */
.clock-container {
  position: relative;
  width: 280px;
  height: 280px;
}

.progress-ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-track {
  stroke: rgba(255, 255, 255, 0.06);
}

.ring-progress {
  stroke: #7c3aed;
  transition: stroke-dashoffset 0.08s linear, stroke 0.4s ease;
  filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.7));
}

.ring-running {
  stroke: #8b5cf6;
}

.ring-paused {
  stroke: #f59e0b;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
}

/* ─── Inner Clock Face ─────────────────────────── */
.clock-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

/* ─── Time Display ─────────────────────────────── */
.time-display {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: 'Space Mono', monospace;
  font-size: 3.2rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  transition: color 0.4s ease;
  user-select: none;
}

.time-running {
  color: #ffffff;
  text-shadow: 0 0 24px rgba(139, 92, 246, 0.6);
}

.time-paused {
  color: #fbbf24;
  text-shadow: 0 0 24px rgba(251, 191, 36, 0.4);
}

.time-segment {
  min-width: 2.2ch;
  text-align: center;
}

.time-colon {
  opacity: 1;
  transition: opacity 0.25s ease;
  padding-bottom: 4px;
  color: rgba(255, 255, 255, 0.4);
}

.time-colon.blink {
  animation: colonBlink 1s step-end infinite;
}

@keyframes colonBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}

/* ─── Milliseconds ─────────────────────────────── */
.time-ms {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.ms-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.ms-value {
  font-family: 'Space Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  min-width: 2ch;
  text-align: center;
}

/* ─── Status Badge ─────────────────────────────── */
.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.4s ease;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background 0.4s ease;
}

.status-idle .status-dot { background: rgba(255,255,255,0.35); }
.status-idle .status-text { color: rgba(255,255,255,0.35); }
.status-idle { background: rgba(255,255,255,0.05); }

.status-running .status-dot {
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: pulse 1.4s ease-in-out infinite;
}
.status-running .status-text { color: #4ade80; }
.status-running { background: rgba(74, 222, 128, 0.1); }

.status-paused .status-dot { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
.status-paused .status-text { color: #fbbf24; }
.status-paused { background: rgba(251, 191, 36, 0.1); }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* ─── Controls ─────────────────────────────────── */
.controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.65rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0);
  transition: background 0.2s ease;
}

.btn:hover::before {
  background: rgba(255, 255, 255, 0.06);
}

.btn:active {
  transform: scale(0.96);
}

.btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Start */
.btn-start {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 4px 20px rgba(109, 40, 217, 0.4), inset 0 1px 0 rgba(255,255,255,0.12);
}
.btn-start:hover {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 6px 28px rgba(109, 40, 217, 0.6), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

/* Pause */
.btn-pause {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 4px 20px rgba(180, 83, 9, 0.4), inset 0 1px 0 rgba(255,255,255,0.12);
}
.btn-pause:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 6px 28px rgba(180, 83, 9, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

/* Resume */
.btn-resume {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 20px rgba(4, 120, 87, 0.4), inset 0 1px 0 rgba(255,255,255,0.12);
}
.btn-resume:hover {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 6px 28px rgba(4, 120, 87, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

/* Reset */
.btn-reset {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}
.btn-reset:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

/* ─── Elapsed label ────────────────────────────── */
.elapsed-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.22);
  letter-spacing: 0.05em;
  font-weight: 400;
}

.initial-time {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}
.initial-time input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0.3rem 0.5rem;
  color: #fff;
  color-scheme: dark;
  font-family: inherit;
  width: 3.5rem;
  text-align: center;
}

/* ─── Responsive ───────────────────────────────── */
@media (max-width: 380px) {
  .clock-container {
    width: 240px;
    height: 240px;
  }
  .time-display {
    font-size: 2.4rem;
  }
  .btn {
    min-width: 100px;
    font-size: 0.78rem;
    padding: 0.6rem 1rem;
  }
}
</style>