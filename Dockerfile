# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for PostHog config
ARG PUBLIC_POSTHOG_KEY
ARG PUBLIC_POSTHOG_HOST

# Accept build arguments for Supabase PostgREST access (PUBLIC_* are safe to expose)
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY

# Accept GitHub token for fetching build-with-me data
ARG GITHUB_TOKEN

# Make them available as env vars during build
ENV PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY
ENV PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV GITHUB_TOKEN=$GITHUB_TOKEN

# Install pnpm globally (version 10 to match lockfile)
RUN npm install -g pnpm@10

# Copy workspace and package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ab-simulator/package.json ./packages/ab-simulator/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build (Astro will bake in PUBLIC_* env vars)
RUN pnpm run build

# Runtime stage - serve static files with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx to listen on port 8080 with subpath routing
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    port_in_redirect off; \
    \
    # Main portfolio site \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # AB Simulator subpath \
    location /ab-simulator/ { \
        try_files $uri $uri/ /ab-simulator/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

