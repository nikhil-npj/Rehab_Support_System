# RehabTrack — Physio Rehabilitation Support System

A full-stack web application that connects physiotherapists with patients for streamlined rehabilitation tracking and management.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React + Vite, Tailwind CSS        |
| Backend  | Node.js, Express                  |
| Database | Supabase (PostgreSQL)             |
| Auth     | Supabase Auth                     |

## Project Structure

```
rehabtrack/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/       # Landing, Login, Signup, Dashboards
│   │   ├── services/    # API & Supabase client
│   │   └── assets/
│   └── public/
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/      # Auth routes
│   │   ├── middleware/   # Auth middleware
│   │   └── services/    # Supabase service
│   └── sql/             # Database schema
└── README.md
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A Supabase project (free tier works)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/nikhil-npj/Rehab_Support_System.git
   cd Rehab_Support_System
   ```

2. **Server**
   ```bash
   cd server
   cp .env.example .env   # fill in your Supabase credentials
   npm install
   npm start
   ```

3. **Client**
   ```bash
   cd client
   cp .env.example .env   # fill in your Supabase credentials
   npm install
   npm run dev
   ```

## Environment Variables

Copy the `.env.example` files in both `client/` and `server/` and fill in your Supabase keys. **Never commit `.env` files.**

## License

MIT
