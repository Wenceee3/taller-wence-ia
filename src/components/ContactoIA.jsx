import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Bot, User } from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

function ContactoIA({ stats }) {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: '¡Hola! Soy el asistente del Taller Wence. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al último mensaje
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
      const prompt = `Eres el asistente del Taller Wence. Datos taller: ${stats.total} trabajos, ${stats.dinero}€ facturados. El usuario dice: ${mensaje}. Responde corto y amable.`;

      const result = await model.generateContent(prompt);
      const respuestaIA = result.response.text();

      setChat(prev => [...prev, { role: 'bot', text: respuestaIA }]);

      // Guardar en Firebase
      await addDoc(collection(db, "conversations"), {
        mensaje: mensaje,
        respuesta: respuestaIA,
        fecha: serverTimestamp()
      });

    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: 'Lo siento, he tenido un problema técnico. ¿Podemos intentarlo de nuevo?' }]);
    }
    setCargando(false);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Cabecera */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-sky-500 p-2 rounded-full">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Asistente Taller Wence</h3>
          <p className="text-emerald-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> En línea
          </p>
        </div>
      </div>

      {/* Cuerpo del Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 italic text-slate-400 text-xs">
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={enviarMensaje} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-sky-500 transition-all"
          placeholder="Escribe tu duda aquí..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button type="submit" className="bg-sky-600 hover:bg-sky-500 p-2 rounded-xl text-white transition-colors">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ContactoIA;