FROM node:18-alpine

LABEL maintainer="Henri Aïdasso <ahenrij@gmail.com>"
LABEL name="darkpearl/chat-service"
LABEL version="0.0.1"

EXPOSE 1337

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install -g npm@latest

RUN npm ci --only=production

# Bundle app source
COPY . .

CMD ["node", "app.js", "--prod"]