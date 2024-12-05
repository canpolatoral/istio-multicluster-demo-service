FROM node:16
WORKDIR /app
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the application source code
COPY app.js .
# Run the application
CMD ["node", "app.js"]