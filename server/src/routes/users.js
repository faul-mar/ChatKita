import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
router.use(authRequired);

const uploadDir = new URL('../../uploads/', import.meta.url);
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0.0-9.-]/g, '_')}`) }), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId } }).select('name username avatar about online lastSeen');
  res.json(users);
});

router.patch('/me', upload.single('avatar'), async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.about) updates.about = req.body.about;
  if (req.file) updates.avatar = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
  res.json(user);
});

export default router;
