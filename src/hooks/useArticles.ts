import { useState, useEffect } from "react";
import { Article } from "@/data/mockData";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export const useArticles = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { settings } = useSettings();

    const triggerCloudflareBuild = () => {
        if (!settings?.cloudflareWebhookUrl) return;

        fetch(settings.cloudflareWebhookUrl, { method: 'POST' })
            .then(res => {
                if (res.ok) console.log("Cloudflare Build acionado com sucesso!");
            })
            .catch(err => console.error("Falha ao acionar webhook da Cloudflare:", err));
    };

    const fetchArticles = async () => {
        setIsLoading(true);

        let allData: any[] = [];
        let hasMore = true;
        let page = 0;
        const pageSize = 1000;

        while (hasMore) {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error("Error fetching articles:", error);
                toast.error("Erro ao carregar artigos do banco de dados.");
                break;
            }

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                if (data.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        if (allData.length > 0) {
            const mappedArticles: Article[] = allData.map(post => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || "",
                content: post.content || "",
                featuredImage: post.image_url || "",
                featuredImageAlt: post.image_alt || "",
                category: post.category || "Sem Categoria",
                tags: post.tags || [],
                author: post.author_name || "Admin",
                publishedAt: post.published_at || post.created_at,
                status: post.status as any,
                type: post.article_type as any,
                affiliateLinks: post.affiliate_links || [],
                wordCount: post.word_count || 0,
            }));
            setArticles(mappedArticles);
        } else if (allData.length === 0) {
            setArticles([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const addArticle = async (article: Article) => {
        // Omitting id so Supabase generates a valid UUID
        const { error } = await supabase
            .from('posts')
            .insert([{
                title: article.title,
                slug: article.slug,
                excerpt: article.excerpt,
                content: article.content,
                image_url: article.featuredImage,
                image_alt: article.featuredImageAlt,
                category: article.category,
                tags: article.tags,
                author_name: article.author,
                status: article.status,
                article_type: article.type,
                affiliate_links: article.affiliateLinks,
                word_count: article.wordCount,
                published_at: article.publishedAt
            }]);

        if (error) {
            console.error("Error adding article:", error);
            toast.error("Erro ao salvar artigo no banco de dados.");
            throw error;
        }

        if (article.status === 'published') {
            triggerCloudflareBuild();
        }

        fetchArticles();
    };

    const updateArticle = async (article: Article) => {
        const { error } = await supabase
            .from('posts')
            .update({
                title: article.title,
                slug: article.slug,
                excerpt: article.excerpt,
                content: article.content,
                image_url: article.featuredImage,
                image_alt: article.featuredImageAlt,
                category: article.category,
                tags: article.tags,
                author_name: article.author,
                status: article.status,
                article_type: article.type,
                affiliate_links: article.affiliateLinks,
                word_count: article.wordCount,
                published_at: article.publishedAt
            })
            .eq('id', article.id);

        if (error) {
            console.error("Error updating article:", error);
            toast.error("Erro ao atualizar artigo.");
            throw error;
        }

        if (article.status === 'published') {
            triggerCloudflareBuild();
        }

        fetchArticles();
    };

    const deleteArticle = async (id: string) => {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting article:", error);
            toast.error("Erro ao excluir artigo.");
            throw error;
        }

        triggerCloudflareBuild(); // Deletions should always trigger a rebuild

        setArticles(articles.filter(a => a.id !== id));
    };

    return {
        articles,
        publishedArticles: articles.filter(a => a.status === 'published'),
        isLoading,
        addArticle,
        updateArticle,
        deleteArticle,
        refreshArticles: fetchArticles
    };
};
