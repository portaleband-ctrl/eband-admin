import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { mockCategories } from "@/data/mockData";
import { Rss, Plus, Trash2, Play, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Feed {
  id: string;
  name: string;
  url: string;
  category: string;
  wordCount: string;
  autoRewrite: boolean;
  lastFetched?: string;
  articlesImported: number;
}

const AdminFeeds = () => {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<Feed[]>([
    {
      id: '1',
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      category: 'tecnologia',
      wordCount: '800',
      autoRewrite: true,
      lastFetched: '2025-02-17',
      articlesImported: 24,
    },
  ]);

  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    category: '',
    wordCount: '800',
    rewritePrompt: '',
  });

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.url) {
      toast({ title: "Preencha os campos", description: "Nome e URL do feed são obrigatórios.", variant: "destructive" });
      return;
    }
    const feed: Feed = {
      id: Date.now().toString(),
      name: newFeed.name,
      url: newFeed.url,
      category: newFeed.category,
      wordCount: newFeed.wordCount,
      autoRewrite: true,
      articlesImported: 0,
    };
    setFeeds(prev => [...prev, feed]);
    setNewFeed({ name: '', url: '', category: '', wordCount: '800', rewritePrompt: '' });
    toast({ title: "Feed adicionado!", description: `"${feed.name}" foi configurado.` });
  };

  const handleRemoveFeed = (id: string) => {
    setFeeds(prev => prev.filter(f => f.id !== id));
    toast({ title: "Feed removido" });
  };

  const handleFetchFeed = (feed: Feed) => {
    toast({
      title: "Buscando artigos...",
      description: `Importando e reescrevendo artigos de "${feed.name}" com IA.`,
    });
  };

  return (
    <AdminLayout title="Feeds RSS / Automação">
      <div className="max-w-4xl space-y-6">
        {/* Add Feed */}
        <Card className="p-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <Rss className="w-5 h-5 text-accent" /> Adicionar Novo Feed
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione feeds RSS de outros blogs. A IA reescreve automaticamente os artigos com conteúdo original e otimizado para SEO.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feedName">Nome do Feed</Label>
              <Input
                id="feedName"
                value={newFeed.name}
                onChange={e => setNewFeed(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: TechCrunch, The Verge..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="feedUrl">URL do Feed RSS</Label>
              <Input
                id="feedUrl"
                value={newFeed.url}
                onChange={e => setNewFeed(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com/feed/"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Categoria dos Artigos</Label>
              <Select
                value={newFeed.category}
                onValueChange={v => setNewFeed(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tamanho do Artigo Reescrito</Label>
              <Select
                value={newFeed.wordCount}
                onValueChange={v => setNewFeed(prev => ({ ...prev, wordCount: v }))}
              >
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
          </div>

          <div className="mt-4">
            <Label htmlFor="rewritePrompt">Instruções para a IA (opcional)</Label>
            <Textarea
              id="rewritePrompt"
              value={newFeed.rewritePrompt}
              onChange={e => setNewFeed(prev => ({ ...prev, rewritePrompt: e.target.value }))}
              placeholder="Ex: Reescreva focando em benefícios para o consumidor brasileiro. Inclua comparações de preço e links de afiliado quando relevante..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button onClick={handleAddFeed} className="mt-4">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Feed
          </Button>
        </Card>

        {/* Feed List */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-4">Feeds Configurados</h3>
          {feeds.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Rss className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum feed configurado ainda.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {feeds.map(feed => (
                <Card key={feed.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{feed.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" /> Auto-reescrita
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{feed.url}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{feed.articlesImported} artigos importados</span>
                        {feed.lastFetched && <span>Última busca: {feed.lastFetched}</span>}
                        <span>{feed.wordCount} palavras/artigo</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFetchFeed(feed)}
                      >
                        <Play className="w-4 h-4 mr-1" /> Buscar Agora
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveFeed(feed.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <Card className="p-5 border-accent/20 bg-accent/5">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Como funciona a automação
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>A IA lê os artigos do feed RSS e reescreve com conteúdo 100% original</li>
            <li>Imagens de destaque são geradas automaticamente com IA</li>
            <li>Alt text é definido automaticamente para SEO</li>
            <li>Os artigos são salvos como rascunho para sua revisão antes de publicar</li>
            <li>Você pode personalizar o tom e estilo com as instruções acima</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFeeds;
