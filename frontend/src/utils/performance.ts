import { useCallback, useMemo } from 'react';

// Debounce hook for search and input optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized callback hook
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Memoized value hook
export function useMemoizedValue<T>(value: T, deps: React.DependencyList): T {
  return useMemo(() => value, deps);
}

// Image optimization utilities
export const imageOptimization = {
  // Generate optimized image props
  getOptimizedImageProps: (src: string, alt: string, priority = false) => ({
    src,
    alt,
    priority,
    quality: 85,
    placeholder: 'blur',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  }),

  // Lazy load images
  getLazyImageProps: (src: string, alt: string) => ({
    ...imageOptimization.getOptimizedImageProps(src, alt, false),
    loading: 'lazy' as const,
  }),
};

// Bundle size optimization
export const bundleOptimization = {
  // Dynamic imports for heavy components
  dynamicImport: (importFn: () => Promise<any>) => {
    return React.lazy(importFn);
  },

  // Code splitting utilities
  createAsyncComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn);
  },
};

// Performance monitoring
export const performanceMonitoring = {
  // Measure component render time
  measureRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },
};

// Caching utilities
export const caching = {
  // Simple in-memory cache
  createCache: <T>() => {
    const cache = new Map<string, T>();
    return {
      get: (key: string) => cache.get(key),
      set: (key: string, value: T) => cache.set(key, value),
      has: (key: string) => cache.has(key),
      clear: () => cache.clear(),
    };
  },

  // Cache with TTL
  createTTLCache: <T>(ttl: number) => {
    const cache = new Map<string, { value: T; expiry: number }>();
    return {
      get: (key: string) => {
        const item = cache.get(key);
        if (!item) return undefined;
        if (Date.now() > item.expiry) {
          cache.delete(key);
          return undefined;
        }
        return item.value;
      },
      set: (key: string, value: T) => {
        cache.set(key, { value, expiry: Date.now() + ttl });
      },
      has: (key: string) => {
        const item = cache.get(key);
        if (!item) return false;
        if (Date.now() > item.expiry) {
          cache.delete(key);
          return false;
        }
        return true;
      },
      clear: () => cache.clear(),
    };
  },
};

// Virtual scrolling utilities
export const virtualScrolling = {
  // Calculate visible items for virtual scrolling
  calculateVisibleItems: (
    itemHeight: number,
    containerHeight: number,
    scrollTop: number,
    totalItems: number
  ) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    );
    return { startIndex, endIndex };
  },
};

// Preloading utilities
export const preloading = {
  // Preload critical resources
  preloadCriticalResources: (resources: string[]) => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'image';
      document.head.appendChild(link);
    });
  },

  // Prefetch next page
  prefetchPage: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
};

// React import for the utilities
import React from 'react';
