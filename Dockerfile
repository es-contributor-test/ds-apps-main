# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for PostHog config
ARG PUBLIC_POSTHOG_KEY
ARG PUBLIC_POSTHOG_HOST

# Accept build arguments for Supabase PostgREST access (PUBLIC_* are safe to expose)
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY

# Make them available as env vars during build
ENV PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY
ENV PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build (Astro will bake in PUBLIC_* env vars)
RUN npm run build

# Runtime stage - serve static files with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx to listen on port 8080
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    port_in_redirect off; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

