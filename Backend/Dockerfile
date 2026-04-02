# builder (first stage)

# builder stage. This stage install everything required to the application. Also, it will compile the TS code into JS.

# use node js version 20 a lightweight version
FROM node:20-slim AS builder 

# it sets working directory to app inside the container that means all the next commands run inside this /app directory
WORKDIR /backend

# it copies all the required dependencies for the backend from the package.json and package-lock.json file
COPY package.json package-lock.json ./

# it install dependencies exactly package-lock.json. it is faster that npm install also it ensures that dependencies must have same version every time. good for production 
RUN npm ci

# it copies the typescript configuration and the source code of the backend required to build the backend of application
COPY tsconfig.json ./
COPY src ./src

# this command is use to convert the TS code into JS code. 
RUN npm run build 

# production (final image)

#starts a fresh container here no need of dev tools, no TS or no build juck. For more security
FROM node:20-slim

# working directory will be same
WORKDIR /backend

# it sets environment variable. It will run in production mode & use to enable optimization
ENV NODE_ENV=production

# copy package files
COPY package.json package-lock.json ./

# it will install only the production dependencies. It won't install dev dependencies. Build already did it. So, the size of the image becomes smaller and speed becomes faster. It make app more secure. 
RUN npm ci --omit=dev

# it copies the compiled code built by builder stage. Only copies the final js built code. skips TS code. saves memery.
COPY --from=builder /backend/dist ./dist

# it will tell developers the application/backend is running on port 4000. not mandotory but good practise.
EXPOSE 4000

# it starts the app. it will run the compiled JS built by builder stage. No tsx and ts-node. only node.js
CMD ["node", "dist/app.js"]