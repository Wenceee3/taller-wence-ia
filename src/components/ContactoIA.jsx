import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Tu API Key de Google AI Studio
const genAI = new GoogleGenerativeAI("AIzaSyBwNkt4pZkPyQ9e053PunL12Pw2eWs08AM");

function ContactoIA({ stats }) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [respuestaBot, setRespuestaBot] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    setCargando(true);
    setRespuestaBot("");

    try {
      // CAMBIO AQUÍ: Forzamos el modelo con el prefijo "models/" que es lo que pide la API v1beta
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }, { apiVersion: 'v1beta' });
      
      const prompt = `Eres el asistente virtual del Taller Wence. 
      Datos: ${stats.total} presupuestos, ${stats.dinero}€ facturados.
      Cliente: ${nombre}. Mensaje: ${mensaje}. 
      Responde amable y breve.`;

      // CAMBIO AQUÍ: Usamos un formato de objeto más explícito para la petición
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      
      const response = await result.response;
      const textoIA = response.text();

      setRespuestaBot(textoIA);

      // Guardado en Firebase (esto ya te funcionaba)
      await addDoc(collection(db, "conversations"), {
        nombreCliente: nombre,
        mensajeOriginal: mensaje,
        respuestaIA: textoIA,
        fecha: serverTimestamp(),
        estado: "ATENDIDO_POR_IA"
      });

    } catch (error) {
      console.error("Error detallado:", error);
      // Si falla, mostramos el error real en el chat para saber qué pasa
      setRespuestaBot("Error de conexión: " + (error.message || "Revisa la consola"));
    }
    setCargando(false);
  };

  // Estilos constantes para los inputs
  const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    margin: '10px 0', 
    borderRadius: '8px', 
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#333',
    fontSize: '16px'
  };

  const btnStyle = { 
    width: '100%', 
    padding: '15px', 
    backgroundColor: '#eab308', 
    color: '#003366',
    border: 'none', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  return (
    <div style={{ backgroundColor: '#003366', padding: '50px', borderRadius: '20px', color: 'white', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      {/* Columna Izquierda: Información de contacto */}
      <div style={{ flex: '1', minWidth: '300px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Taller Wence</h2>
        <div style={{ background: 'white', color: '#333', padding: '25px', borderRadius: '15px', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>📍 Dirección</h3>
          <p style={{ fontSize: '18px', margin: 0 }}>Avenida de la Constitución, 15<br/>Valdepeñas de Jaén</p>
        </div>

        {respuestaBot && (
          <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '25px', borderRadius: '15px', borderLeft: '8px solid #0ea5e9', animation: 'fadeIn 0.5s' }}>
            <strong style={{ fontSize: '20px' }}>🤖 Asistente IA:</strong>
            <p style={{ fontSize: '18px', lineHeight: '1.5', marginTop: '10px' }}>{respuestaBot}</p>
          </div>
        )}
      </div>

      {/* Columna Derecha: Formulario */}
      <div style={{ flex: '1', minWidth: '350px', background: '#f8fafc', padding: '40px', borderRadius: '15px', color: '#333' }}>
        <h2 style={{ color: '#003366', marginTop: 0 }}>Inicia una Conversación</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Cuéntanos qué necesita tu vehículo y nuestra IA te responderá al instante.</p>
        
        <form onSubmit={enviarMensaje}>
          <label style={{ fontWeight: 'bold' }}>Tu Nombre completo*</label>
          <input 
            style={inputStyle} 
            placeholder="Ej. Juan Pérez"
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
            required 
          />
          
          <label style={{ fontWeight: 'bold' }}>¿En qué podemos ayudarte?*</label>
          <textarea 
            style={inputStyle} 
            placeholder="Escribe tu mensaje aquí..."
            rows="5" 
            value={mensaje} 
            onChange={e => setMensaje(e.target.value)} 
            required 
          />
          
          <button type="submit" style={btnStyle} disabled={cargando}>
            {cargando ? '🔄 Procesando con IA...' : 'Enviar Mensaje'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactoIA;