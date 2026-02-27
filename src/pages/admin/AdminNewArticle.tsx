import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { mockCategories } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ImagePlus, RefreshCw, Save, Eye, Send, Globe, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { generateArticleContent, generateImage, generateArticleTitle, analyzeKeywordPotential } from "@/lib/openai";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getKeywordSuggestions, searchUnsplashImages } from "@/lib/externalApis";
import { Search, Info } from "lucide-react";

import { Switch } from "@/components/ui/switch";

const AdminNewArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings } = useSettings();
  const { addArticle, articles, updateArticle } = useArticles();
  const { categories } = useCategories();
  const [keyword, setKeyword] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [articleType, setArticleType] = useState("standard");
  const [wordCount, setWordCount] = useState("800");
  const [affiliateLinks, setAffiliateLinks] = useState("");
  const [imageLinks, setImageLinks] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState("08:00");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [includeProducts, setIncludeProducts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [isAnalyzingKeywords, setIsAnalyzingKeywords] = useState(false);
  const [analyzedKeywords, setAnalyzedKeywords] = useState<any[]>([]);

  useEffect(() => {
    if (id && articles.length > 0) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setIsEditing(true);
        setTitle(article.title);
        setContent(article.content);
        setCategory(article.category);
        setArticleType(article.type);
        setFeaturedImage(article.featuredImage);
        setTagsInput(article.tags.join(", "));
        setAffiliateLinks(article.affiliateLinks.join("\n\n")); // Assuming this format matches

        const dateObj = new Date(article.publishedAt);
        setPublishedAt(dateObj.toISOString().split('T')[0]);
        setPublishTime(dateObj.toTimeString().substring(0, 5));

        // If date is in the future, it was likely scheduled
        if (dateObj > new Date()) {
          setIsScheduleEnabled(true);
        }
      }
    }
  }, [id, articles]);

  const handleGenerateTitle = async () => {
    if (!keyword) {
      toast.error("Por favor, digite uma ideia ou palavra-chave.");
      return;
    }

    if (!settings.openAiApiKey) {
      toast.error("Configure sua chave da OpenAI primeiro.");
      return;
    }

    setIsGeneratingTitle(true);
    try {
      const generatedTitle = await generateArticleTitle(settings.openAiApiKey, keyword, settings.customTitlePrompt);
      setTitle(generatedTitle);
      toast.success("Título gerado com sucesso! Você pode editá-lo abaixo.");
    } catch (error: any) {
      toast.error(`Erro ao gerar título: ${error.message}`);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!title) {
      toast.error("Por favor, defina um título para o artigo.");
      return;
    }

    if (!settings.openAiApiKey) {
      toast.error("Configure sua chave da OpenAI nas configurações antes de gerar.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("A IA está criando seu artigo...");

    try {
      const generatedContent = await generateArticleContent({
        apiKey: settings.openAiApiKey,
        title,
        type: articleType,
        wordCount,
        reviewPrompt,
        affiliateLinks,
        imageLinks,
        includeProducts: articleType === 'review' || includeProducts,
        customStandardPrompt: settings.customStandardPrompt,
      });
      setContent(generatedContent);
      toast.dismiss(loadingToast);
      toast.success("Artigo gerado com sucesso!");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Erro ao gerar: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!title) {
      toast.error("Defina um título para a IA saber o que criar.");
      return;
    }

    if (!settings.openAiApiKey) {
      toast.error("Configure sua chave da OpenAI primeiro.");
      return;
    }

    setIsGeneratingImage(true);
    const loadingToast = toast.loading("Gerando imagem épica...");

    try {
      const imageUrl = await generateImage(settings.openAiApiKey, title);
      setFeaturedImage(imageUrl);
      toast.dismiss(loadingToast);
      toast.success("Imagem gerada e definida como destaque!");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Erro na imagem: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSearchKeywords = async () => {
    if (!keyword || keyword.length < 2) return;
    setIsSearchingKeywords(true);
    try {
      const suggestions = await getKeywordSuggestions(keyword);
      setKeywordSuggestions(suggestions);
      setIsKeywordModalOpen(true);
    } catch (error) {
      toast.error("Erro ao buscar sugestões.");
    } finally {
      setIsSearchingKeywords(false);
    }
  };

  const handleAnalyzeKeywords = async () => {
    if (keywordSuggestions.length === 0) return;
    if (!settings.openAiApiKey) {
      toast.error("API Key da OpenAI é necessária para análise.");
      return;
    }
    setIsAnalyzingKeywords(true);
    try {
      const results = await analyzeKeywordPotential(settings.openAiApiKey, keywordSuggestions);
      setAnalyzedKeywords(results);
      toast.success("Análise concluída!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzingKeywords(false);
    }
  };

  const handleSearchUnsplash = async () => {
    if (!settings.unsplashApiKey) {
      toast.error("Configure sua chave do Unsplash nas configurações primeiro.");
      return;
    }
    const query = unsplashQuery || title || keyword;
    if (!query) {
      toast.error("Digite um termo para pesquisar imagens.");
      return;
    }
    setIsSearchingUnsplash(true);
    try {
      const results = await searchUnsplashImages(query, settings.unsplashApiKey);
      setUnsplashResults(results);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSearchingUnsplash(false);
    }
  };

  const selectUnsplashImage = (url: string) => {
    setFeaturedImage(url);
    setIsUnsplashModalOpen(false);
    toast.success("Imagem selecionada com sucesso!");
  };

  const handlePublish = async () => {
    if (!title || !content || !featuredImage) {
      toast.error("Título, conteúdo e imagem de destaque são obrigatórios para publicar.");
      return;
    }

    const normalizedSlug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const cleanText = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim();

    const combinedPublishDate = isScheduleEnabled
      ? `${publishedAt}T${publishTime}:00`
      : new Date().toISOString();

    const parsedAffiliateLinks = affiliateLinks.split(/\n\s*\n/).filter(Boolean).map(block => {
      const lines = block.trim().split('\n').filter(Boolean);
      return {
        label: lines[0]?.substring(0, 50) || "Ver Oferta",
        url: lines[1] || "#"
      };
    });

    const newArticle = {
      id: id || "",
      title,
      slug: normalizedSlug,
      excerpt: cleanText.substring(0, 160) + (cleanText.length > 160 ? "..." : ""),
      content,
      featuredImage,
      featuredImageAlt: title,
      category: category || "Geral",
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(Boolean),
      author: settings.authorName,
      publishedAt: combinedPublishDate,
      status: 'published' as const,
      type: articleType as any,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      affiliateLinks: parsedAffiliateLinks,
    };

    try {
      if (isEditing) {
        await updateArticle(newArticle);
        toast.success("Artigo atualizado com sucesso!");
      } else {
        await addArticle(newArticle);
        toast.success("Artigo publicado com sucesso! Ele já aparece na Home.");
      }

      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate("/admin/artigos");
      }, 1500);
    } catch (error: any) {
      toast.error(`Erro ao publicar: ${error.message}`);
    }
  };

  const handleSaveAsHTML = async () => {
    if (!title || !content) {
      toast.error("O artigo precisa de título e conteúdo para ser salvo.");
      return;
    }

    // Sanitize title for filename
    const filename = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_") + ".html";

    try {
      // In a real browser environment, we might use a download trigger
      // Here we will also simulate the request to the agent to save it
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Arquivo ${filename} gerado para download!`);

      // Notify the agent in the logs so it can be picked up if needed
      console.log(`ARTIGO_PRONTO_PARA_SALVAR: ${filename}`);
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleSave = () => {
    toast.success("Rascunho salvo localmente!");
  };

  return (
    <AdminLayout title={isEditing ? "Editar Artigo" : "Novo Artigo"}>
      <div className="max-w-4xl">
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList>
            <TabsTrigger value="manual">Escrita Manual</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" /> Criar com IA
            </TabsTrigger>
          </TabsList>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label htmlFor="keyword">Ideia ou Palavra-chave do Artigo</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Ex: Novos fones da Sony 2025"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearchKeywords}
                    disabled={isSearchingKeywords}
                    variant="secondary"
                    className="whitespace-nowrap"
                    title="Descobrir variações e volume (Sugestões Google)"
                  >
                    <Search className={`w-4 h-4 mr-2 ${isSearchingKeywords ? "animate-spin" : ""}`} />
                    Explorar
                  </Button>
                  <Button
                    onClick={handleGenerateTitle}
                    disabled={isGeneratingTitle}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10 whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingTitle ? "animate-spin" : ""}`} />
                    {isGeneratingTitle ? "Gerando..." : "Gerar Título SEO"}
                  </Button>
                </div>

                <Dialog open={isKeywordModalOpen} onOpenChange={(open) => {
                  setIsKeywordModalOpen(open);
                  if (!open) setAnalyzedKeywords([]); // Clear analysis on close
                }}>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-accent" /> Sugestões p/ Brasil (SEO)
                        </DialogTitle>
                        {keywordSuggestions.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-accent/5 border-accent/20 text-accent hover:bg-accent/10"
                            onClick={handleAnalyzeKeywords}
                            disabled={isAnalyzingKeywords}
                          >
                            <Sparkles className={`w-3 h-3 mr-2 ${isAnalyzingKeywords ? "animate-spin" : ""}`} />
                            Analisar com IA
                          </Button>
                        )}
                      </div>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2 bg-secondary/30 p-2 rounded">
                        <Info className="w-3 h-3" /> Foco: Brazil (pt-BR). Clique em um termo para usar no seu artigo.
                      </p>
                      <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2">
                        {keywordSuggestions.length > 0 ? (
                          keywordSuggestions.map((sug, i) => {
                            const analysis = analyzedKeywords.find(a => a.keyword.toLowerCase() === sug.toLowerCase());
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setKeyword(sug);
                                  setIsKeywordModalOpen(false);
                                }}
                                className="text-left px-4 py-3 rounded-lg hover:bg-accent/5 transition-all border border-transparent hover:border-accent/10 flex flex-col gap-2 group relative"
                              >
                                <div className="flex items-start justify-between gap-3 w-full">
                                  <span className="font-bold text-sm leading-tight pt-0.5">{sug}</span>
                                  {analysis ? (
                                    <Badge className={`${analysis.potential === 'High' ? 'bg-green-500 hover:bg-green-600' :
                                      analysis.potential === 'Medium' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-400 hover:bg-gray-500'
                                      } text-[9px] font-black uppercase text-white h-5 shrink-0 px-2`}>
                                      {analysis.potential === 'High' ? 'Alto Potencial' :
                                        analysis.potential === 'Medium' ? 'Médio' : 'Baixo'}
                                    </Badge>
                                  ) : (
                                    <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent mt-1 shrink-0" />
                                  )}
                                </div>
                                {analysis && (
                                  <p className="text-[11px] text-muted-foreground leading-snug animate-fade-in pr-2">
                                    {analysis.reason}
                                  </p>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-center py-8 text-muted-foreground">Nenhuma sugestão encontrada.</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <Label htmlFor="title" className="flex items-center gap-2">
                  Título Final (Editável)
                  {title && <Badge variant="outline" className="text-[10px] py-0">Gerado com IA</Badge>}
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="O título final que aparecerá no blog..."
                  className="mt-1 font-bold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A IA usará este título exato para gerar o conteúdo do artigo.
                </p>
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-2 text-xs text-muted-foreground italic">
                      Nenhuma categoria criada. Vá em "Categorias" para criar uma.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Artigo</Label>
              <Select value={articleType} onValueChange={setArticleType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Artigo Padrão</SelectItem>
                  <SelectItem value="review">Review de Produto</SelectItem>
                  <SelectItem value="listicle">Listicle (Lista)</SelectItem>
                  <SelectItem value="comparison">Comparativo</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Agendar Postagem?</Label>
                    <p className="text-[10px] text-muted-foreground">
                      O post só aparecerá no site na data e hora escolhidas.
                    </p>
                  </div>
                  <Switch
                    checked={isScheduleEnabled}
                    onCheckedChange={setIsScheduleEnabled}
                  />
                </div>

                {isScheduleEnabled && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                    <div>
                      <Label className="text-[11px]">Data</Label>
                      <Input
                        type="date"
                        value={publishedAt}
                        onChange={e => setPublishedAt(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Hora</Label>
                      <Input
                        type="time"
                        value={publishTime}
                        onChange={e => setPublishTime(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags / Palavras-chave (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Ex: sony, audio, fone de ouvido, reviews"
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Tags ajudam no posicionamento e organização do site.
              </p>
            </div>
          </div>

          {/* Featured Image Section */}
          <div className="space-y-4">
            <Label>Imagem de Destaque</Label>
            <Card className="p-4 border-dashed border-2 flex flex-col items-center justify-center bg-muted/30">
              {featuredImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                  <img src={featuredImage} alt="Destaque" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingImage ? "animate-spin" : ""}`} /> Regenerar com IA
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setFeaturedImage("")}>
                      <Trash2 className="w-4 h-4 mr-2" /> Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <ImagePlus className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="font-medium">Nenhuma imagem selecionada</h4>
                  <p className="text-sm text-muted-foreground mb-4">Essencial para Google Discover (16:9)</p>
                  <Button onClick={handleGenerateImage} disabled={isGeneratingImage} variant="outline" className="border-accent text-accent">
                    <Sparkles className="w-4 h-4 mr-2" /> {isGeneratingImage ? "Gerando..." : "Gerar com IA (DALL-E 3)"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">Ou busque gratuitamente:</p>
                  <Button
                    onClick={() => {
                      setIsUnsplashModalOpen(true);
                      setUnsplashQuery(title || keyword);
                    }}
                    variant="secondary"
                    className="mt-2"
                  >
                    <ImagePlus className="w-4 h-4 mr-2" /> Buscar no Unsplash
                  </Button>
                </div>
              )}
            </Card>

            <Dialog open={isUnsplashModalOpen} onOpenChange={setIsUnsplashModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-primary" /> Pesquisar Imagens no Unsplash
                  </DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Ex: tecnologia, cafe, notebook..."
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchUnsplash()}
                  />
                  <Button onClick={handleSearchUnsplash} disabled={isSearchingUnsplash}>
                    <Search className={`w-4 h-4 mr-2 ${isSearchingUnsplash ? "animate-spin" : ""}`} />
                    Buscar
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 overflow-y-auto pr-2 pb-4">
                  {unsplashResults.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-video cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-primary"
                      onClick={() => selectUnsplashImage(img.url)}
                    >
                      <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <p className="text-[10px] text-white truncate">Foto de {img.author}</p>
                      </div>
                    </div>
                  ))}
                  {unsplashResults.length === 0 && !isSearchingUnsplash && (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                      Digite algo e clique em buscar para ver imagens reais e gratuitas.
                    </div>
                  )}
                  {isSearchingUnsplash && (
                    <div className="col-span-full py-20 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                      <p>Buscando na biblioteca...</p>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-auto pt-4 border-t italic">
                  Imagens fornecidas gratuitamente pelo Unsplash sob licença livre.
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="manualImage" className="text-xs text-muted-foreground">Ou cole a URL da sua própria imagem:</Label>
                <Input
                  id="manualImage"
                  placeholder="https://exemplo.com/sua-imagem.jpg"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button variant="secondary" size="icon" className="mb-0.5" title="Limpar" onClick={() => setFeaturedImage("")}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Dica: O sistema formatará automaticamente qualquer imagem para o padrão 16:9 de alta resolução.
            </p>
          </div>

          {/* Manual tab */}
          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label htmlFor="content">Conteúdo (HTML)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do artigo em HTML..."
                rows={16}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </TabsContent>

          {/* AI tab */}
          <TabsContent value="ai" className="space-y-4">
            <Card className="p-5 space-y-4 border-accent/20 bg-accent/5">
              <h3 className="font-heading font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Configurações da IA
              </h3>

              <div>
                <Label>Tamanho do Artigo</Label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 palavras</SelectItem>
                    <SelectItem value="800">800 palavras</SelectItem>
                    <SelectItem value="1200">1200 palavras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Incluir Produtos?</Label>
                  <p className="text-xs text-muted-foreground">
                    Ative para incluir reviews, tabelas e botões de oferta.
                  </p>
                </div>
                <Switch
                  checked={articleType === 'review' || includeProducts}
                  onCheckedChange={setIncludeProducts}
                  disabled={articleType === 'review'}
                />
              </div>

              {(articleType === 'review' || includeProducts) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <Label htmlFor="reviewPrompt">Prompt / Formato do Review</Label>
                    <div className="flex gap-2 items-start mt-1">
                      <Textarea
                        id="reviewPrompt"
                        value={reviewPrompt}
                        onChange={e => setReviewPrompt(e.target.value)}
                        placeholder="Ex: Incluir prós e contras, nota de 1 a 10..."
                        rows={3}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="affiliateLinks">
                      Produtos (nome, link de afiliado e imagem)
                    </Label>
                    <Textarea
                      id="affiliateLinks"
                      value={affiliateLinks}
                      onChange={e => setAffiliateLinks(e.target.value)}
                      placeholder={"Furadeira Bosch GSB 13 RE\nhttps://amzn.to/xxxxxx\nhttps://m.media-amazon.com/images/furadeira.jpg\n\nSierra Dewalt DCD791\nhttps://amzn.to/yyyyyy\nhttps://m.media-amazon.com/images/sierra.jpg"}
                      rows={8}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Gerando...' : 'Gerar Artigo com IA'}
                </Button>
                <Button variant="outline">
                  <ImagePlus className="w-4 h-4 mr-2" /> Gerar Imagem Destaque com IA
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refazer Imagens
                </Button>
              </div>
            </Card>

            {content && (
              <div>
                <Label>Conteúdo Gerado (edite se necessário)</Label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={16}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handleSave} variant="secondary">
              <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
            </Button>
            <Button
              onClick={handlePublish}
              variant="default"
              className={isScheduleEnabled ? "bg-accent hover:bg-accent/90 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {isScheduleEnabled ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" /> Agendar Artigo
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" /> {isEditing ? "Salvar Alterações" : "Publicar Artigo"}
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveAsHTML}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              <Save className="w-4 h-4 mr-2" /> Baixar HTML
            </Button>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" /> Pré-visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pré-visualização do Artigo</DialogTitle>
                </DialogHeader>
                <div className="prose max-w-none pt-4">
                  {featuredImage && <img src={featuredImage} alt="Destaque" className="w-full aspect-video object-cover rounded-lg mb-6" />}
                  <div className="ai-article-container" dangerouslySetInnerHTML={{ __html: content || "<p className='text-muted-foreground italic'>Nenhum conteúdo gerado ainda...</p>" }} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminNewArticle;
