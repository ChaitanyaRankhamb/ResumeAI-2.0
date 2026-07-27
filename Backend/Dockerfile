# builder (first stage)

# builder stage. This stage installs everything required for the application.
# Also, it will compile the TS code into JS.
FROM node:20-slim AS builder

# it sets working directory inside the container
WORKDIR /backend

# it copies package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# installs dependencies exactly as per lock file (production-reproducible)
RUN npm ci

# copy backend source code required for build
# RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src

# compile TypeScript â†’ JavaScript
RUN npm run build


# production (final image)

# fresh lightweight container for production (no TS, no dev tools)
FROM node:20-slim

# working directory
WORKDIR /backend

# production mode enabled
ENV NODE_ENV=production

# application port
ENV PORT=5000

# install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copy only compiled JS output from builder stage
# RUN npm install --omit=dev
COPY --from=builder /backend/dist ./dist

# create non-root user for security (production best practice)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# switch to non-root user
USER appuser

# expose backend port
EXPOSE 5000

# start application (compiled JS only)
CMD ["node", "dist/app.js"]
