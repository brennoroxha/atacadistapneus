import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Política de Envio | Atacadista Pneus" },
      { name: "description", content: "Prazos, custos e modalidades de entrega para pedidos da Atacadista Pneus em todo o Brasil." },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <LegalPage title="Política de Envio">
      <p className="lead">Esta Política de Envio descreve os prazos, custos, modalidades e condições de entrega aplicáveis aos pedidos realizados na Loja da <strong>R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA</strong>.</p>

      <h2>1. Processamento e Manuseio (Handling Time)</h2>
      <p>Após a confirmação do pagamento, o pedido entra em processo de separação, conferência e embalagem. O prazo de manuseio é de <strong>até 2 dias úteis</strong>. Este prazo é independente do prazo de transporte.</p>
      <p>Pedidos com pagamento via boleto somente são processados após a compensação bancária (1 a 3 dias úteis).</p>

      <h2>2. Prazos de Entrega (Transit Time)</h2>
      <p>O prazo estimado de transporte é de <strong>7 dias úteis</strong> após a postagem, podendo variar conforme a região, modalidade selecionada e condições da transportadora. O prazo total exibido no checkout é a soma do tempo de manuseio + tempo de transporte.</p>
      <table>
        <thead>
          <tr><th>Região</th><th>Prazo Estimado</th></tr>
        </thead>
        <tbody>
          <tr><td>Sudeste</td><td>2 a 5 dias úteis</td></tr>
          <tr><td>Sul</td><td>3 a 7 dias úteis</td></tr>
          <tr><td>Centro-Oeste</td><td>4 a 8 dias úteis</td></tr>
          <tr><td>Nordeste</td><td>5 a 12 dias úteis</td></tr>
          <tr><td>Norte</td><td>7 a 15 dias úteis</td></tr>
        </tbody>
      </table>

      <h2>3. Custos de Envio</h2>
      <p>O custo do frete é calculado automaticamente no momento do checkout, com base em: CEP de destino, peso e dimensões dos produtos, e modalidade de entrega selecionada (Correios PAC/SEDEX, transportadoras parceiras, retirada na loja etc.).</p>

      <h2>4. Modalidades de Envio</h2>
      <ul>
        <li><strong>Correios (PAC):</strong> opção econômica, prazo mais longo;</li>
        <li><strong>Correios (SEDEX):</strong> envio expresso, prazo reduzido;</li>
        <li><strong>Transportadoras:</strong> para regiões e produtos específicos;</li>
        <li><strong>Retirada no local:</strong> mediante consulta de disponibilidade.</li>
      </ul>

      <h2>5. Rastreamento do Pedido</h2>
      <p>Após a postagem, o cliente receberá por e-mail o código de rastreamento. O acompanhamento poderá ser feito diretamente no site da transportadora responsável ou em "Meus Pedidos" em sua conta na Loja.</p>

      <h2>6. Endereço de Entrega</h2>
      <p>É de responsabilidade do cliente fornecer endereço completo e correto, incluindo número, complemento, bairro e CEP. Erros de endereço que resultem em devolução do pedido aos remetentes poderão gerar custo adicional para reenvio.</p>

      <h2>7. Recebimento da Mercadoria</h2>
      <p>No ato do recebimento, o cliente deverá conferir a integridade da embalagem. Caso haja qualquer indício de violação, recuse o produto ou registre a ocorrência junto à transportadora e nos comunique imediatamente em <strong>contato@atacadistapneus.com.br</strong>.</p>

      <h2>8. Atrasos na Entrega</h2>
      <p>Embora trabalhemos para cumprir os prazos informados, eventuais atrasos podem ocorrer por motivos alheios ao nosso controle (greves, condições climáticas adversas, problemas logísticos da transportadora). Nesses casos, manteremos o cliente informado.</p>

      <h2>9. Tentativas de Entrega</h2>
      <p>Os Correios e transportadoras realizam, em regra, até <strong>3 (três) tentativas de entrega</strong>. Caso não haja sucesso, o objeto poderá ficar disponível para retirada na agência mais próxima, ou retornar ao remetente. Acompanhe o rastreamento.</p>

      <h2>10. Área de Cobertura</h2>
      <p>Realizamos entregas em <strong>todo o território nacional</strong>. Para regiões com restrições temporárias de entrega pelos Correios, o objeto poderá ficar disponível em agência para retirada.</p>

      <div className="info-box">
        <p>Dúvidas sobre seu envio? Entre em contato:</p>
        <p>E-mail: contato@atacadistapneus.com.br</p>
        <p>Telefone/WhatsApp: 49 99847-8577</p>
      </div>
    </LegalPage>
  );
}
