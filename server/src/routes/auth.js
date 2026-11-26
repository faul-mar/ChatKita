import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'Semua kolom wajib diisi' });
    if (await User.findOne({ $or: [{ email }, { username }] })) return res.status(409).json({ message: 'Email atau username sudah digunakan' });
    const user = await User.create({ name, username, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user._id), user });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username: username?.toLowerCase() }, { email: username?.toLowerCase() }] });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Username atau password salah' });
    user.online = true;
    await user.save();
    res.json({ token: sign(user._id), user });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
