# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY shared/ /app/shared/
COPY backend/ ./

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app/backend

RUN apk add --no-cache bash

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/drizzle ./drizzle
COPY --from=builder /app/backend/drizzle.config.ts ./
COPY --from=builder /app/backend/start.sh ./
RUN chmod +x start.sh

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./start.sh"]
