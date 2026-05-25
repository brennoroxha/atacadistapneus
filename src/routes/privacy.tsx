import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade (LGPD) | Comercial Ferragens" },
      { name: "description", content: "Saiba como a Comercial Ferragens trata e protege seus dados pessoais em conformidade com a LGPD." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p className="lead">A <strong>Becher Comercio de Ferragens e Ferramentas LTDA</strong>, com sede na Rua Júlia Moreira de Souza, nº 795 - Gleba Ribeirão Maringá - Maringá/PR - CEP 87025-659, inscrita no CNPJ/MF sob o nº <strong>49.229.087/0001-62</strong> ("Lojista") leva a sua privacidade a sério e zela pela segurança e proteção de dados de todos os seus clientes, parceiros, fornecedores e usuários ("Usuários" ou "você") do site <strong>https://comercialferragens.site</strong> e qualquer outro site, loja ou aplicativo operado pelo Lojista (aqui designados, simplesmente, "Loja").</p>

      <p>Esta Política de Privacidade ("Política de Privacidade") destina-se a informá-lo sobre o modo como nós utilizamos e divulgamos informações coletadas em suas visitas à nossa Loja e em mensagens que trocamos com você ("Comunicações"). Esta Política de Privacidade aplica-se somente a informações coletadas por meio da Loja.</p>

      <div className="alert"><strong>AO ACESSAR A LOJA, ENVIAR COMUNICAÇÕES OU FORNECER QUALQUER TIPO DE DADO PESSOAL, VOCÊ DECLARA ESTAR CIENTE COM RELAÇÃO AOS TERMOS AQUI PREVISTOS E DE ACORDO COM A POLÍTICA DE PRIVACIDADE</strong>, a qual descreve as finalidades e formas de tratamento de seus dados pessoais que você disponibilizar na Loja.</div>

      <p>Esta Política fornece uma visão geral de nossas práticas de privacidade e das escolhas que você pode fazer, bem como direitos que você pode exercer em relação aos Dados Pessoais tratados por nós. Se você tiver alguma dúvida sobre o uso de Dados Pessoais, entre em contato com <strong>contato@comercialferragens.site</strong>.</p>

      <p>A Política de Privacidade não se aplica a quaisquer aplicativos, produtos, serviços, site ou recursos de mídia social de terceiros que possam ser oferecidos ou acessados por meio da Loja. O acesso a esses links fará com que você deixe a Loja e possa resultar na coleta ou compartilhamento de informações sobre você por terceiros.</p>

      <p>Caso você nos envie Dados Pessoais referentes a outras pessoas físicas, você declara ter a competência para fazê-lo e declara ter obtido o consentimento necessário para autorizar o uso de tais informações nos termos desta Política.</p>

      <h2>1. Definições</h2>
      <p>Para os fins desta Política de Privacidade:</p>
      <ul>
        <li><strong>"Dados Pessoais"</strong>: qualquer informação que, direta ou indiretamente, identifique ou possa identificar uma pessoa natural, como nome, CPF, data de nascimento, endereço IP, entre outros;</li>
        <li><strong>"Dados Pessoais Sensíveis"</strong>: qualquer informação que revele origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou organização religiosa/filosófica/política, dado referente à saúde ou vida sexual, dado genético ou biométrico;</li>
        <li><strong>"Tratamento de Dados Pessoais"</strong>: qualquer operação efetuada com Dados Pessoais, automatizada ou não, como coleta, gravação, organização, estruturação, armazenamento, adaptação, recuperação, consulta, utilização, divulgação, transmissão, eliminação ou destruição;</li>
        <li><strong>"Leis de Proteção de Dados"</strong>: todas as disposições legais que regulem o Tratamento de Dados Pessoais, incluindo a Lei nº 13.709/18 (LGPD).</li>
      </ul>

      <h2>2. Uso de Dados Pessoais</h2>
      <p>Coletamos e usamos Dados Pessoais para gerenciar seu relacionamento conosco e melhor atendê-lo quando você estiver adquirindo produtos e/ou serviços na Loja, personalizando e melhorando sua experiência. Exemplos de como usamos os dados:</p>
      <ul>
        <li>Viabilizar que você adquira produtos e/ou serviços na Loja;</li>
        <li>Confirmar ou corrigir as informações que temos sobre você;</li>
        <li>Enviar informações que acreditamos ser do seu interesse;</li>
        <li>Personalizar sua experiência de uso da Loja;</li>
        <li>Personalizar publicidades baseadas em seu interesse;</li>
        <li>Entrar em contato por telefone, e-mail, SMS ou outro meio que seu dispositivo seja capaz de receber, para fins comerciais razoáveis e nos termos da lei.</li>
      </ul>

      <p>Adicionalmente, os Dados Pessoais poderão ser utilizados na forma que julgarmos necessária ou adequada: (a) nos termos das Leis de Proteção de Dados; (b) para atender exigências de processo judicial; (c) para cumprir decisão judicial, regulatória ou de autoridades competentes; (d) para proteger nossas operações; (e) para proteger direitos, privacidade e segurança nossos, seus ou de terceiros; (f) para detectar e prevenir fraudes; (g) permitir-nos limitar danos que possamos sofrer; (h) de outros modos permitidos por lei; e (i) para aplicar nossos Termos e Condições de Uso.</p>

      <div className="alert"><strong>A LOJA NÃO SE DESTINA A PESSOAS COM MENOS DE 18 (DEZOITO) ANOS</strong> e pedimos que tais pessoas não nos forneçam qualquer Dado Pessoal.</div>

      <h2>3. Não fornecimento de Dados Pessoais</h2>
      <p>Você não é obrigado a compartilhar os Dados Pessoais que solicitamos. Entretanto, se você optar por não compartilhá-los, em alguns casos não poderemos fornecer acesso completo à Loja, alguns recursos especializados, prestar a assistência necessária ou viabilizar a entrega do produto ou prestação do serviço contratado.</p>

      <h2>4. Dados coletados</h2>
      <p>O público em geral poderá navegar na Loja sem necessidade de cadastro e envio de Dados Pessoais. Algumas funcionalidades, no entanto, dependem de cadastro para concluir compras e/ou viabilizar entregas.</p>

      <h3>No contato com a Loja, podemos coletar:</h3>
      <ul>
        <li><strong>Dados de contato:</strong> nome, sobrenome, telefone, cidade, estado e e-mail;</li>
        <li><strong>Informações que você envia:</strong> dados informados via formulário (dúvidas, reclamações, sugestões, críticas, elogios etc.).</li>
      </ul>

      <h3>Na navegação geral da Loja, poderemos coletar:</h3>
      <ul>
        <li><strong>Dados de localização:</strong> dados de geolocalização quando você acessa a Loja;</li>
        <li><strong>Preferências:</strong> informações sobre seus interesses em relação aos produtos/serviços;</li>
        <li><strong>Dados de navegação:</strong> visitas e atividades na Loja, conteúdos visualizados, navegador e dispositivo, endereço IP, localização, site de origem;</li>
        <li><strong>Dados anônimos ou agregados:</strong> respostas anônimas a pesquisas e dados agregados sobre uso da Loja;</li>
        <li><strong>Outras informações:</strong> dados que não revelem especificamente sua identidade, como informações de navegador, dispositivo, dados de uso, cookies, pixel tags e outras tecnologias.</li>
      </ul>
      <p><strong>Nós não coletamos Dados Pessoais Sensíveis.</strong></p>

      <h2>5. Compartilhamento de Dados Pessoais com terceiros</h2>
      <p>Nós poderemos compartilhar seus Dados Pessoais:</p>
      <ul>
        <li>Com empresa(s) parceira(s) que você selecionar, bem como com provedores de serviços para suportar nossas operações comerciais (hospedagem, gerenciamento de fraude, suporte ao cliente, atendimento de pedidos, personalização de conteúdo, marketing, serviços de TI etc.);</li>
        <li>Com terceiros para nos ajudar a gerenciar a Loja;</li>
        <li>Com terceiros, em caso de reorganização, fusão, venda, joint venture, cessão ou transferência de toda ou parte da nossa empresa, ativo ou capital (incluindo falência ou processos semelhantes).</li>
      </ul>

      <h2>6. Transferências internacionais de Dados</h2>
      <p>Dados Pessoais e informações de outras naturezas coletadas por nós podem ser transferidos ou acessados por entidades pertencentes ao grupo corporativo das empresas parceiras em todo o mundo, de acordo com esta Política de Privacidade e em conformidade com a LGPD.</p>

      <h2>7. Forma de coleta automática de Dados Pessoais</h2>
      <p>Quando você visita a Loja, ela pode armazenar ou recuperar informações em seu navegador, na forma de cookies e tecnologias semelhantes.</p>
      <h3>Por meio do navegador ou dispositivo:</h3>
      <p>Coletamos automaticamente informações como tipo de computador, resolução de tela, sistema operacional, modelo do dispositivo, idioma, navegador.</p>
      <h3>Uso de cookies:</h3>
      <p>Cookies permitem coletar informações como tipo de navegador, tempo gasto na Loja, páginas visitadas, preferências de idioma e dados de tráfego anônimos. Caso não deseje, configure os cookies em seu navegador.</p>
      <h3>Uso de pixel tags e tecnologias similares:</h3>
      <p>Pixel tags (web beacons, GIFs invisíveis) são usados para rastrear ações dos usuários, medir o sucesso de campanhas de marketing e coletar dados estatísticos.</p>

      <h2>8. Direitos do Usuário</h2>
      <p>Você pode, a qualquer momento, requerer:</p>
      <ol>
        <li>Confirmação de que seus Dados Pessoais estão sendo tratados;</li>
        <li>Acesso aos seus Dados Pessoais;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;</li>
        <li>Portabilidade dos Dados Pessoais a outro prestador de serviços;</li>
        <li>Eliminação de Dados Pessoais tratados com seu consentimento;</li>
        <li>Informações sobre as entidades às quais seus Dados Pessoais tenham sido compartilhados;</li>
        <li>Informações sobre a possibilidade de não fornecer o consentimento e sobre as consequências da negativa;</li>
        <li>Revogação do consentimento.</li>
      </ol>

      <h2>9. Segurança dos Dados Pessoais</h2>
      <p>Buscamos adotar medidas técnicas e organizacionais previstas pelas Leis de Proteção de Dados para proteção dos Dados Pessoais. Caso tenha motivos para acreditar que sua interação conosco tenha deixado de ser segura, favor nos notificar imediatamente.</p>

      <h2>10. Links para outros sites e redes sociais</h2>
      <p>A Loja poderá conter links que redirecionam para sites de parceiros, anunciantes e fornecedores. Cada site possui suas próprias práticas de privacidade e não somos responsáveis por essas políticas.</p>

      <h2>11. Atualizações desta Política</h2>
      <p>Se modificarmos nossa Política de Privacidade, publicaremos o novo texto na Loja, com a data de revisão atualizada. Sua utilização da Loja após as alterações significa que aceitou a Política revisada.</p>

      <h2>12. Encarregado pelo Tratamento de Dados (DPO)</h2>
      <div className="info-box">
        <p><strong>Razão Social:</strong> Becher Comercio de Ferragens e Ferramentas LTDA</p>
        <p><strong>CNPJ:</strong> 49.229.087/0001-62</p>
        <p><strong>Endereço:</strong> Rua Júlia Moreira de Souza, nº 795 - Gleba Ribeirão Maringá - Maringá/PR - CEP 87025-659</p>
        <p><strong>E-mail:</strong> contato@comercialferragens.site</p>
        <p><strong>Telefone:</strong> 49 99847-8577</p>
      </div>
    </LegalPage>
  );
}
