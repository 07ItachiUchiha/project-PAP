import React, { useEffect } from 'react';

// Accessibility utility functions
export const useKeyboardNavigation = (onEscape, onEnter) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) onEscape();
          break;
        case 'Enter':
          if (onEnter) onEnter();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
};

// Focus trap for modals and dropdowns
export const useFocusTrap = (isActive, containerRef) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
};

// Skip to content link
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-forest-600 text-white px-4 py-2 rounded-br-lg z-50 transition-all"
    >
      Skip to main content
    </a>
  );
};

// Live region for screen readers
export const LiveRegion = ({ children, politeness = 'polite', atomic = false }) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
};

// Accessible button with proper ARIA attributes
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  ariaLabel, 
  ariaExpanded,
  ariaControls,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props 
}) => {
  const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  const variantClasses = {
    primary: 'bg-forest-600 hover:bg-forest-700 text-white focus:ring-forest-500',
    secondary: 'bg-sage-100 hover:bg-sage-200 text-sage-800 focus:ring-sage-500',
    outline: 'border border-sage-300 hover:border-sage-400 text-sage-700 focus:ring-sage-500'
  };
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible form input with proper labeling
export const AccessibleInput = ({ 
  label, 
  id, 
  error, 
  required = false, 
  description, 
  type = 'text',
  className = '',
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-charcoal-700"
      >
        {label} {required && <span className="text-red-500" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-charcoal-600">
          {description}
        </p>
      )}
      
      <input
        id={inputId}
        type={type}
        required={required}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ')}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-sage-300 focus:border-sage-500 focus:ring-sage-500'
          }
        `}
        {...props}
      />
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible modal dialog
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '' 
}) => {
  const modalRef = React.useRef();
  
  useFocusTrap(isOpen, modalRef);
  useKeyboardNavigation(() => isOpen && onClose());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-full overflow-auto ${className}`}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-semibold mb-4">
            {title}
          </h2>
          {children}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default {
  useKeyboardNavigation,
  useFocusTrap,
  SkipToContent,
  LiveRegion,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal
};
