# ==============================================================================
# HeapLens Multi-Stage Production Dockerfile (Optimized for Render Web Services)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build C++ Allocator Engine and Vite React Frontend
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install native compilation dependencies for C++17
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests and install reproducible dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy full application source files
COPY bridge/ ./bridge/
COPY src/ ./src/
COPY src-ui/ ./src-ui/
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY index.html tsconfig.json vite.config.ts ./

# Compile native C++17 allocator engine binary for Linux
RUN mkdir -p build && \
    g++ -std=c++17 -O3 -Wall -Wextra src/allocator.cpp src/main.cpp -o build/heaplens_engine && \
    chmod +x build/heaplens_engine

# Compile React frontend for production
RUN npx vite build

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV HOST=0.0.0.0
ENV HEAPLENS_ENGINE_PATH=/app/build/heaplens_engine

# Copy compiled Linux C++ engine binary from builder
COPY --from=builder /app/build/heaplens_engine /app/build/heaplens_engine

# Copy compiled Vite production bundle from builder
COPY --from=builder /app/dist /app/dist

# Copy Node.js HTTP bridge server and package manifest
COPY --from=builder /app/bridge /app/bridge
COPY --from=builder /app/package.json /app/package.json

# Set file permissions for the built-in node user
RUN chmod +x /app/build/heaplens_engine && \
    chown -R node:node /app

# Run as non-root user for security
USER node

# Expose Render standard port
EXPOSE 10000

# Start unified production server (serves frontend static assets + C++ REST API)
CMD ["node", "bridge/server.js"]
