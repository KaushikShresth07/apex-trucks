# 🚛 Apex Trucks - Vehicle Sales Platform

A modern React-based platform for selling commercial vehicles with an advanced admin dashboard.

## 🌟 Features

- **Advanced Vehicle Management** - Add, edit, delete vehicles with rich details
- **Image Gallery** - Upload and manage vehicle photos
- **Search & Filter** - Find vehicles by make, model, year, price range
- **Interactive Map** - View vehicle locations
- **Admin Dashboard** - Full CRUD operations
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ 
- PM2 (for production)
- Nginx (for web server)

### Installation
```bash
npm install
npm run build
pm2 start ecosystem.config.js --env production
```

### Environment Variables
Set these for production:
- `NODE_ENV=production`
- `PORT=3001`

## 📁 Project Structure
```
├── src/          # React frontend
├── server/       # Express API server
├── data/         # Vehicle data & images
└── ecosystem.config.js  # PM2 configuration
```

## 🔗 API Endpoints
- `GET /api/trucks` - List all vehicles
- `POST /api/trucks` - Add new vehicle
- `PUT /api/trucks/:id` - Update vehicle
- `DELETE /api/trucks/:id` - Remove vehicle
- `POST /api/upload` - Upload vehicle images

## 📱 Frontend Routes
- `/` - Vehicle listing
- `/truck/:id` - Vehicle details
- `/admin` - Admin dashboard
- `/login` - Admin authentication

## 🔧 Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

## 📝 License
© 2025 Apex Trucks. All rights reserved.