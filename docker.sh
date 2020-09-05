#!/bin/bash
echo "**for dev / local docker testing purpose only"

function runDocker {
case $1 in 
    "start")
       docker run -p 8080:8080 --rm -it mp/musiquiz
       ;;
    "build")
       docker build --build-arg bt_mongodb_pass="${MQ_MONGODB_PASS}" --build-arg bt_mongodb_cluster="${MQ_MONGODB_CLUSTER}" --build-arg bt_mongodb_user="${MQ_MONGODB_USER}" --build-arg bt_spotify_secret="${MQ_SPOTIFY_SECRET}" --build-arg bt_spotify_client="${MQ_SPOTIFY_CLIENT}" --build-arg bt_sess_secret="${MQ_SESS_SECRET}" --build-arg bt_base_uri="${MQ_BASE_URI}" --build-arg bt_email="${MQ_EMAIL}" --build-arg bt_email_pass="${MQ_EMAIL_PASS}" -t mp/musiquiz .
       ;;
    "all")
       runDocker "build"
       runDocker "start"
       ;;
    *)
       echo "Invalid option"
       ;;
esac
}

runDocker $1
