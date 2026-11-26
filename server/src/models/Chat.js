import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  mediaUrl: { type: String, default: '' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
