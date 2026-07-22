# Step 1: Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package config files
COPY package.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm install

# Copy source files
COPY . .

# Build both client and server (creates dist/ and dist/server.cjs)
RUN npm run build

# Step 2: Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package.json ./
RUN npm install --only=production

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run the compiled, high-performance production server
CMD ["node", "dist/server.cjs"]
