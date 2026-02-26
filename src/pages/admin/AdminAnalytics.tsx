import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AdminAnalytics = () => {
  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-heading font-bold mb-2">Google Search Console</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Conecte sua conta do Google Search Console para visualizar impressões, cliques, CTR e posição média diretamente aqui.
            </p>
            <p className="text-xs text-muted-foreground">
              Configure em <span className="font-medium">Configurações → Integrações Google</span>
            </p>
          </div>
        </Card>

        {/* Placeholder charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-heading font-bold mb-4">Impressões por Dia</h4>
            <div className="h-48 flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground">
              Gráfico disponível após integração
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="font-heading font-bold mb-4">Top Páginas</h4>
            <div className="h-48 flex items-center justify-center border border-dashed rounded-md text-sm text-muted-foreground">
              Dados disponíveis após integração
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
