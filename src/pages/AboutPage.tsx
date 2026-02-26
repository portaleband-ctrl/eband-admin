import BlogLayout from "@/components/blog/BlogLayout";

const AboutPage = () => (
  <BlogLayout>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">Sobre Nós</h1>
      <div className="prose-blog space-y-4 text-foreground/85">
        <p>Somos um blog dedicado a ajudar consumidores a tomar decisões de compra mais inteligentes. Nosso time pesquisa, testa e analisa produtos de diversas categorias para oferecer recomendações honestas e confiáveis.</p>
        <h2 className="text-2xl font-heading font-bold mt-8">Nossa Missão</h2>
        <p>Simplificar a sua jornada de compra com análises detalhadas, comparativos justos e guias práticos que realmente fazem diferença.</p>
        <h2 className="text-2xl font-heading font-bold mt-8">Transparência</h2>
        <p>Este blog participa de programas de afiliados. Isso significa que podemos receber comissões quando você compra através dos nossos links, sem nenhum custo adicional para você. Essa receita nos ajuda a manter o blog ativo e produzir conteúdo de qualidade.</p>
        <p>Nossas opiniões são sempre independentes e baseadas em pesquisa real. Não recomendamos produtos apenas por lucro — sua confiança é o nosso maior ativo.</p>
      </div>
    </div>
  </BlogLayout>
);

export default AboutPage;
