# Waha Production Deployment

## Quick Options

### 1. Railway.app (Easiest - Recommended for Testing)
**Cost**: $5 free credit (~1-2 months), then $5-10/month

1. Go to https://railway.app → Sign up with GitHub
2. New Project → Deploy Docker Image
3. Image: `devlikeapro/waha:latest`
4. Add volume: `/app/.sessions` (1GB)
5. Add env var: `WAHA_API_KEY=3fa21a796dc14f1a8f134a1d40d97c9e`
6. Deploy → Copy the public URL (e.g., `https://waha-xxx.up.railway.app`)
7. Update your `.env.local`:
   ```bash
   WAHA_API_URL=https://waha-xxx.up.railway.app
   NEXT_PUBLIC_WAHA_URL=https://waha-xxx.up.railway.app
   ```

---

### 2. Oracle Cloud (Best for Long-term Free)
**Cost**: FREE FOREVER (requires credit card but never charges)

1. Sign up at https://oracle.com/cloud/free
2. Create VM Instance → Ubuntu 22.04 → VM.Standard.E2.1.Micro (free tier)
3. SSH into VM:
   ```bash
   ssh ubuntu@<public-ip>
   ```
4. Install Docker:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```
5. Run Waha:
   ```bash
   docker run -d \
     --name waha \
     --restart=always \
     -p 3000:3000 \
     -e WAHA_API_KEY=3fa21a796dc14f1a8f134a1d40d97c9e \
     -v /opt/waha-sessions:/app/.sessions \
     devlikeapro/waha:latest
   ```
6. Open port 3000:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
   sudo netfilter-persistent save
   ```
7. In Oracle Console: VCN → Security Lists → Add Ingress Rule (Port 3000, Source: 0.0.0.0/0)
8. Update your `.env.local`:
   ```bash
   WAHA_API_URL=http://<oracle-vm-ip>:3000
   NEXT_PUBLIC_WAHA_URL=http://<oracle-vm-ip>:3000
   ```

---

### 3. Fly.io (Free Tier)
**Cost**: Free tier includes 3 shared VMs

1. Install CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create `fly.toml`:
   ```toml
   app = "waha-teramotors"

   [build]
     image = "devlikeapro/waha:latest"

   [[services]]
     internal_port = 3000
     protocol = "tcp"
     [[services.ports]]
       port = 80
       handlers = ["http"]
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]

   [env]
     WAHA_API_KEY = "3fa21a796dc14f1a8f134a1d40d97c9e"

   [[mounts]]
     source = "waha_sessions"
     destination = "/app/.sessions"
   ```
4. Deploy:
   ```bash
   fly launch
   fly volumes create waha_sessions --size 1
   fly deploy
   ```
5. Get URL: `fly status` (e.g., `https://waha-teramotors.fly.dev`)

---

## After Deployment

1. Deploy your Next.js app with updated `.env.local`
2. Open your app → WhatsApp page → "إعدادات Waha"
3. Click "بدء الجلسة" (Start Session)
4. Scan QR code with WhatsApp
5. Done! Session persists in volume

---

## Recommendation

- **Testing/First time**: Railway.app (easiest, $5 credit)
- **Long-term free**: Oracle Cloud (free forever, more setup)
