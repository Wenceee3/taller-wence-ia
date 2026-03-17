import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. Cargar productos desde LARAVEL
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/productos');
        const data = await res.json();
        setProductos(data);
        setCargando(false);
      } catch (err) {
        console.error("Error cargando de Laravel:", err);
        toast.error("Servidor Laravel offline");
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);

  const agregarAlCarrito = (prod) => {
    if (prod.stock <= 0) return toast.error("Sin stock disponible");
    setCarrito([...carrito, prod]);
    toast.success(`${prod.nombre} añadido al carrito`);
  };

  // 2. LÓGICA DE COMPRA HÍBRIDA (Firebase + Laravel)
  const finalizarCompra = async () => {
    if (!auth.currentUser) return toast.error("Debes iniciar sesión para comprar");
    if (carrito.length === 0) return;

    try {
      // A. Guardar pedido en FIREBASE
      await addDoc(collection(db, "pedidos"), {
        clienteEmail: auth.currentUser.email,
        items: carrito,
        total: carrito.reduce((sum, i) => sum + parseFloat(i.precio), 0),
        fecha: serverTimestamp(),
        estado: 'Pagado'
      });

      // B. Restar stock en LARAVEL
      await fetch('http://localhost:8000/api/productos/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: carrito })
      });

      // C. Actualizar UI localmente
      const nuevosProductos = productos.map(p => {
        const cantidadComprada = carrito.filter(item => item.id === p.id).length;
        return { ...p, stock: p.stock - cantidadComprada };
      });
      setProductos(nuevosProductos);

      setCarrito([]);
      toast.success("¡Compra realizada con éxito!");
    } catch (e) {
      console.error(e);
      toast.error("Error en el proceso de compra");
    }
  };

  if (cargando) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sky-400 font-bold animate-pulse uppercase tracking-widest text-xs">Conectando con Almacén Laravel...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
      
      {/* Listado de Productos */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-sky-500/50 transition-all group shadow-2xl">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={prod.imagen || 'https://via.placeholder.com/400x300?text=Taller+Wence'} 
                alt={prod.nombre} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                prod.stock < 5 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-900/80 text-sky-400 border-sky-500/20'
              }`}>
                Stock: {prod.stock}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{prod.nombre}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-black text-emerald-400">{parseFloat(prod.precio).toFixed(2)}€</span>
                <button 
                  onClick={() => agregarAlCarrito(prod)}
                  disabled={prod.stock <= 0}
                  className={`p-3 rounded-2xl transition-all active:scale-90 ${
                    prod.stock <= 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                  }`}
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carrito Lateral */}
      <div className="lg:col-span-1">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24 shadow-2xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase tracking-tighter">
            <ShoppingCart className="text-sky-400" size={24} /> Mi Pedido
          </h2>
          
          <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-slate-700 mb-2" size={40} />
                <p className="text-slate-500 italic text-xs">Carrito vacío</p>
              </div>
            ) : (
              carrito.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-right-4">
                  <span className="text-[11px] font-bold truncate max-w-[120px] uppercase">{item.nombre}</span>
                  <span className="text-xs font-black text-emerald-400">{item.precio}€</span>
                </div>
              ))
            )}
          </div>

          {carrito.length > 0 && (
            <div className="border-t border-white/10 pt-5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Total</span>
                <span className="text-3xl font-black text-white italic">
                  {carrito.reduce((sum, i) => sum + parseFloat(i.precio), 0).toFixed(2)}€
                </span>
              </div>
              <button 
                onClick={finalizarCompra}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-white"
              >
                Confirmar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tienda;