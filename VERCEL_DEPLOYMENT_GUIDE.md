# 🚀 Vercel Deployment Guide - TeraMotors Frontend

## ✅ **VERCEL CONFIGURATION COMPLETED**

Your TeraMotors frontend is now ready for Vercel deployment!

## 📁 **Files Created for Vercel:**

### 1. **`vercel.json`** ✅
- Vercel configuration file
- Next.js framework detection
- API function configuration
- Build and output settings

## 🚀 **Deploy to Vercel:**

### **Step 1: Create Vercel App**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `almonzer-fadl/teramotors`
4. **Set Root Directory**: `client`
5. **Framework Preset**: Next.js (auto-detected)

### **Step 2: Configure Environment Variables**
In Vercel dashboard, add these environment variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
AUTH_SECRET=Q9iDm6DF2ZC17EHhyYgsrNXXXOkc5a+XreJkwPRYTYA=
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Socket.io Server (Koyeb)
NEXT_PUBLIC_SOCKET_URL=https://your-koyeb-server.koyeb.app
NEXT_PUBLIC_SOCKET_PATH=/socket.io

# Email Service
RESEND_API_KEY=your_resend_api_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ZATCA
ZATCA_BASE_URL=https://api-sandbox.zatca.gov.sa
ZATCA_CLIENT_ID=your_zatca_client_id
ZATCA_CLIENT_SECRET=your_zatca_client_secret
ZATCA_PRIVATE_KEY=your_private_key_pem
ZATCA_CERTIFICATE=your_certificate_pem
ZATCA_ENVIRONMENT=sandbox

# Company Info
COMPANY_NAME=TeraMotors LLC
COMPANY_VAT_NUMBER=300000000000003
COMPANY_ADDRESS=Your Company Address
COMPANY_CITY=Your City
COMPANY_POSTAL_CODE=12345
COMPANY_COUNTRY=SA

NODE_ENV=production
```

### **Step 3: Deploy**
1. Click "Deploy"
2. Vercel will automatically:
   - Build the Next.js app
   - Deploy to global CDN
   - Set up custom domain

## 🌐 **After Deployment:**

Your frontend will be available at:
- **URL**: `https://your-vercel-app.vercel.app`
- **Login**: `admin@teramotors.com`
- **Password**: `admin123`

## ✅ **What Vercel Will Deploy:**

- ✅ **Next.js Application** (all pages and components)
- ✅ **API Routes** (all `/api/*` endpoints)
- ✅ **Static Generation** (optimized performance)
- ✅ **Database Operations** (MongoDB)
- ✅ **PDF Generation** (ZATCA compliance)
- ✅ **File Uploads** (Cloudinary)
- ✅ **Authentication** (NextAuth)

## 🔗 **Integration with Koyeb Server:**

The frontend will connect to your Koyeb Socket.io server for:
- Real-time dashboard updates
- Live notifications
- Real-time job card updates

**Deploy to Vercel now and your frontend will be live!** 🚗💼
