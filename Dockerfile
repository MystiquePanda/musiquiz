# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app/musiquiz

ARG bt_mongodb_pass
ARG bt_spotify_secret
ARG bt_base_uri
ARG bt_sess_secret
ENV MQ_MONGODB_PASS=$bt_mongodb_pass MQ_SPOTIFY_SECRET=$bt_spotify_secret MQ_BASE_URI=$bt_base_uri MQ_SESS_SECRET=$bt_sess_secret 


# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY . .
RUN yarn install --production
RUN yarn build:all

# Copy built file to container image

# Run the web service on container startup.
CMD [ "yarn", "prod:start" ]
