import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase'; // Asegúrate de que hay ../
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wrench, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

// Aquí está el truco: hay que subir un nivel para encontrar components
import GeneradorFacturas from '../components/GeneradorFacturas';
import AnalizadorFacturas from '../components/AnalizadorFacturas';

function AdminPanel() {
  const [stats, setStats] = useState({ total: 0, dinero: 0 });
  const [dataGrafica, setDataGrafica] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    // Si no hay usuario o el email no es el del jefe, fuera
    if (!user || user.email !== "tu-email@gmail.com") {
      navigate('/');
    }
  }, []);

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

  if (loading) return <div className="p-20 text-center">Cargando panel de control...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Título de la sección */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          <p className="text-slate-400">Gestión interna, finanzas e IA operativa.</p>
        </div>
        <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-widest">
          Acceso Restringido
        </div>
      </header>
      
      
      {/* KPIs Rápidos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Wrench size={32} />} title={stats.total} label="Trabajos Totales" color="text-sky-400" />
        <StatCard icon={<Wallet size={32} />} title={`${stats.dinero.toLocaleString()} €`} label="Facturación" color="text-emerald-400" />
        <StatCard icon={<TrendingUp size={32} />} title="98%" label="Eficiencia IA" color="text-yellow-500" />
      </section>

      {/* Gráfica y Analizador IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 h-[450px]">
          <h2 className="text-xl font-bold mb-6 text-white">📊 Rendimiento Económico</h2>
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

      {/* NUEVA SECCIÓN: Generador de Sorteos con IA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles /> Creador de Sorteos con IA
            </h2>
            <p className="text-indigo-100 mt-2">Dile a la IA qué quieres sortear y ella creará la publicación automáticamente.</p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
            Configurar Sorteo
          </button>
        </div>
      </section>

      {/* Gestión de Facturas */}
      <GeneradorFacturas />
    </div>
  );
}

function StatCard({ icon, title, label, color }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-5">
      <div className={`${color} bg-slate-900/50 p-4 rounded-xl`}>{icon}</div>
      <div>
        <h3 className="text-3xl font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
}

const [ideaSorteo, setIdeaSorteo] = useState('');
const [sorteoGenerado, setSorteoGenerado] = useState(null);

const generarSorteoIA = async () => {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const prompt = `Crea un sorteo para un taller mecánico basado en esta idea: "${ideaSorteo}". 
    Dame la respuesta en formato JSON con estos campos: titulo, descripcion, fechaFin.`;
  
  const result = await model.generateContent(prompt);
  // Aquí parsearíamos el JSON y lo guardaríamos en Firebase
  // Por ahora, solo mostramos la magia:
  setSorteoGenerado(JSON.parse(result.response.text()));
};

export default AdminPanel;