import React, { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';

export function PageLoader() {
  const loading = useAppSelector((state: RootState) => state.ui.globalLoading);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-colors duration-500">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
      <p className="mt-4 text-sm font-medium text-foreground animate-pulse">Loading amazing things...</p>
    </div>
  );
}