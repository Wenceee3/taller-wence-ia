import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { Gift, Calendar, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

function Sorteos() {
  const [listaSorteos, setListaSorteos] = useState([]);

  useEffect(() => {
    const fetchSorteos = async () => {
      const querySnapshot = await getDocs(collection(db, "sorteos"));
      setListaSorteos(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSorteos();
  }, []);

  const participar = async (idSorteo) => {
    const user = auth.currentUser;
    if (!user) return toast.error("Debes iniciar sesión para participar en el sorteo");

    try {
      const sorteoRef = doc(db, "sorteos", idSorteo);
      await updateDoc(sorteoRef, {
        participantes: arrayUnion(user.email)
      });
      toast.success("¡Genial! Ya estás participando.");
    } catch (e) {
      toast.error("Error al intentar participar.");
    }
  };

  return (
    <div className="py-10 max-w-5xl mx-auto space-y-12">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 rounded-[3rem] shadow-2xl text-center space-y-6">
        <div className="bg-white/20 w-fit p-4 rounded-full mx-auto">
          <Gift size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight italic uppercase">Zona de Premios</h2>
        <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
          ¡Gracias por confiar en Taller Wence! Aquí verás los sorteos generados por nuestra IA para premiar a nuestros clientes más fieles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {listaSorteos.length > 0 ? (
          listaSorteos.map(s => (
            <div key={s.id} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-indigo-500 transition-all flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white leading-tight">{s.titulo}</h3>
                  <Gift className="text-indigo-400 shrink-0" size={28} />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">"{s.descripcion}"</p>
              </div>
              
              <div className="flex justify-between items-center border-t border-slate-700 pt-6 mt-4">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-400"/> LÍMITE: {s.fechaFin}
                </span>
                <button 
                  onClick={() => participar(s.id)}
                  className="bg-indigo-600 hover:bg-indigo-500 px-8 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95"
                >
                  Participar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-slate-500 flex flex-col items-center gap-3 italic">
            <Info size={40} />
            <p>No hay sorteos activos en este momento. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sorteos;