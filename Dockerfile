# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/hub-api/package.json ./apps/hub-api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/risk-contract/package.json ./packages/risk-contract/

RUN pnpm install --frozen-lockfile

COPY apps/hub-api/ ./apps/hub-api/
COPY packages/shared/ ./packages/shared/
COPY packages/risk-contract/ ./packages/risk-contract/

RUN cd apps/hub-api && npx prisma generate
RUN cd apps/hub-api && pnpm build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS runner

# Run as non-root user (CWE-250)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/hub-api/package.json ./apps/hub-api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/risk-contract/package.json ./packages/risk-contract/

RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema + migrations (needed for migrate deploy at startup)
COPY apps/hub-api/prisma/ ./apps/hub-api/prisma/

COPY --from=builder /app/apps/hub-api/dist ./apps/hub-api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY apps/hub-api/start.sh ./apps/hub-api/start.sh
RUN chmod +x ./apps/hub-api/start.sh

# Transfer ownership to non-root user
RUN chown -R appuser:appgroup /app

WORKDIR /app/apps/hub-api

USER appuser

EXPOSE 3000

CMD ["sh", "start.sh"]
