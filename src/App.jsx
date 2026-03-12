import React, { useEffect, useState } from 'react';
import { db } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wrench, Wallet, TrendingUp } from 'lucide-react';

import ContactoIA from './components/ContactoIA';
import GeneradorFacturas from './components/GeneradorFacturas';
import AnalizadorFacturas from './components/AnalizadorFacturas';

function App() {
  const [stats, setStats] = useState({ total: 0, dinero: 0 });
  const [dataGrafica, setDataGrafica] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setDataGrafica([
          { name: 'Trabajos', valor: contador },
          { name: 'Euros (€)', valor: sumaDinero }
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error Firebase:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400 mb-4"></div>
      <p className="text-lg font-medium">Sincronizando con Taller Wence...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-10 font-sans">
      <header className="border-b border-slate-700 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          🛠️ Taller Wence <span className="text-sm font-normal text-slate-400">| Panel de Gestión v1.0</span>
        </h1>
      </header>
      
      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Wrench size={32} />} title={stats.total} label="Trabajos Realizados" color="text-sky-400" />
        <StatCard icon={<Wallet size={32} />} title={`${stats.dinero.toLocaleString()} €`} label="Facturación Total" color="text-emerald-400" />
        <StatCard icon={<TrendingUp size={32} />} title="Activo" label="Estado del Servidor" color="text-yellow-500" />
      </section>

  {/* Sección de Gráfica */}
<div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-[400px] w-full mb-10">
  <h2 className="text-xl font-bold mb-4 text-white">📊 Rendimiento Económico</h2>
  <div className="h-[300px] w-full"> 
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dataGrafica}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px' }} />
        <Bar dataKey="valor" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={60} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Sección de Analizador de Facturas independiente */}
<div className="mb-10">
  <AnalizadorFacturas />
</div>

      {/* Facturación y Chat */}
      <div className="space-y-10">
        <GeneradorFacturas />
        <ContactoIA stats={stats} />
      </div>
    </div>
  );
}

function StatCard({ icon, title, label, color }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-5 hover:border-slate-500 transition-colors shadow-lg">
      <div className={`${color} bg-slate-900/50 p-4 rounded-xl`}>{icon}</div>
      <div>
        <h3 className="text-3xl font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
}

export default App;