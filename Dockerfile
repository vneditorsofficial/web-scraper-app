# Use Node.js with Puppeteer support
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Set working directory
WORKDIR /app

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Copy package files
COPY package*.json ./

# Install dependencies (as root user)
USER root
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Create directories for screenshots and output
RUN mkdir -p screenshots output

# Change ownership to pptruser
RUN chown -R pptruser:pptruser /app

# Switch back to non-root user
USER pptruser

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
