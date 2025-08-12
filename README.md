# Fuck Freee CheckIn
Auto check in script

## Install
```bash
# Node v19 and up
npm install
npm run install-browsers
```

## Setup
1. Create a `.env` file with your login credentials:
   ```
   LOGIN_USERNAME=your_username@example.com
   LOGIN_PASSWORD=your_password
   ```
2. Config files `checkin.json` and `checkout.json` for check in and check out actions.
3. crontab

## Run
```bash
docker-compose up --build -d
```
