# Build stage
FROM node:22-alpine AS builder
WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

EXPOSE 3000
CMD ["node","dist/main"]