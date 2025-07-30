import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base public path when served in production (CDN URL)
  base: mode === 'production' ? process.env.VITE_CDN_URL || '/' : '/',
  
  plugins: [
    react(),
    ViteImageOptimizer({
      // Convert formats to webp by default
      webp: {
        quality: 90,
        lossless: false,
        effort: 6, // 0 (fastest) - 6 (slowest)
      },
      
      // JPG/JPEG settings
      jpg: {
        quality: 85,
        mozjpeg: true,
      },
      jpeg: {
        quality: 85,
        mozjpeg: true,
      },
      
      // PNG settings
      png: {
        quality: 85,
        compressionLevel: 9,
      },
      
      // Cache optimized images
      cache: true,
      cacheLocation: './node_modules/.vite-image-cache',
      
      // Enable detailed logging in development
      logStats: process.env.NODE_ENV === 'development',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{js,css,html,ico,png,svg,webp}'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|webp|svg|gif)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configure build settings
  build: {
    // Generate source maps for better debugging in development
    sourcemap: mode !== 'production',
    
    // Minify the production build
    minify: mode === 'production' ? 'esbuild' : false,
    
    // Configure chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Add content hashes to filenames for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    
    // Configure Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
  
  // Configure development server
  server: {
    headers: {
      // Enable caching for assets in development
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // Configure preview server (for production build testing)
  preview: {
    headers: {
      // Enable caching for assets in preview
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
}));
