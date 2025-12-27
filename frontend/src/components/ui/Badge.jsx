import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Badge Component - Premium badges with glow effects
 * Supports various colors, sizes, and glow animations
 */

const badgeVariants = {
  // Color variants
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  secondary: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  
  // Status-specific variants
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  inactive: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  error: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  
  // Size variants
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glow = false,
  pulse = false,
  dot = false,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-200';
  const variantStyles = badgeVariants[variant] || badgeVariants.primary;
  const sizeStyles = badgeVariants[size] || badgeVariants.md;

  const BadgeComponent = pulse ? motion.span : 'span';
  const motionProps = pulse ? {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  return (
    <BadgeComponent
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles,
        sizeStyles,
        glow && 'shadow-glow',
        className
      )}
      {...motionProps}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'primary' && 'bg-primary-400',
          variant === 'secondary' && 'bg-secondary-400',
          variant === 'success' && 'bg-emerald-400',
          variant === 'danger' && 'bg-rose-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'info' && 'bg-cyan-400',
          variant === 'gray' && 'bg-gray-400',
          variant === 'active' && 'bg-emerald-400',
          variant === 'inactive' && 'bg-gray-400',
          variant === 'pending' && 'bg-amber-400',
          variant === 'error' && 'bg-rose-400',
          pulse && 'animate-pulse'
        )} />
      )}
      {children}
    </BadgeComponent>
  );
});

Badge.displayName = 'Badge';

/**
 * StatusBadge - Predefined status badge with proper styling
 */
export const StatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    // Equipment statuses
    ACTIVE: { variant: 'success', label: 'Active', dot: true, pulse: true },
    INACTIVE: { variant: 'gray', label: 'Inactive', dot: true },
    UNDER_MAINTENANCE: { variant: 'warning', label: 'Under Maintenance', dot: true },
    DAMAGED: { variant: 'danger', label: 'Damaged', dot: true },
    SCRAP: { variant: 'error', label: 'Scrap', dot: false },
    
    // Request statuses
    NEW: { variant: 'info', label: 'New', dot: true, pulse: true },
    IN_PROGRESS: { variant: 'warning', label: 'In Progress', dot: true, pulse: true },
    REPAIRED: { variant: 'success', label: 'Repaired', dot: true },
    COMPLETED: { variant: 'success', label: 'Completed', dot: true },
    
    // Work center statuses
    MAINTENANCE: { variant: 'danger', label: 'Maintenance', dot: true },
  };

  const config = statusConfig[status] || { variant: 'gray', label: status, dot: false };

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      pulse={config.pulse}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

/**
 * CountBadge - Small notification-style badge for counts
 */
export const CountBadge = ({ count, max = 99, variant = 'danger', className, ...props }) => {
  const displayCount = count > max ? `${max}+` : count;

  if (!count || count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'absolute -top-1 -right-1',
        'min-w-[20px] h-5 px-1.5',
        'flex items-center justify-center',
        'text-xs font-bold',
        'rounded-full',
        'shadow-lg',
        variant === 'danger' && 'bg-rose-500 text-white',
        variant === 'primary' && 'bg-primary-500 text-white',
        variant === 'success' && 'bg-emerald-500 text-white',
        variant === 'warning' && 'bg-amber-500 text-white',
        className
      )}
      {...props}
    >
      {displayCount}
    </motion.span>
  );
};

export default Badge;
