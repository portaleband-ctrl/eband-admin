export interface WordPressSettings {
    wpUrl: string;
    wpUsername: string;
    wpAppPassword: string;
}

export interface ArticleData {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    status?: "publish" | "draft" | "pending" | "private";
}

export const publishToWordPress = async (article: ArticleData, settings: WordPressSettings) => {
    const { wpUrl, wpUsername, wpAppPassword } = settings;

    if (!wpUrl || !wpUsername || !wpAppPassword) {
        throw new Error("Configurações do WordPress incompletas.");
    }

    // Ensure URL ends with /wp-json/wp/v2/posts
    const baseUrl = wpUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`;

    // Encode credentials for Basic Auth
    const credentials = btoa(`${wpUsername}:${wpAppPassword}`);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${credentials}`,
            },
            body: JSON.stringify({
                title: article.title,
                content: article.content,
                status: article.status || "draft",
                // Categories and tags require IDs in WordPress REST API, 
                // will need mapping or simple text for now if supported by plugins
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha ao publicar no WordPress.");
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("WordPress export failed:", error);
        throw error;
    }
};
