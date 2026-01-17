# Freee check-in
Automated Freee attendance actions (check-in, check-out, break start/end) using a Playwright-powered Node.js CLI, scheduled via cron inside a Docker container. Skips weekends and Japanese national holidays.

## Features
- Automatic check-in/check-out and break actions on weekdays
- Japanese holiday detection for 2025–2026
- Weekend skipping (Monday–Friday only)
- Dockerized runtime with cron scheduling
- Kubernetes manifests for cluster deployment
- Logs and screenshots persisted to host volumes

## Tech Stack
- Node.js (ES modules), CLI via Commander
- Playwright (Chromium)
- Dotenv for environment variables
- Docker, Docker Compose
- Kubernetes Deployment/Namespace/PVCs

## Quick Start (Docker Compose)
1. Create a `.env` file:
   ```
   LOGIN_USERNAME=your_username@example.com
   LOGIN_PASSWORD=your_password
   ```
2. Start:
   ```bash
   docker-compose up --build -d
   ```
3. Logs:
   ```bash
   docker-compose logs -f auto-checkin
   ```
4. Screenshots and logs are available on the host:
   - logs → ./logs
   - screenshots → ./screenshots

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browsers:
   ```bash
   npm run install-browsers
   ```
3. Set environment variables (or use `.env`):
   ```
   LOGIN_USERNAME=...
   LOGIN_PASSWORD=...
   ```
4. Run a task:
   ```bash
   node index.js run checkin.json
   node index.js run checkout.json
   node index.js run break-start.json
   node index.js run break-end.json
   ```
5. CLI help:
   ```bash
   node index.js --help
   ```

## Configuration
- Environment variables are read from `.env`:
  - LOGIN_USERNAME
  - LOGIN_PASSWORD
- Timezone defaults to Asia/Tokyo inside the container.
- Task JSON files define actions:
  - [checkin.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/checkin.json)
  - [checkout.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/checkout.json)
  - [break-start.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/break-start.json)
  - [break-end.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/break-end.json)

## Cron Schedule
- Weekdays only:
  - 10:00 check-in
  - 12:00 break start
  - 13:00 break end
  - 20:00 check-out
- Edit schedule in [crontab](file:///c:/Users/newbd/projects/fuck-freee-checkin/crontab). Rebuild the image after changes.

## Holiday Management
- Holidays are defined in [index.js](file:///c:/Users/newbd/projects/fuck-freee-checkin/index.js#L13-L56).
- To extend to more years, update `JAPANESE_HOLIDAYS` and rebuild.
- Execution is skipped on holidays and weekends.

## Kubernetes Deployment
Prerequisites:
- A Kubernetes cluster and `kubectl` configured.

1. Namespace:
   ```powershell
   kubectl apply -f k8s/00-namespace.yaml
   ```
2. Persistent storage:
   ```powershell
   kubectl apply -f k8s/01-pvc.yaml
   ```
   Adjust `storageClassName` to your cluster if needed.
3. Secret (environment file mounted as `.env`):
   - Copy and edit:
     - [k8s/02-secret.example.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/02-secret.example.yaml) → `k8s/02-secret.yaml`
   - Apply:
     ```powershell
     kubectl apply -f k8s/02-secret.yaml
     ```
4. Deployment:
   ```powershell
   kubectl apply -f k8s/03-deployment.yaml
   ```
5. Observe:
   ```powershell
   kubectl get pods -n fuck-checkin
   kubectl logs deploy/fuck-checkin -n fuck-checkin -f --tail=200
   ```

## Maintenance
- Rebuild after code changes:
  ```bash
  docker-compose down && docker-compose build && docker-compose up -d
  ```
- View specific log files:
  ```bash
  docker-compose exec auto-checkin tail -f /var/log/auto-checkin/checkin.log
  ```

## TrueNAS SCALE
- Create datasets for persistence, for example:
  - /mnt/tank/apps/auto-checkin/logs
  - /mnt/tank/apps/auto-checkin/screenshots
- Option A: Apps → Launch Docker Image
  - Image: ghcr.io/newbdez33/freee-checkin:latest
  - Environment:
    - TZ=Asia/Tokyo
    - NODE_ENV=production
    - LOGIN_USERNAME=your_username@example.com
    - LOGIN_PASSWORD=your_password
  - Host path mounts:
    - /mnt/tank/apps/auto-checkin/logs → /var/log/auto-checkin
    - /mnt/tank/apps/auto-checkin/screenshots → /app/screenshots
  - Deploy and check logs from the app details page.
- Option B: Apps → Docker Compose
  - Use a simplified compose with the published image:
    ```yaml
    services:
      auto-checkin:
        image: ghcr.io/newbdez33/freee-checkin:latest
        container_name: auto-checkin-app
        restart: unless-stopped
        environment:
          TZ: Asia/Tokyo
          NODE_ENV: production
          LOGIN_USERNAME: your_username@example.com
          LOGIN_PASSWORD: your_password
        volumes:
          - /mnt/tank/apps/auto-checkin/logs:/var/log/auto-checkin
          - /mnt/tank/apps/auto-checkin/screenshots:/app/screenshots
    ```
  - Deploy. Cron inside the container will execute tasks at the configured times.
- Updates
  - Launch Docker Image: Redeploy the app to pull the latest image.
  - Docker Compose: Pull and redeploy the stack from the app page.
- Notes
  - Playwright images are large; ensure sufficient space on the node.
  - Timezone is set via TZ; schedules run in Asia/Tokyo by default.

## Key Files
- Entry/CLI: [index.js](file:///c:/Users/newbd/projects/fuck-freee-checkin/index.js)
- Compose: [docker-compose.yml](file:///c:/Users/newbd/projects/fuck-freee-checkin/docker-compose.yml)
- Dockerfile: [Dockerfile](file:///c:/Users/newbd/projects/fuck-freee-checkin/Dockerfile)
- Cron: [crontab](file:///c:/Users/newbd/projects/fuck-freee-checkin/crontab), runner [run-cron.sh](file:///c:/Users/newbd/projects/fuck-freee-checkin/run-cron.sh), startup [start.sh](file:///c:/Users/newbd/projects/fuck-freee-checkin/start.sh)
- Kubernetes: [00-namespace.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/00-namespace.yaml), [01-pvc.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/01-pvc.yaml), [03-deployment.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/03-deployment.yaml)

## License
MIT (see [package.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/package.json))
