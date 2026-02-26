import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticlePage from "./pages/ArticlePage";
import AboutPage from "./pages/AboutPage";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import StaticPage from "./pages/StaticPage"; // New import
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminNewArticle from "./pages/admin/AdminNewArticle";
import AdminPages from "./pages/admin/AdminPages"; // New import
import AdminNewPage from "./pages/admin/AdminNewPage"; // New import
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFeeds from "./pages/admin/AdminFeeds";
import AdminImport from "./pages/admin/AdminImport";
import AdminLogin from "./pages/admin/AdminLogin";
import { useSettings } from "./hooks/useSettings";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return <Navigate to="/admin/login" />;

  return <>{children}</>;
};

const App = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Update Title
    const baseTitle = settings.blogName.replace(/\.$/, '');
    document.title = settings.blogDescription ? `${baseTitle} | ${settings.blogDescription}` : baseTitle;

    // Update Favicon
    if (settings.blogFavicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.blogFavicon;
    }
  }, [settings.blogName, settings.blogDescription, settings.blogFavicon]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Blog pages */}
            <Route path="/" element={<Index />} />
            <Route path="/artigo/:slug" element={<ArticlePage />} />
            <Route path="/p/:slug" element={<StaticPage />} /> {/* New route */}
            <Route path="/categorias" element={<AllCategoriesPage />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
            <Route path="/termos-de-uso" element={<TermsPage />} />
            <Route path="/contato" element={<ContactPage />} />

            {/* Admin pages */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/artigos" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
            <Route path="/admin/novo-artigo" element={<ProtectedRoute><AdminNewArticle /></ProtectedRoute>} />
            <Route path="/admin/paginas" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
            <Route path="/admin/paginas/nova" element={<ProtectedRoute><AdminNewPage /></ProtectedRoute>} />
            <Route path="/admin/paginas/editar/:id" element={<ProtectedRoute><AdminNewPage /></ProtectedRoute>} />
            <Route path="/admin/feeds" element={<ProtectedRoute><AdminFeeds /></ProtectedRoute>} />
            <Route path="/admin/categorias" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/importar" element={<ProtectedRoute><AdminImport /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/configuracoes" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
