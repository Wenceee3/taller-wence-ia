import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wrench, Wallet, TrendingUp, Sparkles, Lock, Package, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from 'react-hot-toast';

import GeneradorFacturas from '../components/GeneradorFacturas';
import AnalizadorFacturas from '../components/AnalizadorFacturas';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

function AdminPanel() {
  const [stats, setStats] = useState({ total: 0, dinero: 0 });
  const [dataGrafica, setDataGrafica] = useState([]);
  const [pedidosAdmin, setPedidosAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ideaSorteo, setIdeaSorteo] = useState('');
  const [creandoSorteo, setCreandoSorteo] = useState(false);
  
  // NUEVO: Estado para Laravel
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '', imagen: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.email !== "wencejunior@gmail.com") {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "presupuestos"));
        let sumaDinero = 0;
        let contador = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          sumaDinero += parseFloat(data.precio) || 0;
          contador++;
        });
        setStats({ total: contador, dinero: sumaDinero });
        setDataGrafica([{ name: 'Trabajos', valor: contador }, { name: 'Euros (€)', valor: sumaDinero }]);

        const resPedidos = await getDocs(collection(db, "pedidos"));
        setPedidosAdmin(resPedidos.docs.map(d => ({ id: d.id, ...d.data() })));

        setLoading(false);
      } catch (error) {
        console.error("Error Firebase:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // NUEVO: Función para guardar en Laravel
  const guardarEnLaravel = async (e) => {
    e.preventDefault();
    if(!nuevoProducto.nombre || !nuevoProducto.precio) return toast.error("Rellena los campos");

    try {
      const resp = await fetch('http://localhost:8000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });
      
      if (resp.ok) {
        toast.success("¡Producto guardado en Laravel!");
        setNuevoProducto({ nombre: '', precio: '', stock: '', imagen: '' });
      }
    } catch (error) {
      toast.error("Error conectando con el servidor Laravel");
    }
  };

  const crearSorteoIA = async () => {
    if (!ideaSorteo) return;
    setCreandoSorteo(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const prompt = `Crea un sorteo para un taller mecánico basado en esta idea: "${ideaSorteo}". Responde ÚNICAMENTE un objeto JSON con: titulo, descripcion, fechaFin (dd/mm/yyyy).`;
      const result = await model.generateContent(prompt);
      const texto = result.response.text().replace(/```json|```/g, "");
      const datos = JSON.parse(texto);

      await addDoc(collection(db, "sorteos"), {
        ...datos,
        fechaCreacion: serverTimestamp(),
        participantes: []
      });
      toast.success("¡Sorteo publicado!");
      setIdeaSorteo('');
    } catch (e) {
      toast.error("Error al generar sorteo.");
    }
    setCreandoSorteo(false);
  };

  if (loading) return <div className="p-20 text-center text-white italic">Cargando sistemas del taller...</div>;

  return (
    <div className="space-y-10 pb-20 text-white">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">PANEL DE CONTROL</h1>
          <p className="text-slate-400 font-medium">Gestión híbrida: Laravel + Firebase</p>
        </div>
        <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 text-xs font-bold flex items-center gap-2">
          <Lock size={14}/> MODO JEFE ACTIVADO
        </div>
      </header>

      {/* NUEVA SECCIÓN: FORMULARIO LARAVEL */}
      <section className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-sky-500/20 shadow-2xl shadow-sky-500/5">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-sky-400">
          <PlusCircle size={20}/> Añadir al Inventario Real (Laravel)
        </h2>
        <form onSubmit={guardarEnLaravel} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" placeholder="Nombre pieza" 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl focus:border-sky-500 outline-none"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
          />
          <input 
            type="number" placeholder="Precio (€)" 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl focus:border-sky-500 outline-none"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
          />
          <input 
            type="number" placeholder="Stock" 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl focus:border-sky-500 outline-none"
            value={nuevoProducto.stock}
            onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})}
          />
          <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-600/20">
            Añadir Pieza
          </button>
        </form>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Wrench size={32} />} title={stats.total} label="Trabajos Realizados" color="text-sky-400" />
        <StatCard icon={<Wallet size={32} />} title={`${stats.dinero.toLocaleString()} €`} label="Facturación Total" color="text-emerald-400" />
        <StatCard icon={<TrendingUp size={32} />} title="Online" label="Estado Servidor PHP" color="text-yellow-500" />
      </section>

      {/* Pedidos de Tienda (Firebase) */}
      <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 italic">
          <Package className="text-sky-400" /> Pedidos Recientes
        </h2>
        <div className="space-y-4">
          {pedidosAdmin.length > 0 ? pedidosAdmin.map(ped => (
            <div key={ped.id} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div>
                <p className="font-bold text-sky-400 text-sm">{ped.clienteEmail}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {ped.items?.map(i => i.nombre).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold">{ped.total?.toFixed(2)} €</p>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 uppercase font-bold">
                  {ped.estado || "Pagado"}
                </span>
              </div>
            </div>
          )) : <p className="text-slate-500 text-center py-4 italic text-sm">No hay pedidos registrados.</p>}
        </div>
      </section>

      {/* Sorteos IA */}
      <section className="bg-gradient-to-r from-sky-600 to-indigo-600 p-8 rounded-3xl shadow-xl shadow-sky-500/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles /> Generador de Sorteos IA</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-sky-100 outline-none focus:bg-white/20"
            placeholder="Ej: Sorteo de un cambio de aceite gratis para fidelizar clientes..."
            value={ideaSorteo} onChange={(e) => setIdeaSorteo(e.target.value)}
          />
          <button 
            onClick={crearSorteoIA} disabled={creandoSorteo}
            className="bg-white text-sky-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all disabled:opacity-50 uppercase text-sm"
          >
            {creandoSorteo ? 'Procesando...' : 'Publicar Sorteo'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 h-[450px]">
          <h2 className="text-xl font-bold mb-6 text-center italic">Balance de Negocio</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px' }} />
                <Bar dataKey="valor" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <AnalizadorFacturas />
      </div>

      <GeneradorFacturas />
    </div>
  );
}

function StatCard({ icon, title, label, color }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-5 hover:border-slate-500 transition-colors">
      <div className={`${color} bg-slate-900/50 p-4 rounded-xl shadow-inner`}>{icon}</div>
      <div>
        <h3 className="text-3xl font-black tracking-tight">{title}</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">{label}</p>
      </div>
    </div>
  );
}

export default AdminPanel;