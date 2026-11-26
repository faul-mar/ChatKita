import express from 'express';
import Chat from '../models/Chat.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  const chats = await Chat.find({ members: req.userId }).populate('members', 'name username avatar online lastSeen').sort('-updatedAt');
  res.json(chats);
});

router.post('/direct', async (req, res) => {
  const { userId } = req.body;
  let chat = await Chat.findOne({ isGroup: false, members: { $all: [req.userId, userId], $size: 2 } });
  if (!chat) chat = await Chat.create({ members: [req.userId, userId] });
  await chat.populate('members', 'name username avatar online lastSeen');
  res.status(201).json(chat);
});

router.post('/group', async (req, res) => {
  const { name, memberIds } = req.body;
  const members = [...new Set([req.userId, ...memberIds])];
  const chat = await Chat.create({ isGroup: true, name, members, admins: [req.userId] });
  await chat.populate('members', 'name username avatar online lastSeen');
  res.status(201).json(chat);
});

export default router;
