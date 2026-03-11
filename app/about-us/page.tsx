// app/about-us/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AboutUsData {
  id: number;
  heading: string;
  content: string;
  founder_name: string;
  founder_title: string;
  founder_image: string | null;
  is_active: boolean;
}

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState<AboutUsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://admin.bezalelsolar.com/api/about-us', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }

        const result = await response.json();
        console.log('About Us API response:', result);
        
        // Extract data from the response structure
        if (result.data) {
          setAboutUs(result.data);
        } else if (result) {
          setAboutUs(result);
        } else {
          setAboutUs(null);
        }
        
      } catch (err: any) {
        console.error('Error fetching about us:', err);
        setError(err.message || 'Failed to load about us');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Construct full image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://admin.bezalelsolar.com/storage/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#4EA674] mx-auto mb-4" />
          <p className="text-gray-600">Loading about us...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutUs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Our about us page is currently being updated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with site gradient */}
      <div className="bg-gradient-to-r from-[#c0f5b4] to-[#2a6b4a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {aboutUs.heading || 'About Us'}
          </h1>
          <div className="w-20 h-1 bg-white mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
              {aboutUs.content}
            </p>
          </div>

          {/* Founder Section */}
          {aboutUs.founder_name && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Meet Our Founder
              </h2>
              <div className="flex flex-col items-center text-center">
                {aboutUs.founder_image && (
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-[#4EA674]">
                    <img
                      src={getImageUrl(aboutUs.founder_image) || ''}
                      alt={aboutUs.founder_name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.log('Image failed to load:', e.currentTarget.src);
                        // Hide the broken image
                        e.currentTarget.style.display = 'none';
                        // Show a fallback
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gray-100 flex items-center justify-center';
                          fallback.innerHTML = '<span class="text-3xl text-gray-400">👤</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {aboutUs.founder_name}
                </h3>
                <p className="text-[#4EA674] font-medium mt-1">
                  {aboutUs.founder_title}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}