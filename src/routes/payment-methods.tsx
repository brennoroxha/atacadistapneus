import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Banknote, QrCode, Landmark } from "lucide-react";

export const Route = createFileRoute("/payment-methods")({
  head: () => ({
    meta: [
      { name: "title", content: "Formas de Pagamento | Atacadista Pneus" },
      { name: "description", content: "Conheça todas as formas de pagamento aceitas na Atacadista Pneus: PIX." },
    ],
  }),
  component: () => (
    <div className="container px-4 mx-auto py-24 space-y-12 max-w-4xl">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter text-industrial-blue">Formas de Pagamento</h1>
        <p className="text-muted-foreground">Escolha a forma que melhor se adapta ao seu bolso. Todas as transações são processadas em ambiente 100% seguro.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="border rounded-lg p-6 space-y-3">
          <QrCode className="h-10 w-10 text-safety-orange" />
          <h2 className="text-xl font-bold text-industrial-blue">PIX</h2>
          <p className="text-muted-foreground text-sm">Pagamento aprovado em segundos. Confirmação automática e envio imediato do pedido.</p>
        </div>
      </div>
    </div>
  ),
});
