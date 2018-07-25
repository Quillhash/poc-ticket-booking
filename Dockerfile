FROM node:8-alpine
ENV NODE_ENV develop
# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN mkdir -p /usr/app && \
    npm i -g nodemon
WORKDIR /usr/app
VOLUME ["/usr/app"]