## WAHA Production Setup (No Credit Card)

This guide sets up WAHA (WhatsApp API) to run persistently on a single machine (the workshop PC) and expose it securely over HTTPS using Cloudflare Tunnel. It also includes an on-demand start option.

Reference: `https://waha.devlike.pro/`

### 1) Install Docker and Prepare Secrets

```bash
# Fedora
sudo dnf -y install docker
sudo systemctl enable --now docker

# WAHA secret (choose a strong secret)
echo 'WAHA_API_KEY=YOUR_STRONG_SECRET' | sudo tee /etc/waha.env >/dev/null
sudo chmod 600 /etc/waha.env

# Persistent sessions
docker volume create waha_sessions
```

### 2) Run WAHA with Auto-Restart

```bash
docker run -d --name waha \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /etc/waha.env \
  -v waha_sessions:/app/.sessions \
  devlikeapro/waha:latest
```

- WAHA will be available at: `http://localhost:3000`
- Sessions persist in `waha_sessions` volume.

### 3) Optional: On-Demand Start Script

This script creates the container if missing and starts it if stopped.

```bash
sudo tee /usr/local/bin/waha-ensure.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

CONTAINER="waha"
IMAGE="devlikeapro/waha:latest"
VOLUME="waha_sessions"
PORT="3000"

if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  docker volume create "$VOLUME" >/dev/null
fi

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    docker start "$CONTAINER" >/dev/null
  fi
else
  docker run -d --name "$CONTAINER" \
    -p ${PORT}:3000 \
    --env-file /etc/waha.env \
    -v ${VOLUME}:/app/.sessions \
    "$IMAGE" >/dev/null
fi

echo "WAHA is running at http://localhost:${PORT}"
docker ps --filter "name=${CONTAINER}"
EOF
sudo chmod +x /usr/local/bin/waha-ensure.sh
```

Stop script (optional):

```bash
sudo tee /usr/local/bin/waha-stop.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
CONTAINER="waha"
docker stop "$CONTAINER" >/dev/null || true
echo "WAHA stopped."
EOF
sudo chmod +x /usr/local/bin/waha-stop.sh
```

### 4) Optional: systemd Units (Auto-start at Boot)

```ini
# /etc/systemd/system/waha.service
[Unit]
Description=WAHA container
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/docker start waha
ExecStop=/usr/bin/docker stop waha

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable waha
sudo systemctl start waha
```

### 5) Cloudflare Tunnel (Permanent HTTPS URL)

Option A: Quick Tunnel (ephemeral URL per run)

```bash
sudo curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Prints https://<random>.trycloudflare.com
cloudflared tunnel --url http://localhost:3000
```

Option B: Stable URL with your domain (Cloudflare free plan)

```bash
cloudflared tunnel login
cloudflared tunnel create waha
cloudflared tunnel route dns waha waha.yourdomain.com

mkdir -p ~/.cloudflared
cloudflared tunnel list  # copy credentials file name

cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: waha
credentials-file: /home/$USER/.cloudflared/<creds.json>

ingress:
  - hostname: waha.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF
```

Run as a service:

```bash
sudo tee /etc/systemd/system/cloudflared-waha.service >/dev/null <<'EOF'
[Unit]
Description=Cloudflare Tunnel for WAHA
After=network-online.target
Wants=network-online.target

[Service]
User=%i
ExecStart=/usr/local/bin/cloudflared --config /home/%i/.cloudflared/config.yml tunnel run waha
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared-waha@$(whoami)
sudo systemctl start cloudflared-waha@$(whoami)
```

Your permanent WAHA URL will be:

- `https://waha.yourdomain.com`

### 6) Integrate with Your App

- Base URL: your Cloudflare URL (or LAN IP if not exposing)
- API Key: the same value in `/etc/waha.env`
- Flow: open your app → WAHA settings → Start Session → scan QR → done

### 7) Maintenance

```bash
# Update WAHA image and restart
docker pull devlikeapro/waha:latest
docker restart waha
```

Migrate sessions to another machine (if needed):

```bash
# On old machine
docker run --rm -v waha_sessions:/from -v $(pwd):/to alpine sh -c "cd /from && tar czf /to/waha_sessions.tgz ."

# Move the file to new machine, then
docker volume create waha_sessions
docker run --rm -v waha_sessions:/to -v $(pwd):/from alpine sh -c "cd /to && tar xzf /from/waha_sessions.tgz"
```


