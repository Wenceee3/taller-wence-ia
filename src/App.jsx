import React, { useEffect, useState } from 'react';
import { db } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wrench, Wallet, TrendingUp } from 'lucide-react';

import ContactoIA from './components/ContactoIA';
import GeneradorFacturas from './components/GeneradorFacturas';

function App() {
  const [stats, setStats] = useState({ total: 0, dinero: 0 });
  const [dataGrafica, setDataGrafica] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkModels = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=TU_API_KEY`);
      const data = await response.json();
      console.log("Modelos disponibles para mi clave:", data);
    } catch (e) {
      console.error("Error al listar modelos:", e);
    }
  };
  checkModels();


    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "presupuestos"));
        let sumaDinero = 0;
        let contador = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const precioNum = parseFloat(data.precio) || 0; 
          sumaDinero += precioNum;
          contador++;
        });

        setStats({ total: contador, dinero: sumaDinero });
        setDataGrafica([
          { name: 'Presupuestos', valor: contador },
          { name: 'Facturación (€)', valor: sumaDinero }
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error al leer Firebase: ", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Cargando datos del taller...</p>
    </div>
  );

  return (
    <div className="main-container">
      <header className="main-header">
        <h1>🛠️ Taller Wence <span>| Panel DAW</span></h1>
      </header>
      
      {/* Sección 1: KPIs (Tarjetas) */}
      <section className="stats-grid">
        <StatCard icon={<Wrench size={40} />} title={stats.total} label="Trabajos" color="#38bdf8" />
        <StatCard icon={<Wallet size={40} />} title={`${stats.dinero.toLocaleString()} €`} label="Ingresos" color="#10b981" />
        <StatCard icon={<TrendingUp size={40} />} title="Activo" label="Servicio" color="#eab308" />
      </section>

      {/* Sección 2: Gráfica */}
      <section className="content-block">
        <h2>📊 Rendimiento del Negocio</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Bar dataKey="valor" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Sección 3: Facturación (El nuevo componente) */}
      <section className="content-block">
        <GeneradorFacturas />
      </section>

      {/* Sección 4: Chat IA */}
      <section className="content-block">
        <ContactoIA stats={stats} />
      </section>

      <style>{`
        .main-container { padding: 40px; background-color: #0f172a; min-height: 100vh; color: white; font-family: sans-serif; }
        .main-header { border-bottom: 1px solid #334155; margin-bottom: 30px; padding-bottom: 20px; }
        .main-header h1 span { font-size: 16px; color: #94a3b8; font-weight: normal; }
        .stats-grid { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
        .content-block { background: #1e293b; padding: 30px; border-radius: 20px; border: 1px solid #334155; margin-bottom: 30px; }
        .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; }
      `}</style>
    </div>
  );
}

// Un pequeño sub-componente interno para no repetir código de tarjetas
function StatCard({ icon, title, label, color }) {
  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #334155' }}>
      <div style={{ color }}>{icon}</div>
      <div>
        <h3 style={{ margin: 0, fontSize: '24px' }}>{title}</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>{label}</p>
      </div>
    </div>
  );
}

export default App;