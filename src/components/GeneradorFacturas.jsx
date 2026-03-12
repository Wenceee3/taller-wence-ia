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

    // Estilo de la factura
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("TALLER WENCE - FACTURA", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Av. Constitución, 15 - Valdepeñas de Jaén", 20, 28);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 28);

    // Línea divisoria
    doc.setDrawColor(0, 51, 102);
    doc.line(20, 35, 190, 35);

    // Datos del Cliente
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`CLIENTE: ${p.nombreCliente || 'N/A'}`, 20, 45);
    doc.text(`VEHÍCULO: ${p.modeloVehiculo || 'N/A'} (${p.matricula || 'S/M'})`, 20, 52);

    // Tabla de Detalles
  autoTable(doc, {
      startY: 65,
      head: [['Descripción del Servicio', 'Estado', 'Importe']],
      body: [
        [p.descripcionProblema || 'Revisión general', p.estado || 'Finalizado', `${p.precio || 0} €`]
      ],
      headStyles: { fillColor: [0, 51, 102] },
      styles: { fontSize: 11 }
    });

    // Total final
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL A PAGAR: ${p.precio || 0} €`, 130, finalY);

    // Guardar el archivo
    doc.save(`Factura_${p.nombreCliente || 'taller'}.pdf`);
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileText color="#38bdf8" /> Gestión de Facturación
      </h2>
      <p>Selecciona un presupuesto para generar su factura oficial en PDF.</p>
      
      <table style={tableStyle}>
        <thead>
          <tr style={{ borderBottom: '2px solid #334155' }}>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Vehículo</th>
            <th style={thStyle}>Precio</th>
            <th style={thStyle}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {presupuestos.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={tdStyle}>{p.nombreCliente}</td>
              <td style={tdStyle}>{p.modeloVehiculo}</td>
              <td style={tdStyle}>{p.precio} €</td>
              <td style={tdStyle}>
                <button onClick={() => descargarPDF(p)} style={btnPdfStyle}>
                  <Download size={16} /> PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Estilos rápidos (puedes moverlos a un archivo CSS)
const containerStyle = { background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid #334155', marginTop: '30px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: '#f8fafc' };
const thStyle = { textAlign: 'left', padding: '12px', color: '#94a3b8' };
const tdStyle = { padding: '12px' };
const btnPdfStyle = { 
  display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', 
  backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
};

export default GeneradorFacturas;