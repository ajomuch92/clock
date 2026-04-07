<template>
  <div class="stopwatch">
    <div class="time-display">
      {{ time.hours }}:{{ time.minutes }}:{{ time.seconds }}.{{ time.milliseconds }}
    </div>
    
    <div class="controls">
      <button v-if="!isRunning" @click="start" class="btn-start">
        Iniciar
      </button>
      <button v-if="isRunning && !isPaused" @click="pause" class="btn-pause">
        Pausar
      </button>
      <button v-if="isRunning && isPaused" @click="resume" class="btn-resume">
        Reanudar
      </button>
      <button @click="reset" class="btn-reset" :disabled="!isRunning && elapsedTime === 0">
        Reiniciar
      </button>
    </div>
    
    <div v-if="isRunning" class="status">
      <span v-if="isPaused" class="status-paused">⏸ Pausado</span>
      <span v-else class="status-running">▶️ En ejecución</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStopwatch } from './composables/useStopwatch';

const { 
  elapsedTime, 
  isRunning, 
  isPaused, 
  start, 
  pause, 
  resume, 
  reset, 
  formatTime 
} = useStopwatch();

const time = computed(() => formatTime(elapsedTime.value));
</script>

<style scoped>
.stopwatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.time-display {
  font-size: 4rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.1em;
  user-select: none;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: #10b981;
  color: white;
}

.btn-start:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.btn-pause {
  background: #f59e0b;
  color: white;
}

.btn-pause:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.btn-resume {
  background: #3b82f6;
  color: white;
}

.btn-resume:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.btn-reset {
  background: #ef4444;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.status {
  font-size: 1.2rem;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.status-running {
  color: #86efac;
}

.status-paused {
  color: #fde047;
}

@media (max-width: 640px) {
  .time-display {
    font-size: 2.5rem;
  }
  
  button {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>