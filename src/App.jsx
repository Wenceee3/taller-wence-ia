import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Tienda from './pages/Tienda';
import Sorteos from './pages/Sorteos';
import AdminPanel from './pages/AdminPanel';
import Perfil from './pages/Perfil';
import ContactoIA from './components/ContactoIA';
import { Wrench, LogOut, User, Lock, ShoppingBag, Gift, MessageSquare } from 'lucide-react';

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const desubscribir = onAuthStateChanged(auth, (user) => setUsuario(user));
    return () => desubscribir();
  }, []);

  const cerrarSesion = () => signOut(auth);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#0f172a] text-white">
        {/* NAVBAR ACTUALIZADO */}
        <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            
            {/* LOGO CON ANIMACIÓN */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-sky-500 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-sky-500/20">
                <Wrench className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                Wence<span className="text-sky-400">Taller</span>
              </span>
            </Link>
            
            {/* LINKS CENTRALES */}
            <div className="hidden md:flex gap-8 text-sm font-semibold items-center">
              <Link to="/tienda" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <ShoppingBag size={16}/> Tienda
              </Link>
              <Link to="/sorteos" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <Gift size={16}/> Sorteos
              </Link>
              <Link to="/contacto" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <MessageSquare size={16}/> IA Chat
              </Link>
              
              {usuario?.email === "wencejunior@gmail.com" && (
                <Link to="/admin" className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                  <Lock size={14}/> ADMIN
                </Link>
              )}
            </div>

            {/* USUARIO / LOGIN */}
            <div className="flex items-center gap-4">
              {usuario ? (
                <div className="flex items-center gap-4">
                  <Link to="/perfil" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/5 transition-all">
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold">
                      {usuario.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Mi Perfil</span>
                  </Link>
                  <button onClick={cerrarSesion} className="text-slate-400 hover:text-red-400 p-2 transition-colors">
                    <LogOut size={20}/>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/20 px-8 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/sorteos" element={<Sorteos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/contacto" element={<div className="py-10"><ContactoIA stats={{total: 0, dinero: 0}} /></div>} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;