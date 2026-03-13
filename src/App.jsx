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
import { Wrench, Home as HomeIcon, ShoppingBag, Gift, MessageSquare, Lock, LogOut, User } from 'lucide-react';

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
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Wrench className="text-sky-400" />
              <span>Taller Wence</span>
            </div>
            
            <div className="hidden md:flex gap-8 text-sm font-medium items-center">
              <Link to="/" className="hover:text-sky-400">Inicio</Link>
              <Link to="/tienda" className="hover:text-sky-400">Tienda</Link>
              <Link to="/sorteos" className="hover:text-sky-400">Sorteos</Link>
              <Link to="/contacto" className="hover:text-sky-400">IA Chat</Link>
              
              {usuario?.email === "wencejunior@gmail.com" && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                  <Lock size={16}/> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              {usuario ? (
                <div className="flex items-center gap-4">
                  <Link to="/perfil" className="hover:text-sky-400 flex items-center gap-1 text-sm italic">
                    <User size={16}/> Mi Perfil
                  </Link>
                  <button onClick={cerrarSesion} className="bg-slate-700 hover:bg-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-1">
                    <LogOut size={16}/> Salir
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg text-sm font-bold">Entrar</Link>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/sorteos" element={<Sorteos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/contacto" element={<div className="py-10"><ContactoIA stats={{total: 0, dinero: 0}} /></div>} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;