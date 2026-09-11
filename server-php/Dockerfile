# Production Dockerfile for CreatorHub PHP 8.2+ Backend
FROM php:8.2-cli-alpine

# Set working directory
WORKDIR /app

# Install system dependencies & SQLite development headers
RUN apk add --no-cache \
    sqlite-dev \
    curl \
    libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite

# Copy backend files and SQLite database
COPY server-php/ ./server-php/
COPY server/data/ ./server/data/
COPY .env.example ./.env

# Ensure proper permissions for SQLite WAL write access
RUN chmod -R 777 ./server/data

# Expose default port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV APP_ENV=production

# Start PHP built-in server with router
CMD ["php", "-S", "0.0.0.0:5000", "-t", "server-php", "server-php/router.php"]
