import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Input Component - Premium dark theme with icons and validation states
 * Supports prefix/suffix icons, error states, and glass morphism styling
 */

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled = false,
  ...props
}, ref) => {
  const inputId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full h-12 px-4 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-gray-100 placeholder:text-gray-500',
            'backdrop-blur-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'hover:border-white/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            LeftIcon && 'pl-12',
            RightIcon && 'pr-12',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        
        {RightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <RightIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-rose-400' : 'text-gray-400'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea Component - Similar styling to Input
 */
export const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  rows = 4,
  disabled = false,
  ...props
}, ref) => {
  const textareaId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-white/5 border border-white/10',
          'text-gray-100 placeholder:text-gray-500',
          'backdrop-blur-sm',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'hover:border-white/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'resize-none',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-rose-400' : 'text-gray-400'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * Select Component - Premium styled dropdown
 */
export const Select = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  children,
  disabled = false,
  ...props
}, ref) => {
  const selectId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full h-12 px-4 rounded-xl',
          'bg-white/5 border border-white/10',
          'text-gray-100',
          'backdrop-blur-sm',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'hover:border-white/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-rose-400' : 'text-gray-400'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;
