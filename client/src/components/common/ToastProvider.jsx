import React, { createContext, useContext, useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  const colors = {
    success: 'from-emerald-500 to-forest-500 text-white',
    error: 'from-red-500 to-rose-500 text-white',
    warning: 'from-amber-500 to-orange-500 text-white',
    info: 'from-blue-500 to-indigo-500 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        max-w-sm w-full bg-gradient-to-r ${colors[toast.type]} 
        shadow-glow rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 
        backdrop-blur-xl border border-white/20
      `}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[toast.type]}
          </div>
          <div className="ml-3 flex-1">
            {toast.title && (
              <p className="text-sm font-semibold">
                {toast.title}
              </p>
            )}
            <p className={`text-sm ${toast.title ? 'mt-1 opacity-90' : ''}`}>
              {toast.message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/20">
        <button
          onClick={() => onRemove(toast.id)}
          className="p-4 flex items-center justify-center text-white hover:bg-white/10 rounded-r-2xl transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options = {}) => 
      addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => 
      addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => 
      addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => 
      addToast({ type: 'info', message, ...options })
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <AnimatePresence>
            {toasts.map((toastItem) => (
              <Toast
                key={toastItem.id}
                toast={toastItem}
                onRemove={removeToast}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
