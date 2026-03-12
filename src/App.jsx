import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Tienda from './pages/Tienda';
import Sorteos from './pages/Sorteos';
import AdminPanel from './pages/AdminPanel';
import ContactoIA from './components/ContactoIA';
import { Wrench, Home as HomeIcon, ShoppingBag, Gift, MessageSquare, Lock } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-white">
        {/* NAVBAR GLOBAL */}
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Wrench className="text-sky-400" />
              <span>Taller Wence</span>
            </div>
            
            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link to="/" className="hover:text-sky-400 flex items-center gap-1"><HomeIcon size={16}/> Inicio</Link>
              <Link to="/tienda" className="hover:text-sky-400 flex items-center gap-1"><ShoppingBag size={16}/> Tienda</Link>
              <Link to="/sorteos" className="hover:text-sky-400 flex items-center gap-1"><Gift size={16}/> Sorteos</Link>
              <Link to="/contacto" className="hover:text-sky-400 flex items-center gap-1"><MessageSquare size={16}/> IA Chat</Link>
              <Link to="/admin" className="text-slate-400 hover:text-red-400 flex items-center gap-1"><Lock size={16}/> Admin</Link>
            </div>

            <Link to="/login" className="bg-sky-600 hover:bg-sky-500 px-5 py-2 rounded-full text-sm font-bold transition-all">
              Entrar
            </Link>
          </div>
        </nav>

        {/* CONTENIDO DE LAS PÁGINAS */}
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/sorteos" element={<Sorteos />} />
            <Route path="/contacto" element={<div className="py-10"><ContactoIA stats={{total: 0, dinero: 0}} /></div>} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;