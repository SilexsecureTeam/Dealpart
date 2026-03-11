// hooks/useAboutUs.ts
import { useState, useEffect } from 'react';

export interface AboutUsData {
  id: number;
  heading: string;
  content: string;
  founder_name: string;
  founder_title: string;
  founder_image: string | null;
  is_active: boolean;
}

export const useAboutUs = () => {
  const [data, setData] = useState<AboutUsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://admin.bezalelsolar.com/api/about-us', {
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }

        const result = await response.json();
        
        // Extract data from response
        if (result.data) {
          setData(result.data);
        } else if (result) {
          setData(result);
        } else {
          setData(null);
        }
        
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Helper to get full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://admin.bezalelsolar.com/storage/${imagePath}`;
  };

  return { 
    data, 
    isLoading, 
    error,
    getImageUrl 
  };
};