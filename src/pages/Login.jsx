import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (esRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/'); // Al loguear, vamos a la Home
    } catch (err) {
      setError('Error: Revisa tus credenciales o el formato del correo.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">{esRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
        <p className="text-slate-400 mt-2">Accede al portal del Taller Wence</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
          <input 
            type="email" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-sky-500 transition-all"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Contraseña</label>
          <input 
            type="password" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-sky-500 transition-all"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>

        <button className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
          {esRegistro ? <><UserPlus size={20}/> Registrarme</> : <><LogIn size={20}/> Entrar</>}
        </button>
      </form>

      <button 
        onClick={() => setEsRegistro(!esRegistro)}
        className="w-full mt-6 text-slate-400 text-sm hover:text-white transition-colors"
      >
        {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
      </button>
    </div>
  );
}

export default Login;