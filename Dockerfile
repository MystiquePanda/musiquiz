# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app/musiquiz

ARG bt_mongodb_cluster
ARG bt_mongodb_user
ARG bt_mongodb_pass
ARG bt_spotify_client
ARG bt_spotify_secret
ARG bt_base_uri
ARG bt_sess_secret
ARG bt_email
ARG bt_email_pass
ENV MQ_MONGODB_CLUSTER=$bt_mongodb_cluster MQ_MONGODB_USER=$bt_mongodb_user MQ_MONGODB_PASS=$bt_mongodb_pass MQ_SPOTIFY_SECRET=$bt_spotify_secret MQ_SPOTIFY_CLIENT=$bt_spotify_client MQ_BASE_URI=$bt_base_uri MQ_SESS_SECRET=$bt_sess_secret MQ_EMAIL=$bt_email MQ_EMAIL_PASS=$bt_email_pass


# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY . .
RUN yarn install --production
RUN yarn build:all

# Copy built file to container image

# Run the web service on container startup.
CMD [ "yarn", "prod:start" ]
