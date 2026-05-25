import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import pagamentos from "@/assets/pagamentos.webp";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-neutral-200 text-black pt-4 md:pt-10 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-16">
          <div className="space-y-6 text-center md:text-left">
            <Link to="/" className="inline-flex items-center justify-center md:justify-start w-full md:w-auto" aria-label="Atacadista Pneus">
              <img src={logo} alt="Atacadista Pneus" className="h-[80px] md:h-[100px] w-auto" />
            </Link>
            <p className="text-black text-sm leading-relaxed">
              Sua loja especializada em pneus. Atacado e varejo com os melhores preços e entrega rápida.
            </p>
          </div>


          <div>
            <h3 className="font-bold text-lg mb-6 tracking-wider">Informações</h3>
            <ul className="space-y-3 text-black text-sm">
              <li><Link to="/about" className="hover:text-industrial-blue hover:underline transition-colors">Quem somos</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-industrial-blue hover:underline transition-colors">Política de Envio e Frete</Link></li>
              <li><Link to="/privacy" className="hover:text-industrial-blue hover:underline transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/refund-policy" className="hover:text-industrial-blue hover:underline transition-colors">Política de Trocas e Devoluções</Link></li>
              <li><Link to="/terms" className="hover:text-industrial-blue hover:underline transition-colors">Termos e Condições</Link></li>
              <li><Link to="/payment-methods" className="hover:text-industrial-blue hover:underline transition-colors">Formas de Pagamento</Link></li>
              <li><Link to="/faq" className="hover:text-industrial-blue hover:underline transition-colors">Perguntas Frequentes</Link></li>
              <li><Link to="/contact" className="hover:text-industrial-blue hover:underline transition-colors">Fale conosco</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 tracking-wider">Atendimento</h3>
            <ul className="space-y-4 text-black text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-safety-orange shrink-0" />
                <span>49 99847-8577<br /><span className="text-xs">Seg a Sex: 9h às 18h | Sáb: 9h às 13h</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-safety-orange shrink-0" />
                <a href="mailto:contato@atacadistapneus.com.br" className="hover:text-industrial-blue break-all">contato@atacadistapneus.com.br</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-safety-orange shrink-0" />
                <span>Avenida Jose Falcao, 75 A, Loja<br />Queimadinha<br />Feira de Santana/BA - CEP 44026-100</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-bold text-sm tracking-wider mb-3">Formas de Pagamento</h4>
              <img src={pagamentos} alt="Formas de pagamento aceitas" className="w-full max-w-[280px] h-auto" />
            </div>
          </div>

        </div>


        <div className="border-t border-black/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-black/70">
          <div className="space-y-1 text-center md:text-left">
            <p>© 2026 R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA. Todos os direitos reservados.</p>
            <p>CNPJ: 04.610.006/0004-84 | Avenida Jose Falcao, 75 A, Loja - Feira de Santana/BA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
