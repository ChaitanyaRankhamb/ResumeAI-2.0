# builder (stage first)

# use node js version 20 a lightweight version
FROM node:20-slim AS builder

# use frontend as the working directory. After the compilation, everything will live on this directory
WORKDIR /frontend

# Next.js reads `NEXT_PUBLIC_*` env vars during `next build` and inlines them
# into the client bundle. We set a default so the build always succeeds.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# it will install all the dependencies required for the frontend from package.json and package-lock.json files.
COPY package.json package-lock.json ./

# it will install the dependencies from the package-lock.json file exactly matches version. it is faster that npm install. 
RUN npm ci

# Copy project files . it will copy the code of frontend/application. all files of that project. 
COPY tsconfig.json ./
COPY next-env.d.ts ./
COPY postcss.config.mjs ./
COPY public ./public
COPY src ./src

# Build Next.js app. it use to compile code from TS to JS.
RUN npm run build

# production (stage final)

# fresh node image. 
FROM node:20-slim

# working directory in production stage
WORKDIR /frontend

# sets environment mode
ENV NODE_ENV=production

# it defines the application port where the application will run
ENV PORT=3000

# Keep runtime env aligned with what was used at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install ONLY production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy only required build output

# it copies built next app from builder stage
COPY --from=builder /frontend/.next ./.next

# it copies the static assets 
COPY --from=builder /frontend/public ./public

# Expose port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]