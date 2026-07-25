import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: false,
      assetsInlineLimit: 4096,
      rollupOptions: {
        // Vendor splitting is a browser-loading optimisation. In the SSR build
        // these packages are external, and naming an external module in
        // manualChunks is a hard Rollup error — so apply it to the client only.
        output: isSsrBuild
          ? {}
          : {
              manualChunks: {
                'react-vendor': ['react', 'react-dom'],
                'motion-vendor': ['motion'],
                'icons-vendor': ['lucide-react'],
              },
            },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
