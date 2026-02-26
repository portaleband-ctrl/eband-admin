import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Settings {
    blogName: string;
    blogDescription: string;
    blogLogo: string;
    blogFavicon: string;
    footerText: string;
    authorName: string;
    authorImage: string;
    wpUrl: string;
    wpUsername: string;
    wpAppPassword: string;
    googleAdSenseId: string;
    geminiApiKey: string;
    openAiApiKey: string;
    googleAnalyticsId: string;
    googleSearchConsoleCode: string;
    unsplashApiKey?: string;
    customStandardPrompt?: string;
    customReviewPrompt?: string;
    customTitlePrompt?: string;
    showTags?: boolean;
    siteUrl?: string;
    googleIndexingJson?: string;
    cloudflareWebhookUrl?: string;
}

export const DEFAULT_SETTINGS: Settings = {
    blogName: "",
    blogDescription: "O próximo nível do seu blog",
    blogLogo: "",
    blogFavicon: "",
    footerText: "Seu guia confiável para encontrar os melhores produtos. Análises honestas e recomendações baseadas em pesquisa real.",
    authorName: "",
    authorImage: "",
    wpUrl: "",
    wpUsername: "",
    wpAppPassword: "",
    openAiApiKey: "",
    geminiApiKey: "",
    googleAdSenseId: "",
    googleAnalyticsId: "",
    googleSearchConsoleCode: "",
    unsplashApiKey: "",
    customStandardPrompt: "Crie um artigo informativo e dinâmico, focado em SEO, com linguagem simples e natural. Evite clichês de IA como 'descubra os segredos'. Use parágrafos curtos e negrito para destaque.",
    customReviewPrompt: "Faça um review detalhado e honesto dos produtos fornecidos. Use uma linguagem de especialista, mas acessível. Avalie prós e contras de forma clara.",
    customTitlePrompt: "Gere um título atraente e direto, focado em SEO e curiosidade real. Evite palavras como 'Descubra', 'Segredos' ou 'Guia Essencial'. O título deve soar humano e informativo.",
    showTags: true,
    siteUrl: "",
    googleIndexingJson: "",
    cloudflareWebhookUrl: "",
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('settings')
                .select('config')
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching settings:", error);
                setIsLoading(false);
                return;
            }

            if (data && data.config) {
                setSettings({ ...DEFAULT_SETTINGS, ...data.config });
            }
            setIsLoading(false);
        };

        fetchSettings();
    }, []);

    const saveSettings = async (newSettings: Settings) => {
        setSettings(newSettings);

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            console.warn("User not authenticated, settings only saved locally for now.");
            return;
        }

        const { data: existingSettings } = await supabase
            .from('settings')
            .select('id')
            .limit(1)
            .maybeSingle();

        let error;
        if (existingSettings) {
            const { error: updateError } = await supabase
                .from('settings')
                .update({ config: newSettings, updated_at: new Date().toISOString() })
                .eq('id', existingSettings.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('settings')
                .insert([{ user_id: userData.user.id, config: newSettings }]);
            error = insertError;
        }

        if (error) {
            console.error("Error saving settings to Supabase:", error);
            throw error;
        }
    };

    return { settings, saveSettings, isLoading };
};
