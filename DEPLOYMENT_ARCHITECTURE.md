# 🏗️ TeraMotors Deployment Architecture

## 🎯 **Deployment Strategy: Vercel + Koyeb**

### **Frontend (Vercel)**
- **Platform**: Vercel
- **Directory**: `client/`
- **Technology**: Next.js 15
- **Features**: UI, API Routes, PDF Generation, Authentication

### **Backend (Koyeb)**
- **Platform**: Koyeb
- **Directory**: `server/`
- **Technology**: Socket.io + Express
- **Features**: Real-time communication, Notifications, WebSocket

## 📁 **File Structure After Deployment:**

```
teramotors/
├── client/                    # → Vercel (Frontend)
│   ├── app/                   # Next.js App Router
│   ├── components/            # React Components
│   ├── lib/                   # Utilities & Services
│   ├── vercel.json           # Vercel Configuration
│   └── package.json          # Frontend Dependencies
│
├── server/                    # → Koyeb (Backend)
│   ├── server.js             # Socket.io Server
│   ├── koyeb.yaml           # Koyeb Configuration
│   └── package.json         # Backend Dependencies
│
├── VERCEL_DEPLOYMENT_GUIDE.md
├── KOYEB_SERVER_DEPLOYMENT_GUIDE.md
└── DEPLOYMENT_ARCHITECTURE.md
```

## 🚀 **Deployment Steps:**

### **1. Deploy Frontend to Vercel**
```bash
# 1. Go to Vercel Dashboard
# 2. Import GitHub repository
# 3. Set root directory: client/
# 4. Add environment variables
# 5. Deploy
```

### **2. Deploy Backend to Koyeb**
```bash
# 1. Go to Koyeb Dashboard
# 2. Create new service
# 3. Set source directory: server/
# 4. Add environment variables
# 5. Deploy
```

## 🔗 **Environment Variables:**

### **Vercel (Frontend)**
```env
MONGODB_URI=your_mongodb_uri
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-koyeb-server.koyeb.app
NEXT_PUBLIC_SOCKET_PATH=/socket.io
RESEND_API_KEY=your_resend_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# ... ZATCA variables
```

### **Koyeb (Backend)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 🌐 **Final URLs:**

- **Frontend**: `https://your-vercel-app.vercel.app`
- **Backend**: `https://your-koyeb-server.koyeb.app`
- **Socket.io**: `wss://your-koyeb-server.koyeb.app/socket.io`

## ✅ **What Each Platform Handles:**

### **Vercel (Frontend)**
- ✅ Next.js Application
- ✅ Static Site Generation
- ✅ API Routes (Next.js)
- ✅ PDF Generation
- ✅ File Uploads
- ✅ Authentication
- ✅ Database Operations
- ✅ ZATCA Compliance

### **Koyeb (Backend)**
- ✅ Socket.io Server
- ✅ Real-time Communication
- ✅ Live Notifications
- ✅ WebSocket Connections
- ✅ Express API (if needed)

## 🎯 **Benefits of This Architecture:**

1. **Performance**: Vercel's global CDN for frontend
2. **Scalability**: Koyeb's server infrastructure
3. **Cost-Effective**: Optimized resource usage
4. **Reliability**: Platform-specific optimizations
5. **Development**: Easy local development

## 🚗 **Ready to Deploy!**

Follow the individual deployment guides:
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Koyeb Server Deployment Guide](./KOYEB_SERVER_DEPLOYMENT_GUIDE.md)

**Your TeraMotors auto repair shop management system is ready for production!** 🚀
