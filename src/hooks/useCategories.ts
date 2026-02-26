import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    featured?: boolean;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { settings } = useSettings();

    const triggerCloudflareBuild = () => {
        if (!settings?.cloudflareWebhookUrl) return;

        fetch(settings.cloudflareWebhookUrl, { method: 'POST' })
            .then(res => {
                if (res.ok) console.log("Cloudflare Build acionado com sucesso (Categorias)!");
            })
            .catch(err => console.error("Falha ao acionar webhook da Cloudflare:", err));
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error);
            // toast.error("Erro ao carregar categorias.");
        } else if (data) {
            setCategories(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (name: string) => {
        const slug = name.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        const { error } = await supabase
            .from('categories')
            .insert([{ name, slug }]);

        if (error) {
            console.error("Error adding category:", error);
            toast.error("Erro ao criar categoria. Talvez ela já exista?");
            throw error;
        }

        triggerCloudflareBuild();
        toast.success(`Categoria "${name}" criada com sucesso!`);
        fetchCategories();
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting category:", error);
            toast.error("Erro ao excluir categoria.");
            throw error;
        }

        triggerCloudflareBuild();
        toast.success("Categoria excluída.");
        setCategories(categories.filter(c => c.id !== id));
    };

    const toggleFeatured = async (id: string, featured: boolean) => {
        const { error } = await supabase
            .from('categories')
            .update({ featured })
            .eq('id', id);

        if (error) {
            console.error("Error toggling featured:", error);
            toast.error("Erro ao atualizar categoria.");
            return;
        }

        triggerCloudflareBuild();
        setCategories(categories.map(c => c.id === id ? { ...c, featured } : c));
    };

    return {
        categories,
        isLoading,
        addCategory,
        deleteCategory,
        toggleFeatured,
        refreshCategories: fetchCategories
    };
};
