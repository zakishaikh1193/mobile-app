import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

// Function to generate a tiny blurred image as a placeholder
const toBase64 = (str: string) => {
  if (typeof window === 'undefined') return '';
  return window.btoa(unescape(encodeURIComponent(str)));
};

const createBlurSvg = (width: number, height: number, color: string = '#e5e7eb') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' fill='${color}'/></svg>`;
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  isBackground?: boolean;
  lazy?: boolean;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholderSrc,
  isBackground = false,
  lazy = true,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle lazy loading with Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined' || !lazy) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when within 200px of viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy]);

  // Load the actual image when in view or src changes
  useEffect(() => {
    if (!isInView) return;
    
    let isMounted = true;
    const img = new window.Image();
    
    const handleLoad = () => {
      if (!isMounted) return;
      setImageSrc(src);
      setIsLoaded(true);
    };

    // Set up event listeners before setting src
    img.src = src;
    const loadEvent = 'decode' in img ? 'decode' : 'load';
    
    if (loadEvent === 'decode' && typeof img.decode === 'function') {
      img.decode()
        .then(handleLoad)
        .catch(() => {
          if (!isMounted) return;
          console.log('🖼️ Image failed to load, using placeholder');
          setImageSrc(placeholderSrc || '');
          setIsLoaded(false);
        });
    } else {
      img.onload = handleLoad;
      img.onerror = () => {
        if (!isMounted) return;
        console.log('🖼️ Image failed to load, using placeholder');
        setImageSrc(placeholderSrc || '');
        setIsLoaded(false);
      };
    }

    // Cleanup function
    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
      img.src = ''; // Cancel any in-progress requests
    };
  }, [src, isInView, placeholderSrc]);
  
  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  // Generate blur placeholder if not provided
  const blurPlaceholder = useMemo(() => {
    if (props.blurDataURL) return props.blurDataURL;
    if (placeholderSrc) return placeholderSrc;
    
    // Default dimensions for placeholder
    const width = typeof props.width === 'number' ? props.width : 400;
    const height = typeof props.height === 'number' ? props.height : 300;
    return createBlurSvg(width, height);
  }, [props.blurDataURL, placeholderSrc, props.width, props.height]);

  // For background images
  if (isBackground) {
    return (
      <div 
        className={`${containerClassName} ${!isLoaded ? 'bg-gray-100' : ''}`}
        ref={imgRef as React.RefObject<HTMLDivElement>}
        style={{
          backgroundImage: `url(${isLoaded ? imageSrc : blurPlaceholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background-image 0.3s ease-in-out',
          ...(props.style || {}),
        }}
        data-loaded={isLoaded}
      >
        {props.children}
      </div>
    );
  }

  // For regular images
  return (
    <div className={`relative ${containerClassName}`} ref={imgRef as React.RefObject<HTMLDivElement>}>
      {/* Blurred placeholder */}
      {!isLoaded && blurPlaceholder && (
        <img
          src={blurPlaceholder}
          alt={`${alt} (loading...)`}
          className={`${className} w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            filter: 'blur(10px)',
            transform: 'scale(1.05)', // Slightly larger to prevent white edges
            ...props.style,
          }}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <motion.img
          src={imageSrc || blurPlaceholder}
          alt={alt}
          className={`${className} w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={lazy ? 'lazy' : 'eager'}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onLoad={() => {
            setIsLoaded(true);
          }}
          onError={() => {
            console.error(`Failed to load image: ${src}`);
            if (blurPlaceholder) setImageSrc(blurPlaceholder);
          }}
          style={props.style}
          {...(props as any)} // Type assertion to handle motion props
        />
      )}
    </div>
  );
};

export default OptimizedImage;
