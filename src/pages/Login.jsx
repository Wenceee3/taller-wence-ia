import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Chrome } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (esRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas o usuario no encontrado.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">{esRegistro ? 'Únete al Taller' : 'Bienvenido'}</h2>
        <p className="text-slate-400 mt-2">Gestiona tus citas y consulta a nuestra IA</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* BOTÓN DE GOOGLE */}
      <button 
        onClick={loginGoogle}
        className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all mb-6 shadow-lg"
      >
        <Chrome size={20} /> Entrar con Google
      </button>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">O con email</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input 
          type="email" placeholder="Correo electrónico"
          className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-sky-500"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input 
          type="password" placeholder="Contraseña"
          className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-sky-500"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        <button className="w-full bg-sky-600 hover:bg-sky-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
          {esRegistro ? <><UserPlus size={18}/> Crear Cuenta</> : <><LogIn size={18}/> Iniciar Sesión</>}
        </button>
      </form>

      <button 
        onClick={() => setEsRegistro(!esRegistro)}
        className="w-full mt-6 text-slate-400 text-sm hover:text-white"
      >
        {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
      </button>
    </div>
  );
}

export default Login;