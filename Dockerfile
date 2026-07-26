# Persistent Node server image. Works on Render, Railway, Fly.io, or any host
# that runs a container. Multi-stage so the runtime image carries no build
# tooling (Vite, esbuild, TypeScript) and no dev dependencies.

# ---------- build ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# Explicit --include=dev so the build still gets its tooling if NODE_ENV is
# ever set to production in the build environment; npm omits devDependencies
# when it sees that.
RUN npm ci --include=dev

COPY . .
# Builds the client, the SSR bundle, injects prerendered HTML, then bundles the server.
RUN npm run build

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Production dependencies only.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Only the build outputs + env.production; source and build tooling stay behind.
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/env.production ./env.production

# Drop root.
USER node

EXPOSE 3000

# Container-native health check; the platform can also poll /healthz directly.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist-server/server.js"]
