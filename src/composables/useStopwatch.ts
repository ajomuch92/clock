import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { load, Store } from '@tauri-apps/plugin-store';
import type { StopwatchState, FormattedTime } from '../types/stopwatch';

export function useStopwatch() {
  const startTime: Ref<number | null> = ref(null);
  const elapsedTime: Ref<number> = ref(0);
  const isRunning: Ref<boolean> = ref(false);
  const isPaused: Ref<boolean> = ref(false);
  const pausedAt: Ref<number | null> = ref(null);
  
  let intervalId: number | null = null;
  let store: Store | null = null;

  // Inicializar el store
  onMounted(async () => {
    store = await load('store.json');
    
    // Cargar estado guardado
    const savedState = await store.get<StopwatchState>('stopwatch');
    
    if (savedState) {
      startTime.value = savedState.startTime;
      elapsedTime.value = savedState.elapsedTime;
      isRunning.value = savedState.isRunning;
      isPaused.value = savedState.isPaused;
      pausedAt.value = savedState.pausedAt;
      
      // Si estaba corriendo, reanudar
      if (isRunning.value && !isPaused.value) {
        startInterval();
      }
    }
  });

  // Guardar estado cuando cambie
  watch(
    [startTime, elapsedTime, isRunning, isPaused, pausedAt],
    async () => {
      if (store) {
        const state: StopwatchState = {
          startTime: startTime.value,
          elapsedTime: elapsedTime.value,
          isRunning: isRunning.value,
          isPaused: isPaused.value,
          pausedAt: pausedAt.value,
        };
        
        await store.set('stopwatch', state);
        await store.save();
      }
    }
  );

  function startInterval(): void {
    intervalId = window.setInterval(() => {
      if (startTime.value && !isPaused.value) {
        elapsedTime.value = Date.now() - startTime.value;
      }
    }, 10); // Actualizar cada 10ms para precisión
  }

  function start(): void {
    if (!isRunning.value) {
      startTime.value = Date.now() - elapsedTime.value;
      isRunning.value = true;
      isPaused.value = false;
      startInterval();
    }
  }

  function pause(): void {
    if (isRunning.value && !isPaused.value) {
      isPaused.value = true;
      pausedAt.value = Date.now();
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  }

  function resume(): void {
    if (isRunning.value && isPaused.value && pausedAt.value !== null) {
      const pausedDuration = Date.now() - pausedAt.value;
      if (startTime.value !== null) {
        startTime.value += pausedDuration;
      }
      isPaused.value = false;
      pausedAt.value = null;
      startInterval();
    }
  }

  function reset(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startTime.value = null;
    elapsedTime.value = 0;
    isRunning.value = false;
    isPaused.value = false;
    pausedAt.value = null;
  }

  function formatTime(ms: number): FormattedTime {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(2, '0'),
    };
  }

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  return {
    elapsedTime,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    formatTime,
  };
}