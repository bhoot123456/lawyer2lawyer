import { useEffect, useState } from "react";

/**
 * useDebouncedValue — returns `value` delayed by `delay` ms.
 *
 * WHY: remote search screens (case list filters, Bare Acts) fired one API
 * request per keystroke, stalling on court-day networks and flashing
 * loading states. Debouncing at the input boundary keeps the existing API
 * layer untouched while cutting request volume ~10x.
 *
 * No new dependencies — plain timers, cleaned up on unmount/value change.
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
