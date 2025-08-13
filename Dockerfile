FROM mcr.microsoft.com/playwright:v1.54.2-jammy

WORKDIR /app

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install cron
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y cron tzdata && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy application files
COPY . .

# Install dependencies
RUN npm install
RUN npm run install-browsers

# Install Playwright browsers
# RUN npx playwright install --with-deps chromium

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
RUN chmod +x /app/run-cron.sh

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Expose port (optional, for health checks)
EXPOSE 3000

CMD ["/start.sh"]