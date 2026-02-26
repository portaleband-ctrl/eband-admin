import { useState } from "react";
import BlogLayout from "@/components/blog/BlogLayout";
import ArticleCard from "@/components/blog/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { useSettings } from "@/hooks/useSettings";
import { Tag } from "lucide-react";

const Index = () => {
  const { publishedArticles, isLoading } = useArticles();
  const { settings } = useSettings();
  const { categories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 32; // 1 destaque + 31 na grid ou similar

  useAnalyticsTracker();

  // Show featured categories; fall back to all if none are marked
  const featuredCategories = categories.filter(c => c.featured);
  const displayCategories = featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 7);

  if (isLoading) {
    return (
      <BlogLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#3483FA] border-t-transparent rounded-full animate-spin" />
        </div>
      </BlogLayout>
    );
  }

  const ARTICLES_IN_GRID = 31;
  const featured = publishedArticles[0];
  const allOtherArticles = publishedArticles.slice(1);
  const totalPages = Math.ceil(allOtherArticles.length / ARTICLES_IN_GRID);

  const startIndex = (currentPage - 1) * ARTICLES_IN_GRID;
  const currentArticles = allOtherArticles.slice(startIndex, startIndex + ARTICLES_IN_GRID);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <BlogLayout>
      {/* Category filters - ML style horizontal pills */}
      <div className="bg-white border-b border-gray-200 sticky top-[88px] z-40">
        <div className="blog-container">
          <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
            <Link to="/categorias">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#3483FA] text-white whitespace-nowrap">
                <Tag className="w-3 h-3" /> Todos
              </span>
            </Link>
            {displayCategories.map(cat => (
              <Link key={cat.id} to={`/categoria/${cat.slug}`}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:border-[#3483FA] hover:text-[#3483FA] transition-all whitespace-nowrap cursor-pointer">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Article */}
      {featured && (
        <section className="bg-white pt-6 pb-4 border-b border-gray-200">
          <div className="blog-container">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#FFE600] text-[#2D3277] text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-wider">
                Destaque
              </span>
              <span className="text-xs text-gray-500 font-medium">Artigo em destaque da semana</span>
            </div>
            <ArticleCard article={featured} featured />
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-8">
        <div className="blog-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Últimas <span className="text-[#3483FA]">Publicações</span>
            </h2>
            <Link to="/categorias" className="text-xs font-bold text-[#3483FA] hover:underline flex items-center gap-1">
              Ver tudo →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentArticles.map((article, i) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          {allOtherArticles.length > ARTICLES_IN_GRID && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-6 py-2 rounded-lg border border-gray-200 font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-6 py-2 rounded-lg border border-gray-200 font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}

          {allOtherArticles.length === 0 && !featured && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">Nenhum artigo publicado ainda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Banner promo estilo ML */}
      <section className="py-8">
        <div className="blog-container">
          <div className="rounded-lg bg-[#FFE600] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-[#2D3277] mb-2">
                {settings.blogName || "Nosso Blog"}
              </h3>
              <p className="text-sm text-[#2D3277]/80 max-w-md">
                {settings.blogDescription || "Curadoria dos melhores conteúdos para você se manter atualizado."}
              </p>
            </div>
            <Link to="/categorias">
              <button className="bg-[#2D3277] text-white font-bold text-sm px-8 py-3 rounded-md hover:bg-[#3D44A0] transition-colors whitespace-nowrap">
                Explorar Categorias
              </button>
            </Link>
          </div>
        </div>
      </section>
    </BlogLayout>
  );
};

export default Index;
