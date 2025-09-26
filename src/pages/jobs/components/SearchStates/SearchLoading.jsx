import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * SearchLoading component
 * Displays loading skeletons for search results
 */
const SearchLoading = ({ 
  count = 6,
  compact = false,
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-border animate-pulse">
          <CardContent className={cn("p-6", compact && "p-4")}>
            <div className="flex gap-4">
              {/* Company Logo Skeleton */}
              <Skeleton className={cn(
                "rounded-lg flex-shrink-0",
                compact ? "h-12 w-12" : "h-16 w-16"
              )} />
              
              <div className="flex-1 space-y-3">
                {/* Job Title and Company */}
                <div className="space-y-2">
                  <Skeleton className={cn(
                    "w-3/4",
                    compact ? "h-5" : "h-6"
                  )} />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                
                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                  {!compact && <Skeleton className="h-6 w-16" />}
                </div>
                
                {/* Description (only in non-compact mode) */}
                {!compact && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                )}
                
                {/* Skills (only in non-compact mode) */}
                {!compact && (
                  <div className="flex gap-1 flex-wrap">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-18" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    {!compact && <Skeleton className="h-4 w-18" />}
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className={cn(
                      compact ? "w-16" : "w-20",
                      "h-8"
                    )} />
                    <Skeleton className={cn(
                      compact ? "w-14" : "w-16",
                      "h-8"
                    )} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchLoading;