export interface StopwatchState {
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  pausedAt: number | null;
}

export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
}