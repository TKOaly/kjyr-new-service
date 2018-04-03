FROM node:alpine
RUN apk add --no-cache git
RUN apk add --no-cache yarn
RUN mkdir /src
WORKDIR /src
ADD . /src/
RUN yarn
RUN yarn install ts-node