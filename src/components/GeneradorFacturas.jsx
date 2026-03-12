import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download } from 'lucide-react';

function GeneradorFacturas() {
  const [presupuestos, setPresupuestos] = useState([]);

  useEffect(() => {
    const fetchPresupuestos = async () => {
      const querySnapshot = await getDocs(collection(db, "presupuestos"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPresupuestos(docs);
    };
    fetchPresupuestos();
  }, []);

  const descargarPDF = (p) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("TALLER WENCE - FACTURA", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Av. Constitución, 15 - Valdepeñas de Jaén", 20, 28);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 28);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, 35, 190, 35);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`CLIENTE: ${p.nombreCliente || 'N/A'}`, 20, 45);
    doc.text(`VEHÍCULO: ${p.modeloVehiculo || 'N/A'} (${p.matricula || 'S/M'})`, 20, 52);

    autoTable(doc, {
      startY: 65,
      head: [['Descripción del Servicio', 'Estado', 'Importe']],
      body: [[p.descripcionProblema || 'Revisión general', p.estado || 'Finalizado', `${p.precio || 0} €`]],
      headStyles: { fillColor: [0, 51, 102] },
    });

    doc.save(`Factura_${p.nombreCliente || 'taller'}.pdf`);
  };

  return (
    <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl mt-8">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="text-emerald-400" /> Gestión de Facturación
      </h2>
      <p className="text-slate-400 mb-6">Genera facturas oficiales en PDF de los presupuestos aprobados.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-600 text-slate-400 uppercase text-xs tracking-wider">
              <th className="p-4">Cliente</th>
              <th className="p-4">Vehículo</th>
              <th className="p-4">Precio</th>
              <th className="p-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 divide-y divide-slate-700">
            {presupuestos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 font-medium">{p.nombreCliente}</td>
                <td className="p-4">{p.modeloVehiculo}</td>
                <td className="p-4 text-emerald-400 font-bold">{p.precio} €</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => descargarPDF(p)} 
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
                  >
                    <Download size={16} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GeneradorFacturas;