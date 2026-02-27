import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useArticles } from "@/hooks/useArticles";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useState } from "react";

const AdminArticles = () => {
  const { articles, deleteArticle, isLoading } = useArticles();
  const { settings } = useSettings();
  const [isIndexing, setIsIndexing] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 50;

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Artigos">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o artigo "${title}"?`)) {
      deleteArticle(id);
      toast.success("Artigo excluído com sucesso.");
    }
  };

  const handleIndexGoogle = async (id: string, slug: string) => {
    if (!settings.googleIndexingJson) {
      toast.error("Configuração ausente: JSON da Google Indexing API não encontrado nas Configurações.");
      return;
    }

    const baseUrl = settings.siteUrl || window.location.origin;
    const url = `${baseUrl}/artigo/${slug}`;

    setIsIndexing(prev => ({ ...prev, [id]: true }));
    toast.info("Enviando requisição de indexação para o Google...");

    try {
      const { data, error } = await supabase.functions.invoke('google-index', {
        body: { url }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Artigo enviado para indexação no Google com sucesso!");
    } catch (error: any) {
      toast.error(`Falha ao indexar: ${error.message}`);
    } finally {
      setIsIndexing(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <AdminLayout title="Artigos">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          {articles.length} artigos (Página {currentPage} de {totalPages})
        </p>
        <Link to="/admin/novo-artigo">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Novo Artigo
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Título</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Categoria</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Tipo</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Data</th>
              <th className="text-right py-3 px-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-muted-foreground">
                  Nenhum artigo encontrado. Crie seu primeiro artigo para vê-lo aqui.
                </td>
              </tr>
            ) : (
              currentArticles.map(article => (
                <tr key={article.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium truncate max-w-xs">{article.title}</p>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{article.category}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs capitalize">{article.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${article.status === 'published' ? 'bg-chart-3/10 text-chart-3' : 'bg-muted text-muted-foreground'
                      }`}>
                      {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{article.publishedAt}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {article.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Forçar Indexação no Google"
                          onClick={() => handleIndexGoogle(article.id, article.slug)}
                          disabled={isIndexing[article.id]}
                        >
                          <Globe className={`w-4 h-4 ${isIndexing[article.id] ? "animate-pulse" : ""}`} />
                        </Button>
                      )}
                      <Link to={`/admin/editar-artigo/${article.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(article.id, article.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {articles.length > ARTICLES_PER_PAGE && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminArticles;
