import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
    </div>
  );
} 