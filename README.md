# Fuck Freee CheckIn
Auto check in script with Japanese holiday detection

## Features
- ⏰ Automatic check-in/check-out scheduling
- 🎌 Japanese holiday detection (2024-2026)
- 📅 Weekend skipping (Monday-Friday only)
- 🐳 Docker containerized deployment

## Setup
1. Create a `.env` file with your login credentials:
   ```
   LOGIN_USERNAME=your_username@example.com
   LOGIN_PASSWORD=your_password
   ```
2. Update the crontab for checkin and checkout time.

## Run
```bash
docker-compose up --build -d
```

## Development & Updates

### After Code Changes
When you update the code (e.g., adding new holidays, modifying logic), you need to rebuild and restart the Docker container:

```bash
# Stop the current container
docker-compose down

# Rebuild the image with updated code
docker-compose build

# Start the container with the new image
docker-compose up -d

# Check container status
docker-compose ps
```

### Quick Restart (Alternative)
```bash
# One-liner to rebuild and restart
docker-compose down && docker-compose build && docker-compose up -d
```

### View Logs
```bash
# View container logs
docker-compose logs -f auto-checkin

# View specific log files
docker-compose exec auto-checkin tail -f /var/log/auto-checkin/checkin.log
```

## Holiday Management
The system automatically skips execution on:
- **Weekends** (Saturday & Sunday)
- **Japanese National Holidays** (2025-2026)

To add more years or modify holidays, update the `JAPANESE_HOLIDAYS` object in `index.js` and rebuild the container.
