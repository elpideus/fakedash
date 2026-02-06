FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy the the application
COPY . .

# Ports are documented here, but driven by Compose
EXPOSE 5173
EXPOSE 3001

CMD ["npm", "run", "dev+api"]