# Backend API Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY ./backend/package*.json ./
RUN npm install
RUN npm install multer # Add multer installation here
COPY . .
EXPOSE 4000
CMD ["node", "backend/server.js"]
