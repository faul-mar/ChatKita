import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chats.js';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import { authSocket, registerSocketHandlers } from './socket.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '20mb' }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'ChatKita' }));

io.use(authSocket);
io.on('connection', socket => registerSocketHandlers(io, socket));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatkita')
  .then(() => {
    server.listen(process.env.PORT || 5000, () => console.log(`ChatKita server running on ${process.env.PORT || 5000}`));
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
