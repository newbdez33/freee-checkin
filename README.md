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

## Kubernetes Deployment

### Prerequisites
- A Kubernetes cluster (e.g., MicroK8s, K3s, Minikube, or a managed cloud cluster)
- `kubectl` configured to connect to your cluster

### Environment Setup (PowerShell)
Define the kubeconfig path variable for easier command execution:
```powershell
$kube = "C:\Users\jacky\AppData\Roaming\Lens\kubeconfigs\b6f0cc16-28e2-49a4-9303-a9ecee6d2725-pasted-kubeconfig.yaml"
```

### 1. Create Namespace
```powershell
kubectl apply -f k8s/00-namespace.yaml --kubeconfig $kube
```

### 2. Configure Persistent Storage
This project uses Persistent Volume Claims (PVCs) for logs and screenshots.
**Note:** The provided manifest (`k8s/01-pvc.yaml`) uses `storageClassName: microk8s-hostpath`. If you are not using MicroK8s, please edit the file to match your cluster's storage class (or remove it to use the default).

```powershell
kubectl apply -f k8s/01-pvc.yaml --kubeconfig $kube
```

### 3. Setup Secrets
Create the secret containing your environment variables.
1. Edit `k8s/02-secret.yaml` with your actual credentials.
2. Apply the secret:

```powershell
kubectl apply -f k8s/02-secret.yaml --kubeconfig $kube
```

### 4. Deploy Application
Deploy the application with the recommended configuration (Image Pull Policy set to `IfNotPresent` to save bandwidth/storage).

```powershell
kubectl apply -f k8s/03-deployment.yaml --kubeconfig $kube
```

### Maintenance & Troubleshooting

**Check Status**
```powershell
kubectl get pods -n fuck-checkin --kubeconfig $kube
```

**View Logs**
```powershell
kubectl logs deploy/fuck-checkin -n fuck-checkin --tail=200 -f --kubeconfig $kube
```

**Common Issues**
- **Evicted Pods**: If you see `Evicted` status, it's often due to node disk pressure (ephemeral-storage).
  - *Fix*: Clean up unused images on the node (`microk8s ctr images prune`) or ensure the `imagePullPolicy` is `IfNotPresent` to avoid re-downloading large images.
- **Image Pull Errors**: Ensure the image name/tag is correct and accessible.

