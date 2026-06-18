import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import patientsRouter from './routes/patients.routes.js';
import exercisesRouter from './routes/exercises.routes.js';
import plansRouter from './routes/plans.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client applications (Vite defaults to 5173)
app.use(cors({
  origin: '*', // Allow all origins for simplicity in local development, can be restricted later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/plans', plansRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'rehabtrack-backend' });
});

// Root path handler
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the RehabTrack API' });
});

app.listen(PORT, () => {
  console.log(`[RehabTrack Backend] Server listening on port ${PORT}`);
});
