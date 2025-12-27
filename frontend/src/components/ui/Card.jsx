import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Card Component - Glass morphism card with various styles
 * Supports hover effects, gradients, and glow
 */

export const Card = React.forwardRef(({
  children,
  className,
  variant = 'glass',
  hoverable = false,
  gradient = false,
  glow = false,
  ...props
}, ref) => {
  const variantStyles = {
    glass: 'backdrop-blur-xl bg-white/5 border border-white/10',
    solid: 'bg-dark-300 border border-white/5',
    gradient: 'bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border border-primary-500/20',
  };

  const CardComponent = hoverable ? motion.div : 'div';
  const motionProps = hoverable ? {
    whileHover: { y: -4, transition: { duration: 0.2 } },
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={cn(
        'rounded-xl shadow-glass transition-all duration-300',
        variantStyles[variant],
        hoverable && 'hover:shadow-glow cursor-pointer',
        glow && 'shadow-glow',
        gradient && 'bg-gradient-to-br from-primary-900/10 to-secondary-900/10',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

Card.displayName = 'Card';

/**
 * CardHeader - Card header section
 */
export const CardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 border-b border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle - Card title component
 */
export const CardTitle = React.forwardRef(({
  children,
  className,
  gradient = false,
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold',
        gradient ? 'gradient-text' : 'text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription - Card description/subtitle
 */
export const CardDescription = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * CardContent - Main card content area
 */
export const CardContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * CardFooter - Card footer section
 */
export const CardFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 border-t border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

/**
 * StatCard - Special card for displaying statistics
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  className,
  ...props
}) => {
  const colorStyles = {
    primary: 'from-primary-600/20 to-primary-500/10 border-l-primary-500',
    secondary: 'from-secondary-600/20 to-secondary-500/10 border-l-secondary-500',
    success: 'from-emerald-600/20 to-emerald-500/10 border-l-emerald-500',
    danger: 'from-rose-600/20 to-rose-500/10 border-l-rose-500',
    warning: 'from-amber-600/20 to-amber-500/10 border-l-amber-500',
  };

  const iconBgColors = {
    primary: 'bg-primary-500/20',
    secondary: 'bg-secondary-500/20',
    success: 'bg-emerald-500/20',
    danger: 'bg-rose-500/20',
    warning: 'bg-amber-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'backdrop-blur-xl bg-gradient-to-br border border-white/10 rounded-xl p-6',
        'shadow-glass hover:shadow-glow transition-all duration-300',
        'border-l-4',
        colorStyles[color],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-100">{value}</p>
          {(trend || trendValue) && (
            <div className="flex items-center gap-2 mt-2">
              {trend === 'up' && (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trendValue && (
                <span className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', iconBgColors[color])}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Card;
