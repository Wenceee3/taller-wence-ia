import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Package, Gift, History } from 'lucide-react';

function Perfil() {
  const [pedidos, setPedidos] = useState([]);
  const [misSorteos, setMisSorteos] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchDatos = async () => {
      // 1. Traer pedidos del usuario
      const qPedidos = query(collection(db, "pedidos"), where("clienteEmail", "==", user.email));
      const resPedidos = await getDocs(qPedidos);
      setPedidos(resPedidos.docs.map(d => ({ id: d.id, ...d.data() })));

      // 2. Traer sorteos donde participa
      const qSorteos = query(collection(db, "sorteos"), where("participantes", "array-contains", user.email));
      const resSorteos = await getDocs(qSorteos);
      setMisSorteos(resSorteos.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchDatos();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Inicia sesión para ver tu perfil.</div>;

  return (
    <div className="py-10 space-y-10">
      <header className="flex items-center gap-4 bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700">
        <div className="bg-sky-500 p-4 rounded-full text-white shadow-lg shadow-sky-500/20">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">{user.displayName || "Usuario Wence"}</h2>
          <p className="text-slate-400">{user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mis Pedidos */}
        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-sky-400">
            <Package size={20} /> Mis Compras en Tienda
          </h3>
          <div className="space-y-4">
            {pedidos.length > 0 ? pedidos.map(p => (
              <div key={p.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold">{p.items.length} productos</p>
                  <p className="text-xs text-slate-500">{p.estado}</p>
                </div>
                <span className="font-bold text-sky-400">{p.total} €</span>
              </div>
            )) : <p className="text-slate-500 italic text-sm text-center py-4">Aún no has comprado nada.</p>}
          </div>
        </div>

        {/* Mis Sorteos */}
        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
            <Gift size={20} /> Sorteos en los que participo
          </h3>
          <div className="space-y-4">
            {misSorteos.length > 0 ? misSorteos.map(s => (
              <div key={s.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <p className="text-sm font-bold">{s.titulo}</p>
                <p className="text-xs text-indigo-400">Finaliza: {s.fechaFin}</p>
              </div>
            )) : <p className="text-slate-500 italic text-sm text-center py-4">No estás en ningún sorteo.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;