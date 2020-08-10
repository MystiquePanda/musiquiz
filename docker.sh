#!/bin/bash
echo "**for dev / local docker testing purpose only"

function runDocker {
case $1 in 
    "start")
       docker run -p 8080:8080 --rm -it mp/musiquiz
       ;;
    "build")
       docker build --build-arg bt_mongodb_pass="${MQ_MONGODB_PASS}" --build-arg bt_spotify_secret="${MQ_SPOTIFY_SECRET}" --build-arg bt_sess_secret="${MQ_SESS_SECRET}" --build-arg bt_base_uri="${MQ_BASE_URI}" -t mp/musiquiz .
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
