FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install --production

LABEL name="kaven-public-api" \
    author="Kaven" \
    email="kaven@wuwenkai.com" \
    version="1.0.0" \
    description="A simple public http server."

EXPOSE 80:80
CMD [ "node", "server.js" ]
