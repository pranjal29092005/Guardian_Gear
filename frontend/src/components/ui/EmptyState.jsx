import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';

/**
 * EmptyState Component - Beautiful empty state displays
 * Shows when there's no data to display with helpful CTAs
 */

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'py-16 px-4 text-center',
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <Icon className="w-16 h-16 text-gray-400" />
        </motion.div>
      )}

      {/* Title */}
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-gray-100 mb-2"
        >
          {title}
        </motion.h3>
      )}

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 max-w-md mb-6"
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && actionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={action}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Predefined empty states for common scenarios
 */

export const NoDataFound = ({ action, actionLabel }) => {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      title="No Data Found"
      description="We couldn't find any items to display. Try adjusting your filters or create a new item."
      action={action}
      actionLabel={actionLabel}
    />
  );
};

export const NoEquipmentFound = ({ action }) => {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      title="No Equipment Found"
      description="Start managing your equipment by adding your first item. Track maintenance, assign technicians, and monitor status all in one place."
      action={action}
      actionLabel="Add Equipment"
    />
  );
};

export const NoRequestsFound = ({ action }) => {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )}
      title="No Maintenance Requests"
      description="No maintenance requests found. Create a new request to track equipment repairs and preventive maintenance."
      action={action}
      actionLabel="Create Request"
    />
  );
};

export const NoSearchResults = ({ searchTerm, onClear }) => {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
      title="No Results Found"
      description={`No results found for "${searchTerm}". Try different keywords or clear your search.`}
      action={onClear}
      actionLabel="Clear Search"
    />
  );
};

export const ErrorState = ({ onRetry }) => {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      title="Something Went Wrong"
      description="We encountered an error while loading the data. Please try again."
      action={onRetry}
      actionLabel="Retry"
    />
  );
};

export default EmptyState;
