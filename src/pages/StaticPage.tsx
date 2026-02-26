import { useParams, Link } from "react-router-dom";
import BlogLayout from "@/components/blog/BlogLayout";
import { usePages } from "@/hooks/usePages";
import { ArrowLeft } from "lucide-react";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";

const StaticPage = () => {
    const { slug } = useParams();
    const { pages, isLoading } = usePages();

    // ✅ Hooks must be at the top level, before any conditional returns
    useAnalyticsTracker();

    if (isLoading) {
        return (
            <BlogLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            </BlogLayout>
        );
    }

    const page = pages.find(p => p.slug === slug);

    if (!page) {
        return (
            <BlogLayout>
                <div className="blog-container py-20 text-center">
                    <h1 className="text-3xl font-heading font-bold mb-4">Página não encontrada</h1>
                    <Link to="/" className="text-accent hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao início
                    </Link>
                </div>
            </BlogLayout>
        );
    }

    return (
        <BlogLayout>
            <div className="blog-container py-12 md:py-20 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-[1.1] text-foreground tracking-tighter mb-12 text-center">
                        {page.title}
                    </h1>

                    <div className="glass shadow-xl rounded-[2.5rem] p-8 md:p-16 border-white/50 border-[0.5px]">
                        <div className="ai-article-container prose-blog max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: page.content }} />
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                            <ArrowLeft className="w-4 h-4" /> Voltar para o Início
                        </Link>
                    </div>
                </div>
            </div>
        </BlogLayout>
    );
};

export default StaticPage;
