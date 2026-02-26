export interface GenerateOptions {
    apiKey: string;
    model?: string;
    title: string;
    type: string;
    wordCount?: string;
    reviewPrompt?: string;
    affiliateLinks?: string;
    imageLinks?: string;
    includeProducts?: boolean;
    customStandardPrompt?: string;
}

export const generateArticleContent = async (options: GenerateOptions) => {
    const { apiKey, title, type, wordCount, reviewPrompt, affiliateLinks, imageLinks, includeProducts } = options;

    if (!apiKey) throw new Error("API Key é necessária");

    const systemPrompt = `Você é um redator especializado em SEO técnico e escrita humana para blogs de alta performance.
  Seu objetivo é criar artigos que soem naturais, simples e fáceis de entender, sem clichês típicos de IA.

  ADICIONE ESTE BLOCO <style> NO TOPO DO HTML (ESTILOS SEGUROS QUE NÃO AFETAM O RESTO DO SITE):
  <style>
    .ai-article-container { font-family: 'Inter', sans-serif; line-height: 1.8; color: #333; }
    .ai-article-container h2, .ai-article-container h3 { color: #111; margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
    .ai-article-container p { margin-bottom: 1.5rem; }
    .ai-article-container .product-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 2.5rem; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .ai-article-container .product-card h2 { margin-top: 0; font-size: 1.6rem; border-bottom: 3px solid #FFD814; display: inline-block; padding-bottom: 4px; margin-bottom: 1.2rem; }
    .ai-article-container .product-image { width: 100% !important; max-width: 500px !important; height: auto !important; border-radius: 8px; display: block; margin: 1.2rem auto; object-fit: contain; }
    .ai-article-container table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
    .ai-article-container th { background-color: #3483FA; color: #fff; padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: none; }
    .ai-article-container td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f0f0f0; background-color: #fff; vertical-align: top; }
    .ai-article-container tr:nth-child(even) td { background-color: #f8faff; }
    .ai-article-container .pros-cell { color: #059669; }
    .ai-article-container .cons-cell { color: #dc2626; }
    .ai-article-container .button-container { text-align: center; margin: 1.5rem 0; }
    .ai-article-container .btn-offer { display: block; width: fit-content; margin: 0 auto; background-color: #3483FA; color: #fff !important; padding: 14px 32px; text-decoration: none !important; border-radius: 4px; font-weight: 700; font-size: 1rem; border: none; box-shadow: 0 2px 8px rgba(52,131,250,0.35); transition: all 0.15s; }
    .ai-article-container .btn-offer:hover { background-color: #2968C8; }
    .ai-article-container .faq-section { background: #f9fafb; padding: 1.5rem; border-radius: 12px; margin: 2.5rem 0; border: 1px solid #eee; }
    .ai-article-container .faq-question { font-weight: bold; color: #111; display: block; margin-bottom: 0.4rem; }
  </style>

  REGRAS DE ESCRITA:
  - NUNCA use frases como "Descubra os segredos", "Prepare-se para", "Neste artigo vamos explorar".
  - Use um tom de conversa direto entre humanos (Linguagem Simples).
  - Parágrafos curtos. Use negrito em termos importantes.
  - IMPORTANTE: NÃO inclua a tag <h1> com o título dentro do conteúdo HTML.

  REGRAS DE PRODUTOS (EXTREMAMENTE CRÍTICO):
  - Use EXATAMENTE o "Nome do Produto" e o "Link de Afiliado" fornecidos. NÃO invente nomes.
  - Para cada produto, a tabela deve ter OBRIGATORIAMENTE pelo menos 3 Vantagens e 3 Desvantagens de forma clara.

  ESTRUTURA HTML (ENVOLVA EM <div class="ai-article-container">):
  <div class="ai-article-container">
    <div class="introduction">[TEXTO DO LEAD]</div>
    ${(type === 'review' || includeProducts) ? `
    <div class="product-reviews">
      [PARA CADA PRODUTO]:
      <div class="product-card">
        <h2>Nome Exato do Produto</h2>
        <img src="[URL_IMAGEM_FORNECIDA]" alt="Nome do Produto" class="product-image">
        <p>[ANÁLISE REALISTA]</p>
        <table>
          <thead><tr><th>Vantagens</th><th>Desvantagens</th></tr></thead>
          <tbody>
            <tr>
              <td class="pros-cell"><ul><li>Vantagem 1</li><li>Vantagem 2</li><li>Vantagem 3</li></ul></td>
              <td class="cons-cell"><ul><li>Desvantagem 1</li><li>Desvantagem 2</li><li>Desvantagem 3</li></ul></td>
            </tr>
          </tbody>
        </table>
        <div class="button-container"><a href="[LINK_AFILIADO_DO_PRODUTO]" class="btn-offer" target="_blank" rel="noopener">Pegar Desconto</a></div>
      </div>
    </div>` : ''}
    <div class="faq-section"><h2>Dúvidas Frequentes</h2>[FAQ ITEMS]</div>
    <div class="conclusion">[FECHAMENTO]</div>
  </div>`;

    const affiliateLinksList = affiliateLinks?.trim().split('\n').filter(Boolean) || [];
    const imageLinksList = imageLinks?.trim().split('\n').filter(Boolean) || [];

    // Parse unified product blocks: groups separated by blank lines
    // Each block has 3 lines: line 1 = product name, line 2 = affiliate link, line 3 = image URL
    const rawInput = (affiliateLinks || '').trim();
    const blocks = rawInput ? rawInput.split(/\n\s*\n/) : [];

    const parsedProducts = blocks.map((block, i) => {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
        return {
            name: lines[0] || `Produto ${i + 1}`,
            url: lines[1] || '',
            img: lines[2] || imageLinksList[i]?.trim() || 'SEM IMAGEM',
        };
    });

    // If user still uses old format (single link per line), fallback
    if (parsedProducts.length === 0 && affiliateLinksList.length > 0) {
        affiliateLinksList.forEach((link, i) => {
            parsedProducts.push({
                name: `Produto ${i + 1}`,
                url: link.trim(),
                img: imageLinksList[i]?.trim() || 'SEM IMAGEM',
            });
        });
    }

    // Build the numbered product table for the AI
    const productImageTable = parsedProducts.map((p, i) =>
        `Produto ${i + 1}:\n  Nome EXATO: ${p.name}\n  Link de Afiliado: ${p.url}\n  Imagem: ${p.img}`
    ).join('\n\n');

    const userPrompt = `Assunto: "${title}".
  Tipo: ${type === 'review' ? 'Review Detalhado' : 'Artigo Informativo'}.
  Tamanho: ${wordCount || '800'} palavras.
  
  DIRETRIZ DE ESTILO:
  ${type === 'review' ? (reviewPrompt || "Review honesto e simples.") : (options.customStandardPrompt || "Linguagem humana e direta.")}
  
  DADOS OBRIGATÓRIOS — CADA PRODUTO TEM SUA PRÓPRIA IMAGEM. NÃO TROQUE AS IMAGENS DE LUGAR:
  ${productImageTable || (affiliateLinks ? `Produtos:\n${affiliateLinks}` : '')}
  
  REGRA CRÍTICA DE IMAGENS: O "Produto 1" DEVE usar SOMENTE a "Imagem do Produto 1". O "Produto 2" DEVE usar SOMENTE a "Imagem do Produto 2". E assim por diante. NUNCA coloque a imagem de um produto em outro.`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: options.model || "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na geração do artigo.");
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean markdown code blocks if present
        content = content.replace(/^```html\n?|```$/g, '').trim();

        return content;
    } catch (error: any) {
        console.error("OpenAI generation failed:", error);
        throw error;
    }
};

export const generateArticleTitle = async (apiKey: string, idea: string, customPrompt?: string) => {
    if (!apiKey) throw new Error("API Key é necessária");

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Você é um especialista em SEO e títulos jornalísticos para blogs de alta performance. 
            Gere 1 título atraente, direto e informativo em Português do Brasil a partir de uma ideia ou palavra-chave.
            
            REGRAS CRÍTICAS:
            - NUNCA use as palavras "Descubra", "Segredos", "Guia Essencial" ou qualquer termo que soe como clichê de IA.
            - O título deve parecer escrito por um humano para outros humanos.
            - Seja específico e direto.
            - Retorne APENAS o texto do título, sem aspas.`
                    },
                    { role: "user", content: customPrompt ? `${customPrompt}\n\nIdeia: ${idea}` : `Ideia: ${idea}` }
                ],
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na geração do título.");
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error("OpenAI title generation failed:", error);
        throw error;
    }
};

export const generateImage = async (apiKey: string, prompt: string) => {
    if (!apiKey) throw new Error("API Key é necessária");

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: `Uma imagem fotográfica profissional, realista e épica para um blog de alta qualidade, otimizada para o Google Discover. Assunto: ${prompt}. Estilo cinema, luz natural, formato paisagem 16:9, sem textos, marcas d'água ou bordas.`,
                n: 1,
                size: "1792x1024",
                quality: "standard",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na geração da imagem.");
        }

        const data = await response.json();
        return data.data[0].url;
    } catch (error: any) {
        console.error("OpenAI image generation failed:", error);
        throw error;
    }
};

export const analyzeKeywordPotential = async (apiKey: string, keywords: string[]) => {
    if (!apiKey) throw new Error("API Key é necessária");
    if (!keywords || keywords.length === 0) return [];

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Você é um especialista em SEO e tendências do Google Discover no Brasil. 
            Analise a lista de palavras-chave fornecida e retorne um JSON com o potencial de cada uma (High, Medium, Low) e uma breve razão (Search Intent).
            Foque em termos que geram curiosidade e tráfego orgânico alto.
            
            Retorne APENAS um array de objetos JSON no formato:
            [
              { "keyword": "termo", "potential": "High/Medium/Low", "reason": "Motivo curto em português" }
            ]`
                    },
                    { role: "user", content: `Palavras-chave: ${keywords.join(", ")}` }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na análise de palavras-chave.");
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        // Sometimes GPT returns { "keywords": [...] } or similar, handle it.
        return result.keywords || Object.values(result)[0] || [];
    } catch (error: any) {
        console.error("OpenAI keyword analysis failed:", error);
        throw error;
    }
};

export const testOpenAiConnection = async (apiKey: string) => {
    if (!apiKey) {
        throw new Error("A chave da API é obrigatória.");
    }

    try {
        const response = await fetch("https://api.openai.com/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro ao conectar com a API da OpenAI.");
        }

        return true;
    } catch (error: any) {
        console.error("OpenAI connection test failed:", error);
        throw error;
    }
};
