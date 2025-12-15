import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
};

export const GuestCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 h-full flex flex-col gap-3 relative overflow-hidden">
      <div className="flex justify-between items-start">
          <div className="space-y-2 w-3/4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full opacity-50" />
      <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center gap-2">
          <div className="flex flex-col gap-1 w-full">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
          </div>
          <Skeleton className="w-8 h-8 rounded-md" />
      </div>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);