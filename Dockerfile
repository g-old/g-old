FROM node:8-alpine

# Set a working directory
WORKDIR /app

COPY ./build/package*.json .
COPY ./build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

CMD [ "node", "server.js" ]
