FROM node:20-alpine3.19
WORKDIR /usr/app/
COPY ./package.json ./
RUN npm install
COPY ./ ./
CMD ["npm","start"]