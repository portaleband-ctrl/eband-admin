import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { usePages } from "@/hooks/usePages";
import { Search } from "lucide-react";

const BlogHeader = () => {
  const { settings, isLoading } = useSettings();
  const { pages } = usePages();

  const menuPages = pages.filter(p => p.show_in_menu);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar - Yellow like Mercado Livre */}
      <div className="bg-[#FFE600]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            {isLoading ? (
              <span className="inline-block w-24 h-6 bg-[#FFE600]/50 rounded animate-pulse" />
            ) : settings.blogLogo ? (
              <img src={settings.blogLogo} alt={settings.blogName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-black text-[#2D3277] tracking-tight">
                {settings.blogName}
              </span>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm bg-white border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar - White */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-6 h-10 overflow-x-auto">
            <Link to="/" className="text-xs font-semibold text-gray-700 hover:text-[#3483FA] transition-colors whitespace-nowrap">
              Início
            </Link>
            <Link to="/categorias" className="text-xs font-semibold text-gray-700 hover:text-[#3483FA] transition-colors whitespace-nowrap">
              Categorias
            </Link>
            {menuPages.map(page => (
              <Link
                key={page.id}
                to={`/p/${page.slug}`}
                className="text-xs font-semibold text-gray-700 hover:text-[#3483FA] transition-colors whitespace-nowrap"
              >
                {page.title}
              </Link>
            ))}
            <Link to="/sobre" className="text-xs font-semibold text-gray-700 hover:text-[#3483FA] transition-colors whitespace-nowrap">
              Sobre
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;
