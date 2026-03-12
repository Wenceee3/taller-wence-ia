import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Search, FileSearch, CheckCircle } from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

function AnalizadorFacturas() {
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

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
    setResultado(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const imagePart = await fileToGenerativePart(file);

      const prompt = "Actúa como un contable experto en talleres. Analiza esta factura. Dime: 1. Proveedor, 2. Fecha, 3. Lista de productos con precio, 4. Total final. Formatea todo en puntos claros.";

      const result = await model.generateContent([prompt, imagePart]);
      setResultado(result.response.text());
    } catch (error) {
      console.error(error);
      setResultado("Error: Asegúrate de que la API Key sea correcta y la imagen clara.");
    }
    setCargando(false);
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FileSearch className="text-sky-400" /> Analizador de Facturas IA
      </h2>
      
      <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-slate-600 rounded-2xl p-6 hover:border-sky-500 transition-all group">
        <input 
          type="file" 
          accept="image/*" 
          onChange={analizarImagen} 
          className="hidden" 
          id="upload-factura"
        />
        <label htmlFor="upload-factura" className="cursor-pointer flex flex-col items-center">
          <Search size={40} className="text-slate-500 group-hover:text-sky-400 mb-2" />
          <span className="text-slate-400 text-sm group-hover:text-white font-medium">Subir Factura (JPG/PNG)</span>
        </label>
      </div>

      {cargando && (
        <div className="mt-4 p-4 bg-sky-900/20 rounded-xl flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sky-400 text-sm font-bold uppercase tracking-widest">Escaneando con IA...</p>
        </div>
      )}
      
      {resultado && (
        <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700 overflow-y-auto max-h-[250px]">
          <div className="flex items-center gap-2 text-emerald-400 mb-2 font-bold text-xs uppercase tracking-wider">
            <CheckCircle size={14} /> Resultados del Escaneo
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{resultado}</p>
        </div>
      )}
    </div>
  );
}

export default AnalizadorFacturas;