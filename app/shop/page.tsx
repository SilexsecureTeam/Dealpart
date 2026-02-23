import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ShopContent from './ShopContent';

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EAF8E7]/50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}