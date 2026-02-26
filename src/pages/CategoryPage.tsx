import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import BlogLayout from "@/components/blog/BlogLayout";
import ArticleCard from "@/components/blog/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { ArrowLeft } from "lucide-react";

const CategoryPage = () => {
    const { slug } = useParams();
    const { publishedArticles, isLoading: isLoadingArticles } = useArticles();
    const { categories, isLoading: isLoadingCategories } = useCategories();

    if (isLoadingArticles || isLoadingCategories) {
        return (
            <BlogLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            </BlogLayout>
        );
    }

    const category = categories.find(c => c.slug === slug);
    const categoryName = category?.name || slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const filteredArticles = publishedArticles.filter(
        article => article.category.toLowerCase() === categoryName?.toLowerCase() ||
            article.category.toLowerCase() === slug?.replace(/-/g, ' ').toLowerCase()
    );

    const [currentPage, setCurrentPage] = useState(1);
    const ARTICLES_PER_PAGE = 30;
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const currentArticles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

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
            <div className="blog-container py-12">
                <div className="mb-10">
                    <Link to="/categorias" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Todas as categorias
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 capitalize">
                        {categoryName}
                    </h1>
                    {category?.description && (
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {category.description}
                        </p>
                    )}
                    <div className="h-1 w-20 bg-accent mt-6 rounded-full"></div>
                </div>

                {currentArticles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentArticles.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {filteredArticles.length > ARTICLES_PER_PAGE && (
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
                    </>
                ) : (
                    <div className="py-20 text-center bg-card rounded-xl border border-dashed">
                        <h3 className="text-xl font-medium mb-2">Nenhum artigo encontrado</h3>
                        <p className="text-muted-foreground mb-6">Estamos trabalhando em novos conteúdos para esta categoria.</p>
                        <Link to="/" className="text-accent hover:underline font-medium">
                            Voltar para o início
                        </Link>
                    </div>
                )}
            </div>
        </BlogLayout>
    );
};

export default CategoryPage;
