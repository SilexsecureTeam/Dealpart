'use client';

import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // This will fetch the profile and update auth context on all pages
  const { data: profile, isLoading } = useProfile();
  
  // Log for debugging (optional)
  useEffect(() => {
    if (profile) {
      console.log('Profile loaded globally:', profile);
    }
  }, [profile]);

  return <>{children}</>;
}