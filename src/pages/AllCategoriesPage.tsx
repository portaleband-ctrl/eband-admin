import BlogLayout from "@/components/blog/BlogLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";

const AllCategoriesPage = () => {
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

    const getCategoryCount = (slug: string) => {
        return publishedArticles.filter(a => a.category?.toLowerCase() === slug.toLowerCase()).length;
    };

    return (
        <BlogLayout>
            <div className="blog-container py-12">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Explorar Categorias</h1>
                    <p className="text-muted-foreground">
                        Encontre os melhores artigos por assunto e mergulhe nos temas que você mais gosta.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => {
                        const count = getCategoryCount(category.slug);
                        return (
                            <Link key={category.id} to={`/categoria/${category.slug}`} className="group block">
                                <Card className="h-full card-hover transition-all duration-300 border-accent/10 hover:border-accent/30 shadow-sm">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <CardTitle className="group-hover:text-accent transition-colors">
                                                {category.name}
                                            </CardTitle>
                                            <span className="text-xs font-medium px-2 py-1 bg-accent/10 text-accent rounded-full">
                                                {count} {count === 1 ? 'artigo' : 'artigos'}
                                            </span>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {category.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </BlogLayout>
    );
};

export default AllCategoriesPage;
