# Version Echo App

A minimal Node.js app for testing a full CI/CD + GitOps pipeline.

## Run Locally

```bash
npm install
VERSION=v2 node app.js
# Visit http://localhost:1121
```

## Run on Server (Background)

Uses [pm2](https://pm2.keymetrics.io/) to keep the app running in the background and auto-restart on crash.

```bash
# Install pm2 globally (once)
npm install -g pm2

# Install dependencies
npm install --omit=dev

# Start in background
npm run start:bg

# Auto-start on server reboot
pm2 startup
pm2 save

# Useful commands
npm run status       # check running status
npm run logs         # tail logs
npm run restart:bg   # restart app
npm run stop:bg      # stop app
```

## Endpoints

| Endpoint     | Response                     |
| ------------ | ---------------------------- |
| GET /        | `Hello from <VERSION>`       |
| GET /version | `{ "version": "<VERSION>" }` |
| GET /health  | `OK`                         |
| GET /metrics | Prometheus metrics           |

## Build Docker Image

```bash
docker build -t your-dockerhub-username/version-echo:latest .
docker run -p 1121:1121 -e VERSION=v2 your-dockerhub-username/version-echo:latest
```

## Jenkins Pipeline

1. Jenkins detects a push to `main`
2. Builds and tags the Docker image with `BUILD_NUMBER`
3. Pushes both `:BUILD_NUMBER` and `:latest` tags to DockerHub
4. Updates `k8s/deployment.yaml` with the new image tag
5. Commits and pushes the manifest change back to the repo

Prerequisites: Add a `dockerhub-credentials` credential (username/password) in Jenkins.

## ArgoCD Deployment

ArgoCD watches the `k8s/` folder in this repo. When Jenkins updates `deployment.yaml`, ArgoCD detects the drift and syncs the cluster automatically.

```bash
# Create ArgoCD app pointing to this repo
argocd app create version-echo \
  --repo https://github.com/your-org/version-echo-app \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated
```

## Check Version Updates

```bash
# From inside the cluster or via port-forward
kubectl port-forward svc/version-echo 1121:1121
curl http://localhost:1121/version
```

## Grafana / Prometheus Metrics

1. Add a Prometheus scrape job pointing to `/metrics` on port 3000
2. In `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "version-echo"
    static_configs:
      - targets: ["version-echo:1121"]
```

3. In Grafana, import a dashboard and query:
   - `http_requests_total` — total request count by method/path
   - `process_cpu_seconds_total` — CPU usage
   - `nodejs_heap_size_used_bytes` — memory usage

## Load Test

```bash
./load-test.sh                        # hits localhost:3000
./load-test.sh http://your-cluster-ip # hits remote
```
