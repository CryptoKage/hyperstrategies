// src/hooks/useIsIOS.js
import { useState, useEffect } from 'react';

export default function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // A reliable way to detect iPhone, iPad, or iPod
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);
  }, []);

  return { isIOS };
}