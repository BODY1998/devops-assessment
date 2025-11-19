# build the application image
FROM node:lts-alpine

WORKDIR /app

# copy only the package.json to leverage Docker cache
COPY package.json .

# install only production dependencies
RUN npm install --production

# copy only necessary files of the application code
COPY server.js .

EXPOSE 8080

CMD ["npm", "start"]