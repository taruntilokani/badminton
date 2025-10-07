# Admin App Dockerfile
FROM node:18-alpine

# Create a non-root user and switch to it
RUN addgroup --gid 1001 nodeuser \
    && adduser --uid 1001 --ingroup nodeuser --shell /bin/sh --disabled-password --gecos "" nodeuser

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Change ownership of the /app directory to nodeuser
RUN chown -R nodeuser:nodeuser /app

# Switch to the non-root user
USER nodeuser

EXPOSE 3003
CMD ["npm", "start"]
