import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Loading Components - Skeleton loaders and spinners with shimmer effects
 */

/**
 * Spinner - Animated loading spinner
 */
export const Spinner = ({ size = 'md', className }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <motion.svg
      className={cn(sizeStyles[size], 'animate-spin text-primary-500', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
};

/**
 * LoadingScreen - Full-page loading overlay
 */
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-500/95 backdrop-blur-sm">
      <Spinner size="xl" />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-lg text-gray-300"
      >
        {message}
      </motion.p>
    </div>
  );
};

/**
 * Skeleton - Base skeleton loader
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white/5 rounded-lg shimmer',
        className
      )}
      {...props}
    />
  );
};

/**
 * SkeletonText - Text skeleton with multiple lines
 */
export const SkeletonText = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard - Card skeleton
 */
export const SkeletonCard = ({ className }) => {
  return (
    <div className={cn('backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonTable - Table skeleton
 */
export const SkeletonTable = ({ rows = 5, columns = 5, className }) => {
  return (
    <div className={cn('backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * SkeletonStat - Stat card skeleton
 */
export const SkeletonStat = ({ className }) => {
  return (
    <div className={cn(
      'backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6',
      'border-l-4 border-l-white/20',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * LoadingButton - Button with loading state
 */
export const LoadingDots = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

/**
 * ProgressBar - Animated progress bar
 */
export const ProgressBar = ({ progress = 0, className, showLabel = true }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <span className="text-sm text-gray-400">
            Progress
          </span>
        )}
        <span className="text-sm font-medium text-gray-100">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default Spinner;
