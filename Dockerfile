FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Create log directory
RUN mkdir -p /var/log/auto-checkin

# Copy cron configuration
COPY crontab /etc/cron.d/auto-checkin

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/auto-checkin

# Apply cron job
RUN crontab /etc/cron.d/auto-checkin

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Expose port (optional, for health checks)
EXPOSE 3000

CMD ["/start.sh"]