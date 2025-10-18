# -------- Stage 1: Build the frontend ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # output goes to /app/dist or build folder depending on your config


# -------- Stage 2: Nginx to serve static files ----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built project from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optional nginx configuration (for custom ports, routing, SPA support)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Default port Nginx listens on
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
