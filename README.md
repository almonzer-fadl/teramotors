# TeraMotors - Auto Repair Shop Management System 🚗

A comprehensive cross-platform application for managing auto repair shop operations, built with modern web technologies.

## 🎯 Project Overview

**Goal:** Build a complete auto repair shop management system to help run an auto repair business efficiently.

**Platforms:** Web application + Desktop app (Windows, Linux, Mac)
**Business Model:** Single shop initially, expandable to multi-tenant SaaS or one-time purchase desktop app

### Core Features
- Customer and vehicle management
- Service estimates and invoicing
- Appointment scheduling
- Parts inventory tracking
- Job progress monitoring
- Vehicle inspection system
- Business analytics and reporting
- Real-time updates and notifications

---

## 🏗️ Technical Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **UI:** React 19 + Tailwind CSS + Shadcn/ui
- **State Management:** Zustand
- **Real-time:** Socket.io client
- **Language:** TypeScript

### Backend
- **Server:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io server
- **Authentication:** NextAuth.js
- **File Storage:** Cloudinary
- **Payment Processing:** Stripe

### Desktop Application
- **Framework:** Electron
- **Cross-platform:** Windows, Linux, Mac
- **Offline capability:** Local database sync
- **Auto-updates:** Electron updater

### Additional Tools
- **PDF Generation:** React-PDF
- **Date/Time:** Day.js
- **Form Handling:** React Hook Form + Zod
- **Charts:** Recharts
- **Email:** Resend

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS version)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/teramotors.git
cd teramotors
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
RESEND_API_KEY=your_resend_api_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
teramotors/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── api/                      # API routes
│   └── ...
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn/ui components
│   ├── forms/                    # Form components
│   ├── dashboard/                # Dashboard components
│   └── ...
├── lib/                          # Utility functions
├── stores/                       # Zustand stores
├── types/                        # TypeScript definitions
├── server/                       # Socket.io server
└── public/                       # Static assets
```

---

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Conventional Commits** - Git commit messages

---

## 🎯 Features

### Authentication & Authorization
- User registration and login
- Role-based access control (Admin, Mechanic, Customer)
- Session management
- Protected routes

### Customer Management
- Customer profiles and information
- Vehicle registration and history
- Service history tracking
- Communication tools

### Appointment System
- Calendar-based scheduling
- Time slot management
- Appointment reminders
- Real-time availability

### Service Management
- Service catalog with pricing
- Labor time calculation
- Parts integration
- Estimate generation

### Job Tracking
- Work order creation
- Real-time job status updates
- Progress tracking
- Photo documentation

### Vehicle Inspection System
- Digital inspection checklists
- Photo documentation
- Condition ratings
- Auto-estimate generation

### Financial Features
- Payment processing with Stripe
- Invoice generation
- Financial reporting
- Revenue analytics

### Real-time Features
- Live job updates
- Instant notifications
- Real-time chat
- Live dashboard updates

---

## 🚀 Deployment

### Web Application
1. **Vercel Deployment** (Recommended)
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Other Platforms**
   - Netlify
   - Railway
   - DigitalOcean App Platform

### Desktop Application
1. **Build for Windows**
```bash
npm run build:win
```

2. **Build for Linux**
```bash
npm run build:linux
```

3. **Build for macOS**
```bash
npm run build:mac
```

---

## 📚 Documentation

- [Technical Documentation](./Auto-Repair-Shop-Documentation.md)
- [Progress Tracking](./PROGRESS.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](./Auto-Repair-Shop-Documentation.md)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

## 🎯 Roadmap

- [ ] Phase 1: Foundation Setup ✅
- [ ] Phase 2: Core Features 🚧
- [ ] Phase 3: UI & Components
- [ ] Phase 4: Business Logic
- [ ] Phase 5: Real-time Features
- [ ] Phase 6: Financial Features
- [ ] Phase 7: Analytics & Reporting
- [ ] Phase 8: Desktop Application
- [ ] Phase 9: Deployment & Production

See [PROGRESS.md](./PROGRESS.md) for detailed progress tracking.

---

**Built with ❤️ for auto repair businesses**
