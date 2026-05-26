import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Política de Trocas e Devoluções | Atacadista Pneus" },
      { name: "description", content: "Procedimentos para troca, devolução e reembolso conforme o Código de Defesa do Consumidor." },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <LegalPage title="Política de Trocas e Devoluções">
      <p className="lead">A presente Política de Trocas e Devoluções da <strong>R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA</strong> (CNPJ 04.610.006/0004-84) tem como objetivo informar os procedimentos para troca, devolução e reembolso, em total conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/90).</p>

      <h2>1. Direito de Arrependimento (Art. 49 do CDC)</h2>
      <p>O cliente tem o direito de desistir da compra no prazo de <strong>7 dias corridos</strong>, a contar do recebimento do produto, sem necessidade de justificativa. Esse direito aplica-se exclusivamente a compras realizadas pelo site, não se aplicando a compras presenciais.</p>

      <h2>2. Devolução por Defeito de Fabricação</h2>
      <p>Caso o produto apresente defeito de fabricação, o cliente terá o prazo legal de:</p>
      <ul>
        <li><strong>30 (trinta) dias</strong> para produtos não duráveis;</li>
        <li><strong>90 (noventa) dias</strong> para produtos duráveis,</li>
      </ul>
      <p>contados a partir do recebimento, para reportar o problema.</p>

      <h2>3. Condições para Aceite da Devolução</h2>
      <p>Para que a troca ou devolução seja aceita, o produto deve atender aos seguintes critérios:</p>
      <ul>
        <li>Estar em sua embalagem original, sem indícios de uso, lavagem ou avaria;</li>
        <li>Acompanhar todos os acessórios, manuais e brindes recebidos;</li>
        <li>Estar acompanhado da nota fiscal de compra;</li>
        <li>Não apresentar danos causados pelo uso indevido pelo cliente.</li>
      </ul>

      <h2>4. Custos de Devolução</h2>
      <p>Os custos de frete para devolução, tanto por arrependimento quanto por defeito, são de responsabilidade da nossa loja. Enviaremos um código postal de devolução por e-mail.</p>

      <h2>5. Taxa de Reabastecimento</h2>
      <p>Não cobramos taxas de reabastecimento para devoluções realizadas dentro do prazo legal e em conformidade com esta política.</p>

      <h2>6. Procedimento para Solicitar Devolução</h2>
      <ol>
        <li>Envie um e-mail para <strong>contato@atacadistapneus.com.br</strong> com o assunto "Devolução - Pedido nº [Número]";</li>
        <li>Informe o número do pedido, motivo da devolução e fotos do produto (caso seja por defeito);</li>
        <li>Aguarde nossa resposta em até <strong>2 dias úteis</strong> com as instruções de postagem;</li>
        <li>Após autorização, embale o produto adequadamente e envie pelos meios indicados;</li>
        <li>Ao recebermos o produto, faremos a conferência em até <strong>5 dias úteis</strong>;</li>
        <li>Aprovada a devolução, processaremos o reembolso conforme item 7.</li>
      </ol>

      <h2>7. Reembolsos</h2>
      <p>O reembolso será processado através do mesmo método de pagamento utilizado na compra:</p>
      <table>
        <thead>
          <tr><th>Forma de Pagamento</th><th>Prazo de Reembolso</th></tr>
        </thead>
        <tbody>
          <tr><td>Cartão de Crédito</td><td>Estorno em até 2 faturas subsequentes (depende da operadora)</td></tr>
          <tr><td>Pix</td><td>Até 10 dias úteis em conta de mesma titularidade</td></tr>
          <tr><td>Boleto Bancário</td><td>Até 10 dias úteis via depósito em conta de mesma titularidade</td></tr>
        </tbody>
      </table>

      <h2>8. Trocas</h2>
      <p>Caso deseje trocar o produto por outro modelo, tamanho ou cor, o procedimento é o mesmo da devolução. Após o recebimento e aprovação do produto devolvido, será gerado um cupom de crédito ou processado o reembolso, à escolha do cliente, para nova aquisição.</p>

      <h2>9. Produtos Não Aceitos para Devolução</h2>
      <p>Por razões higiênicas e legais, não aceitamos devolução por arrependimento de produtos como: itens íntimos, perecíveis, lacrados que tenham sido abertos, ou produtos personalizados sob encomenda.</p>

      <h2>10. Cancelamento Antes do Envio</h2>
      <p>Caso deseje cancelar o pedido antes da postagem, entre em contato imediatamente. Pedidos já despachados deverão seguir o procedimento padrão de devolução.</p>

      <div className="info-box">
        <p><strong>Atendimento ao Cliente</strong></p>
        <p>E-mail: contato@atacadistapneus.com.br</p>
        <p>Telefone/WhatsApp: 49 99847-8577</p>
        <p>Horário: Segunda a Sexta, das 9h às 18h</p>
      </div>
    </LegalPage>
  );
}
