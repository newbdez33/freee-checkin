#!/bin/bash

# Create necessary directories
mkdir -p /var/log/auto-checkin
mkdir -p /app/screenshots

# Start cron daemon
echo "Starting cron daemon..."
service cron start

# Keep container running and show logs
echo "Auto check-in service started!"
echo "Check-in scheduled at 10:00 AM daily"
echo "Check-out scheduled at 20:00 PM daily"
echo "Logs will be available in /var/log/auto-checkin/"
echo ""
echo "Container is running. Press Ctrl+C to stop."

# Tail the log files to keep container alive and show output
tail -f /var/log/auto-checkin/*.log /var/log/cron.log 2>/dev/null || (
    echo "Waiting for log files to be created..."
    sleep 30
    tail -f /var/log/auto-checkin/*.log /var/log/cron.log 2>/dev/null || sleep infinity
)