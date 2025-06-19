import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for infinite scroll functionality
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there's more data to fetch
 * @param {boolean} loading - Whether currently loading
 * @returns {Function} ref callback for the sentinel element
 */
export const useInfiniteScroll = (fetchMore, hasMore, loading) => {
  const [sentinel, setSentinel] = useState(null);

  useEffect(() => {
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinel, fetchMore, hasMore, loading]);

  const sentinelRef = useCallback((node) => {
    setSentinel(node);
  }, []);

  return sentinelRef;
};

/**
 * Custom hook for managing filter state with URL synchronization
 * @param {Object} initialFilters - Initial filter state
 * @param {Object} searchParams - URL search parameters
 * @param {Function} setSearchParams - Function to update URL parameters
 * @returns {Array} [filters, updateFilters]
 */
export const useFilterSync = (initialFilters, searchParams, setSearchParams) => {
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    category: searchParams.get('category') || initialFilters.category,
    search: searchParams.get('q') || initialFilters.search,
  }));

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== initialFilters[key]) {
        if (key === 'search') {
          newSearchParams.set('q', value);
        } else {
          newSearchParams.set(key, value);
        }
      } else {
        if (key === 'search') {
          newSearchParams.delete('q');
        } else {
          newSearchParams.delete(key);
        }
      }
    });
    
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams, initialFilters]);

  return [filters, updateFilters, setFilters];
};
