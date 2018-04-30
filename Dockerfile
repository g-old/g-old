FROM node:8-slim

# Set a working directory
WORKDIR /app

COPY ./build/package*.json .
COPY ./build/yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

# pass drone build args on as env variables
ARG DRONE_BRANCH=
ENV DRONE_BRANCH=${DRONE_BRANCH}
ARG DRONE_BUILD_NUMBER=
ENV DRONE_BUILD_NUMBER=${DRONE_BUILD_NUMBER}

ENV LOGFILE ./logfile
CMD yarn knex --knexfile db/knexfile.js migrate:latest && node server.js -- --release 2>&1 | tee -a $LOGFILE
