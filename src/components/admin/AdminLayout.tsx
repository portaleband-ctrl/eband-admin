import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, PenSquare, Tags, Settings, BarChart3, ArrowLeft, Rss, FileCode, LogOut
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/artigos', icon: FileText, label: 'Artigos' },
  { to: '/admin/novo-artigo', icon: PenSquare, label: 'Novo Artigo' },
  { to: '/admin/paginas', icon: FileCode, label: 'Páginas' },
  { to: '/admin/categorias', icon: Tags, label: 'Categorias' },
  { to: '/admin/feeds', icon: Rss, label: 'Feeds / Automação' },
  { to: '/admin/importar', icon: FileText, label: 'Importador (WP)' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair.");
    } else {
      toast.success("Você saiu do painel.");
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="text-lg font-heading font-bold">
            Blog<span className="text-sidebar-primary">.</span> Admin
          </h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Ver Blog
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md mt-1"
          >
            <LogOut className="w-4 h-4" /> Deslogar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64">
        <header className="h-16 border-b bg-card flex items-center px-6">
          <h2 className="text-lg font-semibold">{title}</h2>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
