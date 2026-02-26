import BlogLayout from "@/components/blog/BlogLayout";

const TermsPage = () => (
  <BlogLayout>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">Termos de Uso</h1>
      <div className="prose-blog space-y-4 text-foreground/85 text-sm leading-relaxed">
        <p><strong>Última atualização:</strong> Fevereiro de 2025</p>
        <h2 className="text-xl font-heading font-bold mt-6">1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar este blog, você concorda com estes termos de uso. Se não concorda, por favor, não utilize nosso site.</p>
        <h2 className="text-xl font-heading font-bold mt-6">2. Conteúdo</h2>
        <p>O conteúdo publicado é apenas informativo. Não garantimos a precisão ou completude das informações. As opiniões expressas são nossas e podem mudar sem aviso prévio.</p>
        <h2 className="text-xl font-heading font-bold mt-6">3. Links de Afiliado</h2>
        <p>Este site pode conter links de afiliado. Divulgamos essa relação de forma transparente. Não somos responsáveis por produtos ou serviços de terceiros.</p>
        <h2 className="text-xl font-heading font-bold mt-6">4. Propriedade Intelectual</h2>
        <p>Todo o conteúdo, incluindo textos, imagens e logotipos, é protegido por direitos autorais. Reprodução sem autorização é proibida.</p>
        <h2 className="text-xl font-heading font-bold mt-6">5. Limitação de Responsabilidade</h2>
        <p>Não nos responsabilizamos por decisões de compra baseadas em nosso conteúdo. Recomendamos sempre pesquisar antes de adquirir qualquer produto.</p>
      </div>
    </div>
  </BlogLayout>
);

export default TermsPage;
