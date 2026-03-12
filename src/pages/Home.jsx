import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Clock, Wrench } from 'lucide-react';

function Home() {
  return (
    <div className="py-10 space-y-20">
      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Cuidamos tu coche con <span className="text-sky-400 font-mono">IA</span>
          </h1>
          <p className="text-slate-400 text-lg">
            En Taller Wence combinamos la mecánica tradicional con la inteligencia artificial de vanguardia para darte el mejor servicio en Valdepeñas de Jaén.
          </p>
          <div className="flex gap-4">
            <Link to="/contacto" className="bg-sky-600 p-4 rounded-xl font-bold flex items-center gap-2 hover:bg-sky-500 transition-all">
              Hablar con el Asistente <ChevronRight size={20}/>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <img 
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop" 
            alt="Taller Mecánico" 
            className="rounded-3xl shadow-2xl border border-slate-700 shadow-sky-500/10"
          />
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard icon={<ShieldCheck className="text-emerald-400"/>} title="Garantía Total" desc="Todas nuestras reparaciones tienen 2 años de garantía certificada." />
        <FeatureCard icon={<Clock className="text-yellow-400"/>} title="Rapidez IA" desc="Nuestro sistema analiza averías al instante para reducir esperas." />
        <FeatureCard icon={<Wrench className="text-sky-400"/>} title="Expertos" desc="Mecánicos con más de 20 años de experiencia en el sector." />
      </section>
    </div>
  );
}

function FeatureCard({icon, title, desc}) {
  return (
    <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700 hover:border-sky-500/50 transition-all">
      <div className="mb-4 bg-slate-900 w-fit p-3 rounded-lg">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}

export default Home;