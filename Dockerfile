# Multi-stage build for production deployment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install necessary packages
RUN apk add --no-cache nginx-nchan supervisor

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --production=false && \
    npm cache clean --force

# Copy server files
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/data/trucks/images /var/log/supervisor /etc/nginx/sites-available /etc/nginx/sites-enabled

# Configure Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose ports
EXPOSE 3000 3001 80

# Start supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
