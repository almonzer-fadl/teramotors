# Waha WhatsApp Setup Guide

## ✅ What's Done

I've migrated your WhatsApp messaging from Twilio to **Waha** (free, self-hosted WhatsApp API).

### Changes Made:

1. **Created Waha Services:**
   - `WahaService.ts` - Sends messages
   - `WahaSessionService.ts` - Manages QR code & sessions

2. **Updated WhatsAppService:**
   - Now uses Waha instead of Twilio
   - All your auto-send triggers still work!
   - Templates send automatically like before

3. **Added Configuration Modal:**
   - "إعدادات Waha" button in WhatsApp page
   - Shows QR code to scan
   - Shows connection status
   - Start/Stop session controls

4. **Updated Database:**
   - Added `wahaMessageId` field to track messages

## 🚀 How to Use

### Step 1: Run Waha Server

Open a terminal and run:

```bash
docker run -d \
  --name waha \
  --restart=always \
  -p 3000:3000 \
  -v ~/waha-sessions:/app/.sessions \
  devlikeapro/waha:latest
```

**What this does:**
- Downloads and runs Waha on port 3000
- Saves your WhatsApp session so you don't have to scan QR every time
- Auto-restarts if it crashes

### Step 2: Configure in Your App

1. Go to WhatsApp page in your app
2. Click "إعدادات Waha" (green button, top right)
3. Click "بدء الجلسة" (Start Session)
4. QR code will appear
5. **Scan QR with WhatsApp** on your phone:
   - Open WhatsApp
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code

6. Wait a few seconds - status will change to "متصل" (Connected)

### Step 3: Test It!

1. Go back to WhatsApp page
2. Select a customer
3. Choose message type (welcome, job_started, etc.)
4. Click "Send Test Message"

**Done!** Message will be sent via Waha.

## 🔄 Auto-Send Still Works

Your automatic triggers still work exactly the same:

- **Customer Created** → Welcome message sent
- **Job Card Opened** → Job started message sent
- **Job Card Closed** → Job completed message sent
- **Invoice Created** → Invoice ready message sent (+ ad after 24h)

No changes needed!

## 📱 When to Re-Scan QR

You need to scan QR again if:
- You restart the Waha container
- WhatsApp logs out the session
- You see status "SCAN_QR_CODE" in config modal

Just open the config modal and scan the new QR.

## 🌐 For Production (Always-On Server)

If you want Waha running 24/7 on a server:

### Option 1: Railway.app (Easiest, ~$5/month)

1. Go to https://railway.app
2. New Project → Docker Image
3. Image: `devlikeapro/waha:latest`
4. Add volume: `/app/.sessions` (1GB)
5. Deploy
6. Copy the public URL (like `https://waha-abc123.railway.app`)
7. Update `.env.local`:
   ```bash
   WAHA_API_URL=https://waha-abc123.railway.app
   NEXT_PUBLIC_WAHA_URL=https://waha-abc123.railway.app
   ```

### Option 2: Your Own VPS

SSH into your server and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Run Waha
docker run -d \
  --name waha \
  --restart=always \
  -p 3000:3000 \
  -v /opt/waha-sessions:/app/.sessions \
  devlikeapro/waha:latest

# Setup Nginx reverse proxy (optional, for HTTPS)
sudo apt install nginx
# ... configure nginx to proxy to localhost:3000
```

## 🔧 Environment Variables

Already configured in `.env.local`:

```bash
WAHA_API_URL=http://localhost:3000      # Waha server URL
WAHA_SESSION_NAME=teramotors            # Session name
WAHA_API_KEY=                           # Optional API key
NEXT_PUBLIC_WAHA_URL=http://localhost:3000  # For frontend
```

## 📊 Monitoring

Check Waha status anytime:
1. Open config modal in WhatsApp page
2. See current status (Connected/Disconnected)
3. Auto-refreshes every 5 seconds

## ❓ Troubleshooting

### "Failed to get session"
- Make sure Waha container is running: `docker ps`
- If not running: `docker start waha`

### "SCAN_QR_CODE" status stuck
- Click "تحديث" (Refresh) button
- If still stuck, stop and start session again

### Messages not sending
- Check Waha config modal - must show "متصل" (Connected)
- Check console logs for errors
- Make sure customer phone numbers are correct

### QR code not showing
- Session might be starting - wait 5-10 seconds
- Click "تحديث" to refresh
- Restart session if needed

## 💰 Cost Comparison

| Provider | Monthly Cost | Per Message |
|----------|-------------|-------------|
| **Twilio** | ~$50-200 | $0.005 each |
| **Waha** | $0-10 (server only) | $0 (FREE!) |

## 🎉 You're Done!

Your app now sends WhatsApp messages for free via Waha!

- Auto-send works ✅
- Manual send works ✅
- Easy QR setup ✅
- Free messages ✅

Questions? Check the Waha docs: https://waha.devlike.pro/docs/
