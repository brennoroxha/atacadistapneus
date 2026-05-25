import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos e Condições de Uso | Atacadista Pneus" },
      { name: "description", content: "Termos e condições de uso do site Atacadista Pneus." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Termos e Condições de Uso">
      <p className="lead">Bem-vindo à <strong>R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA</strong>! Os presentes Termos e Condições de Uso ("Termos") regem o acesso e uso do site <strong>https://atacadistapneus.lovable.app</strong> ("Loja"), operado por R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA, inscrita no CNPJ sob o nº 04.610.006/0004-84, com sede em Avenida Jose Falcao, 75 A, Loja - Queimadinha - Feira de Santana/BA - CEP 44026-100.</p>

      <p><strong>AO UTILIZAR A LOJA, VOCÊ DECLARA QUE LEU, ENTENDEU E CONCORDA INTEGRALMENTE COM ESTES TERMOS.</strong> Caso não concorde, favor não utilizar a Loja.</p>

      <h2>1. Objeto</h2>
      <p>A Loja disponibiliza ao Usuário uma plataforma de comércio eletrônico para a aquisição de produtos e/ou serviços. O Usuário poderá navegar gratuitamente, mas o cadastro e o aceite destes Termos são necessários para a realização de compras.</p>

      <h2>2. Cadastro</h2>
      <p>Para realizar uma compra, o Usuário deverá fornecer informações verídicas, completas e atualizadas. O Usuário é o único responsável pela guarda de sua senha e por todas as atividades realizadas em sua conta. Em caso de uso indevido, deverá nos comunicar imediatamente.</p>
      <p>Reservamo-nos o direito de recusar, suspender ou cancelar cadastros que apresentarem informações falsas, incorretas ou que violem estes Termos.</p>

      <h2>3. Produtos, Preços e Disponibilidade</h2>
      <p>As imagens dos produtos são meramente ilustrativas. Buscamos representar com fidelidade as características, mas pode haver pequenas variações de cor, textura e tamanho.</p>
      <p>Os preços e a disponibilidade de produtos podem ser alterados sem aviso prévio. Caso haja erro evidente de preço, reservamo-nos o direito de cancelar o pedido com restituição integral dos valores pagos. O preço válido é aquele exibido no momento da finalização do pedido.</p>

      <h2>4. Formas de Pagamento e Faturamento</h2>
      <p>Aceitamos as seguintes formas de pagamento: <strong>Pix</strong>. Todas as transações são processadas em ambiente seguro por gateways de pagamento parceiros, com criptografia SSL.</p>
      <p>A nota fiscal eletrônica será emitida em nome do titular do cadastro e enviada por e-mail e/ou junto ao produto. A confirmação do pedido somente ocorrerá após aprovação da operadora financeira.</p>

      <h2>5. Entrega</h2>
      <p>O prazo de entrega é informado no momento da finalização do pedido e contado após a confirmação do pagamento. Eventuais atrasos causados por terceiros (transportadoras, correios, fornecedores) serão comunicados ao Usuário. Para mais informações, consulte nossa <Link to="/shipping-policy">Política de Envio</Link>.</p>

      <h2>6. Direito de Arrependimento e Devoluções</h2>
      <p>Nos termos do art. 49 do Código de Defesa do Consumidor, o Usuário tem o prazo de <strong>7 (sete) dias corridos</strong>, contados do recebimento do produto, para exercer seu direito de arrependimento. Para mais detalhes, consulte nossa <Link to="/refund-policy">Política de Devolução</Link>.</p>

      <h2>7. Propriedade Intelectual</h2>
      <p>Todo o conteúdo da Loja - incluindo textos, imagens, logos, marcas, layout, código-fonte e bancos de dados - é de propriedade exclusiva do Lojista ou de seus licenciadores, sendo protegido pelas leis de propriedade intelectual aplicáveis.</p>
      <p>É vedada a reprodução, cópia, distribuição ou qualquer outra forma de utilização sem autorização expressa.</p>

      <h2>8. Conduta do Usuário</h2>
      <p>O Usuário compromete-se a não utilizar a Loja para:</p>
      <ul>
        <li>Realizar atos contrários à legislação vigente, à moral ou à ordem pública;</li>
        <li>Veicular conteúdos ilícitos, ofensivos, discriminatórios ou que violem direitos de terceiros;</li>
        <li>Tentar acessar áreas restritas, manipular dados ou comprometer a segurança da Loja;</li>
        <li>Realizar engenharia reversa, scraping não autorizado ou utilizar bots/scripts.</li>
      </ul>

      <h2>9. Limitação de Responsabilidade</h2>
      <p>O Lojista não se responsabiliza por: (i) indisponibilidade temporária da Loja decorrente de manutenção, falhas de internet ou caso fortuito/força maior; (ii) prejuízos decorrentes do uso indevido da conta pelo Usuário; (iii) conteúdo de sites de terceiros vinculados por hyperlinks.</p>

      <h2>10. Política de Privacidade</h2>
      <p>O tratamento de dados pessoais coletados pela Loja segue o disposto em nossa <Link to="/privacy">Política de Privacidade</Link>, parte integrante destes Termos.</p>

      <h2>11. Alterações nos Termos</h2>
      <p>O Lojista reserva-se o direito de alterar estes Termos a qualquer momento, publicando a versão revisada na Loja, com a data de atualização. O uso continuado da Loja após a publicação constitui aceitação tácita das alterações.</p>

      <h2>12. Foro e Lei Aplicável</h2>
      <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de <strong>Feira de Santana/BA</strong> para dirimir quaisquer controvérsias decorrentes destes Termos, ressalvada a opção do consumidor pelo foro de seu domicílio.</p>

      <div className="info-box">
        <p><strong>R&A Atacadista Distribuidora e Recauchutadora de Pneus LTDA</strong></p>
        <p>CNPJ: 04.610.006/0004-84</p>
        <p>Endereço: Avenida Jose Falcao, 75 A, Loja - Queimadinha - Feira de Santana/BA - CEP 44026-100</p>
        <p>E-mail: contato@atacadistapneus.com.br</p>
      </div>
    </LegalPage>
  );
}
