import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in development and limit frequency
    if (import.meta.env.MODE !== 'development') return;

    let hasLogged = false;
    const logTimeout = setTimeout(() => {
      if (hasLogged) return;
      hasLogged = true;

      const logPerformanceMetrics = () => {
        // Core Web Vitals - throttled logging
        if ('PerformanceObserver' in window) {
          try {
            // First Contentful Paint - single log
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                  console.log(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
                }
              }
            }).observe({ type: 'paint', buffered: true });

            // Long tasks detection - throttled
            let longTaskCount = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                longTaskCount++;
                if (longTaskCount <= 3) { // Limit to first 3 logs
                  console.warn(`⏱️ Long task detected: ${entry.duration.toFixed(2)}ms`);
                }
              }
            }).observe({ type: 'longtask', buffered: true });          } catch {
            // Silently fail - don't spam console
          }
        }

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = performance.memory;
          console.log(`🧠 Memory Usage:`, {
            used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
          });
        }
      };

      // Log metrics after page load
      if (document.readyState === 'complete') {
        setTimeout(logPerformanceMetrics, 1000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(logPerformanceMetrics, 1000);
        });
      }
    }, 2000); // Delay initial performance monitoring

    return () => {
      clearTimeout(logTimeout);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
