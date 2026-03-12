import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBwNkt4pZkPyQ9e053PunL12Pw2eWs08AM");

function AnalizadorFacturas() {
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Función para convertir imagen a formato que entiende la IA
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const analizarImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCargando(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
      const imagePart = await fileToGenerativePart(file);

      const prompt = "Analiza esta factura de repuestos. Extrae los productos, cantidades y precios en formato de lista clara. Al final calcula el total acumulado.";

      const result = await model.generateContent([prompt, imagePart]);
      setResultado(result.response.text());
    } catch (error) {
      console.error("Error analizando:", error);
      setResultado("Error al leer la imagen. Inténtalo de nuevo.");
    }
    setCargando(false);
  };

  return (
    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155', marginTop: '30px' }}>
      <h2 style={{ color: '#eab308' }}>🔍 Analizador de Facturas de Proveedores (IA)</h2>
      <p>Sube una foto de un ticket o factura de piezas para que la IA extraiga los gastos automáticamente.</p>
      
      <input type="file" accept="image/*" onChange={analizarImagen} style={{ margin: '20px 0', color: 'white' }} />

      {cargando && <p>🤖 La IA está leyendo el documento...</p>}
      
      {resultado && (
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', whiteSpace: 'pre-wrap', border: '1px solid #38bdf8' }}>
          <strong>📋 Datos Extraídos:</strong>
          <p>{resultado}</p>
        </div>
      )}
    </div>
  );
}

export default AnalizadorFacturas;