import express from 'express';
import multer from 'multer';
import fs from 'fs';
import Story from '../models/Story.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
router.use(authRequired);
const uploadDir = new URL('../../uploads/', import.meta.url);
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `story-${Date.now()}-${file.originalname}`) }) });

router.get('/', async (_req, res) => res.json(await Story.find({ expiresAt: { $gt: new Date() } }).populate('user', 'name username avatar').sort('-createdAt')));
router.post('/', upload.single('media'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Media story diperlukan' });
  const story = await Story.create({ user: req.userId, mediaUrl: `/uploads/${req.file.filename}`, caption: req.body.caption || '', type: 'image' });
  res.status(201).json(await story.populate('user', 'name username avatar'));
});

export default router;
