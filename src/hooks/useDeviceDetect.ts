import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook to detect viewport device category:
 * - isMobile: < 768px (Tailwind < md)
 * - isTablet: >= 768px and < 1024px (Tailwind md to lg)
 * - isDesktop: >= 1024px (Tailwind >= lg)
 *
 * Listens to window resize events and provides reactive device breakpoints
 * to prevent mounting heavy 3D/canvas/animation DOM elements on mobile.
 */
export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }
    const width = window.innerWidth;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    // Synchronize once on mount
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};

export default useDeviceDetect;
