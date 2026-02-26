import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { FileText, Eye, TrendingUp, Users, BarChart3, ChevronRight, ExternalLink } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { articles, isLoading: isLoadingArticles } = useArticles();
  const { stats, isLoading: isLoadingAnalytics } = useAnalytics();

  const isLoading = isLoadingArticles || isLoadingAnalytics;

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const dashboardStats = [
    { label: 'Total de Artigos', value: articles.length, icon: FileText, color: 'text-chart-1' },
    { label: 'Visualizações Hoje', value: stats.viewsToday, icon: Eye, color: 'text-chart-2' },
    { label: 'Total de Visualizações', value: stats.totalViews, icon: BarChart3, color: 'text-chart-3' },
    { label: 'Visitantes Únicos', value: stats.uniqueVisitors, icon: Users, color: 'text-chart-4' },
  ];

  const recentArticles = articles.slice(0, 5);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map(stat => (
          <Card key={stat.label} className="p-5 border-white/40 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-card border border-white/20`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-black">{stat.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-heading font-bold mb-4">Artigos Recentes</h3>
          <div className="space-y-3">
            {recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center italic">Nenhum artigo recente.</p>
            ) : (
              recentArticles.map(article => (
                <div key={article.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.category} · {new Date(article.publishedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${article.status === 'published' ? 'bg-chart-3/10 text-chart-3' : 'bg-muted text-muted-foreground'
                    }`}>
                    {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-black">Páginas Mais Visitadas</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {stats.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center italic">Aguardando dados de acesso...</p>
            ) : (
              stats.topPosts.map((post, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="font-bold truncate max-w-[200px]">{post.title}</span>
                    <span className="text-xs font-black text-accent">{post.views} views</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all animate-in slide-in-from-left duration-500"
                      style={{ width: `${(post.views / stats.topPosts[0].views) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
