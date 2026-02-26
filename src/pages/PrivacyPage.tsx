import BlogLayout from "@/components/blog/BlogLayout";

const PrivacyPage = () => (
  <BlogLayout>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">Política de Privacidade</h1>
      <div className="prose-blog space-y-4 text-foreground/85 text-sm leading-relaxed">
        <p><strong>Última atualização:</strong> Fevereiro de 2025</p>
        <h2 className="text-xl font-heading font-bold mt-6">1. Informações que coletamos</h2>
        <p>Coletamos informações que você nos fornece diretamente, como ao preencher formulários de contato. Também coletamos automaticamente informações sobre seu dispositivo e navegação através de cookies e tecnologias semelhantes.</p>
        <h2 className="text-xl font-heading font-bold mt-6">2. Como usamos suas informações</h2>
        <p>Utilizamos as informações coletadas para operar e melhorar nosso blog, personalizar sua experiência, e para fins analíticos através do Google Analytics.</p>
        <h2 className="text-xl font-heading font-bold mt-6">3. Cookies</h2>
        <p>Utilizamos cookies para melhorar a experiência do usuário, analisar tráfego e personalizar conteúdo. Você pode desabilitar cookies nas configurações do seu navegador.</p>
        <h2 className="text-xl font-heading font-bold mt-6">4. Links de Afiliado</h2>
        <p>Este blog contém links de afiliado para produtos e serviços. Quando você clica nesses links, cookies de rastreamento podem ser colocados no seu navegador pelos programas de afiliados.</p>
        <h2 className="text-xl font-heading font-bold mt-6">5. Contato</h2>
        <p>Para dúvidas sobre esta política, entre em contato pela nossa página de contato.</p>
      </div>
    </div>
  </BlogLayout>
);

export default PrivacyPage;
