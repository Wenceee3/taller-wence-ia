import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

const PRODUCTOS = [
  { id: 1, nombre: "Aceite Sintético 5W30", precio: "45.00", img: "https://images.unsplash.com/photo-1635843104392-4fce1090333d?q=80&w=400&auto=format&fit=crop" },
  { id: 2, nombre: "Pastillas de Freno (Juego)", precio: "85.50", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop" },
  { id: 3, nombre: "Batería 75Ah", precio: "120.00", img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400&auto=format&fit=crop" }
];

function Tienda() {
  return (
    <div className="py-10">
      <h2 className="text-4xl font-bold mb-2 flex items-center gap-3 text-white">
        <ShoppingCart className="text-sky-400" /> Tienda de Repuestos
      </h2>
      <p className="text-slate-400 mb-10">Recambios originales con garantía de Taller Wence.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTOS.map((p) => (
          <div key={p.id} className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden hover:border-sky-500/50 transition-all group">
            <img src={p.img} alt={p.nombre} className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{p.nombre}</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-sky-400">{p.precio} €</span>
                <button className="bg-sky-600 hover:bg-sky-500 p-3 rounded-xl transition-colors">
                  <Tag size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tienda;