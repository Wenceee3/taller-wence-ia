import React, { useState } from 'react';
import { ShoppingCart, Tag, Trash2, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PRODUCTOS = [
  { id: 1, nombre: "Aceite Sintético 5W30", precio: 45.00, img: "https://images.unsplash.com/photo-1635843104392-4fce1090333d?q=80&w=400&auto=format&fit=crop" },
  { id: 2, nombre: "Pastillas de Freno (Juego)", precio: 85.50, img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop" },
  { id: 3, nombre: "Batería 75Ah", precio: 120.00, img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=400&auto=format&fit=crop" },
  { id: 4, nombre: "Escobillas Limpia (Par)", precio: 25.00, img: "https://images.unsplash.com/photo-1598209279122-8541213a0387?q=80&w=400&auto=format&fit=crop" }
];

function Tienda() {
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
    toast.success(`${producto.nombre} añadido`, { style: { borderRadius: '10px', background: '#1e293b', color: '#fff' } });
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  const confirmarPedido = async () => {
  const user = auth.currentUser;
  if (!user) {
    toast.error("Debes iniciar sesión para comprar");
    return;
  }

  try {
    await addDoc(collection(db, "pedidos"), {
      clienteEmail: user.email,
      items: carrito,
      total: total,
      estado: "Pendiente",
      fecha: serverTimestamp()
    });

    toast.success("¡Pedido realizado! Pásate por el taller a por él", { icon: '📦' });
    setCarrito([]);
    setMostrarCarrito(false);
  } catch (e) {
    toast.error("Error al procesar el pedido");
  }
};


  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  return (
    <div className="py-10 relative">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-bold flex items-center gap-3 text-white">
            <ShoppingCart className="text-sky-400" /> Tienda Wence
          </h2>
          <p className="text-slate-400">Recambios originales para tu vehículo.</p>
        </div>
        
        {/* Botón Carrito */}
        <button 
          onClick={() => setMostrarCarrito(!mostrarCarrito)}
          className="bg-sky-600 p-4 rounded-2xl flex items-center gap-3 font-bold hover:bg-sky-500 transition-all relative shadow-lg shadow-sky-500/20"
        >
          <ShoppingCart size={24} />
          <span>{carrito.length} ítems</span>
          {carrito.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span>}
        </button>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTOS.map((p) => (
          <div key={p.id} className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden hover:border-sky-500/50 transition-all group">
            <div className="h-40 overflow-hidden">
              <img src={p.img} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{p.nombre}</h3>
              <p className="text-sky-400 font-bold text-xl mb-4">{p.precio.toFixed(2)} €</p>
              <button 
                onClick={() => agregarAlCarrito(p)}
                className="w-full bg-slate-700 hover:bg-sky-600 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Tag size={16} /> Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal del Carrito Lateral */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-8 shadow-2xl border-l border-slate-700 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Tu Pedido</h2>
              <button onClick={() => setMostrarCarrito(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4 h-[60vh] overflow-y-auto pr-2">
              {carrito.length === 0 ? (
                <p className="text-slate-500 italic text-center mt-20">El carrito está vacío</p>
              ) : (
                carrito.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div>
                      <p className="font-bold text-sm">{item.nombre}</p>
                      <p className="text-sky-400 text-xs">{item.precio} €</p>
                    </div>
                    <button onClick={() => eliminarDelCarrito(index)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="absolute bottom-10 left-8 right-8 space-y-4">
              <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-sky-400">{total.toFixed(2)} €</span>
              </div>
              <button 
    onClick={confirmarPedido} // Aquí llamamos a la función real de Firebase
    disabled={carrito.length === 0}
    className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-sky-600/20"
  >
    <PackageCheck size={20}/> Confirmar y Recoger en Taller
  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default Tienda;