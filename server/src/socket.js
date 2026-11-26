import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Chat from './models/Chat.js';

export const authSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch { next(new Error('Unauthorized')); }
};

export const registerSocketHandlers = (io, socket) => {
  socket.join(socket.userId);
  User.findByIdAndUpdate(socket.userId, { online: true }).exec();

  socket.on('join-chat', chatId => socket.join(chatId));
  socket.on('typing', ({ chatId, name }) => socket.to(chatId).emit('typing', { chatId, userId: socket.userId, name }));
  socket.on('stop-typing', ({ chatId }) => socket.to(chatId).emit('stop-typing', { chatId, userId: socket.userId }));

  socket.on('send-message', async payload => {
    const chat = await Chat.findById(payload.chatId);
    if (!chat || !chat.members.some(id => id.toString() === socket.userId)) return;
    const message = { sender: socket.userId, text: payload.text || '', type: payload.type || 'text', mediaUrl: payload.mediaUrl || '', status: 'delivered' };
    chat.messages.push(message);
    await chat.save();
    const saved = chat.messages[chat.messages.length - 1];
    io.to(payload.chatId).emit('new-message', { chatId: chat._id, message: saved });
  });

  socket.on('mark-read', async ({ chatId }) => {
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== socket.userId) {
        message.status = 'read';
        if (!message.readBy.includes(socket.userId)) message.readBy.push(socket.userId);
      }
    });
    await chat.save();
    io.to(chatId).emit('messages-read', { chatId, userId: socket.userId });
  });

  socket.on('disconnect', async () => {
    await User.findByIdAndUpdate(socket.userId, { online: false, lastSeen: new Date() });
  });
};
