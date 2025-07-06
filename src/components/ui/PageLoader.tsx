import { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
    </div>
  );
}

// BarLoader component for NProgress
export function BarLoader() {
  const { loading } = useLoading();
  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
    return () => {
      NProgress.done();
    };
  }, [loading]);
  return null;
}

// Global Loading Context
const LoadingContext = createContext({ loading: false, setLoading: (v: boolean) => {} });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
} 