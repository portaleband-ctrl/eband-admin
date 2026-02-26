
/**
 * Fetches keyword suggestions from Google's autocomplete endpoint.
 * This is a free, non-official way to get related search terms.
 */
export const getKeywordSuggestions = async (target: string): Promise<string[]> => {
    if (!target || target.trim().length < 2) return [];

    try {
        // Adding hl=pt-BR and gl=br for Brazil-focused suggestions
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&hl=pt-BR&gl=br&q=${encodeURIComponent(target)}`;
        // Using allorigins proxy to bypass CORS restrictions on localhost
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Failed to fetch suggestions via proxy");

        const data = await response.json();
        if (!data || !data.contents) return [];

        const parsedData = JSON.parse(data.contents);
        // Data format: ["original_query", ["suggestion1", "suggestion2", ...]]
        return parsedData[1] || [];
    } catch (error) {
        console.error("Error fetching keyword suggestions:", error);
        return [];
    }
};

/**
 * Searches for high-quality images on Unsplash.
 * Requires an API Key from https://unsplash.com/developers
 */
export const searchUnsplashImages = async (query: string, apiKey: string) => {
    if (!apiKey) throw new Error("Unsplash API Key is required");
    if (!query) return [];

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Client-ID ${apiKey}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || "Failed to fetch images from Unsplash");
        }

        const data = await response.json();
        return data.results.map((img: any) => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.thumb,
            alt: img.alt_description || "Image from Unsplash",
            author: img.user.name,
            link: img.links.html
        }));
    } catch (error: any) {
        console.error("Unsplash Search Error:", error);
        throw error;
    }
};
