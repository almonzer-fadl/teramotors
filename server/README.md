# TeraMotors Express Server

This is the Express server for TeraMotors that handles:
- Socket.io real-time communication
- PDF generation for invoices (using Puppeteer)

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `CORS_ORIGIN`: Your frontend URL (e.g., https://your-app.vercel.app)
- `PORT`: Server port (default: 5000)

## Development

Run the server in development mode:
```bash
npm run dev
```

## Production

Run the server in production mode:
```bash
npm start
```

## Deployment

### Deploying to Render.com (Recommended)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add your `MONGODB_URI` and `CORS_ORIGIN`

4. Make sure to install Chrome/Chromium on Render by adding a `render.yaml` file in the root:

```yaml
services:
  - type: web
    name: teramotors-server
    env: node
    buildCommand: cd server && npm install && npx puppeteer browsers install chrome
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: CORS_ORIGIN
        sync: false
```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `MONGODB_URI`: Your production MongoDB connection string
- `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://teramotors.vercel.app`)
- `NODE_ENV`: Set to `production`
- `PORT`: Optional (defaults to 5000)

## API Endpoints

### PDF Generation

**GET** `/api/invoices/:id/pdf`

Query parameters:
- `lang`: Language for the PDF (default: `ar`, options: `ar` | `en`)
- `format`: PDF format (default: `A4`, options: `A4` | `Letter`)

Example:
```
GET /api/invoices/673abc123def456789/pdf?lang=en&format=A4
```

## Frontend Configuration

Update your frontend `.env.local` to point to your deployed server:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-server.onrender.com
```

For local development:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```
