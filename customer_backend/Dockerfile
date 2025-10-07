# Use an official Node.js runtime as a parent image
FROM taruntilokani/badminton:customer-backend

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
# Bundle app source
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD [ "node", "server.js" ]
