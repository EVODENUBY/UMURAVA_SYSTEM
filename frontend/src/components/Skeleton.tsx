"use client";

import { motion } from 'framer-motion';

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-200" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-5/6 bg-slate-100 rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-14 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

export function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <JobCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}