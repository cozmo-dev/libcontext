# ---- Base setup with Bun ----
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ---- Install production dependencies ----
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# ---- Final runtime image ----
FROM base AS runtime

# Use environment variables to redirect config/data to /data
ENV NODE_ENV=production
ENV XDG_CONFIG_HOME=/data
ENV XDG_DATA_HOME=/data
ENV XDG_CACHE_HOME=/data/cache

# Copy built deps
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application files
COPY package.json ./
COPY tsconfig.json ./
COPY migrations/ ./migrations/
COPY src/ ./src/

# Declare volume for persistent app data/config/cache
VOLUME /data
RUN mkdir -p /data && chown -R bun:bun /data

# Set up non-root user for safety
USER bun

# Run the app
ENTRYPOINT ["bun", "run", "start"]
CMD ["start"]
