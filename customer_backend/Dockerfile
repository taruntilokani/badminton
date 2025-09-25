# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies, including multer and express
RUN npm install multer express

# Create the uploads directory and set ownership
RUN mkdir -p /usr/src/app/uploads && chown node:node /usr/src/app/uploads

# Bundle app source
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD [ "node", "server.js" ]
