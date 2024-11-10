# transfer/Dockerfile
FROM node:16
WORKDIR /app
COPY app.js .
RUN npm install express axios
ENV SERVICE_NAME=transfer
CMD ["node", "app.js"]
