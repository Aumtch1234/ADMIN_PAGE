# 1️⃣ Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite project
RUN npm run build

# 2️⃣ Production stage (serve with nginx)
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built files from builder
COPY --from=builder /app/dist ./

# Optional: custom nginx config (for React SPA)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
