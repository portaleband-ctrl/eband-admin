export const testGeminiConnection = async (apiKey: string) => {
    if (!apiKey) {
        throw new Error("A chave da API é obrigatória.");
    }

    // This is a dummy test to simulate a connection check
    // In a real scenario, we would make a lightweight request to the Gemini API
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro ao conectar com a API do Gemini.");
        }

        return true;
    } catch (error: any) {
        console.error("Gemini connection test failed:", error);
        throw error;
    }
};
