import { useState, useEffect } from 'react';

// A simple hook to subscribe to WatermelonDB observables
export function useObserve<T>(observable?: { subscribe: (cb: (data: T) => void) => { unsubscribe: () => void } } | null, initialValue: T | null = null): T | null {
  const [data, setData] = useState<T | null>(initialValue);

  useEffect(() => {
    if (!observable) return;
    const subscription = observable.subscribe((newData) => {
      setData(newData);
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  return data;
}
