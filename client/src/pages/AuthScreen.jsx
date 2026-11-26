import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { api, login } = useApp();
  const [isRegister, setIsRegister] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = React.useState('');
  const submit = async event => {
    event.preventDefault(); setError('');
    try {
      const { data } = await api.post(`/auth/${isRegister ? 'register' : 'login'}`, form);
      login(data);
    } catch (e) { setError(e.response?.data?.message || 'Gagal terhubung'); }
  };
  const change = event => setForm({ ...form, [event.target.name]: event.target.value });
  return <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
      <div className="mb-7 text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-teal-600 text-2xl font-bold text-white">C</div><h1 className="text-2xl font-bold dark:text-white">ChatKita</h1><p className="mt-1 text-sm text-slate-500">{isRegister ? 'Buat akun baru' : 'Masuk ke akun Anda'}</p></div>
      {isRegister && <input name="name" placeholder="Nama lengkap" onChange={change} className="field" />}
      <input name="username" placeholder={isRegister ? 'Username' : 'Username atau email'} onChange={change} className="field" />
      {isRegister && <input name="email" type="email" placeholder="Email" onChange={change} className="field" />}
      <input name="password" type="password" placeholder="Password" onChange={change} className="field" />
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}<button className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white">{isRegister ? 'Daftar' : 'Masuk'}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="mt-4 w-full text-sm text-teal-600">{isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}</button>
    </form>
  </main>;
}
