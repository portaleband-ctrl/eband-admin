import { useParams, Link } from "react-router-dom";
import BlogLayout from "@/components/blog/BlogLayout";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useSettings } from "@/hooks/useSettings";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { useEffect } from "react";
import ShareButtons from "@/components/blog/ShareButtons";

const ArticlePage = () => {
  const { slug } = useParams();
  const { articles, isLoading } = useArticles();
  const { settings } = useSettings();
  const article = articles.find(a => a.slug === slug);

  // ✅ ALL hooks at the top level, BEFORE any conditional returns
  useAnalyticsTracker(article?.id);

  useEffect(() => {
    if (!article) return;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "image": [article.featuredImage],
      "datePublished": article.publishedAt,
      "dateModified": article.publishedAt,
      "author": [{
        "@type": "Person",
        "name": article.author,
        "url": window.location.origin
      }]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [article]);

  if (isLoading) {
    return (
      <BlogLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#3483FA] border-t-transparent rounded-full animate-spin" />
        </div>
      </BlogLayout>
    );
  }

  if (!article) {
    return (
      <BlogLayout>
        <div className="blog-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Artigo não encontrado</h1>
          <Link to="/" className="text-[#3483FA] hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="bg-white">
        {/* Breadcrumb */}
        <div className="blog-container py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-[#3483FA]">Início</Link>
            <span>/</span>
            <Link to={`/categoria/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#3483FA]">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium line-clamp-1">{article.title}</span>
          </div>
        </div>

        <article className="blog-container py-8 max-w-4xl mx-auto">
          {/* Category badge */}
          <Link to={`/categoria/${article.category.toLowerCase().replace(/\s+/g, '-')}`}>
            <span className="inline-block mb-4 bg-[#FFE600] text-[#2D3277] text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest">
              {article.category}
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Meta: Author, Date + Share */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-[#3483FA] flex items-center justify-center text-white text-xs font-bold">
                {article.author.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{article.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="ml-auto">
              <ShareButtons title={article.title} />
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video rounded-lg overflow-hidden mb-8 border border-gray-200">
            <img
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-10">
            <div className="ai-article-container prose-blog max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: article.content }} />

            {/* Tags */}
            {settings.showTags && article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 w-full mb-1">Tags</span>
                {article.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-[#3483FA]/10 hover:text-[#3483FA] transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author Card */}
          <div className="mt-8 p-6 bg-[#F5F5F5] rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#3483FA] flex items-center justify-center shrink-0 overflow-hidden">
              {settings.authorImage ? (
                <img src={settings.authorImage} alt={article.author} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{article.author.charAt(0)}</span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Sobre o Autor</p>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{article.author}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {settings.footerText || "Especialista em curadoria de produtos, trazendo as melhores análises para facilitar sua escolha."}
              </p>
            </div>
          </div>

          {/* Affiliate Links */}
          {article.affiliateLinks && article.affiliateLinks.length > 0 && (
            <div className="mt-8 p-6 bg-[#FFF9DB] border border-[#FFE600] rounded-lg">
              <h3 className="text-base font-bold text-[#2D3277] mb-4 flex items-center gap-2">
                🔗 Recursos Mencionados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {article.affiliateLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-200 hover:border-[#3483FA] hover:shadow-sm transition-all group"
                  >
                    <span className="font-semibold text-sm text-gray-800">{link.label}</span>
                    <ExternalLink className="w-4 h-4 text-[#3483FA] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#3483FA] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Voltar para o Feed
            </Link>
          </div>
        </article>
      </div>
    </BlogLayout>
  );
};

export default ArticlePage;
