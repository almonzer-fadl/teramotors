# 🚀 Koyeb Server Deployment Guide - TeraMotors Backend

## ✅ **KOYEB SERVER CONFIGURATION COMPLETED**

Your TeraMotors Socket.io server is now ready for Koyeb deployment!

## 📁 **Files Created for Koyeb Server:**

### 1. **`server/koyeb.yaml`** ✅
- Koyeb service configuration
- Source directory: `server/`
- Build and run commands
- Environment variables
- Port configuration

### 2. **`server/package.json`** ✅
- Server dependencies
- Socket.io, Express, MongoDB
- Production scripts
- Node.js engine requirements

## 🚀 **Deploy to Koyeb:**

### **Step 1: Create Koyeb Service**
1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click "Create Service"
3. Choose "GitHub" as source
4. Select repository: `almonzer-fadl/teramotors`
5. **Set Source Directory**: `server`
6. **Build Command**: `npm install`
7. **Run Command**: `npm run dev`

### **Step 2: Configure Environment Variables**
In Koyeb dashboard, add these environment variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your_mongodb_connection_string

# CORS (for Vercel frontend)
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### **Step 3: Deploy**
1. Click "Deploy"
2. Koyeb will:
   - Install dependencies
   - Start the Socket.io server
   - Expose on port 5000

## 🌐 **After Deployment:**

Your server will be available at:
- **URL**: `https://your-koyeb-server.koyeb.app`
- **Socket.io**: `wss://your-koyeb-server.koyeb.app/socket.io`

## ✅ **What Koyeb Will Deploy:**

- ✅ **Socket.io Server** (real-time communication)
- ✅ **Express Server** (API endpoints)
- ✅ **MongoDB Connection** (database operations)
- ✅ **CORS Configuration** (for Vercel frontend)
- ✅ **Real-time Features** (notifications, updates)

## 🔗 **Integration with Vercel Frontend:**

The server will provide:
- Real-time dashboard updates
- Live notifications
- Real-time job card updates
- WebSocket connections

## 📝 **Update Frontend Environment:**

After Koyeb deployment, update your Vercel environment variables:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-koyeb-server.koyeb.app
NEXT_PUBLIC_SOCKET_PATH=/socket.io
```

## 🚗 **Complete Architecture:**

```
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Koyeb         │
│   (Frontend)    │◄──►│   (Backend)     │
│                 │    │                 │
│ • Next.js App   │    │ • Socket.io     │
│ • API Routes    │    │ • Express       │
│ • UI/UX         │    │ • Real-time     │
│ • PDF Gen       │    │ • Notifications │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼─────────────────┐
                                 │                 │
                    ┌─────────────▼─────┐  ┌───────▼──────┐
                    │   MongoDB Atlas   │  │  Cloudinary  │
                    │   (Database)      │  │  (Files)     │
                    └───────────────────┘  └──────────────┘
```

**Deploy to Koyeb now and your backend will be live!** 🚀⚡
