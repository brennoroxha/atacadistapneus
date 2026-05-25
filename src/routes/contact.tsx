import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, MessageSquare, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Fale Conosco | Atacadista Pneus" },
      { name: "description", content: "Canais oficiais de atendimento da Atacadista Pneus. Email, WhatsApp e endereço físico em Feira de Santana/BA." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      <section className="bg-industrial-blue text-white py-20 md:py-28 relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            FALE <span className="text-safety-orange">CONOSCO</span>
          </h1>
          <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
            Estamos à disposição para esclarecer dúvidas, receber sugestões e auxiliar com seus pedidos.
          </p>
        </div>
      </section>

      <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 -mt-12 relative z-20">
        {/* Contact Form */}
        <div className="bg-card p-6 md:p-10 rounded-2xl shadow-2xl space-y-6 border">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-industrial-blue dark:text-primary">Envie uma mensagem</h2>
            <div className="h-1 w-10 bg-safety-orange"></div>
            <p className="text-sm text-muted-foreground pt-2">Responderemos no menor prazo possível.</p>
          </div>
          <form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest text-muted-foreground">Nome completo *</Label>
                <Input required placeholder="Seu nome" className="h-11 border-2 focus:border-safety-orange" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest text-muted-foreground">E-mail *</Label>
                <Input required type="email" placeholder="email@exemplo.com" className="h-11 border-2 focus:border-safety-orange" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest text-muted-foreground">Telefone</Label>
                <Input type="tel" placeholder="(00) 00000-0000" className="h-11 border-2 focus:border-safety-orange" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest text-muted-foreground">Assunto *</Label>
                <Input required placeholder="Motivo do contato" className="h-11 border-2 focus:border-safety-orange" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black tracking-widest text-muted-foreground">Mensagem *</Label>
              <Textarea required placeholder="Como podemos te ajudar?" className="min-h-[140px] border-2 focus:border-safety-orange" />
            </div>
            <label className="flex gap-2 items-start text-xs text-muted-foreground">
              <input type="checkbox" required className="mt-1" />
              <span>Concordo com a <a href="/privacy" className="text-industrial-blue dark:text-primary underline">Política de Privacidade</a> e autorizo o tratamento dos meus dados para resposta a esta mensagem.</span>
            </label>
            <Button className="w-full bg-safety-orange hover:bg-safety-orange/90 text-black font-black tracking-widest py-6 h-auto transition-transform hover:scale-[1.01]">
              Enviar Mensagem
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-10">
          <div className="space-y-5">
            <h3 className="text-2xl font-black tracking-tighter text-industrial-blue dark:text-primary">Canais Oficiais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="tel:+5549998478577" className="flex gap-3 p-5 bg-muted/50 rounded-xl border hover:border-safety-orange transition-colors">
                <Phone className="h-6 w-6 text-safety-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-xs tracking-widest">TELEFONE</h4>
                  <p className="text-sm text-muted-foreground">49 99847-8577</p>
                </div>
              </a>
              <a href="https://wa.me/5549998478577" target="_blank" rel="noopener noreferrer" className="flex gap-3 p-5 bg-muted/50 rounded-xl border hover:border-safety-orange transition-colors">
                <MessageSquare className="h-6 w-6 text-safety-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-xs tracking-widest">WHATSAPP</h4>
                  <p className="text-sm text-muted-foreground">49 99847-8577</p>
                </div>
              </a>
              <a href="mailto:contato@comercialferragens.site" className="flex gap-3 p-5 bg-muted/50 rounded-xl border hover:border-safety-orange transition-colors sm:col-span-2">
                <Mail className="h-6 w-6 text-safety-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-xs tracking-widest">E-MAIL</h4>
                  <p className="text-sm text-muted-foreground break-all">contato@comercialferragens.site</p>
                </div>
              </a>
              <div className="flex gap-3 p-5 bg-muted/50 rounded-xl border sm:col-span-2">
                <MapPin className="h-6 w-6 text-safety-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-xs tracking-widest">ENDEREÇO</h4>
                  <p className="text-sm text-muted-foreground">Avenida Jose Falcao, 75 A, Loja<br />Queimadinha - Feira de Santana/BA<br />CEP 44026-100</p>
                </div>
              </div>
              <div className="flex gap-3 p-5 bg-muted/50 rounded-xl border sm:col-span-2">
                <Clock className="h-6 w-6 text-safety-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-xs tracking-widest">HORÁRIO DE ATENDIMENTO</h4>
                  <p className="text-sm text-muted-foreground">
                    Seg a Sex: 09h às 18h<br />
                    Sábados: 09h às 13h<br />
                    Domingos e Feriados: Fechado
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-industrial-blue/5 dark:bg-primary/10 border border-industrial-blue/20 dark:border-primary/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-industrial-blue dark:text-primary" />
              <h4 className="font-bold text-sm tracking-wider text-industrial-blue dark:text-primary">DADOS DA EMPRESA</h4>
            </div>
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">Razão Social:</strong> R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA</p>
            <p className="text-xs text-muted-foreground"><strong className="text-foreground">CNPJ:</strong> 04.610.006/0004-84</p>
          </div>
        </div>
      </div>
    </div>
  );
}
