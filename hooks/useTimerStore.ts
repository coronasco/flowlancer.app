import { create } from 'zustand';
import { useEffect } from 'react';

type TimerState = {
  // Current running task
  runningTaskId: string | null;
  startedAt: number | null; // timestamp when started
  currentSeconds: number; // display seconds (calculated)
  intervalId: NodeJS.Timeout | null;
  
  // Actions
  startLocal: (taskId: string, startedAtServer: number) => void;
  stopLocal: () => void;
  updateTick: () => void;
  cleanup: () => void;
};

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTaskId: null,
  startedAt: null,
  currentSeconds: 0,
  intervalId: null,
  
  startLocal: (taskId: string, startedAtServer: number) => {
    const state = get();
    
    // Clear any existing interval
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    
    // Calculate initial seconds
    const now = Date.now();
    const initialSeconds = Math.floor((now - startedAtServer) / 1000);
    
    // Start new interval for smooth ticking
    const intervalId = setInterval(() => {
      get().updateTick();
    }, 1000);
    
    set({
      runningTaskId: taskId,
      startedAt: startedAtServer,
      currentSeconds: initialSeconds,
      intervalId,
    });
  },
  
  stopLocal: () => {
    const state = get();
    
    // Clear interval
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
    
    set({
      runningTaskId: null,
      startedAt: null,
      currentSeconds: 0,
      intervalId: null,
    });
  },
  
  updateTick: () => {
    const state = get();
    if (!state.startedAt) return;
    
    const now = Date.now();
    const newSeconds = Math.floor((now - state.startedAt) / 1000);
    
    set({ currentSeconds: newSeconds });
  },
  
  cleanup: () => {
    const state = get();
    if (state.intervalId) {
      clearInterval(state.intervalId);
      set({ intervalId: null });
    }
  },
}));

// Hook for cleanup on unmount

export const useTimerCleanup = () => {
  const cleanup = useTimerStore((state) => state.cleanup);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);
};
