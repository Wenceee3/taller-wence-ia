import React from 'react';
import { Gift, Calendar } from 'lucide-react';

function Sorteos() {
  return (
    <div className="py-10 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="bg-white/20 w-fit p-4 rounded-full mx-auto">
          <Gift size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Promociones y Sorteos</h2>
        <p className="text-indigo-100 text-lg">
          ¡Premiamos tu fidelidad! Participa en nuestros sorteos mensuales exclusivos para clientes de Valdepeñas de Jaén.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Sorteo: Cambio de Aceite Gratis</h3>
            <p className="text-slate-400 flex items-center gap-2 justify-center md:justify-start">
              <Calendar size={16} /> Finaliza el 30 de Marzo de 2026
            </p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all">
            Participar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sorteos;