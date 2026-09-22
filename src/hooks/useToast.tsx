import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastAction {
  label: string;
  onAction: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (
    message: string,
    options?: { action?: ToastAction; duration?: number },
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    (message, options) => {
      const id = ++idRef.current;
      setItems(prev => [...prev.slice(-2), { id, message, action: options?.action }]);
      const duration = options?.duration ?? (options?.action ? 8000 : 5000);
      window.setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm backdrop-blur
                         bg-white/95 text-slate-700 border-slate-200
                         dark:bg-slate-800/95 dark:text-slate-200 dark:border-slate-700"
            >
              <span className="flex-1 leading-snug">{item.message}</span>
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    item.action?.onAction();
                    remove(item.id);
                  }}
                  className="shrink-0 font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  {item.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
