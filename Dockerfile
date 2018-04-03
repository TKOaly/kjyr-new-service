FROM alpine:3.5
FROM node:carbon-slim
RUN apk add --no-cache yarn
RUN mkdir /src
WORKDIR /src
ADD . /src/
RUN yarn
RUN yarn install ts-node