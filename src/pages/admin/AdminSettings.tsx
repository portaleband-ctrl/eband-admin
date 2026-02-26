import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { useSettings, Settings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { testGeminiConnection } from "@/lib/gemini";
import { testOpenAiConnection } from "@/lib/openai";
import { Switch } from "@/components/ui/switch";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { usePages } from "@/hooks/usePages";
import { FileCode, Globe } from "lucide-react";

const AdminSettings = () => {
  const { settings, saveSettings, isLoading: isLoadingSettings } = useSettings();
  const { articles } = useArticles();
  const { categories } = useCategories();
  const { pages } = usePages();

  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [isTestingOpenAi, setIsTestingOpenAi] = useState(false);

  useEffect(() => {
    if (!isLoadingSettings) {
      setLocalSettings(settings);
    }
  }, [settings, isLoadingSettings]);

  if (isLoadingSettings) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const handleInputChange = (id: keyof Settings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggleChange = (id: keyof Settings, value: boolean) => {
    setLocalSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (section: string) => {
    try {
      await saveSettings(localSettings);
      toast.success(`Configurações de ${section} salvas com sucesso!`, {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      });
    } catch (error: any) {
      toast.error(`Erro ao salvar ${section}: ${error.message}`);
    }
  };

  const handleTestGemini = async () => {
    if (!localSettings.geminiApiKey) {
      toast.error("Por favor, insira a chave da API do Gemini primeiro.");
      return;
    }

    setIsTestingGemini(true);
    try {
      await testGeminiConnection(localSettings.geminiApiKey);
      toast.success("Conexão com Gemini estabelecida com sucesso!");
    } catch (error: any) {
      toast.error(`Falha na conexão Gemini: ${error.message}`);
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleTestOpenAi = async () => {
    if (!localSettings.openAiApiKey) {
      toast.error("Por favor, insira a chave da API da OpenAI primeiro.");
      return;
    }

    setIsTestingOpenAi(true);
    try {
      await testOpenAiConnection(localSettings.openAiApiKey);
      toast.success("Conexão com OpenAI estabelecida com sucesso!");
    } catch (error: any) {
      toast.error(`Falha na conexão OpenAI: ${error.message}`);
    } finally {
      setIsTestingOpenAi(false);
    }
  };

  const handleGenerateSitemap = () => {
    const baseUrl = localSettings.siteUrl || window.location.origin;
    const date = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${date}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`;

    // Articles
    articles.forEach(art => {
      xml += `  <url>\n    <loc>${baseUrl}/artigo/${art.slug}</loc>\n    <lastmod>${art.publishedAt || date}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Pages
    pages.forEach(pg => {
      xml += `  <url>\n    <loc>${baseUrl}/p/${pg.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Categories
    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/categoria/${cat.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>0.4</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Sitemap.xml gerado com sucesso! Salve-o na pasta 'public' do seu projeto.");
  };

  return (
    <AdminLayout title="Configurações">
      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Integrações Google</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics - ID de Rastreamento</Label>
              <Input
                id="googleAnalyticsId"
                placeholder="G-XXXXXXXXXX"
                className="mt-1"
                value={localSettings.googleAnalyticsId}
                onChange={(e) => handleInputChange("googleAnalyticsId", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="googleSearchConsoleCode">Google Search Console - Código de Verificação</Label>
              <Input
                id="googleSearchConsoleCode"
                placeholder="Cole o meta tag de verificação"
                className="mt-1"
                value={localSettings.googleSearchConsoleCode}
                onChange={(e) => handleInputChange("googleSearchConsoleCode", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="googleAdSenseId">Google AdSense - ID do Publisher</Label>
              <Input
                id="googleAdSenseId"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="mt-1"
                value={localSettings.googleAdSenseId}
                onChange={(e) => handleInputChange("googleAdSenseId", e.target.value)}
              />
            </div>
            <Button onClick={() => handleSave("Google")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Integrações
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">API do Gemini (IA)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="geminiApiKey">Chave da API Gemini</Label>
              <Input
                id="geminiApiKey"
                type="password"
                placeholder="AIzaSy..."
                className="mt-1"
                value={localSettings.geminiApiKey}
                onChange={(e) => handleInputChange("geminiApiKey", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Obter chave no Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSave("Gemini")} className="gap-2">
                <Save className="w-4 h-4" /> Salvar Chave
              </Button>
              <Button
                onClick={handleTestGemini}
                variant="outline"
                className="gap-2"
                disabled={isTestingGemini}
              >
                <RefreshCw className={`w-4 h-4 ${isTestingGemini ? "animate-spin" : ""}`} />
                {isTestingGemini ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">API do Unsplash (Imagens Gratuitas)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="unsplashApiKey">Chave de Acesso Unsplash</Label>
              <Input
                id="unsplashApiKey"
                type="password"
                placeholder="Access Key..."
                className="mt-1"
                value={localSettings.unsplashApiKey}
                onChange={(e) => handleInputChange("unsplashApiKey", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                <a
                  href="https://unsplash.com/developers"
                  target="_blank"
                  rel="noopener"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Criar conta de desenvolvedor Unsplash <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <Button onClick={() => handleSave("Unsplash")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Chave Unsplash
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">API da OpenAI (IA)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="openAiApiKey">Chave da API OpenAI</Label>
              <Input
                id="openAiApiKey"
                type="password"
                placeholder="sk-..."
                className="mt-1"
                value={localSettings.openAiApiKey}
                onChange={(e) => handleInputChange("openAiApiKey", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Obter chave no OpenAI Platform <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSave("OpenAI")} className="gap-2">
                <Save className="w-4 h-4" /> Salvar Chave
              </Button>
              <Button
                onClick={handleTestOpenAi}
                variant="outline"
                className="gap-2"
                disabled={isTestingOpenAi}
              >
                <RefreshCw className={`w-4 h-4 ${isTestingOpenAi ? "animate-spin" : ""}`} />
                {isTestingOpenAi ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Personalização da IA (Escrita)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customStandardPrompt">Prompt para Artigos Normais</Label>
              <Textarea
                id="customStandardPrompt"
                placeholder="Ex: Use linguagem simples, evite clichês de IA..."
                className="mt-1 h-32"
                value={localSettings.customStandardPrompt}
                onChange={(e) => handleInputChange("customStandardPrompt", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Instruções extras enviadas à IA para artigos informativos.
              </p>
            </div>
            <div>
              <Label htmlFor="customReviewPrompt">Prompt para Review de Produtos</Label>
              <Textarea
                id="customReviewPrompt"
                placeholder="Ex: Foque nos pontos positivos e negativos reais..."
                className="mt-1 h-32"
                value={localSettings.customReviewPrompt}
                onChange={(e) => handleInputChange("customReviewPrompt", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Instruções extras enviadas à IA para análises de produtos.
              </p>
            </div>
            <div>
              <Label htmlFor="customTitlePrompt">Prompt para Títulos de Artigo</Label>
              <Textarea
                id="customTitlePrompt"
                placeholder="Ex: Gere títulos diretos e humanos, sem a palavra Descubra..."
                className="mt-1 h-32"
                value={localSettings.customTitlePrompt}
                onChange={(e) => handleInputChange("customTitlePrompt", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Instruções extras enviadas à IA para a criação de títulos SEO.
              </p>
            </div>
            <Button onClick={() => handleSave("Personalização IA")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Prompts Customizados
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Integração WordPress</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wpUrl">URL do Site</Label>
              <Input
                id="wpUrl"
                placeholder="https://meusite.com.br"
                className="mt-1"
                value={localSettings.wpUrl}
                onChange={(e) => handleInputChange("wpUrl", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wpUsername">Usuário / E-mail</Label>
              <Input
                id="wpUsername"
                placeholder="admin"
                className="mt-1"
                value={localSettings.wpUsername}
                onChange={(e) => handleInputChange("wpUsername", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wpAppPassword">Senha de Aplicativo</Label>
              <Input
                id="wpAppPassword"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                className="mt-1"
                value={localSettings.wpAppPassword}
                onChange={(e) => handleInputChange("wpAppPassword", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use uma "Application Password" gerada no seu perfil do WordPress.
              </p>
            </div>
            <Button onClick={() => handleSave("WordPress")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar WordPress
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Configurações de Exibição</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
              <div className="space-y-0.5">
                <Label className="text-base cursor-pointer" htmlFor="showTags">Exibir Tags nos Artigos</Label>
                <p className="text-xs text-muted-foreground">
                  Se ativado, as tags do artigo serão exibidas no final do conteúdo.
                </p>
              </div>
              <Switch
                id="showTags"
                checked={localSettings.showTags}
                onCheckedChange={(checked) => handleToggleChange("showTags", checked)}
              />
            </div>
            <Button onClick={() => handleSave("Exibição")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Configurações de Exibição
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" /> SEO & Indexação
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
              <h4 className="text-sm font-bold mb-2">Sitemap.xml</h4>
              <p className="text-xs text-muted-foreground mb-4">
                O arquivo Sitemap ajuda o Google a descobrir seus artigos mais rapidamente.
                Gere o arquivo e adicione-o à raiz do seu site (pasta public).
              </p>
              <Button onClick={handleGenerateSitemap} variant="outline" className="w-full gap-2 text-accent border-accent/20 hover:bg-accent/5">
                <FileCode className="w-4 h-4" /> Gerar e Baixar Sitemap.xml
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-secondary/20 border border-primary/5">
              <h4 className="text-sm font-bold mb-2">Google Indexing API</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Para indexação instantânea (até 200 artigos/dia), cole abaixo o conteúdo do arquivo JSON da sua <strong>Conta de Serviço do Google Cloud</strong> configurada com a Web Search Indexing API.
              </p>
              <Textarea
                id="googleIndexingJson"
                placeholder='{\n  "type": "service_account",\n  "project_id": "meu-projeto",\n  "private_key_id": "...",\n  ...\n}'
                className="font-mono text-xs h-32"
                value={localSettings.googleIndexingJson}
                onChange={(e) => handleInputChange("googleIndexingJson", e.target.value)}
              />
              <a
                href="https://developers.google.com/search/apis/indexing-api/v3/prereqs"
                target="_blank"
                rel="noopener"
                className="text-[10px] text-accent hover:underline inline-flex items-center gap-1 mt-2"
              >
                Como configurar a Indexing API do Google? <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="p-4 rounded-lg bg-secondary/20 border border-primary/5 mt-4">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                Integração Cloudflare Pages (Deploy Automático)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Cole a URL do seu <strong>Deploy Webhook</strong> do Cloudflare Pages. O sistema irá notificar a Cloudflare para reconstruir o projeto Astro estático sempre que um artigo for publicado ou excluído.
              </p>
              <Input
                id="cloudflareWebhookUrl"
                placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
                value={localSettings.cloudflareWebhookUrl}
                onChange={(e) => handleInputChange("cloudflareWebhookUrl", e.target.value)}
              />
            </div>

            <Button onClick={() => handleSave("SEO & Indexação")} className="w-full gap-2 mt-4">
              <Save className="w-4 h-4" /> Salvar Configurações de SEO & Integrações
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Informações do Blog</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteUrl">URL do Site Principal (Domínio Público)</Label>
              <Input
                id="siteUrl"
                placeholder="https://meusite.com.br"
                className="mt-1"
                value={localSettings.siteUrl}
                onChange={(e) => handleInputChange("siteUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Usado no Sitemap gerado automaticamente.</p>
            </div>
            <div>
              <Label htmlFor="blogName">Nome do Blog</Label>
              <Input
                id="blogName"
                placeholder="Meu Blog."
                className="mt-1"
                value={localSettings.blogName}
                onChange={(e) => handleInputChange("blogName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="blogDescription">Descrição / Slogan</Label>
              <Input
                id="blogDescription"
                placeholder="Análises e recomendações de produtos"
                className="mt-1"
                value={localSettings.blogDescription}
                onChange={(e) => handleInputChange("blogDescription", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="blogLogo">URL da Logo (PNG ou SVG recomendado)</Label>
              <Input
                id="blogLogo"
                placeholder="https://meusite.com/logo.png"
                className="mt-1"
                value={localSettings.blogLogo}
                onChange={(e) => handleInputChange("blogLogo", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Deixe em branco para usar o nome em texto.</p>
            </div>
            <div>
              <Label htmlFor="blogFavicon">URL do Favicon (.ico ou .png)</Label>
              <Input
                id="blogFavicon"
                placeholder="https://meusite.com/favicon.png"
                className="mt-1"
                value={localSettings.blogFavicon}
                onChange={(e) => handleInputChange("blogFavicon", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil do Autor</h4>
              <div>
                <Label htmlFor="authorName">Nome do Autor</Label>
                <Input
                  id="authorName"
                  placeholder="Seu Nome"
                  className="mt-1"
                  value={localSettings.authorName}
                  onChange={(e) => handleInputChange("authorName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="authorImage">URL da Foto do Autor (32x32px recomendado)</Label>
                <Input
                  id="authorImage"
                  placeholder="https://meusite.com/autor.jpg"
                  className="mt-1"
                  value={localSettings.authorImage}
                  onChange={(e) => handleInputChange("authorImage", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="footerText">Texto do Rodapé (Sobre)</Label>
              <Textarea
                id="footerText"
                placeholder="Descreva seu blog no rodapé..."
                className="mt-1"
                rows={3}
                value={localSettings.footerText}
                onChange={(e) => handleInputChange("footerText", e.target.value)}
              />
            </div>
            <Button onClick={() => handleSave("Blog")} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Branding
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
