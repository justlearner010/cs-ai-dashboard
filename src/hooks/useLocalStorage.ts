import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: {
    parse?: (raw: string) => T;
    onWriteError?: (key: string, error: unknown) => void;
  },
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue instanceof Function ? initialValue() : initialValue;
      }
      return options?.parse ? options.parse(item) : (JSON.parse(item) as T);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const onWriteErrorRef = useRef(options?.onWriteError);
  onWriteErrorRef.current = options?.onWriteError;

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          // setItem 必须在 updater 内部捕获：React 可能延迟执行 updater，
          // 放在外层 try/catch 会漏掉 QuotaExceeded 等写入错误。
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
            // updater 可能在渲染阶段执行：推迟回调，避免在渲染中触发上游 setState（toast）
            queueMicrotask(() => onWriteErrorRef.current?.(key, error));
          }
        }
        return valueToStore;
      });
    },
    [key],
  );

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(
            options?.parse ? options.parse(e.newValue) : JSON.parse(e.newValue),
          );
        } catch {
          // ignore invalid JSON
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, options?.parse]);

  return [storedValue, setValue];
}
