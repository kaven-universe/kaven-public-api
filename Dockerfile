FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install --omit=dev

LABEL name="kaven-public-api" \
    author="Kaven" \
    email="kaven@wuwenkai.com" \
    version="1.0.1" \
    description="Lightweight Node.js API for resolving client external IP over HTTP and Kaven protocol"

EXPOSE 80
CMD [ "node", "server.js" ]
