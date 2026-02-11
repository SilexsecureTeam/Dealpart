'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientChartProps {
  children: ReactNode;
  height?: number;
  width?: string;
}

export default function ClientChart({ 
  children, 
  height = 320, 
  width = '100%' 
}: ClientChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width, height, background: 'transparent' }} />;
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      {children}
    </div>
  );
}