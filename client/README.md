# Homely — Home Services Marketplace

A full-stack web platform connecting homeowners with verified local workers (plumbers, electricians, cleaners, and more) in Tashkent, Uzbekistan.

## Live Demo

- Frontend: https://homely-alpha.vercel.app
- Backend API: https://homely-api-djga.onrender.com

## Tech Stack

**Frontend**
- React 19 + Vite 5
- Tailwind CSS v4
- React Router v7
- Socket.IO Client
- Leaflet.js (interactive map)
- Axios

**Backend**
- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Socket.IO (real-time notifications)
- JWT Authentication
- Nodemailer (email verification)
- Telegram Bot API
- Groq API / LLaMA 3.3 (AI assistant)

## Features

- Customer and worker registration with email verification
- Worker profile with services, availability, portfolio, ID verification
- Booking flow: request → confirm → in progress → complete
- Real-time notifications (in-app + Telegram)
- Interactive map address picker (OpenStreetMap)
- Price negotiation — worker sets final price on completion
- AI chat assistant powered by LLaMA 3.3 via Groq
- Admin dashboard with user management and revenue projections
- Multilingual support: Uzbek, Russian, English
- Freemium subscription model for workers

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Environment variables configured

### Installation

```bash
# Clone the repo
git clone https://github.com/asilbek0908/homely.git

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_telegram_token
GROQ_API_KEY=your_groq_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client/` directory:

```
VITE_API_URL=http://localhost:5000/api
```

### Running Locally

```bash
# Start backend
cd server && node server.js

# Start frontend (new terminal)
cd client && npm run dev
```

## Project Structure

```
homely/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── i18n/
└── server/          # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── utils/
```

## Author

Asilbek Saidov — BISP University, 2026
