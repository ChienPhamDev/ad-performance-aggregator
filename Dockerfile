# Use Node.js 18 slim as base image for a small footprint
FROM node:18-slim

# Create and set the working directory
WORKDIR /usr/src/app

# Install unzip and other utilities
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Copy and setup the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create results directory
RUN mkdir -p results

# Use the entrypoint script to handle pre-run tasks (like unzipping)
ENTRYPOINT ["docker-entrypoint.sh", "node", "aggregator.js"]

# Provide default arguments
CMD ["--input", "ad_data.csv", "--output", "results/", "--parallel"]
