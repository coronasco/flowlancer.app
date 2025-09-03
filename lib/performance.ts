/**
 * Performance utilities for development monitoring
 * Only active in development mode
 */

const isDev = process.env.NODE_ENV === 'development';

export const perf = {
  /**
   * Mark the start of a performance measurement
   */
  mark: (name: string) => {
    if (!isDev || typeof window === 'undefined') return;
    performance.mark(`${name}-start`);
  },

  /**
   * Mark the end and measure performance
   */
  measure: (name: string) => {
    if (!isDev || typeof window === 'undefined') return;
    
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        console.log(`⚡ [PERF] ${name}: ${Math.round(measure.duration)}ms`);
      }
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  },

  /**
   * Log slow API calls in development
   */
  logSlowAPI: (url: string, duration: number) => {
    if (!isDev) return;
    
    if (duration > 300) {
      console.warn(`🐌 [SLOW API] ${url}: ${Math.round(duration)}ms`);
    }
  },

  /**
   * Mark first paint for dashboard
   */
  markFirstPaint: (page: string) => {
    if (!isDev || typeof window === 'undefined') return;
    
    // Use requestIdleCallback if available, otherwise setTimeout
    const callback = () => {
      performance.mark(`${page}-first-paint`);
      console.log(`🎨 [FIRST PAINT] ${page} rendered`);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  }
};

/**
 * HOC to measure component render time
 */
export function withPerformanceLogging<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  name: string
): React.ComponentType<T> {
  if (!isDev) return Component;

  return function PerformanceWrappedComponent(props: T) {
    React.useEffect(() => {
      perf.markFirstPaint(name);
    }, []);

    return React.createElement(Component, props);
  };
}
