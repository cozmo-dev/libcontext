#Builder stage
FROM oven/bun:1.0 as builder

# Install dependencies
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

COPY . .


RUN bun run build

#production stage
FROM oven/bun:1.0

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN mkdir -p /data/libcontext && \
    chown -R bun:bun /data/libcontext

# Set environment variables
ENV NODE_ENV=production


EXPOSE 3000


USER bun

#entrypoints
ENTRYPOINT ["bun", "run", "dist/index.js"]
CMD ["start", "--transport", "httpStream", "--port", "3000"]