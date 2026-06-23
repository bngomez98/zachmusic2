{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "node dist/server.cjs",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit",
    "migrate": "node scripts/migrate.js"
  }
}
