# Freee check-in（中文）
使用基于 Playwright 的 Node.js CLI 在 Docker 容器内通过 cron 定时执行 Freee 考勤操作（上班、下班、休息开始/结束）。自动跳过周末与日本法定节假日。

## 功能
- 工作日自动执行上班/下班与休息相关动作
- 支持 2025–2026 日本节假日识别
- 周末跳过（仅周一至周五执行）
- Docker 化运行，容器内 cron 定时调度
- 提供 Kubernetes 清单，支持集群部署
- 日志与截图挂载到宿主机持久化

## 技术栈
- Node.js（ES Modules），命令行框架使用 Commander
- Playwright（Chromium）
+- dotenv 管理环境变量
+- Docker、Docker Compose
+- Kubernetes Deployment/Namespace/PVCs

## 快速开始（Docker Compose）
1. 在项目根目录创建 `.env`：
   ```
   LOGIN_USERNAME=your_username@example.com
   LOGIN_PASSWORD=your_password
   ```
2. 启动：
   ```bash
   docker-compose up --build -d
   ```
3. 查看日志：
   ```bash
   docker-compose logs -f auto-checkin
   ```
4. 宿主机上的持久化目录：
   - 日志 → ./logs
   - 截图 → ./screenshots

## 本地开发
1. 安装依赖：
   ```bash
   npm install
   ```
2. 安装 Playwright 浏览器：
   ```bash
   npm run install-browsers
   ```
3. 设置环境变量（或使用 `.env`）：
   ```
   LOGIN_USERNAME=...
   LOGIN_PASSWORD=...
   ```
4. 运行任务：
   ```bash
   node index.js run checkin.json
   node index.js run checkout.json
   node index.js run break-start.json
   node index.js run break-end.json
   ```
5. CLI 帮助：
   ```bash
   node index.js --help
   ```

## 配置
- 从 `.env` 读取环境变量：
  - LOGIN_USERNAME
  - LOGIN_PASSWORD
- 容器内默认时区为 Asia/Tokyo。
- 任务 JSON 文件定义动作：
  - [checkin.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/checkin.json)
  - [checkout.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/checkout.json)
  - [break-start.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/break-start.json)
  - [break-end.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/break-end.json)

## 定时任务（Cron）
- 仅工作日执行：
  - 10:00 上班
  - 12:00 休息开始
  - 13:00 休息结束
  - 20:00 下班
- 修改请编辑 [crontab](file:///c:/Users/newbd/projects/fuck-freee-checkin/crontab)，更改后需要重新构建镜像。

## 节假日管理
- 节假日定义见 [index.js](file:///c:/Users/newbd/projects/fuck-freee-checkin/index.js#L13-L56)。
- 如需扩展年份，请更新 `JAPANESE_HOLIDAYS` 并重建容器镜像。
- 节假日与周末均跳过执行。

## Kubernetes 部署
前置条件：
- 已准备 Kubernetes 集群且 `kubectl` 可连接。

1. 命名空间：
   ```powershell
   kubectl apply -f k8s/00-namespace.yaml
   ```
2. 持久化存储：
   ```powershell
   kubectl apply -f k8s/01-pvc.yaml
   ```
   如需适配不同环境，请调整 `storageClassName`。
3. Secret（以 `.env` 文件挂载）：
   - 复制并编辑：
     - [k8s/02-secret.example.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/02-secret.example.yaml) → `k8s/02-secret.yaml`
   - 应用：
     ```powershell
     kubectl apply -f k8s/02-secret.yaml
     ```
4. 部署：
   ```powershell
   kubectl apply -f k8s/03-deployment.yaml
   ```
5. 观察：
   ```powershell
   kubectl get pods -n freee-checkin
   kubectl logs deploy/freee-checkin -n freee-checkin -f --tail=200
   ```

## 维护
- 代码变更后重建：
  ```bash
  docker-compose down && docker-compose build && docker-compose up -d
  ```
- 查看特定日志文件：
  ```bash
  docker-compose exec auto-checkin tail -f /var/log/auto-checkin/checkin.log
  ```

## TrueNAS SCALE
- 创建持久化数据集，例如：
  - /mnt/tank/apps/auto-checkin/logs
  - /mnt/tank/apps/auto-checkin/screenshots
- 方式 A：Apps → Launch Docker Image
  - 镜像：ghcr.io/newbdez33/freee-checkin:latest
  - 环境变量：
    - TZ=Asia/Tokyo
    - NODE_ENV=production
    - LOGIN_USERNAME=your_username@example.com
    - LOGIN_PASSWORD=your_password
  - 主机路径挂载：
    - /mnt/tank/apps/auto-checkin/logs → /var/log/auto-checkin
    - /mnt/tank/apps/auto-checkin/screenshots → /app/screenshots
  - 部署后可在应用详情页查看日志。
- 方式 B：Apps → Docker Compose
  - 使用发布的镜像进行简化 Compose：
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
  - 部署后，容器内 cron 会按默认时间执行任务。
- 更新
  - Launch Docker Image：重新部署以拉取最新镜像。
  - Docker Compose：在应用页拉取并重新部署栈。
- 注意
  - Playwright 镜像较大，请确保节点磁盘空间充足。
  - 时区通过 TZ 设置；默认 Asia/Tokyo。

## 关键文件
- 入口/CLI：[index.js](file:///c:/Users/newbd/projects/fuck-freee-checkin/index.js)
- Compose：[docker-compose.yml](file:///c:/Users/newbd/projects/fuck-freee-checkin/docker-compose.yml)
- Dockerfile：[Dockerfile](file:///c:/Users/newbd/projects/fuck-freee-checkin/Dockerfile)
- Cron：[crontab](file:///c:/Users/newbd/projects/fuck-freee-checkin/crontab)，执行脚本 [run-cron.sh](file:///c:/Users/newbd/projects/fuck-freee-checkin/run-cron.sh)，启动脚本 [start.sh](file:///c:/Users/newbd/projects/fuck-freee-checkin/start.sh)
- Kubernetes：[00-namespace.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/00-namespace.yaml)、[01-pvc.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/01-pvc.yaml)、[03-deployment.yaml](file:///c:/Users/newbd/projects/fuck-freee-checkin/k8s/03-deployment.yaml)

## 许可证
MIT（见 [package.json](file:///c:/Users/newbd/projects/fuck-freee-checkin/package.json)）
