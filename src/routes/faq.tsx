import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { name: "title", content: "FAQ - Perguntas Frequentes | Atacadista Pneus" },
      { name: "description", content: "Dúvidas sobre entregas, pagamentos e produtos? Confira nosso FAQ completo." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Qual o prazo de entrega?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O prazo de entrega varia conforme o seu CEP, sendo em média de 2 a 5 dias úteis para a capital e região metropolitana."
              }
            },
            {
              "@type": "Question",
              "name": "Quais as formas de pagamento?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Aceitamos Pix com 5% de desconto, cartões de crédito em até 10x sem juros e boleto bancário."
              }
            },
            {
              "@type": "Question",
              "name": "Vocês entregam em obras de grande porte?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim, temos logística própria para entrega de grandes volumes e condições especiais para faturamento via CNPJ."
              }
            },
            {
              "@type": "Question",
              "name": "Como acompanho meu pedido?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Após a confirmação do pagamento, você receberá um link de rastreio via e-mail e WhatsApp."
              }
            },
            {
              "@type": "Question",
              "name": "Existe valor mínimo para frete grátis?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim, oferecemos frete grátis para compras acima de R$ 500,00."
              }
            }
          ]
        })
      }
    ]
  }),
  component: () => (
    <div className="container px-4 mx-auto py-24 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-black  tracking-tighter text-industrial-blue">FAQ - Perguntas Frequentes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Tire todas as suas dúvidas sobre suas compras, entregas e pagamentos na Atacadista Pneus.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-safety-orange  tracking-wider">Logística e Entregas</h2>
          <div className="space-y-4">
            <div className="border p-6 rounded-lg bg-white dark:bg-card shadow-sm">
              <h3 className="font-bold text-lg">Qual o prazo de entrega?</h3>
              <p className="text-muted-foreground mt-2">O prazo de entrega varia conforme o seu CEP, sendo em média de 2 a 5 dias úteis para a capital e região metropolitana.</p>
            </div>
            <div className="border p-6 rounded-lg bg-white dark:bg-card shadow-sm">
              <h3 className="font-bold text-lg">Existe valor mínimo para frete grátis?</h3>
              <p className="text-muted-foreground mt-2">Sim, oferecemos frete grátis para compras acima de R$ 500,00.</p>
            </div>
            <div className="border p-6 rounded-lg bg-white dark:bg-card shadow-sm">
              <h3 className="font-bold text-lg">Como acompanho meu pedido?</h3>
              <p className="text-muted-foreground mt-2">Após a confirmação do pagamento, você receberá um link de rastreio via e-mail e WhatsApp.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-safety-orange  tracking-wider">Pagamentos</h2>
          <div className="space-y-4">
            <div className="border p-6 rounded-lg bg-white dark:bg-card shadow-sm">
              <h3 className="font-bold text-lg">Quais as formas de pagamento?</h3>
              <p className="text-muted-foreground mt-2">Aceitamos Pix com 5% de desconto, cartões de crédito em até 10x sem juros e boleto bancário.</p>
            </div>
            <div className="border p-6 rounded-lg bg-white dark:bg-card shadow-sm">
              <h3 className="font-bold text-lg">É seguro comprar no site?</h3>
              <p className="text-muted-foreground mt-2">Sim, utilizamos criptografia SSL e somos certificados pelo PCI DSS para garantir a segurança dos seus dados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});

