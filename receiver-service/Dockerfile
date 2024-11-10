# account/Dockerfile
FROM node:16
WORKDIR /app
COPY app.js .
RUN npm install express
ENV SERVICE_NAME=account
CMD ["node", "app.js"]