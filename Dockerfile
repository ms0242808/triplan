# syntax=docker/dockerfile:1.7

# 1. Build the frontend (Vite + React + Tailwind v4)
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Build the backend (TypeScript -> dist/)
FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./
RUN npm run build

# 3. Production image: backend dist + node_modules + bundled frontend
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=backend-build  /app/backend/dist     ./dist
COPY --from=backend-build  /app/backend/migrations ./migrations
COPY --from=frontend-build /app/frontend/dist    ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
