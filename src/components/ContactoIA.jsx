import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Bot, AlertTriangle } from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

function ContactoIA({ stats }) {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: '¡Hola! Soy el asistente inteligente del taller. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [cargando, setCargando] = useState(false);
  const [analisisNegocio, setAnalisisNegocio] = useState(null);
  const scrollRef = useRef(null);

  // 1. Cargar el análisis completo de Laravel al entrar
  useEffect(() => {
    const cargarAnalisis = async () => {
      try {
        const resp = await fetch('http://localhost:8000/api/ia/analisis-completo');
        const data = await resp.json();
        setAnalisisNegocio(data);
      } catch (e) { 
        console.log("Laravel offline o error en analítica"); 
      }
    };
    cargarAnalisis();
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevoMensajeUsuario = { role: 'user', text: mensaje };
    setChat(prev => [...prev, nuevoMensajeUsuario]);
    setMensaje('');
    setCargando(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      
      // Construimos el contexto con los datos que tenemos de Firebase y Laravel
      const infoVentas = `Firebase: ${stats.total} pedidos, ${stats.dinero}€ facturados.`;
      const infoStock = analisisNegocio 
        ? `Laravel: Valor almacén ${analisisNegocio.valor_almacen}€, Alerta: ${analisisNegocio.mensaje_alerta}. Piezas críticas: ${analisisNegocio.piezas_criticas.map(p => p.nombre).join(", ")}.`
        : "Inventario actual ok.";

      const promptIA = `Eres el experto del Taller Wence. 
      DATOS REALES: ${infoVentas} | ${infoStock}
      Si el usuario pregunta "¿Cómo va el negocio?" o "¿Qué falta?", usa estos datos.
      Si pregunta algo técnico, responde como mecánico experto.
      El usuario dice: ${mensaje}. Responde de forma experta, corta y amable.`;

      const result = await model.generateContent(promptIA);
      const respuestaIA = result.response.text();

      setChat(prev => [...prev, { role: 'bot', text: respuestaIA }]);

      // Guardar log en Firebase
      await addDoc(collection(db, "conversations"), {
        mensaje: mensaje,
        respuesta: respuestaIA,
        fecha: serverTimestamp()
      });

    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: 'Lo siento, he tenido un problema conectando con mis neuronas digitales.' }]);
    }
    setCargando(false);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
      
      {/* Alerta visual si hay piezas críticas en Laravel */}
      {analisisNegocio?.piezas_criticas?.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 text-[10px] text-amber-500 flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
          <AlertTriangle size={12}/> IA Alert: Revisar stock de {analisisNegocio.piezas_criticas[0].nombre}
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-sky-500 p-2 rounded-full shadow-lg shadow-sky-500/20">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-tighter">Asistente Taller Wence</h3>
          <p className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Sistema Inteligente Activo
          </p>
        </div>
      </div>

      {/* Cuerpo del Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none italic text-slate-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">
              Consultando bases de datos...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={enviarMensaje} className="p-4 bg-slate-800/80 backdrop-blur-md border-t border-white/5 flex gap-2">
        <input 
          className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600"
          placeholder="Pregunta sobre stock, ventas o piezas..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button type="submit" className="bg-sky-600 hover:bg-sky-500 p-3 rounded-2xl text-white transition-all active:scale-90">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ContactoIA;