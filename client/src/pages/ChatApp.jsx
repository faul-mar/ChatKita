import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Bell, CheckCheck, Image, Mic, Moon, MoreVertical, Phone, Plus, Search, Send, Settings, Smile, Sun, Video, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SERVER = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
const mediaUrl = url => url?.startsWith('http') ? url : `${SERVER}${url}`;

export default function ChatApp() {
  const { api, socket, user, logout, dark, setDark } = useApp();
  const [users, setUsers] = useState([]), [chats, setChats] = useState([]), [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]), [text, setText] = useState(''), [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false), [stories, setStories] = useState([]);
  const endRef = useRef(null), typingTimer = useRef(null);

  useEffect(() => { api.get('/users').then(r => setUsers(r.data)); api.get('/chats').then(r => setChats(r.data)); api.get('/stories').then(r => setStories(r.data)); }, [api]);
  useEffect(() => {
    if (!socket) return;
    socket.on('new-message', ({ chatId, message }) => { if (active?._id === chatId) setMessages(v => [...v, message]); setChats(v => v.map(c => c._id === chatId ? { ...c, updatedAt: new Date() } : c)); });
    socket.on('typing', ({ chatId }) => { if (active?._id === chatId) setTyping(true); });
    socket.on('stop-typing', ({ chatId }) => { if (active?._id === chatId) setTyping(false); });
    return () => { socket.off('new-message'); socket.off('typing'); socket.off('stop-typing'); };
  }, [socket, active]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typing]);

  const openChat = chat => { setActive(chat); setMessages(chat.messages || []); socket?.emit('join-chat', chat._id); socket?.emit('mark-read', { chatId: chat._id }); };
  const openUser = async person => {
    const existing = chats.find(c => !c.isGroup && c.members.some(m => m._id === person._id));
    if (existing) return openChat(existing);
    const { data } = await api.post('/chats/direct', { userId: person._id }); setChats(v => [data, ...v]); openChat(data);
  };
  const send = async (payload = {}) => {
    if (!active || (!text.trim() && !payload.mediaUrl)) return;
    const message = { chatId: active._id, text: text.trim(), type: 'text', ...payload };
    socket?.emit('send-message', message); setText(''); setShowEmoji(false); socket?.emit('stop-typing', { chatId: active._id });
  };
  const changeText = e => {
    setText(e.target.value); if (!active) return;
    socket?.emit('typing', { chatId: active._id, name: user.name }); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => socket?.emit('stop-typing', { chatId: active._id }), 900);
  };
  const uploadMedia = async (event, isStory = false) => {
    const file = event.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.append(isStory ? 'media' : 'media', file);
    if (isStory) { const { data } = await api.post('/stories', form); setStories(v => [data, ...v]); }
    else { const res = await fetch(`${SERVER}/api/users`, { method: 'OPTIONS' }).catch(() => null); const url = URL.createObjectURL(file); send({ mediaUrl: url, type: 'image' }); }
  };
  const contactName = chat => chat.isGroup ? chat.name : chat.members.find(m => m._id !== user._id)?.name || 'Kontak';

  return <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
    <aside className="hidden w-[380px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
      <header className="flex h-20 items-center gap-3 px-5"><img src={mediaUrl(user.avatar) || `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} className="h-11 w-11 rounded-full object-cover" /><div className="flex-1"><b>{user.name}</b><p className="text-xs text-slate-500">@{user.username}</p></div><button onClick={() => setDark(!dark)}>{dark ? <Sun size={20}/> : <Moon size={20}/>}</button><button onClick={logout}><Settings size={20}/></button></header>
      <div className="px-4"><label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-slate-800"><Search size={18}/><input className="w-full bg-transparent outline-none" placeholder="Cari percakapan" /></label></div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-3"><label className="shrink-0 cursor-pointer text-center"><div className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-teal-500"><Plus size={22}/><input type="file" accept="image/*" className="hidden" onChange={e => uploadMedia(e, true)} /></div><small>Story</small></label>{stories.map(s => <div key={s._id} className="shrink-0 text-center"><img src={mediaUrl(s.mediaUrl)} className="h-14 w-14 rounded-full object-cover ring-2 ring-teal-500 ring-offset-2"/><small className="block max-w-14 truncate">{s.user?.name}</small></div>)}</div>
      <nav className="flex-1 overflow-y-auto px-2">{chats.map(chat => <button key={chat._id} onClick={() => openChat(chat)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${active?._id === chat._id ? 'bg-teal-50 dark:bg-teal-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">{chat.isGroup ? <Users/> : contactName(chat).charAt(0)}</div><div className="min-w-0 flex-1"><b className="block truncate">{contactName(chat)}</b><p className="truncate text-sm text-slate-500">{chat.messages?.at(-1)?.text || 'Mulai percakapan'}</p></div></button>)}</nav>
      <div className="border-t p-3 dark:border-slate-800"><p className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">Kontak</p>{users.slice(0,5).map(p => <button key={p._id} onClick={() => openUser(p)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"><img src={mediaUrl(p.avatar) || `https://api.dicebear.com/9.x/initials/svg?seed=${p.name}`} className="h-9 w-9 rounded-full"/><span>{p.name}</span></button>)}</div>
    </aside>

    <main className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_1px_1px,_rgba(20,184,166,.12)_1px,_transparent_0)] bg-[length:22px_22px]">
      {active ? <><header className="flex h-20 items-center gap-3 border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900"><div className="grid h-11 w-11 place-items-center rounded-full bg-teal-100 text-teal-700">{active.isGroup ? <Users/> : contactName(active).charAt(0)}</div><div className="flex-1"><b>{contactName(active)}</b><p className="text-xs text-teal-600">{typing ? 'sedang mengetik...' : active.isGroup ? `${active.members.length} anggota` : 'online'}</p></div><Phone size={20}/><Video className="mx-2" size={20}/><MoreVertical size={20}/></header>
      <section className="flex-1 overflow-y-auto px-4 py-5 md:px-12">{messages.map((m,i) => { const mine = m.sender?.toString() === user._id || m.sender === user._id; return <div key={m._id || i} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${mine ? 'rounded-br-md bg-teal-500 text-white' : 'rounded-bl-md bg-white dark:bg-slate-800'}`}>{m.type === 'image' && (m.mediaUrl.startsWith('blob:') ? <img src={m.mediaUrl} className="mb-2 max-h-72 rounded-lg"/> : <img src={mediaUrl(m.mediaUrl)} className="mb-2 max-h-72 rounded-lg"/>)}{m.type === 'voice' && <audio controls src={mediaUrl(m.mediaUrl)}/>}<p className="whitespace-pre-wrap">{m.text}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-teal-100':'text-slate-400'}`}>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}{mine && <CheckCheck size={14} className={m.status === 'read' ? 'text-sky-400' : ''}/>}</div></div></div>; })}<div ref={endRef}/></section>
      <footer className="relative flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><label className="cursor-pointer p-2"><Image size={22}/><input type="file" accept="image/*" className="hidden" onChange={e => { const file=e.target.files?.[0]; if(file) send({ mediaUrl:URL.createObjectURL(file), type:'image' }); }}/></label><button onClick={() => setShowEmoji(!showEmoji)}><Smile size={22}/></button>{showEmoji && <div className="absolute bottom-16 left-12"><EmojiPicker onEmojiClick={e => setText(v => v + e.emoji)} theme={dark ? 'dark':'light'}/></div>}<input value={text} onChange={changeText} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Tulis pesan..." className="flex-1 rounded-full bg-slate-100 px-4 py-3 outline-none dark:bg-slate-800"/><button onClick={() => send()} className="grid h-11 w-11 place-items-center rounded-full bg-teal-600 text-white"><Send size={19}/></button></footer></> : <div class="m-auto text-center text-slate-400"><div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-slate-200 dark:bg-slate-800"><Bell/></div><h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Selamat datang di ChatKita</h2><p>Pilih percakapan atau kontak untuk mulai mengobrol</p></div>}
    </main>
  </div>;
}
