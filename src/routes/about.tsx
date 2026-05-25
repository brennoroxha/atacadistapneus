import { createFileRoute } from "@tanstack/react-router";
import { HardHat, Users, Award, Truck } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="bg-industrial-blue text-white py-32 relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10 text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black  tracking-tighter leading-none">
            NOSSA <span className="text-safety-orange">HISTÓRIA</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">
            Desde 2014 transformando a forma como o Brasil constrói, com tecnologia e logística de ponta.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-safety-orange/10 -skew-x-12 translate-x-1/2"></div>
      </section>

      <section className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-black  tracking-tighter text-industrial-blue">Onde tudo começou</h2>
          <div className="h-1 w-20 bg-safety-orange"></div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A ConstruMais nasceu do desejo de simplificar o acesso a materiais de construção de qualidade. Percebemos que o mercado tradicional era lento, burocrático e muitas vezes inacessível para quem precisava de agilidade.
            </p>
            <p>
              Fundada por engenheiros civis com décadas de experiência em campo, nossa empresa foi desenhada para resolver os gargalos logísticos e garantir que nenhum canteiro de obras pare por falta de material.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-2">
              <div className="bg-muted p-4 rounded-lg w-fit"><Users className="h-6 w-6 text-safety-orange" /></div>
              <h4 className="font-bold  text-xs tracking-widest">Equipe de Especialistas</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-muted p-4 rounded-lg w-fit"><Award className="h-6 w-6 text-safety-orange" /></div>
              <h4 className="font-bold  text-xs tracking-widest">Qualidade Certificada</h4>
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
          <img src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=1200" alt="Equipe" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 border-[20px] border-white/10 m-8 pointer-events-none"></div>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="container px-4 mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-black  tracking-tighter text-industrial-blue">Nossos Valores</h2>
            <p className="text-muted-foreground">O que nos guia todos os dias em cada entrega.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-12 rounded-2xl shadow-sm border-b-4 border-safety-orange space-y-6">
              <HardHat className="h-12 w-12 text-industrial-blue mx-auto" />
              <h3 className="font-bold  tracking-widest">Segurança em Primeiro Lugar</h3>
              <p className="text-sm text-muted-foreground">Seguimos rigorosamente todas as normas de segurança para nossos colaboradores e clientes.</p>
            </div>
            <div className="bg-white p-12 rounded-2xl shadow-sm border-b-4 border-safety-orange space-y-6">
              <Truck className="h-12 w-12 text-industrial-blue mx-auto" />
              <h3 className="font-bold  tracking-widest">Compromisso com Prazo</h3>
              <p className="text-sm text-muted-foreground">Sabemos que tempo é dinheiro na obra. Nossa logística é otimizada para pontualidade.</p>
            </div>
            <div className="bg-white p-12 rounded-2xl shadow-sm border-b-4 border-safety-orange space-y-6">
              <Users className="h-12 w-12 text-industrial-blue mx-auto" />
              <h3 className="font-bold  tracking-widest">Foco no Cliente</h3>
              <p className="text-sm text-muted-foreground">Nossa equipe de suporte está sempre pronta para ajudar na escolha dos melhores materiais.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
