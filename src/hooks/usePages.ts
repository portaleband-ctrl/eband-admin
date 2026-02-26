import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export interface StaticPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: 'published' | 'draft';
    show_in_menu: boolean;
    show_in_footer: boolean;
    created_at?: string;
    updated_at?: string;
}

export const usePages = () => {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { settings } = useSettings();

    const triggerCloudflareBuild = () => {
        if (!settings?.cloudflareWebhookUrl) return;

        fetch(settings.cloudflareWebhookUrl, { method: 'POST' })
            .then(res => {
                if (res.ok) console.log("Cloudflare Build acionado com sucesso (Página)!");
            })
            .catch(err => console.error("Falha ao acionar webhook da Cloudflare:", err));
    };

    const fetchPages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching pages:", error);
        } else if (data) {
            setPages(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const addPage = async (page: Omit<StaticPage, 'id' | 'created_at' | 'updated_at'>) => {
        const { error } = await supabase
            .from('pages')
            .insert([page]);

        if (error) {
            console.error("Error adding page:", error);
            toast.error("Erro ao criar página.");
            throw error;
        }

        if (page.status === 'published') {
            triggerCloudflareBuild();
        }

        toast.success("Página criada com sucesso!");
        fetchPages();
    };

    const updatePage = async (id: string, updates: Partial<StaticPage>) => {
        const { error } = await supabase
            .from('pages')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error("Error updating page:", error);
            toast.error("Erro ao atualizar página.");
            throw error;
        }

        if (updates.status === 'published' || pages.find(p => p.id === id)?.status === 'published') {
            triggerCloudflareBuild();
        }

        // toast.success("Página atualizada!");
        fetchPages();
    };

    const deletePage = async (id: string) => {
        const { error } = await supabase
            .from('pages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting page:", error);
            toast.error("Erro ao excluir página.");
            throw error;
        }

        toast.success("Página excluída.");
        setPages(pages.filter(p => p.id !== id));
    };

    return {
        pages,
        isLoading,
        addPage,
        updatePage,
        deletePage,
        refreshPages: fetchPages
    };
};
