FROM node:8-slim

# Set a working directory
WORKDIR /app

COPY ./build/package*.json .
COPY ./build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

ENV LOGFILE ./logfile
CMD node server.js -- --release >> $LOGFILE 2>&1
