import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wrench, Wallet, TrendingUp, Sparkles, Lock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        // 1. Datos de Presupuestos
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

        // 2. Datos de Pedidos de Tienda
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
      alert("¡Sorteo publicado!");
      setIdeaSorteo('');
    } catch (e) {
      alert("Error al generar sorteo.");
    }
    setCreandoSorteo(false);
  };

  if (loading) return <div className="p-20 text-center text-white">Cargando panel de control...</div>;

  return (
    <div className="space-y-10 pb-20 text-white">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-slate-400 font-medium">Gestión total del taller</p>
        </div>
        <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30 text-xs font-bold uppercase flex items-center gap-2">
          <Lock size={14}/> Acceso Jefe
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Wrench size={32} />} title={stats.total} label="Trabajos" color="text-sky-400" />
        <StatCard icon={<Wallet size={32} />} title={`${stats.dinero.toLocaleString()} €`} label="Ingresos" color="text-emerald-400" />
        <StatCard icon={<TrendingUp size={32} />} title="98%" label="Estado IA" color="text-yellow-500" />
      </section>

      {/* Pedidos de Tienda */}
      <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 italic">
          <Package className="text-sky-400" /> Pedidos Pendientes de Tienda
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
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                  {ped.estado || "Recibido"}
                </span>
              </div>
            </div>
          )) : <p className="text-slate-500 text-center py-4 italic text-sm">No hay pedidos nuevos.</p>}
        </div>
      </section>

      {/* Sorteos IA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles /> Creador de Sorteos IA</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 outline-none focus:bg-white/20"
            placeholder="Idea del sorteo..."
            value={ideaSorteo} onChange={(e) => setIdeaSorteo(e.target.value)}
          />
          <button 
            onClick={crearSorteoIA} disabled={creandoSorteo}
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50"
          >
            {creandoSorteo ? 'Generando...' : 'Publicar'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 h-[450px]">
          <h2 className="text-xl font-bold mb-6 text-center">📊 Balance de Negocio</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px' }} />
                <Bar dataKey="valor" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={50} />
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
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-5">
      <div className={`${color} bg-slate-900/50 p-4 rounded-xl`}>{icon}</div>
      <div>
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
}

export default AdminPanel;