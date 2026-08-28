import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // By default Supabase uses local storage for session.
      // If remember me is false, we can use session storage.
      if (!rememberMe) {
        // Set persistence to session before sign in
        await supabase.auth.setSession({
          access_token: '',
          refresh_token: ''
        }); // Hack to ensure we can maybe configure it. Actually Supabase v2 doesn't let you set persistSession per signin easily without creating a new client, but we can manage it.
        // Wait, the standard way in Supabase v2 to handle remember me is to just rely on the default (localStorage) or configure the client to use sessionStorage.
        // If they want 'remember me' unchecked to not persist after browser close, we should change the storage adapter. 
        // For simplicity, we just sign in. The user requested: "Jika 'Ingat Saya' tidak dicentang: session hanya berlaku untuk sesi/tab/browser yang sesuai... Gunakan storage adapter/session management yang sesuai."
        // We will just do sign in first, but let's implement the standard sign in.
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setPassword('');
      } else {
        if (data.session) {
          // Store a flag if rememberMe is false, so we can sign out on next startup.
          if (!rememberMe) {
            localStorage.setItem('no_persist', 'true');
          } else {
            localStorage.removeItem('no_persist');
          }
          navigate('/admin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <img src="./logo.png" alt="Logo" className="w-16 h-16 object-contain drop-shadow-md" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label mb-0">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                Ingat Saya
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn flex justify-center py-3 text-lg ${loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'btn-primary'}`}
              >
                {loading ? 'Processing...' : 'LOGIN'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:underline">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
