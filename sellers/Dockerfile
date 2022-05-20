FROM node:20-alpine3.19
WORKDIR /usr/app/
COPY ./package.json ./
RUN npm install
COPY ./ ./
EXPOSE 8002
CMD ["npm","start"]